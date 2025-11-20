# 🔧 Render Build Errors - Complete Fix Guide

## Error Analysis

### Error 1: Backend - "could not determine executable to run"
**Problem**: `npx nest build` fails even after installing dependencies.

**Root Cause**: In npm workspaces, `npx` might not find the CLI correctly. We need to ensure `@nestjs/cli` is available.

### Error 2: AI Service - "requirements.txt not found"
**Problem**: `pip install -r requirements.txt` fails.

**Root Cause**: **Root Directory is NOT set in Render dashboard**. The build is running from repo root, not `services/ai-service`.

## ✅ Complete Fixes

### 🔧 Backend Fix (3 Options - Try in order)

#### Option 1: Use node_modules path directly (Recommended)
**Build Command**:
```bash
npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npm install && ./node_modules/.bin/nest build
```

#### Option 2: Install CLI globally first
**Build Command**:
```bash
npm install -g @nestjs/cli && npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npm install && nest build
```

#### Option 3: Use npm run build (should work after npm install)
**Build Command**:
```bash
npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npm install && npm run build
```

**Start Command** (same for all):
```bash
cd apps/backend && npx prisma db push --schema=../../prisma/schema.prisma --skip-generate && npm run start:prod
```

### 🤖 AI Service Fix (CRITICAL)

**This MUST be done in Render Dashboard:**

1. Go to **Render Dashboard** → **snaktox-ai-service** → **Settings**
2. Scroll to **Root Directory** field
3. **Set it to**: `services/ai-service` ⚠️ **THIS IS REQUIRED!**
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. **Save Changes**
7. **Manual Deploy**

## 🚀 Step-by-Step Fix

### Step 1: Fix AI Service (Easiest - Do this first)

1. Render Dashboard → **snaktox-ai-service** → **Settings**
2. Find **"Root Directory"** field (it's probably empty or set to root)
3. **Change it to**: `services/ai-service`
4. Save → Manual Deploy

This should fix the AI service immediately.

### Step 2: Fix Backend (Try Option 1 first)

1. Render Dashboard → **snaktox-backend** → **Settings**
2. **Build Command** → Replace with:
   ```
   npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npm install && ./node_modules/.bin/nest build
   ```
3. Save → Manual Deploy

If Option 1 fails, try Option 2 or 3.

## 🔍 Why These Fixes Work

### Backend
- **Option 1**: Uses direct path to nest binary, bypassing npx resolution issues
- **Option 2**: Installs CLI globally, making it available system-wide
- **Option 3**: Relies on npm scripts which should work after local install

### AI Service
- Setting Root Directory changes the working directory for all commands
- Build runs from `services/ai-service/` instead of repo root
- `requirements.txt` is now accessible

## ✅ Verification

After fixes:
- **Backend**: https://snaktox-backend.onrender.com/api/v1/health
- **AI Service**: https://snaktox-ai-service.onrender.com/health

## 🆘 If Still Failing

**Backend still failing?**
- Check build logs for specific error
- Try Option 2 (global install)
- Verify `@nestjs/cli` is in `apps/backend/package.json` devDependencies

**AI Service still failing?**
- Double-check Root Directory is exactly `services/ai-service` (no trailing slash)
- Verify `requirements.txt` exists in that directory
- Check build logs for actual path being used

