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


def _difficulty_score(task: Task) -> float:
    duration_signal = _clamp((max(task.duration_minutes or 0, 0) / 180.0) * 100.0, 0.0, 100.0)
    description_signal = _description_signal(task.description)

    text_blob = f"{task.title} {task.description}".lower()
    complexity_keywords = (
        'migrate',
        'refactor',
        'debug',
        'investigate',
        'integration',
        'architecture',
        'optimize',
    )
    keyword_hits = sum(1 for kw in complexity_keywords if kw in text_blob)
    complexity_signal = _clamp(keyword_hits * 15.0, 0.0, 100.0)

    return _clamp((0.55 * duration_signal) + (0.25 * description_signal) + (0.20 * complexity_signal), 0.0, 100.0)


def _difficulty_label(score: float) -> str:
    if score < 35.0:
        return 'easy'
    if score < 70.0:
        return 'medium'
    return 'hard'


def _estimated_effort_minutes(task: Task, difficulty_score: float) -> float:
    explicit_minutes = max(float(task.duration_minutes or 0), 0.0)
    inferred_minutes = 20.0 + (difficulty_score * 2.2)

    if explicit_minutes <= 0:
        return round(inferred_minutes, 2)

    # Keep user-provided duration as a floor, but still scale up for complex tasks.
    return round(max(explicit_minutes, inferred_minutes * 0.7), 2)


def _days_until_deadline(deadline) -> Optional[float]:
    if not deadline:
        return None

    if timezone.is_naive(deadline):
        deadline = timezone.make_aware(deadline, timezone.get_current_timezone())

    return (deadline - timezone.now()).total_seconds() / 86400.0


def _time_pressure_score(estimated_minutes: float, deadline) -> float:
    minutes = max(float(estimated_minutes or 0), 15.0)
    days_until = _days_until_deadline(deadline)

    if days_until is None:
        # Without a deadline, effort still matters but should not dominate urgency.
        return _clamp((minutes / 300.0) * 100.0, 8.0, 75.0)

    if days_until <= 0:
        return 100.0

    # Approximate per-task sustainable focus budget at 120 minutes/day.
    required_daily_minutes = minutes / max(days_until, 0.25)
    return _clamp((required_daily_minutes / 120.0) * 100.0, 0.0, 100.0)


