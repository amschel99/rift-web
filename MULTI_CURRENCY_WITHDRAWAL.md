# Multi-Currency Withdrawal Account Setup

## Overview
Updated the withdrawal account setup to support multiple countries and their respective mobile money providers.

## Supported Countries & Providers

### 🇰🇪 Kenya (KES)
- **Provider**: Safaricom
- **Account Types**: 
  - Mobile Number (M-PESA)
  - Paybill
  - Buy Goods (Till Number)
- **Format**: Same as before

### 🇪🇹 Ethiopia (ETB)
- **Providers**: 
  - Telebirr
  - CBE Birr
- **Input**: Phone number only
- **Format**: `{ accountIdentifier, institution, currency }`

### 🇺🇬 Uganda (UGX)
- **Providers**: 
  - MTN
  - Airtel Money
- **Input**: Phone number only
- **Format**: `{ accountIdentifier, institution, currency }`

### 🇬🇭 Ghana (GHS)
- **Providers**: 
  - MTN
  - AirtelTigo
  - Airtel Money
- **Input**: Phone number only
- **Format**: `{ accountIdentifier, institution, currency }`

### 🇳🇬 Nigeria (NGN)
- **Status**: Pending (Coming Soon message shown)

## Payment Account Object Format

### For Kenya (Safaricom):
```json
{
  "accountIdentifier": "0712345678",
  "accountNumber": "123456",  // Optional, for Paybill.
  "accountName": "John Doe",   // Optional
  "institution": "Safaricom",
  "type": "MOBILE",            // MOBILE | PAYBILL | BUY_GOODS
  "currency": "KES"
}
```

### For Other Countries (ETB, UGX, GHS):
```json
{
  "accountIdentifier": "0911234567",  // Phone number
  "accountName": "John Doe",          // Optional
  "institution": "Telebirr",          // Or: CBE Birr, MTN, Airtel Money, AirtelTigo
  "currency": "ETB"                   // Or: UGX, GHS
}
```

**Note**: The `type` field is NOT included for non-Kenya countries.

## Key Features

1. **Auto Country Detection**: Automatically detects user's country and suggests appropriate currency
2. **Country Mismatch Detection**: If a user with an existing withdrawal account travels to a different country, they'll see a prompt asking if they want to switch to the new country's withdrawal account
3. **Smart Switching**: Users can choose to either:
   - Switch to the detected country's withdrawal account (updates on backend)
   - Keep their current withdrawal account
4. **Currency Selector**: Users can select their country when setting up a new withdrawal account
5. **Provider Selection**: Shows relevant mobile money providers based on selected currency
6. **Smart UI**: Kenya shows the full M-PESA flow with account types, other countries show simplified phone + provider flow
7. **Backward Compatible**: Existing Kenya accounts continue to work as before
8. **Future-Ready**: Easy to add new countries by updating the `MOBILE_MONEY_PROVIDERS` object

## Files Modified

1. `/src/components/ui/payment-account-setup.tsx` - Main component with multi-country support
2. `/src/v2/pages/profile/index.tsx` - Updated account display
3. `/src/features/withdraw/components/WithdrawConfirmation.tsx` - Updated account display

## Country Mismatch Detection Flow

When a user opens the withdrawal account setup modal:

1. **Detection**: System checks if their current account's currency matches the detected country
2. **Prompt**: If currencies differ (e.g., KES account but detected in Ethiopia):
   - Shows a friendly prompt: "We detected you are in Ethiopia"
   - Explains current account is for Kenya
   - Offers two clear buttons:
     - "Switch to ETB" - Sets up new account for detected country
     - "Keep KES" - Continues with current account
3. **Action**: User chooses their preference:
   - If switching: Shows provider selection for new country → Setup flow → Saves to backend
   - If keeping: Hides prompt and shows current account setup
4. **Cache**: Country detection is cached for 24 hours to avoid repeated prompts

### Example Scenarios:

**Scenario 1**: Kenyan user travels to Ethiopia
- User has: Safaricom (KES) account
- Detected: Ethiopia (ETB)
- Prompt: "Switch to ETB?" → User can add Telebirr/CBE Birr account

**Scenario 2**: Ethiopian user travels to Uganda
- User has: Telebirr (ETB) account
- Detected: Uganda (UGX)
- Prompt: "Switch to UGX?" → User can add MTN/Airtel Money account

**Scenario 3**: User in unsupported region (e.g., USA)
- User has: Any supported account
- Detected: USD
- No prompt (USD not supported for mobile money)

## API Integration

The payment account string is sent to the API as a JSON string via the `recipient` field in withdrawal requests. The backend should parse this JSON and handle the different formats appropriately.

For Kenya, use the existing M-PESA flow. For other countries, the mobile money integration should use the `institution` field to determine which provider to use.

When a user switches countries, the backend receives an update with the new payment account JSON string, which should replace the previous one.

