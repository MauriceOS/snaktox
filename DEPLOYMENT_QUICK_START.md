# 🚀 Quick Deployment Guide

Fast deployment steps for SnaKTox to Render + Netlify.

## ⚡ 5-Minute Deployment

### 1️⃣ Deploy AI Service (Render) - 2 min

1. Go to https://dashboard.render.com
2. **New → Web Service**
3. Connect GitHub repo
4. Settings:
   - **Name**: `snaktox-ai-service`
   - **Root Directory**: `services/ai-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   ```
   GEMINI_API_KEY=your-key-here
   CORS_ORIGINS=https://your-app.netlify.app
   ```
6. **Create Web Service**
7. Copy the URL: `https://snaktox-ai-service.onrender.com`

### 2️⃣ Deploy Backend (Render) - 2 min

1. **New → Web Service**
2. Connect same GitHub repo
3. Settings:
   - **Name**: `snaktox-backend`
   - **Root Directory**: (leave empty)
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
     npx prisma db push --schema=../../prisma/schema.prisma --skip-generate &&
     npm run start:prod
     ```
4. Environment Variables:
   ```
   DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/snaktox_db
   JWT_SECRET=generate-random-32-char-string
   AI_SERVICE_URL=https://snaktox-ai-service.onrender.com
   CORS_ORIGIN=https://your-app.netlify.app
   PORT=3002
   ```
5. **Create Web Service**
6. Copy the URL: `https://snaktox-backend.onrender.com`

### 3️⃣ Deploy Frontend (Netlify) - 1 min

1. Go to https://app.netlify.com
2. **Add new site → Import from Git**
3. Connect GitHub repo
4. Build settings:
   - **Base directory**: `apps/web`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: Leave **empty** (Next.js doesn't need Netlify Functions)
5. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://snaktox-backend.onrender.com/api/v1
   NEXT_PUBLIC_AI_SERVICE_URL=https://snaktox-ai-service.onrender.com
   ```
6. **Deploy site**

### 4️⃣ Seed Database - 1 min

1. Go to Render → Backend service
2. Click **Shell**
3. Run:
   ```bash
   cd apps/backend
   npx ts-node ../../prisma/seed.ts
   ```

### 5️⃣ Update CORS - 1 min

After frontend deploys, update CORS in Render:

**Backend** (`CORS_ORIGIN`):
```
https://your-app-name.netlify.app
```

**AI Service** (`CORS_ORIGINS`):
```
https://your-app-name.netlify.app,https://snaktox-backend.onrender.com
```

## ✅ Done!

Your app is live:
- Frontend: `https://your-app.netlify.app`
- Backend: `https://snaktox-backend.onrender.com/api/v1`
- AI Service: `https://snaktox-ai-service.onrender.com`

## 🔧 Need MongoDB?

**Option 1: MongoDB Atlas (Free)**
1. Sign up: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to `DATABASE_URL` in Render

**Option 2: Render MongoDB**
1. Render → New → MongoDB
2. Copy connection string
3. Add to `DATABASE_URL`

## 🐛 Troubleshooting

**Backend won't start?**
- Check `DATABASE_URL` is correct
- Verify Prisma generated: `npx prisma generate`

**CORS errors?**
- Update `CORS_ORIGIN` with exact frontend URL
- Include `https://` protocol

**AI service timeout?**
- Free tier spins down after 15min
- First request takes ~30s to wake up
- Use UptimeRobot to keep alive (free)

## 📚 Full Guide

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

