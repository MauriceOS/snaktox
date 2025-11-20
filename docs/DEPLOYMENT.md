# SnaKTox Deployment Guide

Complete guide for deploying SnaKTox to Render, Netlify, and free AI service hosting.

## 📋 Deployment Overview

SnaKTox consists of three services:
1. **Frontend** (Next.js) → Netlify
2. **Backend API** (NestJS) → Render
3. **AI Service** (FastAPI) → Render (free tier)

## 🚀 Quick Deployment Steps

### Step 1: Deploy AI Service (Render)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **New → Web Service**
3. **Connect your GitHub repository**
4. **Configure**:
   - **Name**: `snaktox-ai-service`
   - **Environment**: `Python 3`
   - **Build Command**: `cd services/ai-service && pip install -r requirements.txt`
   - **Start Command**: `cd services/ai-service && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `services/ai-service`

5. **Environment Variables**:
   ```
   PORT=8000
   DEBUG=false
   GEMINI_API_KEY=your-gemini-api-key
   CORS_ORIGINS=https://your-netlify-app.netlify.app,https://your-backend.onrender.com
   ALLOWED_HOSTS=*
   ```

6. **Deploy** and note the service URL (e.g., `https://snaktox-ai-service.onrender.com`)

### Step 2: Deploy Backend API (Render)

1. **New → Web Service** in Render
2. **Connect your GitHub repository**
3. **Configure**:
   - **Name**: `snaktox-backend`
   - **Environment**: `Node`
   - **Build Command**: 
     ```bash
     npm install &&
     npx prisma generate --schema=prisma/schema.prisma &&
     cd apps/backend &&
     npm run build
     ```
   - **Start Command**: 
     ```bash
     cd apps/backend &&
     npx prisma db push --schema=../../prisma/schema.prisma &&
     npm run start:prod
     ```
   - **Root Directory**: Leave empty (root)

4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3002
   DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/snaktox_db
   JWT_SECRET=generate-a-strong-secret-here
   AI_SERVICE_URL=https://snaktox-ai-service.onrender.com
   CORS_ORIGIN=https://your-netlify-app.netlify.app
   ```

5. **Add MongoDB Database** (if not using Atlas):
   - **New → MongoDB** in Render
   - Copy connection string to `DATABASE_URL`

6. **Deploy** and note the service URL (e.g., `https://snaktox-backend.onrender.com`)

### Step 3: Deploy Frontend (Netlify)

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Add new site → Import from Git**
3. **Connect your GitHub repository**
4. **Configure Build Settings**:
   - **Base directory**: `apps/web`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: Leave **empty** (Next.js uses its own API routes, not Netlify Functions)

5. **Environment Variables** (Site settings → Environment variables):
   ```
   NEXT_PUBLIC_API_URL=https://snaktox-backend.onrender.com/api/v1
   NEXT_PUBLIC_AI_SERVICE_URL=https://snaktox-ai-service.onrender.com
   NEXT_PUBLIC_WS_URL=wss://snaktox-backend.onrender.com
   NODE_VERSION=18
   ```

6. **Deploy**

## 🔧 Detailed Configuration

### Render Backend Configuration

**File**: `apps/backend/render.yaml` (or use Render dashboard)

```yaml
services:
  - type: web
    name: snaktox-backend
    env: node
    plan: starter
    buildCommand: |
      npm install &&
      npx prisma generate --schema=../prisma/schema.prisma &&
      npm run build
    startCommand: |
      npx prisma db push --schema=../prisma/schema.prisma &&
      npm run start:prod
```

**Required Environment Variables**:
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - Strong secret for JWT tokens
- `AI_SERVICE_URL` - Your AI service URL
- `CORS_ORIGIN` - Your Netlify frontend URL

### Render AI Service Configuration

**File**: `services/ai-service/render.yaml`

**Required Environment Variables**:
- `GEMINI_API_KEY` - Google Gemini API key
- `CORS_ORIGINS` - Comma-separated list of allowed origins
- `PORT` - Port (auto-set by Render)

### Netlify Frontend Configuration

**File**: `netlify.toml`

**Required Environment Variables**:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_AI_SERVICE_URL` - AI Service URL (optional)
- `NEXT_PUBLIC_WS_URL` - WebSocket URL (optional)

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. **Sign up**: https://www.mongodb.com/cloud/atlas
2. **Create cluster** (Free tier available)
3. **Get connection string**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/snaktox_db
   ```
4. **Add to Render environment variables**

### Option 2: Render MongoDB

