import json
import math
import socket
from dataclasses import dataclass
from typing import Optional
from urllib import error, request

from django.conf import settings
from django.utils import timezone

from ..models import Task


@dataclass
class PriorityResult:
    score: float
    reason: str
    source: str
    confidence: float


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _deadline_urgency(deadline):
    if not deadline:
        return 25.0

    if timezone.is_naive(deadline):
        deadline = timezone.make_aware(deadline, timezone.get_current_timezone())

    delta_seconds = (deadline - timezone.now()).total_seconds()
    if delta_seconds <= 0:
        return 100.0

    days = delta_seconds / 86400.0
    return _clamp(100.0 * math.exp(-0.35 * days), 5.0, 100.0)


def _description_signal(description: str) -> float:
    word_count = len((description or "").split())
    if word_count <= 0:
        return 0.0
    # Saturate near 60 words to avoid over-weighting very long descriptions.
    return _clamp((word_count / 60.0) * 100.0, 0.0, 100.0)


def _fallback_priority(task: Task) -> PriorityResult:
    if task.status == Task.STATUS_DONE:
        return PriorityResult(score=0.0, reason='Task is completed.', source='rules', confidence=1.0)

    normalized_deadline = task.deadline
    if normalized_deadline and timezone.is_naive(normalized_deadline):
        normalized_deadline = timezone.make_aware(normalized_deadline, timezone.get_current_timezone())

    deadline_urgency = _deadline_urgency(task.deadline)
    description_signal = _description_signal(task.description)
    inferred_importance = _clamp(35.0 + (description_signal * 0.65), 20.0, 95.0)

    score = (0.7 * deadline_urgency) + (0.3 * inferred_importance)

    reason_parts = []
    if normalized_deadline:
        if normalized_deadline <= timezone.now():
            reason_parts.append('Past deadline increases urgency.')
        else:
            reason_parts.append('Nearer deadline increases urgency.')
    else:
        reason_parts.append('No deadline provided; ranking leans on description quality.')

    if description_signal < 20:
        reason_parts.append('Description is short; add context for stronger AI prioritization.')
    else:
        reason_parts.append('Description provides useful context for prioritization.')

    return PriorityResult(
        score=round(_clamp(score, 0.0, 100.0), 2),
        reason=' '.join(reason_parts),
        source='rules',
        confidence=0.45,
    )


def _extract_json_block(text: str) -> Optional[str]:
    if not text:
        return None

    cleaned = text.strip()
    if cleaned.startswith('```'):
        cleaned = cleaned.strip('`')
        if cleaned.lower().startswith('json'):
            cleaned = cleaned[4:].strip()

    if cleaned.startswith('{') and cleaned.endswith('}'):
        return cleaned

    start = cleaned.find('{')
    end = cleaned.rfind('}')
    if start == -1 or end == -1 or end <= start:
        return None
    return cleaned[start : end + 1]


def _extract_gemini_text(response_payload: dict) -> Optional[str]:
    candidates = response_payload.get('candidates') or []
    if not candidates:
        return None

    first = candidates[0]
    content = first.get('content') or {}
    parts = content.get('parts') or []
    texts = []
    for part in parts:
        if isinstance(part, dict) and part.get('text'):
            texts.append(part['text'])

    if not texts:
        return None

    return '\n'.join(texts).strip()


def _gemini_priority(task: Task) -> Optional[PriorityResult]:
    api_key = settings.GEMINI_API_KEY
    model = settings.GEMINI_MODEL
    timeout_seconds = settings.GEMINI_TIMEOUT_SECONDS

    if not api_key:
        return None

    if task.status == Task.STATUS_DONE:
        return PriorityResult(score=0.0, reason='Task is completed.', source='rules', confidence=1.0)

    prompt = (
        'You are a task prioritization assistant. '\
        'Return ONLY valid JSON with this schema: '\
        '{"urgency": number 0-100, "importance": number 0-100, "confidence": number 0-1, "reason": string}. '\
        'Reason should be concise and practical in under 180 characters.\n\n'
        f'Task title: {task.title}\n'
        f'Task description: {task.description}\n'
        f'Deadline (ISO or null): {task.deadline.isoformat() if task.deadline else "null"}\n'
        f'Duration minutes: {task.duration_minutes}\n'
        f'Current status: {task.status}\n'
    )

    endpoint = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}'
    payload = {
        'contents': [{'parts': [{'text': prompt}]}],
        'generationConfig': {
            'temperature': 0.2,
            'response_mime_type': 'application/json',
        },
    }

    data = json.dumps(payload).encode('utf-8')
    req = request.Request(
        endpoint,
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )

    try:
        with request.urlopen(req, timeout=timeout_seconds) as resp:
            raw_body = resp.read().decode('utf-8')
        parsed_response = json.loads(raw_body)
        text = _extract_gemini_text(parsed_response)
        json_text = _extract_json_block(text or '')
        if not json_text:
            return None

        parsed_output = json.loads(json_text)
        ai_urgency = _clamp(float(parsed_output.get('urgency', 50.0)), 0.0, 100.0)
        ai_importance = _clamp(float(parsed_output.get('importance', 50.0)), 0.0, 100.0)
        ai_confidence = _clamp(float(parsed_output.get('confidence', 0.5)), 0.0, 1.0)

        reason = str(parsed_output.get('reason', '')).strip()
        if not reason:
            reason = 'Prioritized by Gemini using deadline pressure and description context.'

        deadline_urgency = _deadline_urgency(task.deadline)
        score = (0.55 * deadline_urgency) + (0.30 * ai_urgency) + (0.15 * ai_importance)

        return PriorityResult(
            score=round(_clamp(score, 0.0, 100.0), 2),
            reason=reason,
            source=f'gemini:{model}',
            confidence=round(ai_confidence, 3),
        )
    except (error.HTTPError, error.URLError, TimeoutError, socket.timeout, ValueError, TypeError, json.JSONDecodeError):
        return None


def prioritize_task(task: Task) -> PriorityResult:
    gemini_result = _gemini_priority(task)
    if gemini_result:
        return gemini_result
    return _fallback_priority(task)


def prioritize_and_save_task(task: Task) -> PriorityResult:
    result = prioritize_task(task)
    task.priority_score = result.score
    task.priority_reason = result.reason
    task.priority_source = result.source
    task.priority_confidence = result.confidence
    task.prioritized_at = timezone.now()
    task.save(
        update_fields=[
            'priority_score',
            'priority_reason',
            'priority_source',
            'priority_confidence',
            'prioritized_at',
        ]
    )
    return result
