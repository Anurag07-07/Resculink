# Quick Fix: Set Backend URL on Vercel

## 🎯 The Solution in 3 Steps

### Step 1: Deploy Your Backend (if not already done)

**If you haven't deployed your backend yet:**
- Use [Render](https://render.com) (free tier available)
- Or any Node.js hosting service
- Get the backend URL (e.g., `https://rescuelink-backend.onrender.com`)

**If you already have it deployed:**
- Copy your backend URL

---

### Step 2: Add Environment Variable on Vercel

1. **Go to** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Click** on your `rescuelink` project
3. **Click** "Settings" tab
4. **Click** "Environment Variables" in the left sidebar
5. **Add New Variable**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (replace with your actual URL)
   - **Environment**: Check all boxes (Production, Preview, Development)
6. **Click** "Save"

---

### Step 3: Redeploy Your Frontend

After adding the environment variable:

1. **Go to** "Deployments" tab
2. **Click** the three dots (...) on the latest deployment
3. **Click** "Redeploy"
4. **Wait** for deployment to complete (~1-2 minutes)

---

## ✅ Verify It's Working

1. Visit your Vercel URL: `https://rescuelink-5bcj.vercel.app`
2. Try to create an account
3. Should work without "Error occurred" message!

---

## 🔧 Alternative: Manual Redeploy (Git Push)

If you prefer to redeploy via GitHub:

```bash
cd client
git add .
git commit -m "Add env variable support"
git push
```

Vercel will automatically redeploy when it detects the push.

---

## 🆘 Still Getting Errors?

### Check if environment variable is set:
1. Go to Vercel project → Settings → Environment Variables
2. Verify `VITE_API_URL` is listed
3. Make sure it's enabled for "Production"

### Check browser console:
1. Press F12 on your website
2. Go to Console tab
3. Look for the actual error message
4. Share the error if you need more help

### Backend not responding?
- Make sure your backend is deployed and running
- Test it by visiting: `https://your-backend-url/api/requests`
- Should return `[]` or list of requests (not an error page)

---

## 📌 Remember

The backend URL should be:
- ✅ `https://your-backend-url.onrender.com` (with https)
- ❌ NOT `http://localhost:5000`
- ❌ NOT ending with a slash `/`
