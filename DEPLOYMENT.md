# Deployment Guide: Bacon_ to Vercel + Render

Complete step-by-step guide to deploy your Bacon_ app to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- [ ] You have a GitHub account and repo is pushed to a branch
- [ ] Render account created (https://render.com)
- [ ] Vercel account created (https://vercel.com)
- [ ] PostgreSQL database ready (via pgAdmin locally set up)
- [ ] API keys ready: Google OAuth, PayPal, Gemini
- [ ] `.env` file is in `.gitignore` (secrets NOT in repo)

---

## 🚀 STEP 1: Backend Deployment on Render

### 1.1 Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name:** `bacon-db`
   - **Database:** `bacon`
   - **User:** `bacon_user`
   - **Region:** `Oregon` (or your preference)
   - **Plan:** Free (for testing) or Paid for production
4. Click **Create Database**
5. ⏳ Wait 2-3 minutes for database to initialize
6. Copy the **Internal Database URL** (looks like: `postgresql://user:password@...`) — **Save this carefully**

### 1.2 Deploy Backend Web Service on Render

1. In Render Dashboard, click **New +** → **Web Service**
2. Connect your GitHub repo:
   - Click "Connect account" if needed
   - Select your `Bacon_` repo
   - Branch: `deployment` (or your branch)
3. Configure:
   - **Name:** `bacon-backend`
   - **Runtime:** `Python 3.11`
   - **Build Command:** 
     ```bash
     pip install -r backend/requirements.txt
     cd backend && python manage.py collectstatic --no-input
     ```
   - **Start Command:** 
     ```bash
     cd backend && gunicorn backend.wsgi --log-file -
     ```
   - **Plan:** Free (good for testing)
4. Scroll to **Environment Variables** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `DEBUG` | `false` | 🔴 Production mode |
| `SECRET_KEY` | `[generate new]` | See below ⬇️ |
| `DATABASE_URL` | Paste Internal DB URL | From Step 1.1 |
| `ALLOWED_HOSTS` | `bacon-backend.onrender.com` | Replace with actual |
| `CORS_ALLOWED_ORIGINS` | `https://yourdomain.vercel.app` | Your Vercel URL (get after frontend deploy) |
| `GOOGLE_CLIENT_ID` | Your Google client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Your Google secret | From Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | `https://yourdomain.vercel.app/api/accounts/google/callback/` | Same as CORS domain |
| `GEMINI_API_KEY` | Your Gemini API key | From Google AI Studio |
| `PAYPAL_CLIENT_ID` | Your PayPal client ID | From PayPal Developer |
| `PAYPAL_SECRET_KEY` | Your PayPal secret | From PayPal Developer |

**Generate new SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

5. Click **Create Web Service**
6. ⏳ Render will build and deploy (2-5 minutes)
7. Once deployed, you'll get a URL like `https://bacon-backend.onrender.com` — **Save this**

### 1.3 Run Database Migrations on Render

Once backend is deployed:
1. In Render dashboard, click your `bacon-backend` service
2. Go to **Shell** tab
3. Run:
   ```bash
   python manage.py migrate
   ```
4. Verify output shows "OK"

**Troubleshooting:**
- If migration fails, check database connection in **Logs** tab
- Ensure DATABASE_URL is correct

---

## 🎨 STEP 2: Frontend Deployment on Vercel

### 2.1 Prepare Frontend

1. Open `frontend/.env` and update:
   ```env
   REACT_APP_API_BASE=https://bacon-backend.onrender.com/api
   ```
2. Commit and push to GitHub:
   ```bash
   git add frontend/.env
   git commit -m "Update API base URL for production"
   git push origin deployment
   ```

### 2.2 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New...** → **Project**
3. Import your GitHub repo (search for `Bacon_`)
4. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
5. Add **Environment Variables:**

| Key | Value |
|-----|-------|
| `REACT_APP_API_BASE` | `https://bacon-backend.onrender.com/api` |
| `REACT_APP_GOOGLE_CLIENT_ID` | Your Google client ID |
| `REACT_APP_GOOGLE_REDIRECT_URI` | `https://yourdomain.vercel.app/api/accounts/google/callback/` |
| `REACT_APP_PAYPAL_CLIENT_ID` | Your PayPal client ID |

6. Click **Deploy**
7. ⏳ Vercel will build and deploy (1-2 minutes)
8. Once ready, you'll get a URL like `https://bacon-xyz.vercel.app` — **This is your frontend domain**

### 2.3 Update Backend CORS

Now that you have your Vercel domain:

1. Go back to Render dashboard → `bacon-backend` service
2. Go to **Settings** → **Environment**
3. Update `CORS_ALLOWED_ORIGINS`:
   ```
   https://yourdomain.vercel.app,https://www.yourdomain.vercel.app
   ```
4. Update `GOOGLE_REDIRECT_URI`:
   ```
   https://yourdomain.vercel.app/api/accounts/google/callback/
   ```
5. Render will auto-redeploy

---

## 🔐 STEP 3: Google OAuth Setup

Google OAuth now needs your production URLs.

### 3.1 Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click your OAuth 2.0 Client ID
5. Update **Authorized redirect URIs:**
   ```
   https://yourdomain.vercel.app/api/accounts/google/callback/
   ```
6. Click **Save**

### 3.2 Get Updated Credentials (if needed)

If you regenerated the client, get the new:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Update these in Render environment variables.

---

## 🧪 STEP 4: Test Your Deployment

1. Open your frontend URL: `https://yourdomain.vercel.app`
2. Test key features:
   - [ ] Registration works
   - [ ] Google OAuth login works
   - [ ] Can view dashboard
   - [ ] Can add tasks
   - [ ] API calls complete without CORS errors

**Check Logs if Issues:**
- **Backend:** Render dashboard → Service → **Logs** tab
- **Frontend:** Vercel dashboard → Deployments → click latest → **Logs**

---

## 📱 STEP 5: Custom Domain (Optional)

### Vercel Custom Domain
1. Vercel dashboard → Your project → **Settings** → **Domains**
2. Add your domain (e.g., `bacon.yourdomain.com`)
3. Follow DNS setup instructions
4. Update all environment variables with new domain

### Render Custom Domain
1. Render dashboard → `bacon-backend` → **Settings** → **Custom Domain**
2. Add domain (e.g., `api.bacon.yourdomain.com`)
3. Follow DNS setup

---

## 📝 Environment Variables Reference

### Backend (.env or Render)
```env
DEBUG=false
SECRET_KEY=your-generated-django-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/bacon
ALLOWED_HOSTS=bacon-backend.onrender.com,your-custom-domain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.vercel.app
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://yourdomain.vercel.app/api/accounts/google/callback/
GEMINI_API_KEY=xxx
PAYPAL_CLIENT_ID=xxx
PAYPAL_SECRET_KEY=xxx
```

### Frontend (.env or Vercel)
```env
REACT_APP_API_BASE=https://bacon-backend.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=xxx
REACT_APP_GOOGLE_REDIRECT_URI=https://yourdomain.vercel.app/api/accounts/google/callback/
REACT_APP_PAYPAL_CLIENT_ID=xxx
```

---

## 🔧 Troubleshooting

### CORS Errors
- ❌ Error: `Access to XMLHttpRequest blocked by CORS policy`
- ✅ Fix: Ensure `CORS_ALLOWED_ORIGINS` in Render includes your Vercel domain

### Database Connection Failed
- ❌ Error: `could not connect to server`
- ✅ Fix: Check `DATABASE_URL` is correct and Postgres service is running

### Google Login Fails
- ❌ Error: `Redirect URI mismatch` or `Invalid OAuth 2.0 configuration`
- ✅ Fix: Ensure Google Cloud Console has exact redirect URI: `https://yourdomain.vercel.app/api/accounts/google/callback/`

### Static Files Not Loading (CSS/JS not visible)
- ❌ Frontend shows but styles missing
- ✅ Fix: Backend ran `collectstatic` in build command

### 502 Bad Gateway
- ❌ Error: `Render backend returning 502`
- ✅ Fix: Check Render logs for Django errors, ensure `gunicorn` is running

---

## 🚨 Security Reminders

Before production:
1. ✅ Generate NEW `SECRET_KEY` (don't use dev key)
2. ✅ Set `DEBUG=false`
3. ✅ Rotate Google & PayPal keys (old ones were in git history)
4. ✅ Ensure `.env` is in `.gitignore`
5. ✅ Enable HTTPS (both Vercel & Render do this by default)
6. ✅ Review Django security checklist: https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

---

## 📊 Monitoring & Logs

- **Render Backend Logs:** Dashboard → Service → Logs
- **Vercel Frontend Logs:** Dashboard → Deployments → Build/Runtime logs
- **Database Connection Issues:** Render → Postgres → Logs

---

## 🔄 Redeploying After Changes

### Push to Render (backend):
```bash
git push origin deployment
```
Render auto-redeploys on GitHub push.

### Push to Vercel (frontend):
```bash
git push origin deployment
```
Vercel auto-redeploys on GitHub push.

---

## ✅ Deployment Complete!

Your app is now live at:
- **Frontend:** `https://yourdomain.vercel.app`
- **Backend API:** `https://bacon-backend.onrender.com/api`

Enjoy! 🎉
