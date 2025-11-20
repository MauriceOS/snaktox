# 🔧 Render Build Fix - "nest: not found" Error

## Problem
The build is failing with: `sh: 1: nest: not found`

This happens because the NestJS CLI (`nest` command) is not globally available in Render's build environment.

## ✅ Solution

### Option 1: Use `npx nest build` (Recommended)

**In Render Dashboard → Backend Service → Settings:**

Update **Build Command** to:
```
npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npx nest build
```

The key change: Use `npx nest build` instead of `npm run build` (which tries to run `nest build` directly).

### Option 2: Install NestJS CLI globally in build

Alternatively, you can install it globally in the build command:
```
npm install -g @nestjs/cli && npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npm run build
```

## 🚀 Quick Fix Steps

1. Go to **Render Dashboard** → **snaktox-backend** → **Settings**
2. Find **Build Command** field
3. Replace with:
   ```
   npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npx nest build
   ```
4. Click **Save Changes**
5. Click **Manual Deploy** → **Deploy latest commit**

## ✅ Verify

After deployment, check:
- Build logs should show successful compilation
- Service should start without errors
- Health endpoint: `https://snaktox-backend.onrender.com/api/v1/health`

## 📝 Why This Works

- `npx` runs commands from `node_modules/.bin/` or installs them if needed
- `nest` CLI is installed as a dev dependency in `apps/backend/package.json`
- Using `npx nest build` ensures the CLI is found and executed correctly

