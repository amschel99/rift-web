# Perpetual Earnings — Frontend Integration Guide

## Overview

Perpetual Earnings is Rift's referral fee system. When a user refers someone to Rift, they earn **0.3% of every offramp/pay transaction** their referral makes — forever. Fees accumulate in the local currency of each transaction (KES, NGN, UGX, GHS, ETB, CDF) and can be claimed once per week as USDC sent directly to the referrer's Base wallet.

## How It Works

1. **User A** shares their referral code (found in `GET /user/me` as `referralCode`)
2. **User B** signs up using that code (passed as the `referrer` field during signup)
3. Every time **User B** does an offramp or pay transaction, **0.3%** of the transaction amount (in local currency) is credited to **User A**
4. **User A** can see their accumulated earnings (converted to USD) and claim them as USDC once per week
5. There is no cap — earnings accumulate forever as long as referred users keep transacting

**Fee structure:**
- Total transaction fee: **1.5%**
- Of which **0.3%** goes to the referrer (if the transacting user was referred)
- The remaining **1.2%** is Rift's platform fee

**Supported currencies:** KES, NGN, UGX, GHS, ETB, CDF

## Base URL

```
{API_URL}/api/referral-fees
```

## Authentication

All endpoints require:

```
Authorization: Bearer <jwt_token>
x-api-key: <project_api_key>
```

---

## Endpoints

### 1. `GET /api/referral-fees/balance`

Returns the user's total accumulated (unclaimed) referral fees converted to USD, a breakdown per currency, and whether they can claim.

**Response `200`:**

```json
{
  "totalUsd": 34.62,
  "currencyBreakdown": [
    { "currency": "KES", "amount": 3900, "amountUsd": 30.0 },
    { "currency": "NGN", "amount": 7400, "amountUsd": 4.62 }
  ],
  "entryCount": 12,
  "canClaim": true,
  "nextClaimDate": null
}
```

**When claim is on cooldown:**

```json
{
  "totalUsd": 34.62,
  "currencyBreakdown": [
    { "currency": "KES", "amount": 3900, "amountUsd": 30.0 }
  ],
  "entryCount": 12,
  "canClaim": false,
  "nextClaimDate": "2026-03-01T14:30:00.000Z"
}
```

**Field reference:**

| Field | Type | Description |
|-------|------|-------------|
| `totalUsd` | `number` | Total unclaimed referral fees converted to USD. |
| `currencyBreakdown` | `array` | Breakdown of accumulated fees per currency. |
| `currencyBreakdown[].currency` | `string` | Currency code (KES, NGN, UGX, etc.). |
| `currencyBreakdown[].amount` | `number` | Accumulated amount in that local currency. |
| `currencyBreakdown[].amountUsd` | `number` | USD equivalent of that currency amount. |
| `entryCount` | `number` | Number of individual fee entries (one per transaction your referrals made). |
| `canClaim` | `boolean` | `true` if the user can claim now. `false` if within 7-day cooldown. |
| `nextClaimDate` | `string \| null` | ISO date when the next claim becomes available. `null` if can claim now. |

---

### 2. `GET /api/referral-fees/entries`

Returns each individual fee accumulation entry — one per transaction a referred user made.

**Response `200`:**

```json
{
  "totalUsd": 34.62,
  "currencyBreakdown": [
    { "currency": "KES", "amount": 3900, "amountUsd": 30.0 },
    { "currency": "NGN", "amount": 7400, "amountUsd": 4.62 }
  ],
  "entries": [
    {
      "id": "uuid",
      "amountLocal": 300,
      "currency": "KES",
      "transactorUserId": "user-uuid",
      "orderId": "order-uuid",
      "createdAt": "2026-02-22T10:15:00.000Z"
    },
    {
      "id": "uuid",
      "amountLocal": 7400,
      "currency": "NGN",
      "transactorUserId": "user-uuid",
      "orderId": "order-uuid",
      "createdAt": "2026-02-21T16:45:00.000Z"
    }
  ]
}
```

**Field reference:**

