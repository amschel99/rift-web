# Rift — Product Context

## What is Rift?

Rift is a fintech wallet app built as a Progressive Web App (PWA) and Telegram mini-app. It lets users in Africa buy and sell crypto using local mobile money, send and receive payments, and earn through referral and investment products.

**Core value prop**: Bridge between crypto (USDC on Base chain) and local mobile money networks across multiple African countries.

---

## Target Markets & Currency Support

| Country    | Currency | Mobile Money Providers         | Status   |
|------------|----------|--------------------------------|----------|
| Kenya      | KES      | Safaricom M-Pesa              | Full     |
| Ethiopia   | ETB      | Telebirr                       | Active   |
| Uganda     | UGX      | MTN, Airtel Money              | Active   |
| Ghana      | GHS      | MTN, AirtelTigo, Airtel Money  | Active   |
| Nigeria    | NGN      | —                              | Coming   |
| DRC        | CDF      | —                              | Partial  |

Country is auto-detected via IP (ipapi.co) with user override. Kenya has the most complete feature set including paybill and buy-goods payment types.

---

## Core Features

### 1. Wallet & Balance

- Users get a smart contract wallet on Base chain (account abstraction)
- Primary asset is USDC — displayed as "USD" in the UI
- Balance shown in both USD and local currency equivalent using live exchange rates
- Gasless transactions — users never pay blockchain gas fees
- Multi-chain support: Base (primary), Ethereum, Polygon, Arbitrum, Optimism

### 2. Buy Crypto (On-Ramp)

Users deposit local currency via mobile money to receive USDC in their wallet.

**Flow**: Enter amount → select mobile money provider → receive STK push on phone → confirm payment → USDC arrives in wallet

**Kenya**: M-Pesa STK push (direct prompt on phone)
**Other countries**: Unified V2 on-ramp with provider selection

Fee: ~1% included in exchange rate.

### 3. Withdraw / Cash Out (Off-Ramp)

Users convert USDC back to local currency sent to their mobile money account.

**Flow**: Enter amount → preview fee → confirm → money sent to mobile money

**Kenya-specific payment types**:
- Mobile: Direct to M-Pesa number
- Paybill: Business number + account number
- Buy Goods: Till number

Fee: 1% platform fee. Total 1.5% when referral fee (0.3%) applies.

### 4. Send Money

Three ways to send:

- **Send to Wallet** — Send USDC to any blockchain address (gasless)
- **Pay** — Send money directly to a phone number via mobile money
- **Send via Link** — Generate a shareable payment link; recipient claims without needing a Rift account

### 5. Receive Money

- Display wallet QR code for on-chain deposits
- Share receive link
- Request money from others

### 6. Swap

DEX swap between crypto assets using LiFi integration. Supports USDC, ETH, and other ERC-20 tokens including cross-chain swaps.

### 7. AI Agent (Beta)

Chat-based wallet interface for natural language commands:
- "Send $10 to 0x742d..."
- "Swap 50 USDC to ETH"
- "Check my balance"

Located at `/app/agent`.

### 8. WalletConnect

Connect external dApps to the Rift wallet via QR code scanning. Supports transaction signing and approval flows via Socket.IO.

---

## Earn & Investment Products

### Weekly Pool

A gamified weekly prize draw. Users who transact $50+ USD in a week are entered to win $10 USDC.

- **Qualification threshold**: $50 USD effective volume per week
- **Prize**: $10 USDC, drawn every Sunday at 23:59 UTC
- **Referral multiplier**: 1.2^(number of active referrals) applied to volume
  - Multiplier activates when referred users' combined volume ≥ $50
  - Example: 3 active referrals = 1.728x multiplier on your volume
- **Leaderboard**: Top 10 users by effective volume (names masked)
- **Qualifying activity**: Swaps, sends, payments, on-ramp, off-ramp

**API**: `GET /api/weekly-pool` — returns pool data, user progress, leaderboard, referral stats

### Perpetual Earnings (Referral Fees)

