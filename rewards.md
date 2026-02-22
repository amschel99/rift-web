# Weekly Pool — Frontend Integration Guide

## Base URL

```
{API_URL}/api/weekly-pool
```

## Authentication

All endpoints require:

```
Authorization: Bearer <jwt_token>
x-api-key: <project_api_key>
```

---

## Endpoints

### 1. `GET /api/weekly-pool`

Returns the current active pool, the authenticated user's progress, leaderboard, and recent winners.

**Headers:**

```
Authorization: Bearer <token>
x-api-key: <api_key>
```

**Response `200`:**

```json
{
  "status": "ACTIVE",
  "prizeAmount": 10,
  "weekStart": "2026-02-16T00:00:00.000Z",
  "weekEnd": "2026-02-22T23:59:59.999Z",
  "totalParticipants": 47,
  "qualifiedParticipants": 12,
  "qualificationThreshold": 50,
  "user": {
    "transactionVolume": 42,
    "referralCount": 2,
    "multiplier": 1.44,
    "effectiveVolume": 60.48,
    "qualificationThreshold": 50,
    "progressPercent": 100,
    "isQualified": true,
    "rank": 4
  },
  "leaderboard": [
    {
      "rank": 1,
      "displayName": "A***d",
      "effectiveVolume": 285,
      "isQualified": true,
      "isCurrentUser": false
    },
    {
      "rank": 4,
      "displayName": "You",
      "effectiveVolume": 60.48,
      "isQualified": true,
      "isCurrentUser": true
    }
  ],
  "pastWinners": [
    {
      "weekLabel": "Feb 9 - Feb 15",
      "displayName": "M***a",
      "prizeAmount": 10
    }
  ]
}
```

