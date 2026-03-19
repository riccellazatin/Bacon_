from datetime import datetime, timedelta
import json
import math
import socket
from dataclasses import dataclass
from typing import Optional
from urllib import error, request

from django.conf import settings
from django.utils import timezone
from django.apps import apps  # Use apps to avoid circular imports

from ..models import ScheduleBlock, Task


@dataclass
class PriorityResult:
    score: float
    reason: str
    source: str
    confidence: float
    suggested_slot: Optional[str] = None


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


def _find_next_available_slot(user, duration_minutes: float) -> Optional[str]:
    """Finds next available slot starting from now, respecting user's block schedule."""
    if not user:
        return timezone.localtime(timezone.now()).strftime("%Y-%m-%d %H:%M")
        
    start_dt = timezone.localtime(timezone.now())
    # Try finding slot for next 7 days or just simply greedily pick first
    # This is a simple greedy approach: "Start now. If blocked, jump to end of block. Repeat."
    
    blocks = list(ScheduleBlock.objects.filter(user=user))
    if not blocks:
        return start_dt.strftime("%Y-%m-%d %H:%M")

    # Limit search to avoid infinite loop
    current_dt = start_dt
    for _ in range(10): # Try up to 10 jumps
        # Check if current_dt overlaps with any block
        # Blocks are weekly recurring: needs day matching
        day_name = current_dt.strftime('%A')
        current_time = current_dt.time()
        
        collision = None
        for b in blocks:
            if b.day_of_week == day_name:
                # Check overlap: (StartA <= EndB) and (EndA >= StartB)
                # Here we check if `current_dt` is INSIDE a block
                if b.start_time <= current_time < b.end_time:
                    collision = b
                    break
        
        if collision:
            # Move current_dt to end of this block
            # Construct new datetime for today with block's end time
            # Note: handle midnight crossing if needed (rare for class schedule)
            new_time = collision.end_time
            current_dt = datetime.combine(current_dt.date(), new_time)
            current_dt = timezone.make_aware(current_dt, timezone.get_current_timezone())
            # Add small buffer? e.g. 5 mins transition
            current_dt += timedelta(minutes=5)
            continue
        
        # If no collision for start time, check if `duration` fits?
        # For simplicity, we assume if start is free, we take it.
        # But ideally check end too.
        # Let's just return this start time as candidate.
        return current_dt.strftime("%Y-%m-%d %H:%M")
    
    # If all failed, default to original start (user will just have to deal with it)
    return start_dt.strftime("%Y-%m-%d %H:%M")


def _find_next_available_slot(user, task: Optional[Task] = None):
    # Simple greedy search: Try finding a slot that doesn't start INSIDE a block
    # Also respects UserPreferences (off_days and working hours), UNLESS deadline is imminent.
    start_dt = timezone.localtime(timezone.now())
    schedule_blocks = list(ScheduleBlock.objects.filter(user=user))
    
    # Try getting preferences
    UserPreferences = apps.get_model('accounts', 'UserPreferences')
    prefs = UserPreferences.objects.filter(user=user).first()
    
    off_days = []
    work_start_time = None
    work_end_time = None
    
    if prefs:
        if prefs.off_days:
            # prefs.off_days is JSON list like ["Friday", "Saturday"]
            off_days = [d.lower() for d in prefs.off_days]
        if prefs.start_time:
            work_start_time = prefs.start_time
        if prefs.end_time:
            work_end_time = prefs.end_time
            
    current_attempt = start_dt
    
    # Validate deadline
    task_deadline = None
    if task and task.deadline:
        if timezone.is_naive(task.deadline):
            task_deadline = timezone.make_aware(task.deadline, timezone.get_current_timezone())
        else:
            task_deadline = task.deadline

    # Limit attempts
    for _ in range(30): # Give more attempts as we might skip days
        day_name = current_attempt.strftime('%A')
        attempt_time = current_attempt.time()
        
        # Check if deadline forces us to ignore preferences
        # If current_attempt date is on or after the deadline date, we MUST try to schedule now,
        # ignoring off-days and working hours.
        ignore_prefs = False
        if task_deadline:
             # If we've passed the deadline completely, just return the best we can (now)
             if current_attempt > task_deadline:
                 return start_dt.strftime("%Y-%m-%d %H:%M")
                 
             if current_attempt.date() >= task_deadline.date():
                 ignore_prefs = True

        # 1. Check Off Days
        if not ignore_prefs and day_name.lower() in off_days:
            # Skip to next day. If working hours set, start at working start, else 8am default
            next_day = current_attempt.date() + timedelta(days=1)
            next_start_hour = work_start_time if work_start_time else datetime.strptime("08:00", "%H:%M").time()
            next_dt = datetime.combine(next_day, next_start_hour)
            current_attempt = timezone.make_aware(next_dt, timezone.get_current_timezone())
            continue
            
        # 2. Check Working Hours (if set)
        if not ignore_prefs and work_start_time and work_end_time:
            # If before start time -> jump to start time today
            if attempt_time < work_start_time:
                next_dt = datetime.combine(current_attempt.date(), work_start_time)
                current_attempt = timezone.make_aware(next_dt, timezone.get_current_timezone())
                continue
            # If after end time -> jump to start time tomorrow
            if attempt_time >= work_end_time:
                next_day = current_attempt.date() + timedelta(days=1)
                next_dt = datetime.combine(next_day, work_start_time)
                current_attempt = timezone.make_aware(next_dt, timezone.get_current_timezone())
                continue

        # 3. Check Schedule Blocks (Classes)
        collision = None
        for block in schedule_blocks:
            if block.day_of_week == day_name:
                if block.start_time <= attempt_time < block.end_time:
                    collision = block
                    break
        
        if collision:
            # Combine current date with collision end time
            end_dt = datetime.combine(current_attempt.date(), collision.end_time)
            end_dt = timezone.make_aware(end_dt, timezone.get_current_timezone())
            if end_dt <= current_attempt:
                 end_dt += timedelta(days=1)

            current_attempt = end_dt + timedelta(minutes=10)
            continue
        
        return current_attempt.strftime("%Y-%m-%d %H:%M")

    return start_dt.strftime("%Y-%m-%d %H:%M")


