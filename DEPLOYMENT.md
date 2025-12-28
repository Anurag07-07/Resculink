# RescueLink Deployment Guide

## 🚀 Deployment Overview

- **Backend**: Render (Node.js)
- **Frontend**: Vercel (Vite React)
- **Database**: MongoDB Atlas (cloud)

---

## 📦 Backend Deployment (Render)

### 1. Prepare MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/rescuelink`)

### 2. Deploy to Render

#### Option A: Using Render Dashboard
1. Go to [Render](https://render.com) and sign up
2. Click **"New +" → "Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `rescuelink-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
   PORT=5000
   NODE_ENV=production
   ```

6. Click **"Create Web Service"**

#### Backend will be available at:
```
https://rescuelink-backend.onrender.com
```

---

## 🌐 Frontend Deployment (Vercel)

### 1. Update Environment Variable

Before deploying, you need to update the API URL in your frontend.

**Option A: Environment Variable (Recommended)**
Create `client/.env.production`:
```env
VITE_API_URL=https://rescuelink-backend.onrender.com
```

Then update axios calls to use:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

**Option B: Direct Update**
Update all `http://localhost:5000` references to your Render backend URL.

### 2. Deploy to Vercel

#### Using Vercel Dashboard:
1. Go to [Vercel](https://vercel.com) and sign up
2. Click **"Add New" → "Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://rescuelink-backend.onrender.com
   ```

6. Click **"Deploy"**

#### Using Vercel CLI:
```bash
cd client
npm install -g vercel
vercel login
vercel --prod
```

#### Frontend will be available at:
```
https://rescuelink.vercel.app
```

---

## 🔧 Important Configuration Changes

### Update CORS in Backend
In `server/server.js`, update CORS to allow your Vercel domain:

```javascript
app.use(cors({
  origin: ['https://rescuelink.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### Update Socket.IO in Frontend
In `client/src/pages/Dashboard.jsx`, update socket connection:

```javascript
const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
```

---

## 📝 Deployment Commands Summary

### Backend (Render)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `server`

### Frontend (Vercel)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `client`
- **Install Command**: `npm install`

---

## 🧪 Testing After Deployment

1. **Backend Health Check**:
   ```
   https://rescuelink-backend.onrender.com/
   ```

2. **Frontend**:
   ```
   https://rescuelink.vercel.app
   ```

3. **Test Flow**:
   - Register a new user
   - Login
   - Create a request
   - Check if map loads
   - Verify real-time updates work

---

## 🐛 Troubleshooting

### Backend Issues
- **500 Error**: Check MongoDB connection string in Render env variables
- **CORS Error**: Ensure frontend URL is in CORS allowed origins
- **Build Failed**: Check that `package.json` has correct dependencies

### Frontend Issues
- **API 404**: Verify `VITE_API_URL` is set correctly
- **Map not loading**: Check if Leaflet CSS is importing correctly
- **Build Failed**: Clear node_modules and reinstall

### Common Fixes
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 🔐 Security Checklist

- ✅ Use strong JWT_SECRET (min 32 characters)
- ✅ Use MongoDB Atlas (not local MongoDB)
- ✅ Set NODE_ENV=production
- ✅ Enable HTTPS (automatic on Render/Vercel)
- ✅ Limit CORS origins to your domains only
- ✅ Don't commit `.env` files to Git

---

## 💡 Optional Enhancements

### Custom Domain (Vercel)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records

### Better Logging (Render)
1. Go to Service → Logs
2. Monitor for errors
3. Set up email alerts

---

## 📊 Monitoring

### Render Dashboard
- View logs in real-time
- Monitor memory/CPU usage
- Set up auto-deploy from GitHub

### Vercel Analytics
- Track page views
- Monitor performance
- View deployment history

---

## 🎉 You're Done!

Your RescueLink application is now live and accessible worldwide!

**Backend**: https://rescuelink-backend.onrender.com  
**Frontend**: https://rescuelink.vercel.app

Share these URLs for your hackathon demo!