1. **Render Dashboard → New → MongoDB**
2. **Copy connection string** to `DATABASE_URL`
3. **Note**: Free tier has limitations

## 🔐 Environment Variables Checklist

### Backend (Render)
- [ ] `DATABASE_URL` - MongoDB connection
- [ ] `JWT_SECRET` - Strong random string
- [ ] `AI_SERVICE_URL` - AI service URL
- [ ] `CORS_ORIGIN` - Frontend URL
- [ ] `PORT` - 3002 (auto-set)

### AI Service (Render)
- [ ] `GEMINI_API_KEY` - Google Gemini API key
- [ ] `CORS_ORIGINS` - Allowed origins
- [ ] `PORT` - 8000 (auto-set)

### Frontend (Netlify)
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL
- [ ] `NEXT_PUBLIC_AI_SERVICE_URL` - AI Service URL
- [ ] `NEXT_PUBLIC_WS_URL` - WebSocket URL

## 🧪 Post-Deployment Steps

### 1. Seed Database

After backend deploys, run database seed:

```bash
# Via Render Shell or locally
cd apps/backend
npx prisma db push --schema=../../prisma/schema.prisma
npm run db:seed
```

Or use Render's Shell feature:
1. Go to your backend service
2. Click **Shell**
3. Run:
   ```bash
   cd apps/backend
   npx ts-node ../../prisma/seed.ts
   ```

### 2. Verify Services

- **Backend Health**: `https://your-backend.onrender.com/api/v1/health`
- **AI Service Health**: `https://your-ai-service.onrender.com/health`
- **Frontend**: `https://your-app.netlify.app`

### 3. Update CORS Settings

After all services deploy, update CORS:

**Backend** (`CORS_ORIGIN`):
```
https://your-app.netlify.app
```

**AI Service** (`CORS_ORIGINS`):
```
https://your-app.netlify.app,https://your-backend.onrender.com
```

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Prisma client not found
**Solution**: Add `npx prisma generate` to build command

**Problem**: Database connection fails
**Solution**: Check `DATABASE_URL` format and MongoDB network access

**Problem**: CORS errors
**Solution**: Update `CORS_ORIGIN` with exact frontend URL

### AI Service Issues

**Problem**: Service times out
**Solution**: Render free tier spins down after 15min inactivity. Upgrade to paid or use a keep-alive service

**Problem**: Gemini API errors
**Solution**: Verify `GEMINI_API_KEY` is correct and has quota

### Frontend Issues

**Problem**: API calls fail
**Solution**: Check `NEXT_PUBLIC_API_URL` includes `/api/v1` prefix

**Problem**: Build fails
**Solution**: Ensure `NODE_VERSION=18` in Netlify environment

## 💰 Free Tier Limitations

### Render
- **Web Services**: Spins down after 15min inactivity (takes ~30s to wake)
- **MongoDB**: 90-day free trial, then paid
- **Bandwidth**: 100GB/month

### Netlify
- **Builds**: 300 build minutes/month
- **Bandwidth**: 100GB/month
- **Functions**: 125,000 invocations/month

### Solutions
- Use MongoDB Atlas free tier (512MB storage)
- Use a keep-alive service for Render (UptimeRobot, cron-job.org)
- Optimize builds to reduce Netlify usage

## 🔄 Continuous Deployment

All services auto-deploy on `git push` to main branch:

1. **Push to GitHub**
2. **Render/Netlify detects changes**
3. **Automatically builds and deploys**

## 📊 Monitoring

### Render
- View logs in dashboard
- Set up alerts for service downtime
- Monitor resource usage

### Netlify
- View build logs
- Monitor function invocations
- Check analytics

## 🚨 Keep-Alive for Free Tier

Render free tier services spin down after inactivity. Use a keep-alive service:

1. **UptimeRobot** (https://uptimerobot.com)
   - Add monitor for your services
   - Set interval to 5 minutes
   - Free tier: 50 monitors

2. **cron-job.org** (https://cron-job.org)
   - Create cron job to ping your services
   - Set to run every 5 minutes

## 📝 Production Checklist

- [ ] All environment variables set
- [ ] Database seeded with initial data
- [ ] CORS configured correctly
- [ ] Health checks working
- [ ] Keep-alive service configured (for free tier)
- [ ] Error monitoring set up (optional)
- [ ] SSL certificates active (automatic on Render/Netlify)
- [ ] Domain configured (optional)

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Netlify Dashboard**: https://app.netlify.com
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Google Gemini API**: https://makersuite.google.com/app/apikey

---

**Need Help?** Check the [Troubleshooting](#-troubleshooting) section or open an issue on GitHub.

