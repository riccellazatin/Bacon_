# BACON - Point System Task Tracker

A full-stack task management application featuring AI-powered task prioritization, a weekly point system with shop integration, and intelligent schedule management.

**Tech Stack:**
- **Backend**: Django 6.0.2, Django REST Framework, JWT authentication, PostgreSQL
- **Frontend**: React with Redux, Axios HTTP client
- **AI Integration**: Google Gemini API for task classification and schedule extraction

## Features

✨ **Task Management**
- AI-powered task prioritization using Gemini
- Weekly point system: Complete tasks to earn points (Easy: 0.5pts, Medium: 1pt, Hard: 2pts)
- Weekly earning limit: 15 points per week (resets every 7 days)
- Task difficulty classification: AI automatically determines task complexity based on description and duration

📚 **Schedule Management**
- Extract class schedule from image via Gemini OCR
- Visual weekly grid display of classes (Monday-Sunday, 6 AM - 10 PM)
- Avoid scheduling conflicts between tasks and classes
- User-defined work preferences: off-days, work hours

🏪 **Shop & Rewards**
- Browse and purchase items using earned points
- Point deductions only affect total points (weekly earned points preserved)
- Predefined shop items: Coffee, food, gift cards (₱200+)

👤 **User Onboarding**
- One-time preference setup (off-days, work hours)
- Account gating based on onboarding status
- Automatic UserPreferences creation on registration

---

## Quick Start (Development)

**Prerequisites:**
- Python 3.9+, Node.js 14+
- PostgreSQL database running locally

### Backend Setup

```powershell
cd backend
py -m venv myenv
.\myenv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Database & Admin:**
```powershell
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

**Environment Variables** - Create `backend/.env`:
```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
SECRET_KEY=your_django_secret_key
DEBUG=True
```

**Run Server:**
```powershell
python manage.py runserver
```
Backend runs on http://127.0.0.1:8000

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000

> Note: If you see peer dependency warnings, run:
```bash
npm install ajv@^8.0.0 ajv-keywords@^5.0.0 --legacy-peer-deps
```

---

## Core Models

### User Model (`accounts/models.py`)
```python
- email (unique, USERNAME_FIELD)
- username
- total_points (float) - Lifetime earned points
- points_earned_this_week (float) - Weekly accumulation (resets every 7 days)
- week_start_date (date) - Tracks weekly reset
- is_onboarded (bool) - Preference setup status
```

### Task Model (`tasks/models.py`)
```python
- title, description
- deadline, suggested_start_time (AI calculated)
- duration_minutes
- difficulty (easy/medium/hard) - AI determined
- points_value (float) - Awarded on completion based on difficulty
- priority_score (float) - AI prioritization (0-100)
- priority_reason (text) - Why this priority
- status (ongoing/missing/done)
```

### ScheduleBlock Model (`tasks/models.py`)
```python
- subject (class name)
- day_of_week (Monday-Sunday)
- start_time, end_time
```

### Items Model (`shop/models.py`)
```python
- name, description, image
- points (int) - Cost to purchase
- is_paid (bool)
```

---

## Key API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/token/` | POST | Login (returns JWT tokens) |
| `/token/refresh/` | POST | Refresh access token |
| `/user/` | GET | Get current user info |
| `/user/points/` | GET | Get total & weekly points |
| `/user/preferences/` | PATCH | Update work preferences |
| `/tasks/` | GET, POST | List & create tasks |
| `/tasks/{id}/complete/` | PATCH | Mark task done, award points |
| `/tasks/reprioritize/` | POST | Recalculate priorities |
| `/tasks/upload-schedule/` | POST | OCR extract schedule |
| `/tasks/schedule-blocks/` | GET | List classes |
| `/api/items/` | GET | List shop items |
| `/api/items/{id}/purchase/` | POST | Buy item with points |

---

## AI Features

### Task Prioritization (`tasks/services/prioritization.py`)
- **AI Approach**: Sends task details to Gemini → returns priority score + reasoning
- **Fallback**: Rule-based scoring if API unavailable
  - Deadline urgency (closer = higher priority)
  - Task difficulty (harder tasks nudged up when deadlines similar)
  - Description quality & duration signals

### Difficulty Classification
- **AI Analysis**: Analyzes task title, description, and duration
- **Difficulty Levels**: Easy (0.5 pts) → Medium (1 pt) → Hard (2 pts)
- **Fallback**: Rule-based using description length + complexity keywords

### Schedule Extraction
- **Gemini Vision**: Processes uploaded class schedule image
- **Extraction**: Identifies classes, days, times, subject names
- **Auto-blocking**: Prevents task scheduling during class times

---

## User Journey

### Brand New User
1. Register with email/password
2. System marks `is_onboarded = false`
3. Redirected to Preferences setup
4. Set off-days, work start/end times
5. System marks `is_onboarded = true`
6. Redirected to ScheduleGate