| Field | Type | Description |
|-------|------|-------------|
| `totalUsd` | `number` | Sum of all unclaimed entries converted to USD. |
| `currencyBreakdown` | `array` | Per-currency totals (same as balance endpoint). |
| `entries` | `array` | Individual fee entries, newest first. |
| `entries[].id` | `string` | Entry ID. |
| `entries[].amountLocal` | `number` | Fee earned in the local currency (0.3% of the transaction amount). |
| `entries[].currency` | `string` | Currency code of this entry (KES, NGN, UGX, etc.). |
| `entries[].transactorUserId` | `string` | The referred user who made the transaction. |
| `entries[].orderId` | `string` | The offramp order ID that generated this fee. |
| `entries[].createdAt` | `string` | ISO date when the fee was recorded. |

**Note:** Entries are deleted when claimed. After a successful claim, this list resets to empty and new entries start accumulating from subsequent transactions.

---

### 3. `POST /api/referral-fees/claim`

Claim all accumulated referral fees. Converts each currency to USD at the current exchange rate and sends the total as USDC to the user's Base chain smart wallet.

**Request body:** None required.

**Response `200` (success):**

```json
{
  "id": "claim-uuid",
  "amountUsd": 34.62,
  "transactionHash": "0xabc123...",
  "status": "COMPLETED"
}
```

**Response `400` (cooldown active):**

```json
{
  "error": "Claims allowed once per week. Next claim available 2026-03-01T14:30:00.000Z"
}
```

**Response `400` (nothing to claim):**

```json
{
  "error": "No accumulated referral fees to claim"
}
```

**Field reference:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Claim record ID. |
| `amountUsd` | `number` | Total USD claimed (sum of all currencies converted). |
| `transactionHash` | `string \| null` | On-chain USDC transfer hash. `null` if transfer failed. |
| `status` | `string` | `"COMPLETED"` on success, `"FAILED"` if USDC transfer failed. |

**What happens on claim:**
1. All accumulated fee entries are grouped by currency
2. Each currency total is converted to USD using the live Xwift exchange rate
3. The total USD amount is sent as USDC to the user's Base wallet
4. Fee entries are deleted (the claim record persists as history)
5. A 7-day cooldown starts before the next claim

**If the USDC transfer fails:** The claim is marked `"FAILED"` but the fee entries are **not** deleted. The user can try again after the issue is resolved.

---

### 4. `GET /api/referral-fees/claims`

Returns the user's past claim history.

**Response `200`:**

```json
{
  "claims": [
    {
      "id": "claim-uuid",
      "userId": "user-uuid",
      "amountKes": 0,
      "amountUsd": 34.62,
      "exchangeRate": 0,
      "transactionHash": "0xabc123...",
      "status": "COMPLETED",
      "createdAt": "2026-02-22T14:30:00.000Z",
      "completedAt": "2026-02-22T14:30:05.000Z"
    },
    {
      "id": "claim-uuid-2",
      "userId": "user-uuid",
      "amountKes": 0,
      "amountUsd": 16.15,
      "exchangeRate": 0,
      "transactionHash": "0xdef456...",
      "status": "COMPLETED",
      "createdAt": "2026-02-15T10:00:00.000Z",
      "completedAt": "2026-02-15T10:00:04.000Z"
    }
  ]
}
```

**Field reference:**

| Field | Type | Description |
|-------|------|-------------|
| `claims` | `array` | All past claims, newest first. |
| `claims[].id` | `string` | Claim ID. |
| `claims[].amountUsd` | `number` | USD amount that was claimed. |
| `claims[].amountKes` | `number` | Legacy field, always `0` for multi-currency claims. Use `amountUsd`. |
| `claims[].exchangeRate` | `number` | Legacy field, always `0` for multi-currency claims. |
| `claims[].transactionHash` | `string \| null` | On-chain tx hash. `null` if failed. |
| `claims[].status` | `string` | `"COMPLETED"`, `"PENDING"`, or `"FAILED"`. |
| `claims[].createdAt` | `string` | When the claim was initiated. |
| `claims[].completedAt` | `string \| null` | When the USDC was sent. `null` if pending/failed. |

