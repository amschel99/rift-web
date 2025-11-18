# Webpushr Service Worker Routing Fix

## Problem

When accessing `https://wallet.riftfi.xyz/webpushr-sw.js`, the app was showing:
```
No routes matched location "/webpushr-sw.js"
```

This error occurred because the service worker file was being intercepted by React Router instead of being served as a static JavaScript file.

## Root Cause

The issue was in the server configuration files:

1. **`serve.json`** - Had a catch-all rewrite rule that sent ALL requests (including `/webpushr-sw.js`) to `/index.html`
2. **React Router** - When the HTML was loaded, React Router tried to match `/webpushr-sw.js` as a route, which doesn't exist
3. **Service Worker Requirements** - Service workers MUST be served as actual JavaScript files with proper MIME type headers, not through an SPA router

## Solution Applied

### 1. Updated `serve.json`

**Before:**
```json
{
  "rewrites": [
    {
      "source": "**",
      "destination": "/index.html"
    }
  ]
}
```

**After:**
```json
{
  "headers": [
    {
      "source": "webpushr-sw.js",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "webpushr-sw.js",
      "destination": "/webpushr-sw.js"
    },
    {
      "source": "**",
      "destination": "/index.html"
    }
  ]
}
```

**Key Changes:**
- ✅ Added explicit rewrite rule for `webpushr-sw.js` BEFORE the catch-all
- ✅ Added proper headers for service worker (Content-Type, Service-Worker-Allowed)
- ✅ Set cache control to ensure fresh service worker on updates

### 2. Updated `vercel.json`

**Added:**
```json
{
  "routes": [
    {
      "src": "/webpushr-sw.js",
      "dest": "/webpushr-sw.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/webpushr-sw.js",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

**Key Changes:**
- ✅ Added route configuration for Vercel deployment
- ✅ Ensures service worker is served before SPA routing
- ✅ Proper headers for service worker file

### 3. Updated `vite.config.ts`

**Changed:**
```typescript
VitePWA({
  includeAssets: [
    "rift.png", 
    "hero.png", 
    "icon.png", 
    "splash.png", 
    "s1.png", 
    "s2.png", 
    "s3.png", 
    "webpushr-sw.js" // ✅ Added this
  ],
  // ...
})
```

**Key Changes:**
- ✅ Explicitly includes `webpushr-sw.js` in build assets
- ✅ Ensures file is copied to build output

## How It Works Now

### Request Flow for `/webpushr-sw.js`

```
Browser requests /webpushr-sw.js
    ↓
Server checks routing rules (in order)
    ↓
Matches explicit rule: webpushr-sw.js → /webpushr-sw.js
    ↓
Serves actual JavaScript file from /public/webpushr-sw.js
    ↓
Browser receives service worker with proper headers
    ↓
Service worker registers successfully ✅
```

### Request Flow for Other Routes (e.g., `/app`)

```
Browser requests /app
    ↓
Server checks routing rules (in order)
    ↓
No match for explicit rules
    ↓
Falls through to catch-all: ** → /index.html
    ↓
Serves index.html
    ↓
React Router handles /app route ✅
```

## Important Headers Explained

### Content-Type: `application/javascript; charset=utf-8`
- **Why:** Browsers require service workers to be served as JavaScript
- **Without it:** Browser will reject the service worker registration

### Service-Worker-Allowed: `/`
- **Why:** Allows the service worker to control the entire origin
- **Without it:** Service worker scope might be limited to `/webpushr-sw.js/` only

### Cache-Control: `public, max-age=0, must-revalidate`
- **Why:** Ensures browsers always check for updated service worker
- **Without it:** Browsers might cache old service worker versions, preventing updates

## Testing the Fix

### 1. Local Development

```bash
npm run build
npm run preview
```

Then visit: `http://localhost:4173/webpushr-sw.js`

**Expected Result:**
- Should see the JavaScript source code
- Content-Type header should be `application/javascript`

### 2. Production (Vercel)

Visit: `https://wallet.riftfi.xyz/webpushr-sw.js`

**Expected Result:**
- Should see the JavaScript source code
- No React Router error
- Proper headers in Network tab

### 3. Service Worker Registration

Check browser console after enabling notifications:

```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registered service workers:', registrations);
});
```

**Expected Result:**
- Should show `webpushr-sw.js` as registered
- Scope should be `https://wallet.riftfi.xyz/`

## Deployment Checklist

When deploying these changes:

1. ✅ Ensure `public/webpushr-sw.js` exists
2. ✅ Commit all config file changes (`serve.json`, `vercel.json`, `vite.config.ts`)
3. ✅ Deploy to production
4. ✅ Test `/webpushr-sw.js` URL directly
5. ✅ Test notification registration flow
6. ✅ Verify in browser DevTools → Application → Service Workers

## Troubleshooting

### Still Getting 404 or Router Error

1. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
   - Or clear site data in DevTools

2. **Check Build Output**
   ```bash
   npm run build
   ls dist/webpushr-sw.js
   ```
   Should show the file exists

3. **Verify Server Config**
   - Check that `serve.json` or `vercel.json` was deployed
   - Look at response headers in Network tab

### Service Worker Not Registering

1. **HTTPS Required**
   - Service workers only work on HTTPS (or localhost)
   - Check that you're on `https://wallet.riftfi.xyz`

2. **Check Console Errors**
   - Open DevTools Console
   - Look for service worker errors
   - Check Network tab for failed requests

3. **Verify Headers**
   - Network tab → Click on `webpushr-sw.js`
   - Check Response Headers
   - Should have `Content-Type: application/javascript`

## Additional Notes

### Why Not Use React Router?

Service workers have special requirements:
- Must be served from the root of the origin
- Must have exact Content-Type
- Cannot go through JavaScript bundlers/routers
- Need specific cache control headers

React Router is designed for SPA navigation, not serving static assets with special requirements.

### Alternative Approaches Considered

1. **Public folder only** ❌ 
   - Doesn't work with SPA catch-all routing
   
2. **Service worker in src/** ❌
   - Would be bundled/transformed by Vite
   - URL would change (hash in filename)
   
3. **External hosting** ❌
   - Webpushr requires service worker on same origin
   
4. **Server routing exclusion** ✅ **CHOSEN**
   - Explicit rules before catch-all
   - Proper headers
   - Works with both local and production

## Files Modified

- ✅ `/serve.json` - Local server configuration
- ✅ `/vercel.json` - Vercel deployment configuration  
- ✅ `/vite.config.ts` - Build configuration

## Related Documentation

- [WEBPUSHR_SETUP.md](./WEBPUSHR_SETUP.md) - Complete notification setup guide
- [Service Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Webpushr Documentation](https://www.webpushr.com/docs)

