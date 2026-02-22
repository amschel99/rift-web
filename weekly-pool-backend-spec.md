# Weekly Pool — Backend API Spec

## Overview

A gamified weekly prize pool. Users qualify by transacting at least **$50 USD** in a week. Referrals give a **1.2x compounding multiplier** on volume. One winner is drawn randomly from all qualified participants every **Sunday at midnight UTC**. Prize: **$10 USDC**.

---

## Database Schema

### `weekly_pools` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `week_start` | TIMESTAMP | Monday 00:00:00 UTC |
| `week_end` | TIMESTAMP | Sunday 23:59:59 UTC |
| `status` | ENUM(`active`, `drawing`, `completed`) | Current pool state |
| `prize_amount` | DECIMAL(10,2) | Prize in USD (default: 10.00) |
| `winner_id` | UUID (nullable) | FK → users.id, set after draw |
| `winner_payout_tx` | VARCHAR (nullable) | USDC transaction hash of payout |
| `total_participants` | INT | Count of users with any volume this week |
| `qualified_participants` | INT | Count of users meeting threshold |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### `weekly_pool_entries` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `pool_id` | UUID | FK → weekly_pools.id |
| `user_id` | UUID | FK → users.id |
| `transaction_volume` | DECIMAL(12,2) | Raw USD volume this week |
| `referral_count` | INT | Active referrals at snapshot time |
| `multiplier` | DECIMAL(5,2) | Computed: 1.2^referral_count |
| `effective_volume` | DECIMAL(12,2) | transaction_volume × multiplier |
| `is_qualified` | BOOLEAN | effective_volume >= qualification_threshold |
| `rank` | INT (nullable) | Position by effective_volume |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Unique constraint**: (`pool_id`, `user_id`)

### `weekly_pool_winners` table (historical)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `pool_id` | UUID | FK → weekly_pools.id |
| `user_id` | UUID | FK → users.id |
| `display_name` | VARCHAR | Masked name (e.g., "A***d") |
| `week_label` | VARCHAR | e.g., "Feb 16 - Feb 22" |
| `prize_amount` | DECIMAL(10,2) | |
| `paid_at` | TIMESTAMP (nullable) | When USDC was sent |
| `created_at` | TIMESTAMP | |

---

## API Endpoints

All endpoints require `Authorization: Bearer <token>` and `x-api-key` headers.

### 1. `GET /api/weekly-pool`

Returns the current active pool with the authenticated user's progress.

**Response 200:**

