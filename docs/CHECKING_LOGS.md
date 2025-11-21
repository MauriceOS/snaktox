# How to Check Request Logs

If you're not seeing requests in your backend or AI service logs, follow these steps:

## 🔍 For Deployed Services (Render)

### Backend Service Logs

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on your backend service** (`snaktox-backend`)
3. **Click "Logs" tab** at the top
4. **Look for request logs** - You should see:
   ```
   → POST /api/v1/ai/chat - 192.168.1.1 - Mozilla/5.0...
   ← POST /api/v1/ai/chat 200 - 150ms
   ```

### AI Service Logs

1. **Click on your AI service** (`snaktox-ai-service`)
2. **Click "Logs" tab**
3. **Look for request logs** - You should see:
   ```
   {"event": "Incoming request", "method": "POST", "url": "...", "ip": "..."}
   {"event": "Request completed", "status_code": 200, "duration_ms": 150}
   ```

## 🔍 For Local Development

### Backend Logs

If running locally, check your terminal where you started the backend:
```bash
# You should see logs like:
→ POST /api/v1/ai/chat - 127.0.0.1 - Mozilla/5.0...
← POST /api/v1/ai/chat 200 - 150ms
```

### AI Service Logs

Check your terminal where you started the AI service:
```bash
# You should see logs like:
{"event": "Incoming request", "method": "POST", "url": "...", "ip": "127.0.0.1"}
{"event": "Request completed", "status_code": 200, "duration_ms": 150}
```

## 🐛 Troubleshooting: No Requests Appearing

### 1. Check Frontend Configuration

**For Netlify (Deployed Frontend):**
1. Go to **Netlify Dashboard** → Your site → **Site settings** → **Environment variables**
2. Verify `NEXT_PUBLIC_API_URL` is set to:
   ```
   https://snaktox-backend.onrender.com/api/v1
   ```
3. **Redeploy** the site after changing environment variables

**For Local Frontend:**
1. Check `.env` or `.env.local` in `apps/web/`
2. Ensure `NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1`
3. **Restart** the Next.js dev server

### 2. Check CORS Configuration

**Backend (Render):**
1. Go to **Environment variables**
2. Verify `CORS_ORIGIN` includes your frontend URL:
   ```
   https://lucent-pasca-161c73.netlify.app,http://localhost:3000,http://localhost:3001
   ```

**AI Service (Render):**
1. Verify `CORS_ORIGINS` includes:
   ```
   https://snaktox-backend.onrender.com,https://lucent-pasca-161c73.netlify.app
   ```

### 3. Test Direct API Calls

**Test Backend:**
```bash
curl -X POST https://snaktox-backend.onrender.com/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'
```

**Test AI Service:**
```bash
curl https://snaktox-ai-service.onrender.com/health
```

### 4. Check Browser Console

1. Open your frontend in browser
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Look for errors like:
   - `CORS policy: No 'Access-Control-Allow-Origin' header`
   - `net::ERR_CONNECTION_REFUSED`
   - `Failed to fetch`

### 5. Check Network Tab

1. Open **Developer Tools** → **Network** tab
2. Try using the chat or snake identification feature
3. Look for requests to:
   - `https://snaktox-backend.onrender.com/api/v1/ai/chat`
   - `https://snaktox-backend.onrender.com/api/v1/ai/upload-and-detect`
4. Check the **Status** column:
   - **200** = Success (check backend logs)
   - **404** = Endpoint not found
   - **500** = Server error (check backend logs)
   - **CORS error** = CORS not configured

## 📊 What Logs Should Show

### Successful Request Flow

**Frontend → Backend:**
```
→ POST /api/v1/ai/chat - 192.168.1.1 - Mozilla/5.0...
[Backend processes request]
← POST /api/v1/ai/chat 200 - 150ms
```

**Backend → AI Service:**
```
[Backend] Calling AI service: https://snaktox-ai-service.onrender.com/api/v1/chat
[AI Service] {"event": "Incoming request", "method": "POST", "url": "/api/v1/chat"}
[AI Service] {"event": "Request completed", "status_code": 200}
[Backend] AI service response received - success: true
```

## 🔧 Quick Fixes

### If requests aren't reaching backend:
1. ✅ Check `NEXT_PUBLIC_API_URL` in frontend
2. ✅ Check CORS settings in backend
3. ✅ Verify backend is running (check Render dashboard)

### If backend isn't calling AI service:
1. ✅ Check `AI_SERVICE_URL` in backend environment variables
2. ✅ Check `CORS_ORIGINS` in AI service
3. ✅ Verify AI service is running (check Render dashboard)

### If logs show errors:
1. ✅ Check the error message in logs
2. ✅ Verify environment variables are set correctly
3. ✅ Check service health endpoints

---

**Still not seeing requests?** Check:
- Services are actually running (not spun down)
- Environment variables are set correctly
- Frontend is using the correct API URL
- No browser console errors

