# RescueLink Production Deployment Fix

## 🐛 Problem Identified

Your RescueLink application on Vercel (rescuelink-5bcj.vercel.app) was showing **"Error occurred"** when trying to create an account because:

1. **Frontend** (deployed on Vercel) was making API calls to `http://localhost:5000`
2. `localhost:5000` doesn't exist on Vercel's servers - it only exists on your local machine
3. The frontend needs to point to your deployed backend on Render

## ✅ Changes Made

### 1. **Frontend API Configuration** (Client)

Updated the following files to use environment variables:

- ✅ `client/src/context/AuthContext.jsx` - Added `API_URL` constant
- ✅ `client/src/pages/Dashboard.jsx` - Added `API_URL` constant
- ✅ `client/src/components/RequestModal.jsx` - Added `API_URL` constant

All API calls now use: 
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

This means:
- **In production**: Uses `VITE_API_URL` environment variable
- **In development**: Falls back to `http://localhost:5000`

### 2. **Backend CORS Configuration** (Server)

Updated `server/server.js` to allow:
- ✅ All Vercel deployments (`*.vercel.app`)
- ✅ Localhost for development
- ✅ Custom frontend URL via `FRONTEND_URL` env variable

## 🚀 Next Steps to Deploy

### **Option 1: Deploy Backend to Render (Recommended)**

1. **Go to [Render.com](https://render.com)** and sign up
2. **Create a new Web Service**
   - Connect your GitHub repository
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node server.js`)
   
3. **Add Environment Variables on Render**:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
   PORT=10000
   NODE_ENV=production
   FRONTEND_URL=https://rescuelink-5bcj.vercel.app
   ```

4. **Get your Render backend URL** (e.g., `https://rescuelink-backend.onrender.com`)

### **Option 2: Or Update Vercel Environment Variable**

1. **Go to your Vercel project dashboard**
2. **Go to Settings → Environment Variables**
3. **Add this variable**:
   ```
   VITE_API_URL=https://rescuelink-backend.onrender.com
   ```
   *(Replace with your actual backend URL)*

4. **Redeploy** your frontend on Vercel

### **Important: MongoDB Atlas Setup**

Make sure you have:
1. ✅ Created a MongoDB Atlas cluster (free tier is fine)
2. ✅ Configured Network Access to allow connections from anywhere (`0.0.0.0/0`)
3. ✅ Created a database user with read/write permissions
4. ✅ Got your connection string

## 🔍 How to Verify It's Working

1. **Check Backend Health**:
   - Visit: `https://your-backend-url.onrender.com/api/requests`
   - Should show: `[]` or list of requests (not an error)

2. **Check Frontend**:
   - Visit: `https://rescuelink-5bcj.vercel.app`
   - Try to register a new account
   - Should successfully create account without "Error occurred" message

3. **Check Browser Console**:
   - Press F12 → Console tab
   - Look for successful API calls (200 status)
   - No CORS errors

## 📝 Testing Locally (Still Works!)

Your local development setup still works perfectly:

```bash
# Terminal 1 - Start Backend
cd server
npm start

# Terminal 2 - Start Frontend  
cd client
npm run dev
```

The code will automatically use `localhost:5000` when `VITE_API_URL` is not set.

## 🎯 Common Issues & Solutions

### Issue: "CORS Error"
**Solution**: Make sure your backend CORS allows `.vercel.app` domains (already fixed)

### Issue: "Network Error" or "Failed to fetch"
**Solution**: 
- Check if backend is running on Render
- Verify `VITE_API_URL` is set correctly in Vercel
- Check backend logs on Render dashboard

### Issue: "User already exists"
**Solution**: This is expected! Try logging in instead or use a different email

### Issue: Backend "Can't connect to MongoDB"
**Solution**: 
- Verify `MONGO_URI` is set correctly in Render environment variables
- Check MongoDB Atlas network access settings
- Ensure database user credentials are correct

## 💡 Quick Deploy Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Render
- [ ] Render environment variables configured
- [ ] Frontend `VITE_API_URL` set in Vercel
- [ ] Frontend redeployed after env variable update
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test creating a request (SOS)

## 🆘 Need Help?

If you see the "Error occurred" message again:
1. Check browser console (F12) for the actual error
2. Check Render logs for backend errors
3. Verify all environment variables are set correctly
4. Make sure MongoDB Atlas allows connections from Render's IP
