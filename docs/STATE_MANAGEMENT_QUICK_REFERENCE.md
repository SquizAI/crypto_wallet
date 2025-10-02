# State Management Quick Reference

Quick reference guide for using the wallet state management layer.

## Import Statements

```typescript
// Wallet context
import { useWallet } from '@/context/WalletContext';

// React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
```

## useWallet Hook API

### State Properties
```typescript
const {
  address,        // string | null - Current wallet address
  isUnlocked,     // boolean - Whether wallet is unlocked
  isLoading,      // boolean - Operation in progress
  error,          // string | null - Current error message
} = useWallet();
```

### Methods
```typescript
const {
  // Unlock existing wallet
  unlock,         // (password: string) => Promise<void>

  // Lock wallet
  lock,           // () => void

  // Create new wallet (returns mnemonic)
  createWallet,   // (password: string) => Promise<string>

  // Import from mnemonic
  importWallet,   // (mnemonic: string, password: string) => Promise<void>

  // Check if wallet exists
  hasExistingWallet, // () => boolean

  // Clear error state
  clearError,     // () => void
} = useWallet();
```

## Common Patterns

### 1. Protected Component
```typescript
'use client';

export function ProtectedPage() {
  const { isUnlocked } = useWallet();

  if (!isUnlocked) {
    return <UnlockForm />;
  }

  return <Dashboard />;
}
```

### 2. Fetch Data
```typescript
'use client';

export function Balance() {
  const { address } = useWallet();

  const { data, isLoading, error } = useQuery({
    queryKey: ['balance', address],
    queryFn: () => fetchBalance(address),
    enabled: !!address,
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error />;
  return <div>{data}</div>;
}
```

### 3. Mutate Data
```typescript
'use client';

export function SendForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: sendTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });

  return (
    <button onClick={() => mutation.mutate(data)}>
      Send
    </button>
  );
}
```

### 4. Create Wallet
```typescript
'use client';

export function CreateWallet() {
  const { createWallet } = useWallet();
  const [mnemonic, setMnemonic] = useState(null);

  const handleCreate = async (password: string) => {
    const mnemonic = await createWallet(password);
    setMnemonic(mnemonic); // Show to user for backup
  };

  return mnemonic ? (
    <BackupScreen mnemonic={mnemonic} />
  ) : (
    <PasswordForm onSubmit={handleCreate} />
  );
}
```

### 5. Unlock Wallet
```typescript
'use client';

export function UnlockForm() {
  const { unlock, isLoading, error, clearError } = useWallet();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await unlock(password);
      // Navigate to dashboard
    } catch (err) {
      // Error already in context
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <div>{error}</div>}
      <button disabled={isLoading}>
        {isLoading ? 'Unlocking...' : 'Unlock'}
      </button>
    </form>
  );
}
```

## React Query Presets

### Balance Query
```typescript
useQuery({
  queryKey: ['balance', tokenAddress, walletAddress],
  queryFn: () => getBalance(tokenAddress, walletAddress),
  enabled: !!walletAddress,
  staleTime: 30000,      // 30 seconds
  refetchInterval: 60000, // 1 minute
});
```

### Transaction History Query
```typescript
useQuery({
  queryKey: ['transactions', walletAddress],
  queryFn: () => getTransactions(walletAddress),
  enabled: !!walletAddress,
  staleTime: 60000, // 1 minute
});
```

### Send Transaction Mutation
```typescript
const mutation = useMutation({
  mutationFn: ({ to, amount, token }) =>
    sendToken(to, amount, token),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['balance'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  },
});
```

## Error Handling

### Wallet Errors
```typescript
try {
  await unlock(password);
} catch (error) {
  if (error instanceof WalletError) {
    switch (error.code) {
      case 'INVALID_PASSWORD':
        // Handle wrong password
        break;
      case 'DECRYPTION_FAILED':
        // Handle decryption failure
        break;
      case 'NO_WALLET':
        // Handle no wallet found
        break;
    }
  }
}
```

