# Fix: Firebase FCM Authentication Error

## Error You're Seeing:
```
messaging/token-subscribe-failed
Request is missing required authentication credential
```

## Root Cause:
Your Firebase project has **authentication requirements** enabled for FCM token registration.

## Solution 1: Disable App Check (Recommended for Testing)

### In Firebase Console:
1. Go to: https://console.firebase.google.com/project/rift-c881c/appcheck
2. Click on your **Web app**
3. **Disable App Check** temporarily
4. Try enabling notifications again

## Solution 2: Enable Unauthenticated Access for FCM

### In Firebase Console:
1. Go to: https://console.firebase.google.com/project/rift-c881c/settings/cloudmessaging
2. Scroll to **"FCM Registration Tokens"**
3. Enable **"Allow FCM registration without authentication"**
4. Save

## Solution 3: Add App Check (Production Solution)

If you want to keep security tight, implement App Check:

### Step 1: Register Your Domain
1. Firebase Console → App Check
2. Add your domain: `wallet.riftfi.xyz`
3. Choose provider: **reCAPTCHA Enterprise** or **reCAPTCHA v3**

### Step 2: Get Site Key
After registration, you'll get a site key

### Step 3: Update Code

```typescript
// In src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const app = initializeApp(firebaseConfig);

// Add App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});

const messaging = getMessaging(app);
```

### Step 4: Add to Environment Variables
```bash
VITE_FIREBASE_APP_CHECK_KEY=your_recaptcha_site_key
```

## Quick Fix for Now:

The **easiest solution** is Option 1 or 2 above - disable authentication requirements for FCM in Firebase Console.

This error is NOT a code issue - it's a Firebase project configuration issue.

## Check Your Firebase Settings:

1. **App Check**: https://console.firebase.google.com/project/rift-c881c/appcheck
   - If enabled, disable it OR implement it properly

2. **Cloud Messaging**: https://console.firebase.google.com/project/rift-c881c/settings/cloudmessaging
   - Check if there are any authentication restrictions

3. **Authentication**: https://console.firebase.google.com/project/rift-c881c/authentication
   - Make sure "Anonymous" auth is enabled if you want unauthenticated FCM

## After Fixing in Firebase Console:

No code changes needed! Just:
1. Change Firebase settings
2. Refresh your app
3. Try enabling notifications again
4. Should work! ✅