Earn 0.3% of every off-ramp/pay transaction made by users you referred. Earnings accumulate in the local currency of each transaction and are claimable as USDC.

- **Fee split**: 1.5% total transaction fee → 0.3% to referrer, 1.2% to Rift
- **Supported currencies**: KES, NGN, UGX, GHS, ETB, CDF
- **Claim frequency**: Once per week minimum
- **Payout**: USDC sent to user's Base wallet on claim

**API**:
- `GET /api/referral-fees/balance` — total USD balance + per-currency breakdown
- `GET /api/referral-fees/entries` — individual fee entries
- `POST /api/referral-fees/claim` — claim accumulated fees
- `GET /api/referral-fees/claims` — claim history

### Senior Vault (Sail Vault)

Dollar-denominated savings product with ~10% APY. Managed via the Liquid Royalty / SAILR platform. Deposit and withdraw anytime.

### Coming Soon

- **Estate Royalty** — investment product (placeholder in UI)
- **Tapin** — business ownership shares (placeholder in UI)

---

## Referral System

Each user has a unique referral code (from backend `GET /user/me` → `referralCode`).

**Referral flow**:
1. User shares invite link with `?referrer=CODE` parameter
2. New user opens link → referrer code saved to localStorage as `pending_referrer`
3. After signup, app calls `updateUser({ referrer: CODE })` to link accounts
4. Referrer starts earning 0.3% on referee's qualifying transactions
5. Referrer's weekly pool multiplier increases by 1.2x per active referral

---

## Authentication & Onboarding

### Auth Methods
- Phone + OTP
- Email + OTP
- Username + Password

### Onboarding Flow
1. Choose auth method
2. Enter credentials + verify OTP
3. KYC verification (Smile ID) — selfie + ID document
4. Payment account setup (currency, mobile money provider, phone number)
5. Optional first deposit
6. Land on home page

### Security
- JWT token stored in localStorage
- OTP verification for sensitive actions (sends, withdrawals)
- KYC (Smile ID) required for withdrawals and higher limits
- Account suspension system for suspicious activity
- Account recovery via email or phone

---

## App Structure & Routes

```
/                              Splash screen
/auth                          Onboarding / login
/kyc                           KYC verification
/suspended                     Suspended account

/app                           Home (balance, quick actions, history)
/app/profile                   Settings, referral code, payment accounts
/app/invest                    Earn hub (weekly pool, perpetual earnings, vaults)
/app/invest/weekly-pool        Weekly pool details + leaderboard
/app/invest/perpetual-earnings Referral earnings dashboard
/app/invest/sail-vault         Senior vault (savings)
/app/swap                      DEX swap
/app/history                   Full transaction history
/app/explore                   DeFi exploration (HyperLiquid)
/app/agent                     AI wallet agent (beta)
/app/walletconnect             dApp connections

/app/buy                       Buy crypto (on-ramp)
/app/withdraw                  Cash out (off-ramp)
/app/send/address              Send to blockchain address
/app/send/open-link            Create payment link
/app/pay                       Pay to phone number
/app/receive/address           Show receive QR
/app/receive/link              Receive via link
/app/request                   Request money

/app/markets                   Prediction markets (coming soon)
/app/token/:id/:chain/:bal     Token details
```

---

## Tech Stack

| Layer            | Technology                                        |
|------------------|---------------------------------------------------|
| Framework        | React 18 + TypeScript 5.6                         |
| Build            | Vite (SWC)                                        |
| Routing          | React Router 7.5                                  |
| Server State     | TanStack React Query 5                            |
| Styling          | Tailwind CSS 4.1 + Emotion                        |
| UI Components    | Radix UI primitives                               |
| Animations       | Motion (Framer Motion) 12                         |
| Forms            | React Hook Form + Zod                             |
| Charts           | Recharts + Lightweight Charts                     |
| Icons            | Lucide React + React Icons                        |
| Toasts           | Sonner                                            |
| Analytics        | PostHog                                           |
| Notifications    | Pusher Beams                                      |
| KYC              | Smile ID Web Components                           |
| Blockchain       | ethers.js + @rift-finance/wallet SDK               |
| Real-time        | Socket.IO (WalletConnect)                         |
| Platforms        | PWA + Telegram Mini App + Farcaster Mini App      |

