# 🚨 CRITICAL Render Fixes - Both Services

## ⚠️ Current Errors

1. **Backend**: `./node_modules/.bin/nest: No such file or directory`
2. **AI Service**: `requirements.txt not found` (Root Directory not set)

## ✅ IMMEDIATE FIXES REQUIRED

### 🔧 Backend Service Fix

**In Render Dashboard → snaktox-backend → Settings:**

**Build Command** (copy exactly):
```
npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npm install --include=dev && npm run build
```

**Key Changes:**
- Added `--include=dev` to ensure devDependencies (including @nestjs/cli) are installed
- Use `npm run build` instead of direct nest binary (more reliable)

**Start Command** (keep as is):
```
cd apps/backend && npx prisma db push --schema=../../prisma/schema.prisma --skip-generate && npm run start:prod
```

### 🤖 AI Service Fix (CRITICAL - MUST DO THIS!)

**In Render Dashboard → snaktox-ai-service → Settings:**

1. **Scroll down to "Root Directory" field**
2. **Set it to**: `services/ai-service` ⚠️ **THIS IS MANDATORY!**
3. **Build Command**:
   ```
   pip install -r requirements.txt
   ```
4. **Start Command**:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. **Save Changes**
6. **Manual Deploy**

## 🎯 Why These Fixes Work

### Backend
- `--include=dev` ensures `@nestjs/cli` (devDependency) is installed
- `npm run build` uses the build script which finds nest correctly
- More reliable than direct binary path

### AI Service
- **Root Directory MUST be set** - without it, build runs from repo root
- Setting it to `services/ai-service` makes `requirements.txt` accessible
- This is a Render dashboard setting, not in code

## 📋 Step-by-Step

### Step 1: Fix AI Service (Do This First - 30 seconds)

1. Render Dashboard → **snaktox-ai-service**
2. Click **Settings** (left sidebar)
3. Scroll to **"Root Directory"** field
4. **Type**: `services/ai-service`
5. Click **Save Changes**
6. Click **Manual Deploy** → **Deploy latest commit**

✅ This should fix AI service immediately!

### Step 2: Fix Backend (1 minute)

1. Render Dashboard → **snaktox-backend**
2. Click **Settings**
3. Find **"Build Command"** field
4. **Replace entire command with**:
   ```
   npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npm install --include=dev && npm run build
   ```
5. Click **Save Changes**
6. Click **Manual Deploy** → **Deploy latest commit**

## ✅ Verification

After both fixes:
- **Backend**: https://snaktox-backend.onrender.com/api/v1/health
- **AI Service**: https://snaktox-ai-service.onrender.com/health

## 🆘 If Still Failing

**Backend still failing?**
- Check if `@nestjs/cli` is in `apps/backend/package.json` devDependencies (it is)
- Try: `npm install -g @nestjs/cli && npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npm install && nest build`

**AI Service still failing?**
- **Double-check Root Directory is exactly `services/ai-service`** (no `/` at end, no quotes)
- Verify the field saved correctly
- Check build logs to see what directory it's running from

---

**The AI Service Root Directory setting is the most critical - without it, the build will always fail!**

