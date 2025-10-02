# React State Management Layer - Implementation Summary

This document provides an overview of the state management implementation for the Stablecoin Wallet application.

## Files Created

### 1. Core Context & Providers

#### `/src/context/WalletContext.tsx` (299 lines)
**Purpose:** Global wallet state management using React Context.

**Features:**
- Wallet unlock/lock functionality
- Create new HD wallet
- Import wallet from mnemonic
- Secure state handling (never stores private keys)
- Comprehensive error handling
- Loading states

**Exports:**
- `WalletProvider` - Context provider component
- `useWallet()` - Hook to access wallet state

**State:**
```typescript
{
  address: string | null;        // Current wallet address
  isUnlocked: boolean;           // Unlock status
  isLoading: boolean;            // Operation in progress
  error: string | null;          // Error message
}
```

**Methods:**
```typescript
unlock(password: string): Promise<void>
lock(): void
createWallet(password: string): Promise<string> // Returns mnemonic
importWallet(mnemonic: string, password: string): Promise<void>
hasExistingWallet(): boolean
clearError(): void
```

#### `/src/providers/QueryProvider.tsx` (90 lines)
**Purpose:** React Query client configuration for server state management.

**Configuration:**
- 30s stale time for blockchain data
- 5 minute cache time
- 3 retries with exponential backoff
- Auto-refetch on window focus
- Auto-refetch on network reconnect

**Rationale:**
Blockchain data doesn't change instantly, so we can cache aggressively while still maintaining data freshness through periodic refetching.

#### `/src/providers/Providers.tsx` (42 lines)
**Purpose:** Combines all application providers in correct order.

**Provider Order:**
1. `QueryProvider` (outer) - React Query for data fetching
2. `WalletProvider` (inner) - Wallet authentication state

#### `/src/context/index.ts` (7 lines)
**Purpose:** Centralized exports for context.

#### `/src/providers/index.ts` (7 lines)
**Purpose:** Centralized exports for providers.

### 2. Root Layout Update

#### `/src/app/layout.tsx` (Updated)
**Changes:**
- Added `Providers` wrapper around children
- Updated metadata (title and description)
- Added `suppressHydrationWarning` to HTML tag

### 3. Documentation & Examples

#### `/src/context/USAGE_EXAMPLES.tsx` (580+ lines)
**Purpose:** Comprehensive examples showing how to use the state management layer.

**Examples Include:**
1. Basic wallet unlock form
2. Create wallet flow with mnemonic backup
3. Import wallet from mnemonic
4. Protected dashboard component
5. Balance fetching with React Query
6. Send transaction with mutations
7. Transaction history with queries
8. Conditional rendering based on wallet state
9. Auto-lock on inactivity
10. Error boundary for wallet operations

#### `/src/app/test-wallet/page.tsx` (42 lines)
**Purpose:** Simple test page to verify wallet context is working.

**Access:** Navigate to `/test-wallet` to see current wallet state.

## Usage Examples

### Basic Setup (Already Done)
```tsx
// In app/layout.tsx
import { Providers } from '@/providers/Providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Accessing Wallet State
```tsx
'use client';

import { useWallet } from '@/context/WalletContext';

export function MyComponent() {
  const { address, isUnlocked, unlock, lock } = useWallet();

  if (!isUnlocked) {
    return <button onClick={() => unlock(password)}>Unlock</button>;
  }

  return (
    <div>
      <p>Address: {address}</p>
      <button onClick={lock}>Lock</button>
    </div>
  );
}
```

### Fetching Data with React Query
```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@/context/WalletContext';

