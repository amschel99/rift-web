# LiFi Cross-Chain Transfer Integration

This document describes the integration of LiFi Protocol for cross-chain stablecoin transfers in the Sphere Wallet application using the Sphere Proxy Wallet Service.

## Overview

The swap functionality has been completely rewritten to use LiFi Protocol for secure cross-chain transfers of stablecoins (USDC and USDT) across supported networks:
- **Base** (8453)
- **Polygon** (137)
- **Arbitrum** (42161)
- **Berachain** (80085)

The integration uses Sphere's **Proxy Wallet Service** for direct blockchain interaction, providing full control over transaction signing, gas management, and smart contract interactions.

## Key Changes

### 1. New Hooks
- **`useLifiTransfer`** - Handles LiFi quote fetching from the API
- **`useLifiTransaction`** - Complete transaction execution using Sphere Proxy Wallet Service

### 2. Simplified Token Selection
- Only stablecoins (USDC, USDT) are displayed
- Tokens filtered by supported chains only
- Invalid token combinations prevented at UI level
- Static token data used for better performance

### 3. Updated UI Components
- **`SwapSummary`** - Uses LiFi quotes with approval flow integration
- **`TokenInput`** - Simplified to work with LiFi transfers
- **`FromTokenSelect`** - Shows only owned stablecoins on supported chains
- **`TokenSearch`** - Shows all available stablecoins across supported chains

### 4. Sphere Proxy Wallet Integration
- **Native balance checking** before transactions
- **Automatic token approval** handling for ERC-20 transfers
- **Direct transaction signing and broadcasting**
- **Comprehensive error handling** with user-friendly messages

## Environment Variables

Add the following to your `.env` file:
```env
VITE_LIFI_API_URL=https://super-straight-forward-swap.onrender.com
```

## Supported Token Addresses

### Base (8453)
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

### Polygon (137)
- USDC: `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`
- USDT: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

### Arbitrum (42161)
- USDC: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
- USDT: `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`

### Berachain (80085)
- USDC: `0x4200000000000000000000000000000000000006` (Placeholder - needs actual address)

## How It Works

### Complete Transaction Flow

1. **Token Selection & Quote Fetching**
   - User selects stablecoins from supported chains
   - App fetches real-time transfer quote from LiFi API
   - Quote includes exchange rate, fees, and estimated execution time

2. **Pre-Transaction Validation**
   - **Wallet Instance Retrieval**: Get wallet details using `sphere.proxyWallet.getWalletInstance()`
   - **Native Balance Check**: Verify sufficient native tokens for gas fees
   - **Quote Display**: Show transfer details to user

3. **Token Approval Flow** (if required)
   - Check if token approval is needed for LiFi contract
   - Execute ERC-20 approval transaction using `sphere.proxyWallet.sendTransaction()`
   - Wait for approval confirmation before proceeding

4. **Main Transfer Execution**
   - Execute LiFi transfer transaction using Sphere Proxy Wallet Service
   - Transaction signed and broadcast directly to blockchain
   - Real-time transaction status updates

5. **Cross-Chain Transfer Completion**
   - LiFi Protocol handles the bridge and transfer process
   - User receives confirmation when transfer is initiated
   - Tokens appear on destination chain after bridge completion

### Error Handling at Each Step

- **Insufficient Balance**: Detected before transaction execution
- **Approval Failures**: Specific error messages for token approval issues
- **Network Errors**: Graceful handling of RPC and API failures
- **Unsupported Chains**: Prevention of transactions on unsupported networks

## API Endpoints

The LiFi integration uses the following API endpoint:
```
GET /transfer?fromChain={chainId}&toChain={chainId}&fromToken={address}&toToken={address}&amount={amount}&fromAddress={address}&toAddress={address}&fromAmount={amount}&order=FASTEST
```

## Technical Implementation

### Key Technologies
- **LiFi Protocol**: Cross-chain infrastructure for secure token transfers
- **Sphere Proxy Wallet Service**: Direct blockchain interaction and transaction signing
- **React Query**: State management for API calls and caching
- **TypeScript**: Type-safe development with comprehensive error handling

### Code Architecture
```
src/hooks/data/
├── use-lifi-transfer.tsx      # LiFi API integration
└── use-lifi-transaction.tsx   # Sphere Proxy Wallet integration

src/v2/pages/swap/components/
├── swap-summary.tsx           # Main transfer UI with approval flow
├── token-input.tsx           # Amount input with validation
├── from-token-select.tsx     # Owned tokens selection
└── token-search.tsx          # All available tokens
```

### Transaction Security
- **Proxy Wallet Service**: All transactions signed securely through Sphere infrastructure
- **Pre-flight Checks**: Balance and approval validation before execution
- **Error Recovery**: Graceful handling of failed approvals and transactions
- **Gas Management**: Automatic gas estimation and optimization

## Testing

For testing purposes, set:
```env
VITE_TEST=true
```

This will simulate transactions without actually executing them.

## Development Guide

### Adding New Chains
1. Update `SUPPORTED_CHAINS` in `use-lifi-transfer.tsx`
2. Add token addresses to `STABLECOIN_ADDRESSES`
3. Update chain name mapping in `use-lifi-transaction.tsx`
4. Test with LiFi API to ensure compatibility

### Adding New Tokens
1. Add token addresses to `STABLECOIN_ADDRESSES` object
2. Update filtering logic in token selection components
3. Test token approval flow for new contracts

### Error Handling Patterns
```typescript
// Example error handling in transaction hook
try {
  const result = await sphere.proxyWallet.sendTransaction(txData);
  return { hash: result.hash, success: true };
} catch (error) {
  if (error.message.includes("Insufficient")) {
    throw new Error("Insufficient balance for gas fees");
  } else if (error.message.includes("approval")) {
    throw new Error("Token approval failed");
  }
  throw error;
}
```

## Production Considerations

### Performance Optimizations
- **Static Token Data**: Uses local token data instead of API calls for better performance
- **React Query Caching**: Intelligent caching of LiFi quotes and token data
- **Debounced Inputs**: Prevents excessive API calls during user input

### Security Measures
- **Input Validation**: All amounts and addresses validated before API calls
- **Type Safety**: Comprehensive TypeScript types prevent runtime errors
- **Transaction Limits**: Built-in checks for minimum/maximum transfer amounts
- **Chain Validation**: Prevents transactions on unsupported networks

### Monitoring & Analytics
- **Transaction Tracking**: All transfers logged for debugging and analytics
- **Error Reporting**: Comprehensive error logging for production debugging
- **Performance Metrics**: API response times and transaction success rates

## Future Enhancements

### Phase 1 (Short-term)
1. **Real Balance Checking**: Implement native token balance verification using RPC calls
2. **Slippage Protection**: Add user-configurable slippage tolerance
3. **Transaction Status**: Real-time cross-chain transfer status tracking

### Phase 2 (Medium-term)
4. **More Stablecoins**: Add support for DAI, FRAX, and other major stablecoins
5. **More Chains**: Expand to Optimism, BSC, and other L1/L2 networks
6. **Gas Optimization**: Implement dynamic gas pricing and EIP-1559 support

### Phase 3 (Long-term)
7. **Batch Transfers**: Support for multiple transfers in a single transaction
8. **Scheduled Transfers**: Time-based and condition-based transfer execution
9. **Advanced Routing**: Multi-hop transfers with optimal path finding
