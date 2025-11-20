# 🔧 Final Render Build Fix

## Issues Found

1. **Backend**: `npx nest build` fails because nest CLI not found after `cd apps/backend`
2. **AI Service**: `requirements.txt` not found because root directory not set correctly

## ✅ Complete Fix

### Backend Service

**In Render Dashboard → snaktox-backend → Settings:**

1. **Build Command**:
   ```
   npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npm install && npm run build
   ```

2. **Start Command**:
   ```
   cd apps/backend && npx prisma db push --schema=../../prisma/schema.prisma --skip-generate && npm run start:prod
   ```

3. **Root Directory**: Leave **empty** (root of repo)

### AI Service

**In Render Dashboard → snaktox-ai-service → Settings:**

1. **Root Directory**: `services/ai-service` ⚠️ **CRITICAL - Must be set!**

2. **Build Command**:
   ```
   pip install -r requirements.txt
   ```

3. **Start Command**:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

## 🔑 Key Changes

### Backend
- Added `npm install` in `apps/backend` directory before building
- This ensures `@nestjs/cli` is installed locally in backend's node_modules
- Then `npm run build` can find the nest CLI

### AI Service
- **Root Directory MUST be set to `services/ai-service`**
- This makes `requirements.txt` accessible in the build context
- Without this, pip can't find the requirements file

## 🚀 Steps to Fix

1. **Update Backend Settings**:
   - Go to Render → snaktox-backend → Settings
   - Update Build Command (see above)
   - Save Changes
   - Manual Deploy

2. **Update AI Service Settings**:
   - Go to Render → snaktox-ai-service → Settings
   - **Set Root Directory to `services/ai-service`** ⚠️
   - Update Build Command (see above)
   - Save Changes
   - Manual Deploy

3. **Wait for Build**:
   - Both services should build successfully now

4. **Seed Database** (after backend is live):
   ```bash
   curl -X POST https://snaktox-backend.onrender.com/api/v1/health/seed
   ```

## ✅ Verification

After successful deployment:
- Backend: https://snaktox-backend.onrender.com/api/v1/health
- AI Service: https://snaktox-ai-service.onrender.com/health
- API Docs: https://snaktox-backend.onrender.com/api/docs