### Query Errors
```typescript
const { error } = useQuery({
  queryKey: ['balance'],
  queryFn: fetchBalance,
  retry: 3,
  onError: (error) => {
    console.error('Failed to fetch balance:', error);
  },
});
```

## Query Invalidation

### After Transaction
```typescript
// Invalidate all balance queries
queryClient.invalidateQueries({ queryKey: ['balance'] });

// Invalidate specific balance
queryClient.invalidateQueries({
  queryKey: ['balance', tokenAddress]
});

// Invalidate all queries
queryClient.invalidateQueries();
```

### Manual Refetch
```typescript
const { refetch } = useQuery({
  queryKey: ['balance'],
  queryFn: fetchBalance,
});

// Later...
refetch();
```

## Loading States

### Query Loading
```typescript
const { data, isLoading, isFetching } = useQuery(...);

// isLoading: true on first load only
// isFetching: true whenever fetching (including background refetch)
```

### Mutation Loading
```typescript
const { mutate, isPending, isSuccess, isError } = useMutation(...);

// isPending: mutation in progress
// isSuccess: mutation succeeded
// isError: mutation failed
```

## Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: sendTransaction,
  onMutate: async (newTx) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['transactions'] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['transactions']);

    // Optimistically update
    queryClient.setQueryData(['transactions'], (old) => [...old, newTx]);

    // Return context with snapshot
    return { previous };
  },
  onError: (err, newTx, context) => {
    // Rollback on error
    queryClient.setQueryData(['transactions'], context.previous);
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  },
});
```

## Debugging

### Check Provider Setup
```typescript
// Navigate to /test-wallet to verify providers are working
```

### Log Query State
```typescript
const query = useQuery(...);
console.log('Query state:', {
  data: query.data,
  isLoading: query.isLoading,
  isFetching: query.isFetching,
  error: query.error,
  status: query.status,
});
```

### DevTools (Optional)
```typescript
// Install React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## TypeScript Types

### Wallet Context Types
```typescript
interface WalletContextValue {
  address: string | null;
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
  unlock: (password: string) => Promise<void>;
  lock: () => void;
  createWallet: (password: string) => Promise<string>;
  importWallet: (mnemonic: string, password: string) => Promise<void>;
  hasExistingWallet: () => boolean;
  clearError: () => void;
}
```

### Query Options Type
```typescript
import type { UseQueryOptions } from '@tanstack/react-query';

const options: UseQueryOptions<BalanceData, Error> = {
  queryKey: ['balance'],
  queryFn: fetchBalance,
};
```

## Best Practices

1. **Always check `isUnlocked`** before wallet operations
2. **Use `enabled` flag** in queries to prevent unnecessary fetches
3. **Invalidate queries** after mutations that change data
4. **Handle loading and error states** in all components
5. **Use React Query** for all blockchain data (not useState)
6. **Keep wallet context minimal** - use React Query for data
7. **Never store private keys** in React state
8. **Clear sensitive data** when locking wallet
9. **Use TypeScript** for type safety
10. **Test with `/test-wallet`** page after changes

## Common Mistakes to Avoid

### ❌ Don't: Store blockchain data in wallet context
```typescript
// Bad
const [balance, setBalance] = useState(null);
```

### ✅ Do: Use React Query
```typescript
// Good
const { data: balance } = useQuery({
  queryKey: ['balance'],
  queryFn: fetchBalance,
});
```

### ❌ Don't: Forget to check isUnlocked
```typescript
// Bad - will fail if locked
const { address } = useWallet();
sendTransaction(address, ...);
```

### ✅ Do: Guard with isUnlocked
```typescript
// Good
const { address, isUnlocked } = useWallet();
if (isUnlocked) {
  sendTransaction(address, ...);
}
```

### ❌ Don't: Forget to invalidate after mutations
```typescript
// Bad - balance won't update
useMutation({
  mutationFn: sendToken,
});
```

### ✅ Do: Invalidate queries
```typescript
// Good - balance refreshes
useMutation({
  mutationFn: sendToken,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['balance'] });
  },
});
```
