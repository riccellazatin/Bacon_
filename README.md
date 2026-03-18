# Bacon_

Lightweight full-stack task tracker (Django REST + React). This repository contains a Django backend (API + JWT auth) and a React frontend (Redux, Axios) with a one-time onboarding/preferences flow and a simple to-do/task system.

**Documentation**

This root README is the single documentation file for the project.

**Quick Start (development)**

Must do:
    - Delete node_modules folder, package-lock.json, and package.json files

- **Backend**

  1. py -m venv myenv

```powershell

cd backend
.\myenv\Scripts\Activate.ps1
pip install -r requirements.txt
```

  2. Apply migrations and create a superuser:

```powershell
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

  3. Run the dev server:

```powershell
python manage.py runserver
```

- **Frontend**

  1. Install node deps and start the dev server:

```bash
cd frontend
npm install
npm start (if it did not run using npm start use this -> npm install ajv@^8.0.0 ajv-keywords@^5.0.0 --legacy-peer-deps)
```

  The React app runs at http://localhost:3000 and talks to the backend at http://127.0.0.1:8000 by default (CORS is configured in development).

**Important paths & endpoints**

- Backend API base: `/` (Django dev server)
- Auth token endpoints: `/token/` and `/token/refresh/`
- Current user: `/user/` (GET)
- Update preferences: `/user/preferences/` (PATCH)
- Tasks list/create: `/tasks/` (GET, POST)
- Task complete: `/tasks/{id}/complete/` (PATCH)
- Reprioritize tasks: `/tasks/reprioritize/` (POST)

Access/refresh tokens are saved by the frontend in localStorage under `access_token` and `refresh_token`.

**Gemini AI task prioritization**

Task prioritization is now implemented server-side. The backend stores a computed `priority_score`, `priority_reason`, `priority_source`, and `priority_confidence` for each task.
Task sorting is driven by Gemini's `priority_score` (highest first), balancing difficulty with deadline urgency.

Recommended setup (backend virtual env):

1. Copy `backend/.env.example` to `backend/.env`.
2. Put your key in `GEMINI_API_KEY` inside `backend/.env`.
3. Start backend as usual with `python manage.py runserver`.

To enable Gemini:

```powershell
# PowerShell (current terminal)
$env:GEMINI_API_KEY="your_api_key_here"
$env:GEMINI_MODEL="gemini-2.5-flash"
python manage.py runserver
```

If `GEMINI_API_KEY` is not set (or Gemini fails), the backend automatically falls back to deterministic rule-based prioritization using deadline + difficulty + description quality.

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

**Gemini AI prioritization troubleshooting**

If Gemini AI task prioritization is not working (0% success rate):

1. **Verify `.env` file exists** in `backend/`:
   - Copy from template: `cp backend/.env.example backend/.env`
   - File should NOT be committed (it's in .gitignore)

2. **Get a valid API key**:
   - Visit https://aistudio.google.com/apikey and create a free key
   - Paste it in `backend/.env`: `GEMINI_API_KEY=your_actual_key_here`
   - Remove any quotes or extra spaces around the key

3. **Check backend logs**:
   - Run backend with: `python manage.py runserver`
   - Look for ERROR or WARNING messages mentioning "Gemini API"
   - Common issues:
     - `GEMINI_API_KEY not set` → Check `.env` file exists and has the key
     - `HTTP Error 401` → API key is invalid or malformed
     - `HTTP Error 400` → API key doesn't have permission, regenerate from aistudio.google.com
     - `TimeoutError` → Network connectivity issue or API rate limited

4. **Restart the backend** after adding/changing `.env`

5. **Fallback behavior**:
   - If Gemini API is temporarily unavailable, tasks are automatically sorted using rule-based prioritization (deadline urgency + difficulty + effort estimate)
   - Check the `priority_source` field on each task: `gemini:gemini-2.5-flash` means AI was used; `rules` means fallback