### Return User
1. Login with email/password
2. Check `is_onboarded = true` → Access Dashboard
3. May be gated by ScheduleGate if no schedule uploaded
4. Upload class schedule via image
5. Dashboard shows tasks + weekly progress

### Task Completion Flow
1. User marks task as done
2. Backend:
   - Validates difficulty is set (fallback to medium if missing)
   - Calculates points based on difficulty
   - Checks weekly limit (15 points max)
   - Adds points to user.total_points
   - Awards remaining points to points_earned_this_week (if under 15)
   - Returns response with new totals
3. Frontend:
   - Redux updates points immediately from response
   - Display refreshes instantly
   - Shows weekly limit warning if reached 15/15

---

## State Management (Redux)

### Auth Reducer
- `userInfo` - Current user object (email, username, total_points)
- `token` - JWT access token
- `isOnboarded` - Boolean onboarding status

### Tasks Reducer
- `tasks` - Array of user's tasks
- `loading`, `error` states

### Schedule Reducer
- `blocks` - Array of ScheduleBlock objects
- `hasSchedule` - Boolean (true if blocks exist)

### Points Reducer (NEW)
- `total_points`, `points_earned_this_week`, `weekly_limit`
- Centralized points state (persists across page navigation)
- Updated immediately on task completion via Redux dispatch

**Why Redux for Points?**
- Local component state was reverting to 0 when navigating between pages
- Redux provides single source of truth across entire app
- Dashboard & Shop stay in perfect sync

---

## Point System Logic

**Earning Points:**
- Easy tasks: +0.5 points
- Medium tasks: +1 point
- Hard tasks: +2 points

**Weekly Limit:**
- Hard cap: 15 points earned per week
- Rolling 7-day window: `week_start_date` tracks reset
- When limit reached: No more points awarded until next week
- Warning message displays: "Weekly limit reached! Earn more next week."

**Purchasing Items:**
- Deducts from `total_points` only (lifetime accumulation)
- Does NOT affect `points_earned_this_week`
- Allows future monetization: "Increase weekly limit" upgrade feature

---

## Common Development Tasks

### Add New Task Field
1. Add to `Task` model in `tasks/models.py`
2. Run: `python manage.py makemigrations tasks`
3. Run: `python manage.py migrate`
4. Update `TaskSerializer` in `tasks/serializers.py`

### Troubleshoot Difficulty Not Setting
1. Check the task record: `python manage.py shell`
   ```python
   from tasks.models import Task
   t = Task.objects.filter(difficulty='').first()
   t.difficulty  # Should be auto-determined during creation
   ```
2. Ensure `determine_task_difficulty()` is called in `TaskListCreateView.perform_create()`

### Reset User Points (Testing)
```python
from accounts.models import User
u = User.objects.get(email='test@example.com')
u.total_points = 0
u.points_earned_this_week = 0
u.save()
```

### Test Without Gemini
- Leave `GEMINI_API_KEY` unset in `.env`
- System automatically falls back to rule-based prioritization
- Check logs: "AI unavailable, defaulting to..."

---

## Notes

- CORS is configured in development to allow `http://localhost:3000` → `http://127.0.0.1:8000`
- Tokens stored in browser localStorage persist across sessions
- No role-based access control yet (all authenticated users see all endpoints)
- Future features: Bulk point purchases, sharing tasks, team collaboration
- **Data Integration**: Fetches schedule blocks from `/api/tasks/schedule-blocks/` endpoint

**Technical Details:**
- **Component**: [ScheduleOverview.jsx](frontend/src/screens/ScheduleOverview/ScheduleOverview.jsx)
- **Styling**: [ScheduleOverview.css](frontend/src/screens/ScheduleOverview/ScheduleOverview.css)
- **State**: Redux `schedule` reducer (`blocks` array + `loading` state)
- **Authentication**: Protected route via `ScheduleGate` wrapper (requires `hasSchedule` flag)
- **Colors**: Uses project primary red (#cf403f) for headers and class cards

**Branching / pushing**

To create and push a working branch for the to-do work:

```bash
git checkout -b "to-do list"
git add -A
git commit -m "chore: snapshot for to-do list branch"
git push -u origin "to-do list"
```

**Notes & troubleshooting**

- If the frontend redirects to `/preferences` after a refresh, ensure the frontend can fetch `/user/` (check network tab). If the request fails (401), refresh token flow may need inspection.
- If migrations error due to history, remove `db.sqlite3` in development and re-run migrations (this is destructive — only for dev).
- The backend uses simple random point assignment when completing a task; points are awarded server-side.
- **Schedule Overview**: The schedule grid adapts to any viewport size using responsive `max()` CSS functions. If the grid appears cramped, check that no container has a fixed max-width constraint.
- **Protected Routes**: The Schedule Overview is protected by `ScheduleGate` — ensure the Redux `schedule.hasSchedule` flag is set to `true` after uploading a schedule in Semester Scan.
