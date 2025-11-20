# 🔍 Root Directory Troubleshooting - AI Service

## Problem
Even after setting Root Directory to `services/ai-service`, the build still fails with:
```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

## 🔍 Possible Causes

### 1. Root Directory Not Saved Correctly
**Check:**
- Go to Render Dashboard → snaktox-ai-service → Settings
- Verify "Root Directory" field shows exactly: `services/ai-service`
- **NOT**: `/services/ai-service` (no leading slash)
- **NOT**: `services/ai-service/` (no trailing slash)
- **NOT**: `./services/ai-service` (no relative path prefix)

### 2. Render Caching Old Settings
**Solution:**
- After changing Root Directory, **wait 30 seconds**
- Click **Save Changes** again
- **Manual Deploy** (don't wait for auto-deploy)

### 3. Build Command Running Before Root Directory Takes Effect
**Solution:** Make build command explicit with absolute path check

### 4. Case Sensitivity or Typo
**Verify:**
- Exact spelling: `services/ai-service` (lowercase)
- No spaces before/after
- No quotes in the field

## ✅ Alternative Solutions

### Solution 1: Use Absolute Path in Build Command

**In Render Dashboard → snaktox-ai-service → Settings:**

**Root Directory**: `services/ai-service`

**Build Command** (try this if Root Directory isn't working):
```bash
cd services/ai-service && pip install -r requirements.txt
```

This explicitly changes to the directory first, then runs pip.

### Solution 2: Use Full Path to requirements.txt

**Root Directory**: `services/ai-service`

**Build Command**:
```bash
pip install -r ./requirements.txt
```

Or:
```bash
pip install -r services/ai-service/requirements.txt
```

### Solution 3: Verify Root Directory is Actually Set

**Steps to verify:**
1. Render Dashboard → snaktox-ai-service → Settings
2. Scroll to "Root Directory" field
3. **Clear the field completely** (if it has any value)
4. **Type fresh**: `services/ai-service`
5. **Click Save Changes**
6. **Refresh the page** (F5 or Cmd+R)
7. **Check again** - does it still show `services/ai-service`?
8. If yes, proceed with Manual Deploy

### Solution 4: Check Build Logs for Working Directory

**In the build logs, look for:**
- What directory is the build running from?
- Does it show `==> Running build command` from the correct directory?

If logs show it's running from root (`/opt/render/project/src/`), then Root Directory isn't being applied.

## 🎯 Recommended Fix (Try This First)

**In Render Dashboard → snaktox-ai-service → Settings:**

1. **Root Directory**: `services/ai-service`

2. **Build Command** (use explicit cd):
   ```
   cd services/ai-service && pip install -r requirements.txt
   ```

3. **Start Command**:
   ```
   cd services/ai-service && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

This way, even if Root Directory isn't working, the `cd` command ensures we're in the right directory.

## 🔍 Debug Steps

1. **Check Current Settings:**
   - Render → snaktox-ai-service → Settings
   - Screenshot or note the exact "Root Directory" value
   - Note the exact "Build Command"

2. **Check Build Logs:**
   - Look for the first line after "Running build command"
   - Does it show the correct directory?
   - What's the working directory when pip runs?

3. **Try Explicit Path:**
   - If Root Directory is set but not working, use `cd` in build command
   - This is a workaround that should always work

## ✅ Verification

After applying fix, build logs should show:
- ✅ `Successfully installed` (not "requirements.txt not found")
- ✅ Packages being installed from requirements.txt
- ✅ Build completing successfully

## 🆘 If Still Failing

**Last Resort - Use Full Path:**
```
pip install -r /opt/render/project/src/services/ai-service/requirements.txt
```

But this shouldn't be necessary if Root Directory is set correctly.

---

**Most Likely Issue**: Root Directory field might have a typo, extra spaces, or didn't save properly. Double-check the exact value in Render dashboard.

