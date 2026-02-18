# Recovery System API Documentation

**Base URL:** `https://service.riftfi.xyz`

All endpoints require the `x-api-key` header unless otherwise noted.

---

## Overview

The recovery system supports two flows:

1. **Password Reset** - For users who signed up with `externalId` + password and forgot their password
2. **Account Recovery** - For users who signed up with phone/email and lost access to that phone/email

Both flows use **recovery methods** (a backup email and/or phone) that the user sets up in advance.

---

## 1. Recovery Setup

These endpoints require JWT authentication (`Authorization: Bearer <token>`) and OTP/password verification.

### Create Recovery Methods

```
POST /recovery/create
```

**Headers:**
```
x-api-key: sk_...
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "externalId": "john123",
  "emailRecovery": "backup@gmail.com",
  "phoneRecovery": "+254712345678"
}
```

- `externalId` is optional if user is authenticated via JWT (phone/email users)
- At least one of `emailRecovery` or `phoneRecovery` is required

**Response (201):**
```json
{
  "message": "Recovery methods created successfully",
  "recovery": {
    "id": "uuid",
    "email": "backup@gmail.com",
    "phoneNumber": "+254712345678",
    "createdAt": "2026-02-18T..."
  }
}
```

### Add Recovery Method

```
POST /recovery/add-method
```

**Body:**
```json
{
  "externalId": "john123",
  "method": "emailRecovery",
  "value": "backup@gmail.com"
}
```

- `method`: `"emailRecovery"` or `"phoneRecovery"`

### Update Recovery Method

```
PUT /recovery/update-method
```

**Body:**
```json
{
  "externalId": "john123",
  "method": "phoneRecovery",
  "value": "+254799999999"
}
```

### Remove Recovery Method

```
DELETE /recovery/remove-method
```

**Body:**
```json
{
  "externalId": "john123",
  "method": "emailRecovery"
}
```

> Cannot remove the last recovery method. At least one must remain.

### Get My Recovery Methods

```
POST /recovery/my-methods
```

**Body:**
```json
{
  "externalId": "john123"
}
```

**Response (200):**
```json
{
  "recovery": {
    "id": "uuid",
    "email": "backup@gmail.com",
    "phoneNumber": "+254712345678",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```


### Delete All Recovery Methods

```
DELETE /recovery/delete-all
```

**Body:**
```json
{
  "externalId": "john123"
}
```

---

## 2. Password Reset Flow (externalId users)

For users who signed up with `externalId` + password and forgot their password.

### Step 1: Get Recovery Options

```
GET /recovery/options/:externalId
```

**Headers:**
```
x-api-key: sk_...
```

**Response (200):**
```json
{
  "recoveryOptions": {
    "email": "ba***@gmail.com",
    "phone": "+254***78"
  }
}
```

> Email and phone are masked for privacy.

### Step 2: Request Password Reset Link

```
POST /recovery/request-reset
```

**Headers:**
```
x-api-key: sk_...
```

**Body:**
```json
{
  "externalId": "john123",
  "method": "emailRecovery"
}
```

- `method`: `"emailRecovery"` or `"phoneRecovery"`

**Response (200):**
```json
{
  "message": "If an account exists with recovery methods, a reset link has been sent."
}
```

> A link is sent via email (Cradle) or SMS (Cradle) to the recovery contact. The link format is:
> `{RECOVERY_URL}/reset-password?token=<64-char-hex-token>`
> The token expires in **15 minutes** and is single-use.

### Step 3: Validate Token (Frontend)

Before showing the password reset form, the frontend should validate the token.

```
GET /recovery/validate-token/:token
```

**Headers:**
```
x-api-key: sk_...
```

**Response (200) - Valid:**
```json
{
  "valid": true,
  "type": "PASSWORD_RESET",
  "expiresAt": "2026-02-18T12:30:00.000Z"
}
```

**Response (400) - Invalid:**
```json
{
  "valid": false,
  "message": "Token has expired"
}
```

