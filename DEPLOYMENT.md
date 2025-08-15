# Deployment Guide

## Backend Deployment (Render)

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Select the backend folder as root directory
   - Build Command: `./build.sh`
   - Start Command: `gunicorn --bind 0.0.0.0:$PORT backend.wsgi:application`

2. **Environment Variables on Render**
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=False
   ALLOWED_HOSTS=your-backend-url.onrender.com
   FRONTEND_URL=https://your-frontend-url.vercel.app
   DATABASE_URL=postgresql://user:password@host:port/database
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

3. **Database Setup**
   - Create a PostgreSQL database on Render
   - Copy the DATABASE_URL to environment variables

## Frontend Deployment (Vercel)

1. **Deploy to Vercel**
   - Connect your GitHub repository
   - Select the frontend folder as root directory
   - Build Command: `npm run build`
   - Output Directory: `build`

2. **Environment Variables on Vercel**
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

3. **Update Backend URL**
   - Replace `your-backend-url.onrender.com` with your actual Render URL
   - Replace `your-frontend-url.vercel.app` with your actual Vercel URL

## Post-Deployment Steps

1. **Update CORS Settings**
   - Add your Vercel domain to CORS_ALLOWED_ORIGINS in backend settings
   
2. **Update Frontend Environment**
   - Update .env.production with your actual backend URL
   
3. **Test the Application**
   - Verify API endpoints are working
   - Test authentication flow
   - Check CORS configuration

## Files Modified for Deployment

### Backend:
- `settings.py` - Added environment variables and production settings
- `requirements.txt` - Added all dependencies
- `build.sh` - Build script for Render
- `.env.example` - Environment variables template

### Frontend:
- `api.js` - Updated to use environment variables
- `ProductDetail.js` - Updated API URL
- `package.json` - Removed proxy
- `.env.example` - Environment variables template
- `vercel.json` - Vercel configuration for SPA routing