def _fallback_priority(task: Task, user=None) -> PriorityResult:
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
    
    # Try finding an available slot for suggested start time (fallback)
    suggested_slot_str = timezone.localtime(timezone.now()).strftime("%Y-%m-%d %H:%M")
    
    if user:
         suggested_slot_str = _find_next_available_slot(user, task)
    
    reason_clean = ' '.join(reason_parts)
    reason_clean += ' (AI unavailable, defaulting to next available slot)'

    return PriorityResult(
        score=round(_clamp(score, 0.0, 100.0), 2),
        reason=reason_clean,
        source='rules',
        confidence=0.45,
        suggested_slot=suggested_slot_str
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


def _gemini_priority(task: Task, user) -> Optional[PriorityResult]:
    if task.status == Task.STATUS_DONE:
        return PriorityResult(score=0.0, reason='Task is completed.', source='rules', confidence=1.0)
    
    api_key = settings.GEMINI_API_KEY
    model = settings.GEMINI_MODEL
    timeout_seconds = settings.GEMINI_TIMEOUT_SECONDS

    fixed_schedule = ScheduleBlock.objects.filter(user=user)
    schedule_str = ", ".join([
        f"{c.day_of_week} {c.start_time.strftime('%H:%M')}-{c.end_time.strftime('%H:%M')} ({c.subject})" 
        for c in fixed_schedule
    ])

    UserPreferences = apps.get_model('accounts', 'UserPreferences')
    prefs = UserPreferences.objects.filter(user=user).first()
    prefs_str = ""
    if prefs:
        prefs_str = f"USER PREFERENCES (STRICTLY RESPECT): Off Days: {prefs.off_days} "
        if prefs.start_time and prefs.end_time:
            prefs_str += f", Working Hours: {prefs.start_time.strftime('%H:%M')} to {prefs.end_time.strftime('%H:%M')}"

    if not api_key:
        return None

    deadline_str = "null"
    if task.deadline:
        deadline_str = task.deadline.isoformat() if hasattr(task.deadline, 'isoformat') else str(task.deadline)

    estimated_difficulty_score = _difficulty_score(task)
    estimated_difficulty_label = _difficulty_label(estimated_difficulty_score)
    estimated_effort_minutes = _estimated_effort_minutes(task, estimated_difficulty_score)
    
    # Use local time for the prompt so AI understands "today/tomorrow" correctly
    now_local = timezone.localtime(timezone.now())
    now_str = now_local.strftime("%Y-%m-%d %H:%M (%A)")

    prompt = (
        'You are a task prioritization assistant. '
        'Decide which tasks should be done first by balancing deadline urgency with task difficulty. '
        'Think realistically about how much focused time each task needs. '
        'RULE 1: Tasks with deadlines closest to now are HIGHEST PRIORITY (score near 100). '
        'RULE 2: For tasks with similar deadlines (or far deadlines), prioritize EASIER tasks first (higher score). '
        'RULE 3: Harder tasks should have lower scores unless they are urgent. '
        'IMPORTANT: Suggest a start time ("suggested_start_time") that works best for the user, STRICTLY AVOID scheduling during their '
        'Unavailable Times (Class Schedule). If no schedule is provided, suggest a time based on urgency. '
        'Return ONLY valid JSON with this schema: '
        '{"priority_score": number 0-100, "difficulty": "easy|medium|hard", "estimated_minutes": number, "confidence": number 0-1, "reason": string, "suggested_start_time": "YYYY-MM-DD HH:MM"}. '
        'priority_score must represent final ranking priority where 100 is highest priority. '
        'suggested_start_time MUST be a valid future time (YYYY-MM-DD HH:MM) from now. '
        'STRICTLY FORBIDDEN: Do not suggest a time clearly in the past. '
        'Suggest a time as soon as possible if the schedule is clear. '
        'Reason should be concise and practical (under 180 chars). '
        'It MUST state the deadline relative to now (e.g. "Due in 2 hours" or "Deadline is tomorrow"). '
        'Do NOT say "Deadline is far" if it is within 24 hours.\n\n'
        f'Current Time: {now_str}\n'
        f'Task title: {task.title}\n'
        f'Task description: {task.description}\n'
        f'Deadline (ISO or null): {deadline_str}\n'
        f'User-entered duration minutes (0 means unknown): {task.duration_minutes}\n'
        f'Estimated difficulty from metadata: {estimated_difficulty_label} ({round(estimated_difficulty_score, 1)}/100)\n'
        f'Baseline effort estimate from metadata (minutes): {int(round(estimated_effort_minutes))}\n'
        f'Current status: {task.status}\n'
        f"User Schedule (UNAVAILABLE TIMES): {schedule_str}\n"
        "Instructions: Provide a priority score and suggest the best "
        "time slot that does not overlap with the schedule above."
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
        ai_suggested_slot = parsed_output.get('suggested_start_time')
        
        # Validate format of slot if present and ensure it is in the future
        if ai_suggested_slot:
            try:
                naive_dt = datetime.strptime(ai_suggested_slot, "%Y-%m-%d %H:%M")
                current_tz = timezone.get_current_timezone()
                aware_dt = timezone.make_aware(naive_dt, current_tz)
                
                # Allow a 15-minute grace period for "slightly past" times to avoid discarding useful suggestions
                # due to minor clock differences or processing time.
                grace_period = timezone.now() - timedelta(minutes=15)
                
                if aware_dt < grace_period:
                    # Only discard if *significantly* in the past (more than 15 mins ago)
                    # For slightly past times, we'll keep it as "Due Now"
                    ai_suggested_slot = None
                
                # Also verify against deadline if present
                if task.deadline and ai_suggested_slot:
                    deadline_aware = task.deadline
                    if timezone.is_naive(deadline_aware):
                        deadline_aware = timezone.make_aware(deadline_aware, current_tz)
                    
                    if aware_dt > deadline_aware:
                        # Suggestion is past the deadline -> Invalid
                        ai_suggested_slot = None
            except (ValueError, TypeError):
                ai_suggested_slot = None

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
            suggested_slot=ai_suggested_slot,
        )
    except (error.HTTPError, error.URLError, TimeoutError, socket.timeout, ValueError, TypeError, json.JSONDecodeError):
        # Allow fallback to catch this
        return None


def prioritize_task(task: Task, user) -> PriorityResult:
    gemini_result = _gemini_priority(task, user)
    if gemini_result and gemini_result.suggested_slot:
        # Only accept AI result if it successfully generated a slot
        return gemini_result
    elif gemini_result:
        # If AI worked but failed to give a slot (due to past time filtering), 
        # we might want to inject a fallback slot but keep AI score?
        # But simpler to just run fallback logic for slot finding if we want to guarantee a slot.
        # Let's augment the AI result with a fallback slot if it missed one.
        fallback_slot = _find_next_available_slot(user, task)
        gemini_result.suggested_slot = fallback_slot
        return gemini_result

    return _fallback_priority(task, user)


def prioritize_and_save_task(task: Task, user) -> PriorityResult:
    result = prioritize_task(task, user)
    task.priority_score = result.score
    task.priority_reason = result.reason
    task.priority_source = result.source
    task.priority_confidence = result.confidence
    task.prioritized_at = timezone.now()

    if getattr(result, 'suggested_slot', None):
        try:
            # Gemini returns "YYYY-MM-DD HH:MM", we convert to aware datetime
            naive_dt = datetime.strptime(result.suggested_slot, "%Y-%m-%d %H:%M")
            current_tz = timezone.get_current_timezone()
            task.suggested_start_time = timezone.make_aware(naive_dt, current_tz)
        except (ValueError, TypeError):
            # If the date format is weird, we leave it null rather than crashing
            pass
        
    task.save(update_fields=[
        'priority_score',
        'priority_reason',
        'priority_source',
        'priority_confidence',
        'prioritized_at',
        'suggested_start_time',
    ])
    
    return result

def get_optimal_slot(user, task):
    # 1. Get all fixed classes for the user
    fixed_classes = ClassSchedule.objects.filter(user=user)
    
    # 2. Get all other 'ongoing' tasks already scheduled
    existing_tasks = Task.objects.filter(user=user, status='ongoing').exclude(id=task.id)

    # 3. Ask Gemini to find the "Sweet Spot"
    prompt = f"""
    I have a new task: "{task.title}"
    Description: {task.description}
    Deadline: {task.deadline}
    Estimated Duration: {task.duration_minutes} minutes

    USER'S FIXED CLASS SCHEDULE:
    {list(fixed_classes.values())}

    EXISTING PLANNED TASKS:
    {list(existing_tasks.values('title', 'deadline'))}

    GOAL:
    Find the most efficient vacant time slot before the deadline. 
    - Harder tasks (based on description) should be placed in morning gaps if possible.
    - Never overlap with Class Schedule.
    - Prioritize by how close the deadline is.

    Return ONLY a JSON with:
    {{ "suggested_start_time": "YYYY-MM-DD HH:MM", "priority_level": 1-10, "reasoning": "string" }}
    """
    # ... call Gemini and save the result to the Task model