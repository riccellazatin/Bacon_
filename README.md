# Bacon_

Lightweight full-stack task tracker (Django REST + React). This repository contains a Django backend (API + JWT auth) and a React frontend (Redux, Axios) with a one-time onboarding/preferences flow and a simple to-do/task system.

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

Access/refresh tokens are saved by the frontend in localStorage under `access_token` and `refresh_token`.

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

If you'd like, I can extend this README with screenshots, a contribution guide, or a list of available npm/Python scripts. 
