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
   - **Root Directory**: `services/ai-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

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
     npm install --include=dev &&
     cd apps/backend &&
     ./node_modules/.bin/nest build
     ```
   - **Start Command**: 
     ```bash
     cd apps/backend &&
     npx prisma db push --schema=../../prisma/schema.prisma --skip-generate &&
     node dist/src/main
     ```
   - **Root Directory**: Leave empty (root)

4. **Environment Variables** (⚠️ IMPORTANT - Set these correctly):
   ```
   NODE_ENV=production
   PORT=3002
   DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/snaktox_db
   JWT_SECRET=generate-a-strong-secret-here
   AI_SERVICE_URL=https://snaktox-ai-service.onrender.com
   CORS_ORIGIN=https://your-netlify-app.netlify.app,http://localhost:3000,http://localhost:3001
   ```
   
   **⚠️ Critical**: `CORS_ORIGIN` must include your Netlify frontend URL. Use comma-separated values for multiple origins. If CORS errors occur, check this variable first!

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

After backend deploys, seed the database using the HTTP endpoint (no shell access needed):

**Option 1: HTTP Endpoint (Recommended for Free Tier)**
```bash
curl -X POST https://snaktox-backend.onrender.com/api/v1/health/seed
```

**Option 2: Render Shell (If Available)**
1. Go to your backend service in Render
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

Render free tier services spin down after **15 minutes of inactivity**. This causes a **~30 second delay** when the first request arrives after spin-down.

### ✅ Solution 1: GitHub Actions (Recommended - Free & Automatic)

**Best option** - No external services needed, runs automatically.

1. **The workflow is already configured** in `.github/workflows/keep-alive.yml`
2. **Enable GitHub Actions** (if not already enabled):
   - Go to your GitHub repository
   - Click **Settings** → **Actions** → **General**
   - Under "Workflow permissions", select **Read and write permissions**
   - Check **Allow GitHub Actions to create and approve pull requests**
   - Save changes
3. **Enable scheduled workflows**:
   - Go to **Settings** → **Actions** → **General**
   - Under "Workflows", ensure **Allow all actions and reusable workflows** is selected
4. **Verify it's working**:
   - Go to **Actions** tab in your repository
   - You should see "Keep Services Alive" workflow running every 10 minutes
   - Click on a run to see the ping results

**Manual trigger**: You can also manually trigger it from the Actions tab → "Keep Services Alive" → "Run workflow"

### ✅ Solution 2: UptimeRobot (External Service)

1. **Sign up**: https://uptimerobot.com (free tier available)
2. **Add Monitor**:
   - Click **+ Add New Monitor**
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `SnaKTox Backend`
   - **URL**: `https://snaktox-backend.onrender.com/api/v1/health`
   - **Monitoring Interval**: 5 minutes
   - Click **Create Monitor**
3. **Repeat for AI Service**:
   - Add another monitor for `https://snaktox-ai-service.onrender.com/health`
4. **Free tier limits**: 50 monitors, 5-minute intervals

### ✅ Solution 3: cron-job.org (External Service)

1. **Sign up**: https://cron-job.org (free tier available)
2. **Create Cron Job**:
   - Click **Create cronjob**
   - **Title**: `SnaKTox Keep-Alive`
   - **Address**: `https://snaktox-backend.onrender.com/api/v1/health`
   - **Schedule**: Every 5 minutes (`*/5 * * * *`)
   - Click **Create cronjob**
3. **Add second job** for AI service:
   - Address: `https://snaktox-ai-service.onrender.com/health`
   - Same schedule

### ✅ Solution 4: Local Script (For Testing)

Use the provided script `scripts/keep-alive.sh`:

```bash
# Make executable
chmod +x scripts/keep-alive.sh

# Run manually
./scripts/keep-alive.sh

# Or set up local cron (macOS/Linux)
crontab -e
# Add: */10 * * * * /path/to/snaktox/scripts/keep-alive.sh
```

### 📊 Comparison

| Solution | Cost | Setup | Reliability | Recommended |
|----------|------|-------|-------------|-------------|
| GitHub Actions | Free | Automatic | ⭐⭐⭐⭐⭐ | ✅ Yes |
| UptimeRobot | Free | 2 min | ⭐⭐⭐⭐ | ✅ Yes |
| cron-job.org | Free | 2 min | ⭐⭐⭐⭐ | ✅ Yes |
| Local Script | Free | Manual | ⭐⭐ | ❌ No |

**Recommendation**: Use **GitHub Actions** (Solution 1) - it's already configured and requires no external services!

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

