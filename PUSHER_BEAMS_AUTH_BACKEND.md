# Pusher Beams Authentication Endpoint (Required for Multi-Device)

## Why This Is Needed

To support **multiple devices per user**, Pusher Beams requires an authentication endpoint that generates tokens for authenticated users.

## Backend Endpoint Required

**Endpoint:** `POST /notifications/pusher-beams-auth`

**What it does:** Generates a Beams auth token that proves the user owns this device.

## Implementation

```typescript
import PushNotifications from '@pusher/push-notifications-server';

const beamsClient = new PushNotifications({
  instanceId: 'fd7e39bb-7564-47f4-b370-2fc87cf8d4e5',
  secretKey: 'AD30CE94732D8A6A5E2B0AF6A2E155D6E6063B384A60CEAD986F41BEDF3C5A19',
});

// POST /notifications/pusher-beams-auth
export async function pusherBeamsAuth(req, res) {
  // 1. Get user ID from authenticated request
  const userId = req.user.id; // From your auth middleware
  
  // 2. Verify user is authenticated
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 3. Generate Beams token for this user
    const beamsToken = beamsClient.generateToken(userId);
    
    // 4. Return the token
    res.json(beamsToken);
  } catch (error) {
    console.error('Pusher Beams auth error:', error);
    res.status(500).json({ error: 'Failed to generate Beams token' });
  }
}
```

## Response Format

The endpoint should return:

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

This is handled automatically by `beamsClient.generateToken(userId)`.

## How It Works

### Flow:

1. **Frontend calls** `.setUserId(userId, tokenProvider)`
2. **Token provider makes request** to your `/notifications/pusher-beams-auth` endpoint
3. **Backend generates token** using `beamsClient.generateToken(userId)`
4. **Frontend receives token** and authenticates with Pusher Beams
5. **Device is now linked** to the user ID

### Multi-Device Support:

```
User logs in on Device 1:
  → setUserId("user_12345", tokenProvider)
  → Device 1 linked to user_12345

User logs in on Device 2:
  → setUserId("user_12345", tokenProvider)
  → Device 2 linked to user_12345

Backend sends notification:
  → publishToUsers(["user_12345"], {...})
  → Both Device 1 AND Device 2 receive! ✅
```

## Security

- ✅ User is authenticated via Bearer token
- ✅ Backend verifies user identity
- ✅ Token is short-lived and specific to user
- ✅ Each device must authenticate independently

## Sending Notifications (Backend)

**Before (Interests - single device):**
```typescript
await beamsClient.publishToInterests([userId], {...}); // ❌ Only first device
```

**After (Authenticated Users - all devices):**
```typescript
await beamsClient.publishToUsers([userId], {...}); // ✅ All user's devices
```

## Key Changes

1. **Backend:** Add `/notifications/pusher-beams-auth` endpoint
2. **Backend:** Use `publishToUsers()` instead of `publishToInterests()`
3. **Frontend:** Already updated to use `.setUserId()`

---

## Complete Backend Example

```typescript
import express from 'express';
import PushNotifications from '@pusher/push-notifications-server';

const app = express();

const beamsClient = new PushNotifications({
  instanceId: 'fd7e39bb-7564-47f4-b370-2fc87cf8d4e5',
  secretKey: 'AD30CE94732D8A6A5E2B0AF6A2E155D6E6063B384A60CEAD986F41BEDF3C5A19',
});

// Authentication endpoint for Pusher Beams
app.post('/notifications/pusher-beams-auth', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const beamsToken = beamsClient.generateToken(userId);
    res.json(beamsToken);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Send notification to user (all devices)
app.post('/notifications/send', async (req, res) => {
  const { userId, title, message } = req.body;

  try {
    const publishResponse = await beamsClient.publishToUsers(
      [userId], // All devices of this user
      {
        web: {
          notification: {
            title: title,
            body: message,
            icon: 'https://wallet.riftfi.xyz/rift.png',
            deep_link: 'https://wallet.riftfi.xyz/app',
          },
        },
      }
    );

    res.json({ success: true, publishId: publishResponse.publishId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Testing

1. **Enable notifications on Device 1**
2. **Enable notifications on Device 2** (same user)
3. **Send notification from backend** using `publishToUsers([userId])`
4. **Both devices receive!** ✅

---

That's it! Once you add the auth endpoint, multi-device will work perfectly! 🚀