**Field reference:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"ACTIVE" \| "DRAWING" \| null` | Current pool state. `null` if no pool exists yet. |
| `prizeAmount` | `number` | Prize in USDC (always 10). |
| `weekStart` | `string \| null` | ISO date — Monday 00:00 UTC. |
| `weekEnd` | `string \| null` | ISO date — Sunday 23:59 UTC. |
| `totalParticipants` | `number` | Users with any volume this week. |
| `qualifiedParticipants` | `number` | Users with effective volume >= $50. |
| `qualificationThreshold` | `number` | Always 50 (USD). |
| `user` | `object \| null` | Authenticated user's entry. `null` if not authenticated. |
| `user.transactionVolume` | `number` | Raw USD volume this week. |
| `user.referralCount` | `number` | Number of active referrals. |
| `user.multiplier` | `number` | `1.2^referralCount` if referral volume threshold met, else `1.0`. |
| `user.effectiveVolume` | `number` | `transactionVolume * multiplier`. |
| `user.progressPercent` | `number` | 0-100. `min(100, floor((effectiveVolume / 50) * 100))`. |
| `user.isQualified` | `boolean` | `effectiveVolume >= 50`. |
| `user.rank` | `number \| null` | Position by effective volume. `null` if not yet ranked (stats update every 60s). |
| `leaderboard` | `array` | Top 10 by effective volume. |
| `leaderboard[].displayName` | `string` | Masked name or `"You"` for current user. |
| `leaderboard[].isCurrentUser` | `boolean` | `true` if this is the authenticated user. |
| `pastWinners` | `array` | Last 3 winners from previous weeks. |

**Notes:**

- Data refreshes every 60 seconds via background job (leaderboard, ranks, participant counts).
- User volume is computed live on each request if the user has no entry yet.
- Use `staleTime: 30000` (30s) in React Query for optimal caching.
- When `status` is `"DRAWING"`, the draw is in progress — show a "drawing..." state.
- When `status` is `null`, no pool exists — show a "coming soon" state.

---

### 2. `GET /api/weekly-pool/history`

Returns paginated past pool results.

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number (1-indexed). |
| `limit` | `number` | `10` | Results per page (max 50). |

**Response `200`:**

```json
{
  "pools": [
    {
      "id": "uuid",
      "weekLabel": "Feb 9 - Feb 15",
      "prizeAmount": 10,
      "winnerDisplayName": "M***a",
      "totalParticipants": 52,
      "qualifiedParticipants": 15
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3
  }
}
```

---

### 3. `GET /api/weekly-pool/referral`

Returns the authenticated user's referral code and stats.

**Response `200`:**

```json
{
  "referralCode": "ABC12XYZ",
  "totalReferred": 5,
  "activeReferrals": 3,
  "combinedVolume": 7500,
  "multiplierActive": true,
  "multiplier": 1.728,
  "volumeThreshold": 5000,
  "referrals": [
    {
      "displayName": "J***n",
      "joinedAt": "2026-02-10T14:30:00.000Z"
    }
  ]
}
```

**Field reference:**

| Field | Type | Description |
|-------|------|-------------|
| `referralCode` | `string` | User's unique 8-character code. Share this for others to sign up with. |
| `totalReferred` | `number` | Total users who signed up with this code. |
| `activeReferrals` | `number` | Referred users who transacted in the current or previous week. |
| `combinedVolume` | `number` | Combined USD volume of all active referrals. |
| `multiplierActive` | `boolean` | `true` if `combinedVolume >= 5000`. Multiplier only applies when this is `true`. |
| `multiplier` | `number` | `1.2^activeReferrals` if active, else `1.0`. |
| `volumeThreshold` | `number` | Always 5000 (USD). The combined volume needed to activate the multiplier. |
| `referrals` | `array` | List of referred users (masked names). |

---

## Referral Code

- Every user gets a unique `referralCode` (auto-generated on signup or first access).
- The code is also returned in `GET /user/me` as `referralCode`.
- When a new user signs up, pass the referrer's code as the `referrer` field in the signup request body.
- The referral multiplier (1.2x per active referral) only activates when the **combined volume of all active referrals >= $5,000** within the current week or previous week.

**Multiplier examples (when threshold is met):**

| Active referrals | Multiplier |
|-----------------|------------|
| 0 | 1.0x |
| 1 | 1.2x |
| 2 | 1.44x |
| 3 | 1.728x |
| 5 | 2.488x |

---

## Frontend Hook Example

```typescript
import { useQuery } from "@tanstack/react-query";

interface WeeklyPoolData {
  status: "ACTIVE" | "DRAWING" | null;
  prizeAmount: number;
  weekStart: string | null;
  weekEnd: string | null;
  totalParticipants: number;
  qualifiedParticipants: number;
  qualificationThreshold: number;
  user: {
    transactionVolume: number;
    referralCount: number;
    multiplier: number;
    effectiveVolume: number;
    qualificationThreshold: number;
    progressPercent: number;
    isQualified: boolean;
    rank: number | null;
  } | null;
  leaderboard: {
    rank: number;
    displayName: string;
    effectiveVolume: number;
    isQualified: boolean;
    isCurrentUser: boolean;
  }[];
  pastWinners: {
    weekLabel: string;
    displayName: string;
    prizeAmount: number;
  }[];
}

export default function useWeeklyPool() {
  return useQuery({
    queryKey: ["weekly-pool"],
    queryFn: async (): Promise<WeeklyPoolData> => {
      const apiUrl = import.meta.env.VITE_API_URL;
      const apiKey = import.meta.env.VITE_SDK_API_KEY;
      const token = localStorage.getItem("token");

      const res = await fetch(`${apiUrl}/api/weekly-pool`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-api-key": apiKey,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch weekly pool");
      return res.json();
    },
    staleTime: 1000 * 30,
    retry: false,
  });
}
```

```typescript
interface ReferralInfo {
  referralCode: string;
  totalReferred: number;
  activeReferrals: number;
  combinedVolume: number;
  multiplierActive: boolean;
  multiplier: number;
  volumeThreshold: number;
  referrals: { displayName: string; joinedAt: string }[];
}

export function useReferralInfo() {
  return useQuery({
    queryKey: ["weekly-pool-referral"],
    queryFn: async (): Promise<ReferralInfo> => {
      const apiUrl = import.meta.env.VITE_API_URL;
      const apiKey = import.meta.env.VITE_SDK_API_KEY;
      const token = localStorage.getItem("token");

      const res = await fetch(`${apiUrl}/api/weekly-pool/referral`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-api-key": apiKey,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch referral info");
      return res.json();
    },
    staleTime: 1000 * 60,
  });
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Short error description",
  "message": "Detailed error message"
}
```

| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid JWT token. |
| `403` | Invalid API key. |
| `500` | Server error. |

---

## How It Works (Summary)

1. **Monday 00:00 UTC** — A new pool is created automatically. Previous pool is closed.
2. **Every 60 seconds** — All user volumes, referral multipliers, qualifications, and ranks are recomputed.
3. **Sunday 23:59 UTC** — Draw happens automatically:
   - Final stats update runs
   - One winner is picked randomly from all qualified users (effective volume >= $50)
   - $10 USDC is sent to the winner's Base wallet
   - Pool is marked as completed
4. **Qualification** — Transact $50+ (effective volume) in the week. Volume counts: swaps, sends, payments, on-ramp, off-ramp, airtime.
5. **Referral boost** — Share your `referralCode`. If your referrals' combined volume hits $5k (current + previous week), you get a 1.2x multiplier per active referral on your volume.
