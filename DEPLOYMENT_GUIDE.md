# ChronoSync-Onco Deployment Guide

This guide will help you deploy ChronoSync-Onco to publicly accessible URLs for your hackathon submission.

---

## 📋 Prerequisites

- GitHub account (free)
- Vercel account (free) - for frontend
- Render account (free) - for backend
- Git installed on your computer

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare and Push to GitHub

First, we need to push your code to GitHub so both Vercel and Render can access it.

```bash
# Navigate to your project directory
cd c:/Users/91988/Downloads/chrono-onco

# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - ChronoSync-Onco prototype"

# Create a new repository on GitHub first (github.com/new)
# Then add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/chrono-onco.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Important:** Before pushing, make sure your `.gitignore` file is in place to avoid pushing sensitive files.

---

### Step 2: Deploy Backend to Render

1. **Create a Render account**
   - Go to https://render.com
   - Sign up with GitHub (recommended)
   - Authorize Render to access your GitHub repositories

2. **Create a new Web Service**
   - Click "New +" → "Web Service"
   - Select your `chrono-onco` repository from GitHub
   - Configure the service:
     - **Name**: `chronosync-onco-api`
     - **Region**: Choose nearest region (e.g., Oregon)
     - **Branch**: `main`
     - **Runtime**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Click "Create Web Service"

3. **Wait for deployment**
   - Render will build and deploy your backend
   - This may take 2-5 minutes
   - You'll see a URL like: `https://chronosync-onco-api.onrender.com`

4. **Configure Environment Variables**
   - Go to your service dashboard on Render
   - Click "Environment" tab
   - Add variable:
     - Key: `FRONTEND_URL`
     - Value: (leave empty for now, we'll add after frontend deployment)

5. **Test the backend**
   - Open your backend URL in browser: `https://chronosync-onco-api.onrender.com`
   - You should see: `{"message":"ChronoSync-Onco API","version":"1.0.0",...}`
   - Test health endpoint: `https://chronosync-onco-api.onrender.com/health`
   - API docs: `https://chronosync-onco-api.onrender.com/docs`

---

### Step 3: Deploy Frontend to Vercel

1. **Create a Vercel account**
   - Go to https://vercel.com
   - Sign up with GitHub (recommended)
   - Authorize Vercel to access your GitHub repositories

2. **Import your project**
   - Click "Add New..." → "Project"
   - Select your `chrono-onco` repository from GitHub
   - Configure the project:
     - **Framework Preset**: Vite
     - **Root Directory**: `./` (leave as default)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Configure Environment Variables**
   - In the Environment Variables section:
     - Key: `VITE_API_BASE_URL`
     - Value: Your Render backend URL (e.g., `https://chronosync-onco-api.onrender.com`)
   - Click "Add"

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - This may take 1-3 minutes
   - You'll see a URL like: `https://chrono-onco.vercel.app`

5. **Update Backend CORS**
   - Go back to Render dashboard
   - Add environment variable:
     - Key: `FRONTEND_URL`
     - Value: Your Vercel frontend URL (e.g., `https://chrono-onco.vercel.app`)
   - Render will automatically redeploy with the new setting

---

### Step 4: Test the Complete Application

1. **Open your frontend URL**
   - Navigate to: `https://chrono-onco.vercel.app`
   - You should see the ChronoSync-Onco application

2. **Test Device Simulation**
   - Click "Device Simulation" in sidebar
   - Select a patient
   - Click "Start Monitoring"
   - Verify live readings update
   - Complete all 5 stages

3. **Test Clinician Dashboard**
   - Click "Clinician Dashboard" in sidebar
   - Verify charts render correctly
   - Test patient selection

4. **Test API Communication**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Start monitoring in Device Simulation
   - Verify API calls to your Render backend succeed

---

## 🔧 Troubleshooting

### Frontend shows blank screen
- Check Vercel deployment logs for build errors
- Verify `npm run build` works locally
- Check browser console for JavaScript errors

### API calls failing with CORS error
- Verify FRONTEND_URL is set in Render environment variables
- Check that the frontend URL matches exactly (no trailing slashes)
- Wait for Render to redeploy after adding environment variable

### Backend returns 500 errors
- Check Render logs for error messages
- Verify all Python dependencies are in requirements.txt
- Test backend locally with `uvicorn main:app --host 0.0.0.0 --port 8000`

### Charts not rendering
- Verify Recharts is properly installed
- Check browser console for errors
- Ensure data is being fetched from API

---

## 📝 Final URLs After Deployment

After completing the steps above, you'll have:

- **Frontend URL**: `https://chrono-onco.vercel.app` (or your custom domain)
- **Backend API URL**: `https://chronosync-onco-api.onrender.com`
- **API Documentation**: `https://chronosync-onco-api.onrender.com/docs`

---

## 🔄 How to Update After Deployment

### Frontend Updates
1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update description"
   git push
   ```
3. Vercel will automatically redeploy

### Backend Updates
1. Make changes to backend code
2. Commit and push to GitHub
3. Render will automatically redeploy
4. Or trigger manual redeploy from Render dashboard

### Environment Variable Changes
- Update in Vercel/Render dashboards
- Services will redeploy automatically

---

## ⚡ Alternative: Single Repository Structure

If you prefer to keep everything in one repository (recommended):

```
chrono-onco/
├── frontend/          # React/Vite frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/           # FastAPI backend
│   ├── main.py
│   ├── routers/
│   ├── models.py
│   └── requirements.txt
├── README.md
└── .gitignore
```

For this structure:
- Deploy frontend from `frontend/` directory on Vercel
- Deploy backend from `backend/` directory on Render
- Set root directory accordingly in deployment settings

---

## 🎯 Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Backend health endpoint accessible
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] Device simulation tested
- [ ] Clinician dashboard tested
- [ ] API communication verified
- [ ] Application works in fresh browser

---

## 🆘 Need Help?

If you encounter issues:

1. **Vercel Documentation**: https://vercel.com/docs
2. **Render Documentation**: https://render.com/docs
3. **Check deployment logs** in both Vercel and Render dashboards
4. **Test locally** to ensure code works before deploying

---

## 📌 Important Notes

- Both Vercel and Render free tiers have usage limits
- Free tier services may "sleep" when not in use (cold starts)
- First load after sleep may take 10-30 seconds
- For hackathon demo, warm up the site a few minutes before presenting
- Keep your API keys and secrets in environment variables, never in code

---

**Good luck with your Seva First Innovation Challenge hackathon submission!** 🚀
