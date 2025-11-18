# Webpushr Push Notifications Setup Guide

This document explains how push notifications are implemented in the Rift Wallet app using Webpushr and the Rift SDK.

## Overview

The notification system enables users to receive real-time push notifications about:
- Payment confirmations
- Transaction updates
- Security alerts
- Account activities

When a user clicks on a notification, they are redirected to `https://wallet.riftfi.xyz/app` (the home page) or to a specific target URL if configured.

## Prerequisites

### 1. Webpushr Dashboard Configuration

You need to have already configured the following in your Webpushr dashboard:
1. Created a Webpushr account at [https://www.webpushr.com](https://www.webpushr.com)
2. Obtained your Webpushr Public Key
3. Configured your domain (wallet.riftfi.xyz)

### 2. Rift Dashboard Configuration

The Webpushr credentials should already be configured in the Rift Dashboard:
1. Navigate to your project → Notification Management
2. Add your Webpushr Key and Auth Token
3. Configure target URLs (optional)

## Implementation Details

### Files Created/Modified

1. **`/public/webpushr-sw.js`** - Service Worker
   - Handles notification clicks and redirects
   - Default redirect: `https://wallet.riftfi.xyz/app`
   - Manages push events and displays notifications

2. **`/index.html`** - Webpushr Script Integration
   - Loads the Webpushr SDK
   - Initializes with public key (needs to be configured)

3. **`/src/services/notifications.ts`** - Notification Service
   - Core notification logic
   - Handles subscription management
   - Interfaces with Rift SDK

4. **`/src/contexts/NotificationContext.tsx`** - React Context Provider
   - Manages notification state across the app
   - Provides hooks for components

5. **`/src/components/notifications/NotificationSettings.tsx`** - UI Component
   - User-facing settings interface
   - Enable/disable notifications
   - View connected devices

6. **`/src/main.tsx`** - App Integration
   - Wraps app with NotificationProvider

7. **`/src/v2/pages/profile/index.tsx`** - Profile Page
   - Adds notification settings section
   - Accessible from user profile

## Configuration Required

### Step 1: Add Your Webpushr Public Key

Update the `/index.html` file and replace the placeholder with your actual Webpushr public key:

```html
<!-- Find this line in index.html -->
webpushr('setup', {'key': 'WEBPUSHR_PUBLIC_KEY_PLACEHOLDER' });

<!-- Replace with your actual key -->
webpushr('setup', {'key': 'YOUR_ACTUAL_WEBPUSHR_PUBLIC_KEY' });
```

To get your public key:
1. Log into [Webpushr Dashboard](https://app.webpushr.com)
2. Go to Settings → Integration
3. Copy the Public Key

### Step 2: Verify Service Worker

The service worker is already configured at `/public/webpushr-sw.js`. It handles:
- Notification clicks → redirects to `https://wallet.riftfi.xyz/app`
- Push events → displays notifications with Rift branding

### Step 3: Test the Implementation

After deploying:

1. **Test Notification Permission Request**
   - Go to Profile → Push Notifications
   - Click "Enable"
   - Accept browser permission

2. **Verify Subscription**
   - Check that the UI shows "Notifications Enabled"
   - Verify device count shows 1

3. **Send Test Notification**
   - Use the Rift SDK to send a test notification
   - Click the notification
   - Verify it redirects to `/app`

## How It Works

### User Flow

1. **User Enables Notifications**
   ```
   User clicks "Enable" 
   → Browser permission requested via Webpushr
   → Webpushr generates subscriber ID
   → Subscriber ID registered with Rift SDK
   → Subscription stored locally
   ```

2. **Sending Notifications**
   ```
   Transaction occurs
   → Backend calls Rift SDK to send notification
   → Rift SDK uses Webpushr API
   → Webpushr pushes to user's browser
   → Service worker displays notification
   ```

3. **User Clicks Notification**
   ```
   User clicks notification
   → Service worker intercepts click
   → Redirects to targetUrl or default (/app)
   → If app is open, focuses existing window
   → If app is closed, opens new window
   ```

### Code Usage Examples

#### In a Component

```typescript
import { useNotifications } from "@/contexts/NotificationContext";

function MyComponent() {
  const { isEnabled, enableNotifications, disableNotifications } = useNotifications();
  
  const handleToggle = async () => {
    if (isEnabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };
  
  return (
    <button onClick={handleToggle}>
      {isEnabled ? "Disable" : "Enable"} Notifications
    </button>
  );
}
```

#### Sending Notifications via Rift SDK

```typescript
import rift from "@/lib/rift";

// Send to all user's devices
const response = await rift.notifications.sendToAllUserSubscribers({
  title: "Payment Received",
  message: "You received 100 USDC",
  targetUrl: "https://wallet.riftfi.xyz/app", // Optional
});

if (response.success) {
  console.log(`Sent to ${response.data?.summary.sent} devices`);
}
```

## API Methods Available

The NotificationService provides the following methods:

- `enableNotifications()` - Enable notifications for current user
- `getSubscriptions()` - Get all user subscriptions
- `unsubscribe(subscriberId)` - Unsubscribe a specific device
- `deleteAllSubscriptions()` - Remove all subscriptions
- `sendTestNotification(subscriberId, message)` - Send test notification

## Notification Context Hook

The `useNotifications()` hook provides:

```typescript
{
  isEnabled: boolean;              // Are notifications enabled?
  isLoading: boolean;              // Is operation in progress?
  subscriptionCount: number;       // Number of active devices
  subscriptions: UserSubscriptionsData; // Full subscription details
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<boolean>;
  refreshSubscriptions: () => Promise<void>;
  notificationService: NotificationService;
}
```

## Troubleshooting

### Notifications Not Working

1. **Check Browser Support**
   - Ensure notifications are supported: `'Notification' in window`
   - Check permission: `Notification.permission`

2. **Verify Webpushr Key**
   - Make sure the public key in `index.html` is correct
   - Check browser console for Webpushr errors

3. **Check Service Worker**
   - Open DevTools → Application → Service Workers
   - Verify `webpushr-sw.js` is registered and active

4. **Verify Rift Dashboard**
   - Confirm Webpushr credentials are correct in Rift Dashboard
   - Check notification logs for errors

### Service Worker Not Loading (404 or Router Error)

**Problem:** Accessing `https://wallet.riftfi.xyz/webpushr-sw.js` shows "No routes matched" error.

**Solution:** This has been fixed by updating server configuration files:
- `serve.json` - Explicit route for service worker before catch-all
- `vercel.json` - Proper routing configuration for Vercel
- `vite.config.ts` - Includes service worker in build assets

See [WEBPUSHR_ROUTING_FIX.md](./WEBPUSHR_ROUTING_FIX.md) for detailed explanation.

**Quick Test:**
1. Visit `https://wallet.riftfi.xyz/webpushr-sw.js` directly
2. Should see JavaScript code (not a React Router error)
3. Check Content-Type header = `application/javascript`

### Redirect Not Working (404 Issue)

The service worker at `/public/webpushr-sw.js` already handles redirects properly:

- Default redirect: `https://wallet.riftfi.xyz/app`
- Custom redirect: Use `targetUrl` parameter when sending notifications
- Falls back to opening the app at `/app` if target URL fails

### Permission Denied

If users deny notification permission:
- Browser blocks further permission requests
- User must manually enable in browser settings
- Clear guidance should be provided in the UI

## Security Considerations

1. **User Authentication**
   - Subscriptions are tied to authenticated users
   - Rift SDK requires valid bearer token

2. **Subscription Management**
   - Users can view and manage all their subscriptions
   - Users can unsubscribe individual devices
   - Users can delete all subscriptions at once

3. **Data Privacy**
   - Subscriber IDs are stored locally
   - Device info is collected for identification only
   - No sensitive data is transmitted in notifications

## Browser Compatibility

Notifications are supported in:
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile with iOS 16.4+)
- ❌ Private/Incognito mode (limited)

## Next Steps

1. **Add Webpushr Public Key** to `index.html`
2. **Deploy** the application
3. **Test** notification flow end-to-end
4. **Monitor** delivery rates in Webpushr dashboard
5. **Customize** notification messages for different events

## Support

For issues related to:
- **Webpushr**: [Webpushr Support](https://www.webpushr.com/support)
- **Rift SDK**: [Rift Support](https://support.rift-id.com)
- **Implementation**: Check the documentation at `webpushrimplement.md`

