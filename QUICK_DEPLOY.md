# ⚡ Quick Deployment Checklist for ChronoSync-Onco

Follow these exact steps to deploy your application for the hackathon.

---

## STEP 1: Push to GitHub (5 minutes)

### 1.1 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `chrono-onco`
3. Make it **Public** (so judges can access)
4. Click "Create repository"
5. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/chrono-onco.git`)

### 1.2 Push Your Code
Open terminal in your project directory and run:

```bash
cd c:/Users/91988/Downloads/chrono-onco

git init
git add .
git commit -m "Initial commit - ChronoSync-Onco prototype"

# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/chrono-onco.git
git branch -M main
git push -u origin main
```

**✅ Done when:** You can see your code on GitHub at github.com/YOUR_USERNAME/chrono-onco

---

## STEP 2: Deploy Backend to Render (10 minutes)

### 2.1 Create Render Account
1. Go to https://render.com
2. Click "Sign Up"
3. Choose "Sign up with GitHub" (easiest)
4. Authorize Render to access your repositories

### 2.2 Create Web Service
1. Click "New +" button (top right)
2. Select "Web Service"
3. Under "Connect", select your `chrono-onco` repository
4. Click "Connect"

### 2.3 Configure Service
Fill in these settings:

- **Name**: `chronosync-onco-api`
- **Region**: Oregon (or nearest to you)
- **Branch**: `main`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 2.4 Deploy
1. Click "Create Web Service" at the bottom
2. Wait 2-5 minutes for deployment
3. You'll see a URL like: `https://chronosync-onco-api.onrender.com`

### 2.5 Test Backend
Open these URLs in your browser:
- `https://chronosync-onco-api.onrender.com` - Should return JSON
- `https://chronosync-onco-api.onrender.com/health` - Should return `{"status":"healthy"}`
- `https://chronosync-onco-api.onrender.com/docs` - API documentation

**✅ Done when:** Backend health endpoint returns `{"status":"healthy"}`

### 2.6 Add Environment Variable
1. In Render dashboard, click your service
2. Go to "Environment" tab
3. Click "Add Environment Variable"
4. Key: `FRONTEND_URL`
5. Value: Leave empty for now (we'll add after frontend deployment)
6. Click "Save Changes"

---

## STEP 3: Deploy Frontend to Vercel (10 minutes)

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Sign up with GitHub" (easiest)
4. Authorize Vercel to access your repositories

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Find and select your `chrono-onco` repository
3. Click "Import"

### 3.3 Configure Project
Vercel will auto-detect settings. Verify:

- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3.4 Add Environment Variable
1. Scroll to "Environment Variables"
2. Click "Add New"
3. Name: `VITE_API_BASE_URL`
4. Value: Your Render backend URL (e.g., `https://chronosync-onco-api.onrender.com`)
5. Click "Add"

### 3.5 Deploy
1. Click "Deploy" button
2. Wait 1-3 minutes
3. You'll see a URL like: `https://chrono-onco.vercel.app`

### 3.6 Test Frontend
Open your Vercel URL in browser:
- You should see the ChronoSync-Onco dashboard
- Click "Device Simulation" in sidebar
- Test the complete 5-stage workflow

**✅ Done when:** Device simulation works and shows live readings

---

## STEP 4: Update Backend CORS (2 minutes)

1. Go back to Render dashboard
2. Click your `chronosync-onco-api` service
3. Go to "Environment" tab
4. Find the `FRONTEND_URL` variable
5. Update the value to your Vercel URL (e.g., `https://chrono-onco.vercel.app`)
6. Click "Save Changes"
7. Render will automatically redeploy

**✅ Done when:** Render shows "Deploy successful"

---

## STEP 5: Final Testing (5 minutes)

### Test Checklist:
- [ ] Open frontend URL in fresh browser (incognito mode)
- [ ] Navigate to Device Simulation
- [ ] Select patient and start monitoring
- [ ] Verify live readings update
- [ ] Complete all 5 stages
- [ ] Navigate to Clinician Dashboard
- [ ] Verify charts render
- [ ] Test with different patients
- [ ] Open DevTools (F12) → Network tab
- [ ] Verify API calls succeed (no red errors)

---

## 📋 Your Final URLs

After completing all steps, you'll have:

- **Frontend**: `https://chrono-onco.vercel.app` (or similar)
- **Backend**: `https://chronosync-onco-api.onrender.com` (or similar)
- **API Docs**: `https://chronosync-onco-api.onrender.com/docs`

---

## 🆘 Troubleshooting

### "git push" fails
- Make sure you created the GitHub repository first
- Verify your GitHub username in the remote URL
- Try: `git remote -v` to check the remote

### Render deployment fails
- Check the deployment logs in Render dashboard
- Verify `requirements.txt` is in the repository
- Make sure `main.py` is in the root directory

### Vercel deployment fails
- Check the deployment logs in Vercel dashboard
- Verify `package.json` is in the repository
- Make sure `npm run build` works locally

### CORS errors in browser
- Verify FRONTEND_URL is set in Render
- Wait for Render to redeploy after adding the variable
- Check the URL matches exactly (no trailing slash)

### Blank screen on frontend
- Check browser console (F12) for errors
- Verify VITE_API_BASE_URL is set in Vercel
- Check that backend is accessible

---

## 🎯 For Hackathon Demo

**Before presenting:**
1. Open your frontend URL 5 minutes early
2. Run through the complete simulation once
3. This "warms up" the free-tier services (prevents cold start delays)
4. Keep the tab open during your presentation

**Share with judges:**
- Frontend URL: `https://chrono-onco.vercel.app`
- Tell them: "No installation needed, just open in browser"

---

## 📝 What to Submit

For your hackathon submission, provide:

1. **Frontend URL**: Your Vercel URL
2. **GitHub Repository**: github.com/YOUR_USERNAME/chrono-onco
3. **README**: Already included in your repository
4. **Demo Video** (optional): Record a walkthrough of the application

---

**Need help?** Check the detailed DEPLOYMENT_GUIDE.md for more information.
