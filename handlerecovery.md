# Recovery Flow - Frontend Integration Guide

Base API URL: your backend API (e.g. `https://api.riftfi.xyz`)
Frontend URL: `https://wallet.riftfi.xyz` (configured via `RECOVERY_URL` env var)

All API requests require the `x-api-key` header.

---

## Flow 1: Password Reset (for externalId users)

### Step 1 — User requests a reset

User provides their externalId and chooses a recovery method (email or phone).

```
POST /recovery/request-reset
```

```json
{
  "externalId": "user123",
  "method": "emailRecovery"
}
```

Response (always generic to prevent enumeration):

```json
{
  "message": "If an account exists with recovery methods, a reset link has been sent."
}
```

The backend sends an email/SMS with a link like:

```
https://wallet.riftfi.xyz/reset-password?token=abc123def456...
```

---

### Step 2 — Frontend: `/reset-password` page loads

When the user clicks the link, the frontend `/reset-password` page should:

1. Extract the `token` from the URL query params
2. Validate the token by calling:

```
GET /recovery/validate-token/{token}
```

**If valid:**

```json
{
  "valid": true,
  "type": "PASSWORD_RESET",
  "expiresAt": "2026-02-18T12:30:00.000Z"
}
```

Show the new password form.

**If invalid:**

```json
{
  "valid": false,
  "message": "Token has expired"
}
```

Show an error message (token expired, already used, or not found). Offer a link to request a new reset.

---

### Step 3 — User submits new password

```
POST /recovery/reset-password
```

```json
{
  "token": "abc123def456...",
  "newPassword": "newSecurePassword123"
}
```

**Success (200):**

```json
{
  "message": "Password reset successful"
}
```

Redirect user to login.

**Errors (400):**

```json
{ "message": "Token and new password are required" }
{ "message": "Password must be at least 8 characters long" }
{ "message": "Token has expired" }
{ "message": "Token has already been used" }
```

---

## Flow 2: Account Recovery (for phone/email users who lost access)

This flow is for users who signed up with email/phone and lost access to that email/phone. They use their recovery method to update their primary identifier.

### Step 1 — Look up recovery options

User provides their old email or phone number.

```
GET /recovery/options-by-identifier?identifier=old@email.com&identifierType=email
```

Response (masked values):

```json
{
  "recoveryOptions": {
    "email": "re***@gmail.com",
    "phone": "+254***89"
  }
}
```

If no account or no recovery methods exist, returns nulls (no error, to prevent enumeration):

```json
{
  "recoveryOptions": { "email": null, "phone": null }
}
```

---

### Step 2 — User requests recovery link

```
POST /recovery/request-account-recovery
```

```json
{
  "identifier": "old@email.com",
  "identifierType": "email",
  "method": "emailRecovery"
}
```

Response (always generic):

```json
{
  "message": "If an account exists with recovery methods, a recovery link has been sent."
}
```

The backend sends a link like:

```
https://wallet.riftfi.xyz/recover-account?token=xyz789...
```

---

### Step 3 — Frontend: `/recover-account` page loads

When the user clicks the link, the frontend `/recover-account` page should:

1. Extract the `token` from the URL query params
2. Validate the token:

```
GET /recovery/validate-token/{token}
```

**If valid:**

```json
{
  "valid": true,
  "type": "ACCOUNT_RECOVERY",
  "expiresAt": "2026-02-18T12:30:00.000Z"
}
```

Show a form with:
- New email or phone number input
- A dropdown/toggle for identifier type (`email` or `phone`)
- An OTP input field
- A button to request OTP for the new identifier (use your existing OTP endpoint)

**If invalid:** Show error, offer link to start over.

---

### Step 4 — User submits new identifier

User first requests an OTP to their **new** email/phone (via your existing OTP send endpoint), then submits:

```
POST /recovery/recover-account
```

```json
{
  "token": "xyz789...",
  "newIdentifier": "new@email.com",
  "identifierType": "email",
  "otpCode": "123456"
}
```

**Success (200):**

```json
{
  "message": "Account recovery successful. Your identifier has been updated."
}
```

Redirect user to login with their new email/phone.

**Errors:**

| Status | Message |
|--------|---------|
| 400 | `token, newIdentifier, identifierType, and otpCode are required` |
| 400 | `identifierType must be 'email' or 'phone'` |
| 400 | `Token has expired` / `Token has already been used` |
| 400 | `Invalid token type for account recovery` |
| 400 | `OTP verification failed: ...` |
| 409 | `This email is already associated with another account` |

---

## Frontend Page Summary

| Page | URL | What to show |
|------|-----|-------------|
| `/reset-password` | `?token=xxx` | Validate token → show new password form → `POST /recovery/reset-password` |
| `/recover-account` | `?token=xxx` | Validate token → show new identifier + OTP form → `POST /recovery/recover-account` |

### UI States for both pages

1. **Loading** — Validating token...
2. **Token valid** — Show the form
3. **Token invalid** — Show error message + link to request a new one
4. **Submitting** — Loading spinner on submit button
5. **Success** — Confirmation message + redirect to login
6. **Error** — Show API error message, let user retry