export function BalanceDisplay() {
  const { address } = useWallet();

  const { data: balance, isLoading } = useQuery({
    queryKey: ['balance', 'USDC', address],
    queryFn: async () => {
      // Fetch balance from blockchain
      return '1000.00';
    },
    enabled: !!address,
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>Balance: {balance} USDC</div>;
}
```

### Creating Wallet
```tsx
'use client';

import { useWallet } from '@/context/WalletContext';
import { useState } from 'react';

export function CreateWallet() {
  const { createWallet, isLoading, error } = useWallet();
  const [password, setPassword] = useState('');
  const [mnemonic, setMnemonic] = useState<string | null>(null);

  const handleCreate = async () => {
    const newMnemonic = await createWallet(password);
    setMnemonic(newMnemonic);
    // Show mnemonic to user for backup
  };

  if (mnemonic) {
    return <div>Backup this phrase: {mnemonic}</div>;
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password (min 8 chars)"
        minLength={8}
      />
      {error && <div>{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Wallet'}
      </button>
    </form>
  );
}
```

## Security Features

### 1. No Private Key Storage in State
- Only stores wallet address and unlock status
- Private keys are NEVER stored in React state
- Wallet service handles all encryption/decryption

### 2. Auto-Lock on Error
- Wallet automatically locks on authentication failures
- Prevents unauthorized access after failed unlock attempts

### 3. Password Validation
- Minimum 8 characters enforced
- Validation happens at service layer

### 4. Error Handling
- All wallet errors are caught and displayed
- User-friendly error messages
- Errors don't expose sensitive information

## React Query Configuration

### Query Settings
```typescript
{
  staleTime: 30 * 1000,        // 30 seconds
  gcTime: 5 * 60 * 1000,       // 5 minutes
  retry: 3,                    // 3 attempts
  refetchOnWindowFocus: true,  // Refresh on focus
  refetchOnReconnect: true,    // Refresh on reconnect
  refetchOnMount: false,       // Don't refetch if fresh
}
```

### Mutation Settings
```typescript
{
  retry: 1,                    // 1 retry attempt
  retryDelay: 1000,           // 1 second delay
}
```

## Best Practices

### 1. Always Use the Hook
```tsx
// Good
const { address, isUnlocked } = useWallet();

// Bad - will throw error
// Direct context access not supported
```

### 2. Check isUnlocked Before Operations
```tsx
if (!isUnlocked) {
  // Redirect to unlock page
  return <UnlockForm />;
}

// Proceed with wallet operations
```

### 3. Handle Loading States
```tsx
const { isLoading, error } = useWallet();

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
```

### 4. Use React Query for Blockchain Data
```tsx
// Good - cached, auto-refetching
const { data } = useQuery({
  queryKey: ['balance', address],
  queryFn: fetchBalance,
});

// Bad - no caching, manual refetch logic
const [balance, setBalance] = useState(null);
useEffect(() => {
  fetchBalance().then(setBalance);
}, []);
```

### 5. Invalidate Queries After Mutations
```tsx
const queryClient = useQueryClient();

const sendMutation = useMutation({
  mutationFn: sendToken,
  onSuccess: () => {
    // Refetch balances after sending
    queryClient.invalidateQueries({ queryKey: ['balance'] });
  },
});
```

## Testing

### Manual Testing
1. Navigate to `/test-wallet` to verify context is working
2. Check browser console for any errors
3. Verify wallet state is displayed correctly

### Integration Testing (Future)
- Test wallet creation flow
- Test unlock/lock functionality
- Test React Query cache invalidation
- Test error handling

## Next Steps

### Recommended Component Implementation Order

1. **Onboarding Flow** (`/app/onboarding`)
   - Welcome screen
   - Create wallet screen (with mnemonic backup)
   - Import wallet screen
   - Use examples from USAGE_EXAMPLES.tsx

2. **Dashboard** (`/app/dashboard`)
   - Protected route (requires unlock)
   - Balance cards with React Query
   - Transaction history
   - Lock wallet button

3. **Transaction Flow** (`/app/send`, `/app/receive`)
   - Send form with validation
   - QR code for receive
   - Transaction confirmation
   - Use React Query mutations

4. **Settings** (`/app/settings`)
   - Export mnemonic (with password confirmation)
   - Change password
   - Wallet information

## Performance Considerations

### Current Optimizations
- React Query caching reduces API calls
- Context updates are memoized with useCallback
- No unnecessary re-renders (state is minimal)

### Future Optimizations
- Consider code splitting for heavy components
- Lazy load transaction history
- Implement virtual scrolling for long lists
- Add service worker for offline support

## Troubleshooting

### Common Issues

#### "useWallet must be used within WalletProvider"
**Solution:** Ensure component is wrapped in `<Providers>` (already done in layout.tsx)

#### React Query not refetching
**Solution:** Check `enabled` flag and `staleTime` configuration

#### Wallet state not persisting
**Expected Behavior:** Wallet locks on page refresh for security. Only encrypted data persists in localStorage.

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Updated with Providers
│   └── test-wallet/
│       └── page.tsx           # Test page
├── context/
│   ├── WalletContext.tsx      # Main wallet context
│   ├── USAGE_EXAMPLES.tsx     # Usage examples
│   └── index.ts               # Exports
└── providers/
    ├── Providers.tsx          # Combined providers
    ├── QueryProvider.tsx      # React Query config
    └── index.ts               # Exports
```

## Summary

The state management layer is now complete and ready for production use. It provides:

- Secure wallet state management
- React Query integration for blockchain data
- Comprehensive error handling
- Loading states
- Type-safe APIs
- Extensive documentation and examples

All components can now use `useWallet()` to access wallet state and React Query for data fetching.
