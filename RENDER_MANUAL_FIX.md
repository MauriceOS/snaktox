# 🔧 Manual Render Configuration Fix

Since the build failed, update these settings **manually in Render Dashboard**:

## 🔧 Backend Service Fix

1. Go to **Render Dashboard** → **snaktox-backend** → **Settings**

2. **Build Command** (replace the existing one):
   ```
   npm install && npx prisma generate --schema=prisma/schema.prisma && cd apps/backend && npx nest build
   ```

3. **Start Command** (replace the existing one):
   ```
   cd apps/backend && npx prisma db push --schema=../../prisma/schema.prisma --skip-generate && npm run start:prod
   ```

4. **Root Directory**: Leave **empty** (root of repo)

5. Click **Save Changes**

6. Click **Manual Deploy** → **Deploy latest commit**

## 🤖 AI Service Fix

1. Go to **Render Dashboard** → **snaktox-ai-service** → **Settings**

2. **Root Directory**: Set to `services/ai-service`

3. **Build Command** (replace the existing one):
   ```
   pip install -r requirements.txt
   ```

4. **Start Command** (replace the existing one):
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

5. Click **Save Changes**

6. Click **Manual Deploy** → **Deploy latest commit**

## 🌱 Seed Database (After Backend Deploys)

Once backend is running, seed the database via HTTP:

**Option 1: Using curl**
```bash
curl -X POST https://snaktox-backend.onrender.com/api/v1/health/seed
```

**Option 2: Using browser/Postman**
- URL: `https://snaktox-backend.onrender.com/api/v1/health/seed`
- Method: `POST`
- No body needed

**Option 3: Using JavaScript (browser console)**
```javascript
fetch('https://snaktox-backend.onrender.com/api/v1/health/seed', {
  method: 'POST'
}).then(r => r.json()).then(console.log)
```

## ✅ Verify Deployment

1. **Backend Health**: https://snaktox-backend.onrender.com/api/v1/health
2. **AI Service Health**: https://snaktox-ai-service.onrender.com/health
3. **API Docs**: https://snaktox-backend.onrender.com/api/docs

## 🐛 If Still Failing

Check the build logs for:
- Missing environment variables
- Database connection issues
- Path errors

Common fixes:
- Ensure `DATABASE_URL` is set in backend environment
- Ensure `GEMINI_API_KEY` is set in AI service environment
- Check that all paths are correct