### Step 4: Reset Password

```
POST /recovery/reset-password
```

**Headers:**
```
x-api-key: sk_...
```

**Body:**
```json
{
  "token": "a1b2c3d4e5f6...64chars",
  "newPassword": "myNewSecurePassword"
}
```

- Password must be at least 8 characters

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

---

## 3. Account Recovery Flow (phone/email users)

For users who signed up with phone or email and lost access to it.

### Step 1: Get Recovery Options by Identifier

```
GET /recovery/options-by-identifier?identifier=user@email.com&identifierType=email
```

**Headers:**
```
x-api-key: sk_...
```

**Query Parameters:**
- `identifier`: The old phone number or email the user lost access to
- `identifierType`: `"email"` or `"phone"`

**Response (200):**
```json
{
  "recoveryOptions": {
    "email": "ba***@gmail.com",
    "phone": "+254***78"
  }
}
```


> Returns `null` for both if no account/recovery found (prevents enumeration).

### Step 2: Request Account Recovery Link

```
POST /recovery/request-account-recovery
```

**Headers:**
```
x-api-key: sk_...
```

**Body:**
```json
{
  "identifier": "user@oldemail.com",
  "identifierType": "email",
  "method": "phoneRecovery"
}
```

- `identifier`: The old phone/email the user lost
- `identifierType`: `"email"` or `"phone"`
- `method`: `"emailRecovery"` or `"phoneRecovery"` (which recovery option to send the link to)

**Response (200):**
```json
{
  "message": "If an account exists with recovery methods, a recovery link has been sent."
}
```

> A link is sent to the chosen recovery contact. Format:
> `{RECOVERY_URL}/recover-account?token=<64-char-hex-token>`
> Expires in **15 minutes**, single-use.

### Step 3: Validate Token (Frontend)

Same as password reset - see [Step 3 above](#step-3-validate-token-frontend). The `type` will be `"ACCOUNT_RECOVERY"`.

### Step 4: Send OTP to New Identifier

The user enters their new phone/email. The frontend sends an OTP to it using the existing OTP endpoint:

```
POST /otp/send
```

**Body (for new email):**
```json
{
  "email": "user@newemail.com"
}
```

**Body (for new phone):**
```json
{
  "phone": "+254700000000"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "The verification code was sent to ..."
}
```

> Phone OTP is sent via Twilio (6-digit code). Email OTP is sent via Cradle (4-char alphanumeric code).

### Step 5: Complete Account Recovery

```
POST /recovery/recover-account
```

**Headers:**
```
x-api-key: sk_...
```

**Body:**
```json
{
  "token": "a1b2c3d4e5f6...64chars",
  "newIdentifier": "user@newemail.com",
  "identifierType": "email",
  "otpCode": "K7NP"
}
```

- `token`: The recovery token from the link
- `newIdentifier`: The new phone number or email
- `identifierType`: `"email"` or `"phone"`
- `otpCode`: The OTP code sent to the new identifier

**Response (200):**
```json
{
  "message": "Account recovery successful. Your identifier has been updated."
}
```

**Response (409) - Duplicate:**
```json
{
  "message": "This email is already associated with another account"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Description of what went wrong"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error / invalid token |
| 401 | Missing API key or project context |
| 404 | Resource not found |
| 409 | Conflict (duplicate identifier) |
| 429 | Rate limited (too many requests) |
| 500 | Internal server error |

---

## Rate Limiting

- `POST /recovery/request-reset` - 5 requests per 5 minutes per IP
- `POST /recovery/request-account-recovery` - 5 requests per 5 minutes per IP

---


## Security Notes

- Recovery tokens are 64-char hex strings (256 bits of entropy)
- Tokens expire after 15 minutes and are single-use
- Requesting a new token invalidates all previous unused tokens for the same user
- Lookup endpoints return generic responses to prevent user enumeration
- Account recovery requires OTP verification of the new phone/email before updating
- New identifiers are checked for uniqueness within the project before updating


