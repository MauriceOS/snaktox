# 🔧 Render Deployment Fixes

## Issues Found

1. **Backend Build Error**: Build command syntax issue
2. **AI Service Error**: Root directory path incorrect
3. **Database Seeding**: No shell access on free tier

## ✅ Fixes Applied

### 1. Backend Build Command
**Before:**
```yaml
buildCommand: |
  npm install &&
  npx prisma generate --schema=prisma/schema.prisma &&
  cd apps/backend &&
  npm run build
```

**After:**
```yaml
buildCommand: npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npm run build
```

### 2. AI Service Configuration
**Before:**
```yaml
buildCommand: |
  pip install -r services/ai-service/requirements.txt
startCommand: |
  cd services/ai-service &&
  uvicorn main:app --host 0.0.0.0 --port $PORT
```

**After:**
```yaml
rootDir: services/ai-service
buildCommand: pip install -r requirements.txt
startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 3. Database Seeding Solution
Added HTTP endpoint to seed database without shell access:
- **Endpoint**: `POST /api/v1/health/seed`
- **Usage**: Call this endpoint after deployment to seed the database

## 🚀 Updated Render Settings

### Backend Service
1. Go to Render Dashboard → Your Backend Service → Settings
2. Update **Build Command**:
   ```
   npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npm run build
   ```
3. Update **Start Command**:
   ```
   cd apps/backend && npx prisma db push --schema=../../prisma/schema.prisma --skip-generate && npm run start:prod
   ```
4. **Root Directory**: Leave empty (root)

### AI Service
1. Go to Render Dashboard → Your AI Service → Settings
2. Set **Root Directory**: `services/ai-service`
3. Update **Build Command**:
   ```
   pip install -r requirements.txt
   ```
4. Update **Start Command**:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

## 🌱 Seeding Database (No Shell Needed)

After backend deploys successfully:

1. **Call the seed endpoint**:
   ```bash
   curl -X POST https://your-backend.onrender.com/api/v1/health/seed
   ```

2. **Or use a browser/Postman**:
   - URL: `https://your-backend.onrender.com/api/v1/health/seed`
   - Method: POST
   - No authentication required (for now)

3. **Or use this one-liner**:
   ```bash
   curl -X POST https://snaktox-backend.onrender.com/api/v1/health/seed
   ```

## 📝 Next Steps

1. **Update Render settings** with the fixed commands above
2. **Redeploy** both services
3. **After successful deployment**, call the seed endpoint
4. **Verify** by checking your database or calling health endpoint

## ✅ Verification

After seeding, verify:
- Health check: `https://your-backend.onrender.com/api/v1/health`
- API docs: `https://your-backend.onrender.com/api/docs`
- Test endpoints to see if data exists