def _fallback_priority(task: Task) -> PriorityResult:
    if task.status == Task.STATUS_DONE:
        return PriorityResult(score=0.0, reason='Task is completed.', source='rules', confidence=1.0)

    normalized_deadline = task.deadline
    if normalized_deadline and timezone.is_naive(normalized_deadline):
        normalized_deadline = timezone.make_aware(normalized_deadline, timezone.get_current_timezone())

    deadline_urgency = _deadline_urgency(task.deadline)
    description_signal = _description_signal(task.description)
    difficulty_score = _difficulty_score(task)
    difficulty_label = _difficulty_label(difficulty_score)
    estimated_minutes = _estimated_effort_minutes(task, difficulty_score)
    time_pressure = _time_pressure_score(estimated_minutes, task.deadline)
    inferred_importance = _clamp(35.0 + (description_signal * 0.65), 20.0, 95.0)

    score = (
        (0.45 * deadline_urgency)
        + (0.20 * inferred_importance)
        + (0.20 * difficulty_score)
        + (0.15 * time_pressure)
    )

    reason_parts = []
    if normalized_deadline:
        if normalized_deadline <= timezone.now():
            reason_parts.append('Past deadline increases urgency.')
        else:
            reason_parts.append('Nearer deadline increases urgency.')
    else:
        reason_parts.append('No deadline provided; ranking leans on description quality.')

    reason_parts.append(f'Difficulty estimated as {difficulty_label}; harder tasks are nudged earlier when deadlines are comparable.')

    days_until = _days_until_deadline(task.deadline)
    if days_until is None:
        reason_parts.append(f'Estimated effort is about {int(round(estimated_minutes))} minutes.')
    elif days_until <= 0:
        reason_parts.append(f'Estimated effort is about {int(round(estimated_minutes))} minutes and the task is already overdue.')
    else:
        required_daily = max(1, int(round(estimated_minutes / max(days_until, 0.25))))
        reason_parts.append(
            f'Estimated effort is about {int(round(estimated_minutes))} minutes, needing roughly {required_daily} minutes/day before the deadline.'
        )

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

    estimated_difficulty_score = _difficulty_score(task)
    estimated_difficulty_label = _difficulty_label(estimated_difficulty_score)
    estimated_effort_minutes = _estimated_effort_minutes(task, estimated_difficulty_score)

    prompt = (
        'You are a task prioritization assistant. '\
        'Decide which tasks should be done first by balancing deadline urgency with task difficulty. '\
        'Think realistically about how much focused time each task needs. '\
        'More difficult tasks usually require more time and should start earlier when deadlines are similar. '\
        'For similar deadlines, harder tasks should usually start earlier. '\
        'For overdue or very near deadlines, urgency can override difficulty. '\
        'Return ONLY valid JSON with this schema: '\
        '{"priority_score": number 0-100, "difficulty": "easy|medium|hard", "estimated_minutes": number, "confidence": number 0-1, "reason": string}. '\
        'priority_score must represent final ranking priority where 100 is highest priority. '\
        'Reason should be concise and practical in under 180 characters and mention deadline, difficulty, and time needed.\n\n'
        f'Task title: {task.title}\n'
        f'Task description: {task.description}\n'
        f'Deadline (ISO or null): {task.deadline.isoformat() if task.deadline else "null"}\n'
        f'User-entered duration minutes (0 means unknown): {task.duration_minutes}\n'
        f'Estimated difficulty from metadata: {estimated_difficulty_label} ({round(estimated_difficulty_score, 1)}/100)\n'
        f'Baseline effort estimate from metadata (minutes): {int(round(estimated_effort_minutes))}\n'
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
        ai_score = _clamp(float(parsed_output.get('priority_score', 50.0)), 0.0, 100.0)
        ai_difficulty = str(parsed_output.get('difficulty', '')).strip().lower()
        if ai_difficulty not in {'easy', 'medium', 'hard'}:
            ai_difficulty = estimated_difficulty_label
        ai_estimated_minutes = _clamp(
            float(parsed_output.get('estimated_minutes', estimated_effort_minutes)),
            5.0,
            1440.0,
        )
        ai_confidence = _clamp(float(parsed_output.get('confidence', 0.5)), 0.0, 1.0)

        effective_minutes = max(ai_estimated_minutes, float(task.duration_minutes or 0), estimated_effort_minutes)
        difficulty_signal = {'easy': 25.0, 'medium': 55.0, 'hard': 85.0}[ai_difficulty]
        time_pressure = _time_pressure_score(effective_minutes, task.deadline)
        blended_score = _clamp((0.60 * ai_score) + (0.25 * time_pressure) + (0.15 * difficulty_signal), 0.0, 100.0)

        reason = str(parsed_output.get('reason', '')).strip()
        if not reason:
            reason = (
                f'Prioritized by Gemini: {ai_difficulty} difficulty, about {int(round(effective_minutes))} minutes effort, and deadline urgency tradeoff.'
            )

        reason_lower = reason.lower()
        if 'deadline' not in reason_lower:
            reason = f'{reason} Deadline timing was considered.'
            reason_lower = reason.lower()
        if 'difficulty' not in reason_lower and 'difficult' not in reason_lower:
            reason = f'{reason} Difficulty: {ai_difficulty}.'
            reason_lower = reason.lower()
        if not any(token in reason_lower for token in ('minute', 'minutes', 'hour', 'hours', 'time', 'effort')):
            reason = f'{reason} Estimated effort: {int(round(effective_minutes))} min.'
        reason = reason.strip()
        if len(reason) > 180:
            reason = reason[:177].rstrip() + '...'

        return PriorityResult(
            score=round(blended_score, 2),
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