```json
{
  "status": "active",
  "prizeAmount": 10,
  "weekStart": "2026-02-16T00:00:00Z",
  "weekEnd": "2026-02-22T23:59:59Z",
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

**Logic:**
1. Find the pool where `status = 'active'` (there should only be one at a time)
2. Get or create the user's `weekly_pool_entries` row for this pool
3. Compute `transaction_volume` by summing all the user's completed transactions (swaps, sends, payments) from `week_start` to now
4. Get `referral_count` from the referrals table (count of referred users who have transacted at least once)
5. Compute `multiplier = 1.2 ^ referral_count` (compounding)
6. Compute `effective_volume = transaction_volume × multiplier`
7. Compute `progressPercent = min(100, floor((effective_volume / 50) × 100))`
8. Set `is_qualified = effective_volume >= 50`
9. Rank is the user's position among all entries ordered by `effective_volume` DESC
10. Leaderboard: top 10 entries by `effective_volume` DESC. Mask names: first letter + `***` + last letter
11. `isCurrentUser`: true if the leaderboard entry's user_id matches the authenticated user
12. Past winners: last 3 from `weekly_pool_winners` ordered by `created_at` DESC

**Performance notes:**
- Leaderboard and participant counts can be cached for 30 seconds (matches frontend staleTime)
- User's own volume should be computed fresh each request (or cached for 5-10 seconds)
- Consider materializing ranks via a periodic job (every 60s) rather than computing on every request

---

### 2. `GET /api/weekly-pool/history`

Returns past pool results (paginated). Optional, for future use.

**Query params:** `?page=1&limit=10`

**Response 200:**

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

## Background Jobs / Cron

### Job 1: `createWeeklyPool` — Runs every Monday at 00:00 UTC

1. Set previous pool's `status` → `completed`
2. Create new pool row with `status = 'active'`, `week_start` = this Monday, `week_end` = this Sunday 23:59:59
3. Log event

### Job 2: `runWeeklyDraw` — Runs every Sunday at 23:59 UTC

1. Set current pool's `status` → `drawing`
2. Get all entries where `is_qualified = true`
3. If no qualified participants → set `status = 'completed'`, no winner, carry prize to next week (or skip)
4. **Random selection**: Pick one winner uniformly at random from qualified entries
   - Use a cryptographically secure random number generator
   - `winnerIndex = crypto.randomInt(0, qualifiedEntries.length)`
5. Set `weekly_pools.winner_id` to the selected user
6. Insert into `weekly_pool_winners`
7. **Payout**: Send $10 USDC to the winner's wallet address
   - Record the transaction hash in `winner_payout_tx`
   - Set `weekly_pool_winners.paid_at`
8. Send push notification / in-app notification to the winner
9. Set pool `status` → `completed`

### Job 3: `updatePoolStats` — Runs every 60 seconds (while pool is active)

1. For each user who has transacted this week:
   - Recompute `transaction_volume` (sum of completed transactions within pool period)
   - Recompute `referral_count`, `multiplier`, `effective_volume`, `is_qualified`
2. Update `total_participants` and `qualified_participants` on the pool
3. Recompute `rank` for all entries (ORDER BY effective_volume DESC)

This job keeps the leaderboard fresh without computing it on every API request.

---

## Transaction Volume Calculation

"Transaction volume" counts the **USD equivalent** of:
- Swaps (buy/sell amounts)
- Send to address
- Send via link (when claimed)
- Pay (payment transactions)
- On-ramp purchases

**Does NOT count:**
- Deposits from external wallets
- Withdrawals / off-ramp
- Failed or pending transactions

**Query pattern:**
```sql
SELECT COALESCE(SUM(usd_amount), 0) as volume
FROM transactions
WHERE user_id = :userId
  AND status = 'completed'
  AND created_at >= :weekStart
  AND created_at <= :weekEnd
  AND type IN ('swap', 'send', 'send_link', 'payment', 'onramp')
```

---

## Referral Multiplier

- Each **active referral** gives a 1.2x multiplier
- "Active referral" = a referred user who has completed at least one transaction ever
- Multiplier compounds: `multiplier = 1.2 ^ active_referral_count`
  - 0 referrals → 1.0x
  - 1 referral → 1.2x
  - 2 referrals → 1.44x
  - 3 referrals → 1.728x
  - 5 referrals → 2.488x
- `effective_volume = transaction_volume × multiplier`

---

## Display Name Masking

For privacy on the leaderboard, mask user names:
- Take the user's first name (or email prefix, or phone)
- Show: `first_char` + `***` + `last_char`
- Examples: "Amschel" → "A***l", "mary@email.com" → "m***y"
- Current user always shows as "You"

---

## Edge Cases

| Case | Behavior |
|------|----------|
| No qualified participants | No winner drawn, prize rolls to next week OR is skipped |
| User has no transactions | Show in pool with 0 volume, progressPercent = 0 |
| User not authenticated | Return 401 |
| Pool in `drawing` state | Return the pool data but indicate draw is in progress |
| Multiple pools active (bug) | Always return the most recent one |
| Winner's wallet can't receive USDC | Retry payout 3 times, then flag for manual review |
| Referral added mid-week | Multiplier updates in next `updatePoolStats` run |

---

## Frontend Integration

When the backend is ready, update `src/hooks/data/use-weekly-pool.tsx`:

```typescript
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

---

## Notifications (optional, future)

| Event | Channel | Message |
|-------|---------|---------|
| User qualifies | Push + in-app | "You're qualified for this week's $10 pool!" |
| Draw approaching (2h before) | Push | "Weekly Pool draw in 2 hours — are you qualified?" |
| Winner announced | Push + in-app | "Congrats! You won the Weekly Pool! $10 USDC sent." |
| Almost qualified (80%+) | In-app | "Almost there! $X more to qualify for $10." |
