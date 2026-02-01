# Deployment Guide

## Deploying to Railway (Recommended - Free Tier Available)

Railway is the easiest way to deploy this Node.js app. Follow these steps:

### Step 1: Create a Railway Account
- Go to https://railway.app
- Sign up with GitHub (easiest option)

### Step 2: Create a New Project
- Click "Create a new project"
- Select "Deploy from GitHub"
- Choose your `collabarative_drawing_canvas` repository
- Click "Deploy Now"

### Step 3: Configure Environment
Railway auto-detects Node.js projects and installs dependencies automatically. No special config needed!

### Step 4: Get Your URL
Once deployed, Railway will give you a public URL like:
```
https://collaborative-canvas-production.railway.app
```

### Step 5: Test It
- Open the URL in your browser
- Open it in a second browser window
- Test real-time drawing!

---

## Alternative: Vercel Deployment

Vercel also works but requires a different setup since it's serverless:

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
vercel
```

### Step 3: Configure
When prompted, use defaults but update `vercel.json` to use:
```json
{
  "buildCommand": "npm install",
  "outputDirectory": ".",
  "framework": "nodejs"
}
```

---

## Alternative: Heroku Deployment

Heroku is shutting down free tier, but if you have credits:

### Step 1: Install Heroku CLI
```bash
npm install -g heroku
```

### Step 2: Create App & Deploy
```bash
heroku create your-app-name
git push heroku main
```

### Step 3: View Logs
```bash
heroku logs --tail
```

---

## Troubleshooting

### Port Issues
The app reads `PORT` from environment. Railway/Heroku automatically set this.

### WebSocket Issues
Make sure your deployment supports WebSockets (all three platforms do).

### Build Failures
Check that `package.json` has all dependencies:
```bash
npm install uuid express socket.io
npm install --save-dev
```

---

## Current Repository

**GitHub Link**: https://github.com/dheerajkumar161/collabarative_drawing_canvas

Your deployment link will be provided by the platform after you follow the above steps.