---

## Project Structure

```
src/
├── components/ui/          Reusable atomic components (button, input, dialog, etc.)
├── components/layouts/     Layout wrappers
├── features/               Feature modules (agent, send, receive, onboarding, kyc)
├── v2/pages/               Page-level components (home, invest, profile, swap)
├── v2/shell/               App shell, navigation, page container + routing
├── hooks/data/             Data-fetching hooks (useUser, useWeeklyPool, etc.)
├── hooks/wallet/           Wallet operation hooks (useSendTransaction, useOnRamp)
├── hooks/agent/            AI agent hooks
├── lib/                    SDK initialization, utilities
├── services/               API service layer
├── contexts/               React context providers
├── utils/                  Helper functions
├── types/                  TypeScript type definitions
└── styles/                 Global styles
```

---

## Key API Endpoints

| Endpoint                          | Method | Purpose                              |
|-----------------------------------|--------|--------------------------------------|
| `/user/me`                        | GET    | User profile, referral code          |
| `/user/update`                    | PUT    | Update user (set referrer, etc.)     |
| `/api/weekly-pool`                | GET    | Pool data, progress, leaderboard     |
| `/api/weekly-pool/referral`       | GET    | Referral code and stats              |
| `/api/weekly-pool/history`        | GET    | Past pool results                    |
| `/api/referral-fees/balance`      | GET    | Accumulated referral earnings        |
| `/api/referral-fees/entries`      | GET    | Individual fee entries               |
| `/api/referral-fees/claim`        | POST   | Claim accumulated fees               |
| `/api/referral-fees/claims`       | GET    | Claim history                        |
| `/api/offramp-fee`                | GET    | Fee preview for withdrawals          |
| `/api/kyc/*`                      | —      | KYC verification                     |
| `/api/payment-links`              | —      | Send/request payment links           |

Backend base URL: `https://service.riftfi.xyz`

---

## Business Model

**Revenue**: Transaction fees on every on-ramp and off-ramp

- Total fee per off-ramp/pay transaction: **1.5%**
  - 0.3% → referrer (if user was referred)
  - 1.2% → Rift platform
- On-ramp fee: ~1% built into exchange rate

**Example** (1000 KES withdrawal at 130 KES/USD):
- User receives: 1000 KES
- Fee deducted: 15 KES (1.5%)
- Referrer gets: 3 KES (0.3%)
- Rift keeps: 12 KES (1.2%)

---

## Design & UI Patterns

- **Mobile-first** responsive design, centered container on desktop (max 448px)
- **Color palette**: Teal accent (#2E8C96), light surfaces (#E9F1F4, #F8F9FA)
- **Loading states**: Skeleton loaders for all data-dependent cards
- **Notifications**: Sonner toasts for success/error feedback
- **Animations**: Framer Motion for page transitions, card reveals
- **No "USDC" in user-facing text** — displayed as "USD" throughout
- **No "onchain" terminology** — transactions tab labeled "Transfers"
- **Desktop detection** used throughout for responsive layouts

---

## Platform Deployment

- **Web**: PWA with service worker, installable
- **Telegram**: Mini-app with back button, haptic feedback
- **Farcaster**: Mini-app SDK integration
- **Docker**: Dockerfile included for containerized deployment
- **Hosting**: Vercel

---

## Environment Configuration

```
VITE_API_URL              Backend API endpoint
VITE_SDK_API_KEY          Rift wallet SDK key
VITE_SMILE_ID_ENV         KYC environment (sandbox/production)
VITE_SMILE_ID_PARTNER_ID  Smile ID credentials
VITE_PUBLIC_POSTHOG_KEY   Analytics key
VITE_TEST                 Enable mock data
VITE_DEV                  Development mode
```