---

## TypeScript Types

```typescript
interface CurrencyBreakdown {
  currency: string;
  amount: number;
  amountUsd: number;
}

interface ReferralFeeBalance {
  totalUsd: number;
  currencyBreakdown: CurrencyBreakdown[];
  entryCount: number;
  canClaim: boolean;
  nextClaimDate: string | null;
}

interface ReferralFeeEntry {
  id: string;
  amountLocal: number;
  currency: string;
  transactorUserId: string;
  orderId: string;
  createdAt: string;
}

interface ReferralFeeEntriesResponse {
  totalUsd: number;
  currencyBreakdown: CurrencyBreakdown[];
  entries: ReferralFeeEntry[];
}

interface ReferralFeeClaim {
  id: string;
  amountUsd: number;
  transactionHash: string | null;
  status: "COMPLETED" | "PENDING" | "FAILED";
  createdAt: string;
  completedAt: string | null;
}
```

---

## React Query Hooks

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_SDK_API_KEY;

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "x-api-key": apiKey,
  };
}

// Get accumulated balance + claim eligibility
export function useReferralFeeBalance() {
  return useQuery({
    queryKey: ["referral-fee-balance"],
    queryFn: async (): Promise<ReferralFeeBalance> => {
      const res = await fetch(`${apiUrl}/api/referral-fees/balance`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch balance");
      return res.json();
    },
    staleTime: 1000 * 30,
  });
}

// Get individual fee entries
export function useReferralFeeEntries() {
  return useQuery({
    queryKey: ["referral-fee-entries"],
    queryFn: async (): Promise<ReferralFeeEntriesResponse> => {
      const res = await fetch(`${apiUrl}/api/referral-fees/entries`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch entries");
      return res.json();
    },
    staleTime: 1000 * 30,
  });
}

// Claim fees
export function useClaimReferralFees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<ReferralFeeClaim> => {
      const res = await fetch(`${apiUrl}/api/referral-fees/claim`, {
        method: "POST",
        headers: getHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Claim failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-fee-balance"] });
      queryClient.invalidateQueries({ queryKey: ["referral-fee-entries"] });
      queryClient.invalidateQueries({ queryKey: ["referral-fee-claims"] });
    },
  });
}

// Get claim history
export function useReferralFeeClaims() {
  return useQuery({
    queryKey: ["referral-fee-claims"],
    queryFn: async (): Promise<{ claims: ReferralFeeClaim[] }> => {
      const res = await fetch(`${apiUrl}/api/referral-fees/claims`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch claims");
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
| `400` | Invalid request or claim not allowed (cooldown, nothing to claim). |
| `401` | Missing or invalid JWT token. |
| `403` | Invalid API key. |
| `500` | Server error. |

---

## How Perpetual Earnings Works (Summary)

1. **Share your referral code** — found in `GET /user/me` response as `referralCode`
2. **Referred users transact** — every offramp/pay transaction they make, you earn 0.3% of the transaction amount in their local currency
3. **Fees accumulate** — check your balance anytime via `GET /api/referral-fees/balance` (shows USD equivalent with per-currency breakdown)
4. **Claim weekly** — call `POST /api/referral-fees/claim` to convert all accumulated local currency fees to USDC and receive it in your Base wallet
5. **No limits** — there's no cap on earnings. The more your referrals transact, the more you earn. Forever.
6. **Multi-currency** — works across all supported markets: Kenya (KES), Nigeria (NGN), Uganda (UGX), Ghana (GHS), Ethiopia (ETB), DR Congo (CDF)

**Example:**
- You refer 5 users across Kenya and Nigeria
- A Kenyan referral does 50,000 KES in offramps → you earn 150 KES (~$1.15)
- A Nigerian referral does 200,000 NGN in offramps → you earn 600 NGN (~$0.38)
- Total accumulated: ~$1.53 USD
- You claim and receive $1.53 USDC in your wallet
- Next week they transact again, you earn again
