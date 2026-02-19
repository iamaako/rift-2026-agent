# 🚀 Deployment Guide - Web Interface Only

Complete guide using **Heroku Web Interface** for backend and **Vercel Web Interface** for frontend.

---

## 📋 Prerequisites

- [x] GitHub account
- [x] Heroku account ([Sign up](https://signup.heroku.com/))
- [x] Vercel account ([Sign up](https://vercel.com/signup))
- [x] Gemini API Key ([Get here](https://makersuite.google.com/app/apikey))
- [x] GitHub Token (optional) ([Get here](https://github.com/settings/tokens))

---

## 📦 Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - RIFT 2026 Agent"

# Create main branch
git branch -M main

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/rift-2026-agent.git

# Push to GitHub
git push -u origin main
```

---

## 🔧 Step 2: Deploy Backend to Heroku

### 2.1 Create Heroku App

1. Go to [Heroku Dashboard](https://dashboard.heroku.com/)
2. Click **"New"** → **"Create new app"**
3. Enter app name: `rift-agent-backend` (or any unique name)
4. Choose region: **United States**
5. Click **"Create app"**

### 2.2 Connect GitHub

1. Go to **"Deploy"** tab
2. Deployment method: Select **"GitHub"**
3. Click **"Connect to GitHub"**
4. Search for your repository: `rift-2026-agent`
5. Click **"Connect"**

### 2.3 Deploy

1. Scroll to **"Manual deploy"** section
2. Select branch: **main**
3. Click **"Deploy Branch"**
4. Wait 2-3 minutes for build to complete
5. You'll see "Your app was successfully deployed"

### 2.4 Set Environment Variables

1. Go to **"Settings"** tab
2. Click **"Reveal Config Vars"**
3. Add these variables:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | Your Gemini API key |
| `GITHUB_TOKEN` | Your GitHub token (optional) |
| `PORT` | `8000` |

### 2.5 Verify Backend

1. Click **"Open app"** button (top right)
2. Your backend URL: `https://rift-agent-backend.herokuapp.com`
3. Test health check: `https://rift-agent-backend.herokuapp.com/health`
4. Should return: `{"status": "healthy"}`

**✅ Save this URL - you'll need it for frontend!**

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Continue with GitHub"**
4. Select repository: `rift-2026-agent`
5. Click **"Import"**

### 3.2 Configure Project

**Framework Preset:** Vite (auto-detected)

**Root Directory:** 
- Click **"Edit"** next to Root Directory
- Enter: `frontend`
- Click **"Continue"**

**Build Settings** (auto-detected):
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 3.3 Add Environment Variable

1. Expand **"Environment Variables"** section
2. Add variable:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://rift-agent-backend.herokuapp.com` |

(Use your actual Heroku backend URL from Step 2)

### 3.4 Deploy

1. Click **"Deploy"** button
2. Wait 1-2 minutes for deployment
3. You'll see "Congratulations!" when done
4. Your frontend URL: `https://your-project.vercel.app`

### 3.5 Verify Frontend

1. Click **"Visit"** button
2. Dashboard should load
3. Try entering a repository URL
4. Check if it connects to backend

---

## 🔄 Step 4: Update Backend CORS

After frontend is deployed, update backend CORS settings:

### 4.1 Update Code Locally

Edit `backend/main.py` (around line 18):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-project.vercel.app",  # ← Your Vercel URL
        "http://localhost:5173"  # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4.2 Push to GitHub

```bash
git add .
git commit -m "Update CORS for production"
git push origin main
```

### 4.3 Redeploy on Heroku

**Option A: Auto Deploy (Recommended)**
1. Go to Heroku → Deploy tab
2. Enable **"Automatic deploys"** from main branch
3. Heroku will auto-deploy on every push

**Option B: Manual Deploy**
1. Go to Heroku → Deploy tab
2. Scroll to "Manual deploy"
3. Click **"Deploy Branch"**

---

## ✅ Step 5: Final Testing

### Test Backend
```bash
# Health check
curl https://rift-agent-backend.herokuapp.com/health

# API docs
open https://rift-agent-backend.herokuapp.com/docs
```

### Test Frontend
1. Open: `https://your-project.vercel.app`
2. Enter repository URL
3. Enter team details
4. Click "Run Agent"
5. Verify real-time updates work
6. Check browser console (F12) for errors

### Test Integration
- Frontend should connect to backend
- No CORS errors in console
- Agent should run successfully
- Fixes should display in dashboard

---

## 🔐 Environment Variables Summary

### Heroku (Backend)
| Variable | Required | Value |
|----------|----------|-------|
| `GEMINI_API_KEY` | ✅ Yes | Your Gemini API key |
| `GITHUB_TOKEN` | ❌ Optional | Your GitHub token |
| `PORT` | ✅ Yes | `8000` |

### Vercel (Frontend)
| Variable | Required | Value |
|----------|----------|-------|
| `VITE_API_URL` | ✅ Yes | `https://rift-agent-backend.herokuapp.com` |

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Build fails on Heroku
```
Solution:
1. Check if Procfile exists in root
2. Check if requirements.txt exists in root
3. Check if runtime.txt exists in root
4. View logs: Heroku Dashboard → More → View logs
```

**Problem:** App crashes after deploy
```
Solution:
1. Check Config Vars are set (GEMINI_API_KEY)
2. View logs: More → View logs
3. Check Python version in runtime.txt
4. Check if Git is installed (Aptfile and .buildpacks configured)
```

**Problem:** Health check fails
```
Solution:
1. Check if app is running: heroku ps
2. Check logs for errors
3. Verify PORT is set to 8000
```

**Problem:** API endpoints return 404 (run_id not found)
```
This means the background agent task is failing. Debug steps:

1. Check Heroku logs for [RIFT] messages:
   - Look for "Created orchestrator with run_id"
   - Look for "Background task error"
   - Look for "Fatal error: Git not available"

2. Verify Git is installed:
   - Check .buildpacks file exists in root
   - First line: https://github.com/heroku/heroku-buildpack-apt
   - Second line: https://github.com/heroku/heroku-buildpack-python
   - Check Aptfile exists with "git" and "git-core"

3. Test health endpoint to see active runs:
   curl https://your-backend.herokuapp.com/health
   
   If "active_runs" is 0 after starting analysis, background task failed.

4. Check GEMINI_API_KEY is set correctly in Config Vars

5. Try with a public test repository first
```

**Problem:** "Git not available" error
```
Solution:
1. Ensure .buildpacks file exists in root directory
2. Ensure Aptfile exists in root directory
3. Redeploy the app (buildpacks only run during build)
4. Check build logs for "apt" buildpack execution
```

### Frontend Issues

**Problem:** Build fails on Vercel
```
Solution:
1. Check Root Directory is set to "frontend"
2. Check package.json exists in frontend/
3. View build logs in Vercel dashboard
```

**Problem:** Can't connect to backend
```
Solution:
1. Check VITE_API_URL is correct in Vercel
2. Check backend CORS includes Vercel URL
3. Open browser console (F12) for errors
4. Test backend URL directly
```

**Problem:** CORS errors
```
Solution:
1. Update backend/main.py with Vercel URL
2. Push to GitHub
3. Redeploy backend on Heroku
4. Clear browser cache and retry
```

---

## 🔄 Updating Deployments

### Update Backend
```bash
# Make changes
git add .
git commit -m "Update backend"
git push origin main

# If auto-deploy enabled, Heroku will deploy automatically
# Otherwise, manually deploy from Heroku dashboard
```

### Update Frontend
```bash
# Make changes
git add .
git commit -m "Update frontend"
git push origin main

# Vercel will automatically deploy
```

---

## 📊 Monitoring

### Heroku Logs
1. Go to Heroku Dashboard
2. Select your app
3. Click **"More"** → **"View logs"**
4. Monitor real-time logs

### Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click on latest deployment
4. View **"Build Logs"** or **"Function Logs"**

---

## 💰 Free Tier Limits

### Heroku Free Tier
- 550-1000 free dyno hours/month
- App sleeps after 30 min inactivity
- Wakes up on first request (10-30 sec delay)

### Vercel Free Tier
- Unlimited deployments
- 100GB bandwidth/month
- Automatic SSL
- Global CDN

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Heroku app created
- [ ] Backend deployed successfully
- [ ] Config vars set (GEMINI_API_KEY)
- [ ] Backend health check passes
- [ ] Vercel project created
- [ ] Frontend deployed successfully
- [ ] Environment variable set (VITE_API_URL)
- [ ] Frontend loads correctly
- [ ] Backend CORS updated with Vercel URL
- [ ] End-to-end test successful
- [ ] No errors in browser console
- [ ] No errors in Heroku logs

---

## 🎉 Deployment Complete!

Your URLs:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://rift-agent-backend.herokuapp.com`
- **API Docs**: `https://rift-agent-backend.herokuapp.com/docs`

**Next Steps:**
1. Test thoroughly
2. Record demo video (2-3 min)
3. Post on LinkedIn with @RIFT2026
4. Submit to RIFT website

**Good luck! 🚀**

---

Made with ❤️ for RIFT 2026
