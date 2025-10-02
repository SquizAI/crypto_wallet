# React Hooks for Blockchain Data

Custom React hooks for fetching and mutating blockchain data using React Query patterns. These hooks integrate seamlessly with the wallet context and services layer.

## Overview

All hooks follow React Query patterns with:
- Automatic caching (30s stale time for balances, 10s for transactions)
- Auto-refetch on wallet unlock/address change
- Proper error handling and loading states
- Optimistic updates and cache invalidation

## Hooks

### useBalance

Fetch token balances from the blockchain.

**Signatures:**
```typescript
// Single token balance
useBalance(tokenSymbol: 'USDC' | 'USDT' | 'DAI', options?: UseBalanceOptions)

// All token balances
useBalance(options?: UseBalanceOptions)
useBalance(null, options?: UseBalanceOptions)
```

**Options:**
- `refetchInterval?: number` - Auto-refetch interval in ms
- `enabled?: boolean` - Conditionally enable/disable the query
- `queryOptions?: Partial<UseQueryOptions>` - Additional React Query options

**Return Value:**
```typescript
{
  data: TokenBalance | TokenBalance[] | undefined,
  isLoading: boolean,
  error: Error | null,
  refetch: () => void,
  // ... other React Query properties
}
```

**Examples:**
```typescript
// Fetch USDC balance
const { data: balance, isLoading } = useBalance('USDC');

// Fetch all balances
const { data: allBalances } = useBalance();

// With auto-refetch every 10 seconds
const { data } = useBalance('USDT', { refetchInterval: 10000 });

// Conditionally fetch
const { data } = useBalance('DAI', { enabled: isWalletUnlocked });
```

---

### useSendTransaction

Send token transactions with automatic balance invalidation.

**Return Value:**
```typescript
{
  mutate: (params: SendTransactionParams, callbacks?) => void,
  mutateAsync: (params: SendTransactionParams) => Promise<SendTransactionResult>,
  isPending: boolean,
  error: Error | null,
  data: SendTransactionResult | undefined,
  // ... other React Query mutation properties
}
```

**Parameters:**
```typescript
interface SendTransactionParams {
  tokenSymbol: 'USDC' | 'USDT' | 'DAI';
  recipient: string;        // 0x-prefixed address
  amount: string;          // e.g., "10.5"
  password?: string;       // Required to unlock wallet
}
```

**Result:**
```typescript
interface SendTransactionResult {
  hash: string;                    // Transaction hash
  transaction: Transaction;        // Stored transaction record
  gasEstimate: GasEstimate;       // Gas estimation details
  stopMonitoring: () => void;     // Cleanup function
}
```

**Examples:**
```typescript
const { mutate: sendToken, isPending, error } = useSendTransaction();

// Send transaction
sendToken(
  {
    tokenSymbol: 'USDC',
    recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    amount: '10.5',
    password: 'user-password',
  },
  {
    onSuccess: (data) => {
      console.log('Transaction sent!', data.hash);
    },
    onError: (error) => {
      console.error('Failed:', error.message);
    },
  }
);

// With async/await
try {
  const result = await mutateAsync({
    tokenSymbol: 'USDT',
    recipient: '0x...',
    amount: '100',
    password: 'password',
  });
  console.log('Success:', result.hash);
} catch (error) {
  console.error('Error:', error);
}
```

---

### useTransactionHistory

Fetch transaction history from local storage.

**Options:**
```typescript
interface UseTransactionHistoryOptions {
  statusFilter?: 'pending' | 'confirmed' | 'failed';
  typeFilter?: 'send' | 'receive' | 'approve' | 'contract';
  limit?: number;
  enabled?: boolean;
  refetchInterval?: number;
  queryOptions?: Partial<UseQueryOptions>;
}
```

**Return Value:**
```typescript
{
  data: Transaction[] | undefined,
  isLoading: boolean,
  error: Error | null,
  refetch: () => void,
  // ... other React Query properties
}
```

**Examples:**
```typescript
// All transactions
const { data: transactions } = useTransactionHistory();

// Only pending transactions
const { data: pending } = useTransactionHistory({ statusFilter: 'pending' });

// Last 10 confirmed transactions
const { data: recent } = useTransactionHistory({
  statusFilter: 'confirmed',
  limit: 10,
});

// Only send transactions
const { data: sent } = useTransactionHistory({ typeFilter: 'send' });
```

---

### Helper Hooks

Additional convenience hooks built on `useTransactionHistory`:

#### usePendingTransactions
```typescript
const { data: pending } = usePendingTransactions();
// Auto-refetches every 10 seconds
```

#### useConfirmedTransactions
```typescript
const { data: confirmed } = useConfirmedTransactions({ limit: 20 });
```

#### useFailedTransactions
```typescript
const { data: failed } = useFailedTransactions();
```

#### useTransactionCounts
```typescript
const { data: counts } = useTransactionCounts();
// Returns: { pending: number, confirmed: number, failed: number, total: number }
```

#### useTransaction
```typescript
const { data: transaction } = useTransaction('0x123...');
// Get single transaction by hash
```

---

### useEstimateGas

Estimate gas for a token transfer without sending.

**Parameters:**
```typescript
type EstimateGasParams = Omit<SendTransactionParams, 'password'>;
```

**Example:**
```typescript
const { mutate: estimateGas, data: gasEstimate } = useEstimateGas({
  tokenSymbol: 'USDC',
  recipient: '0x...',
  amount: '10.5',
});

// Trigger estimation
estimateGas();

// Gas estimate result
console.log(gasEstimate?.estimatedCostFormatted); // "0.002 ETH"
```

---

## Type Guards

Utility functions for type checking:

### isSingleTokenBalance
```typescript
if (isSingleTokenBalance(data)) {
  console.log(data.balanceFormatted); // TypeScript knows it's TokenBalance
}
```

### isMultipleTokenBalances
```typescript
if (isMultipleTokenBalances(data)) {
  data.forEach(balance => console.log(balance.symbol)); // TypeScript knows it's TokenBalance[]
}
```

---

## Complete Example

```typescript
'use client';

import {
  useBalance,
  useSendTransaction,
  useTransactionHistory,
  usePendingTransactions,
} from '@/hooks';

export function WalletPage() {
  // Fetch USDC balance
  const { data: balance, isLoading: balanceLoading } = useBalance('USDC');

  // Fetch recent transactions
  const { data: transactions } = useTransactionHistory({ limit: 5 });

  // Check for pending transactions
  const { data: pending } = usePendingTransactions();

  // Send transaction mutation
  const { mutate: sendToken, isPending } = useSendTransaction();

  const handleSend = () => {
    sendToken(
      {
        tokenSymbol: 'USDC',
        recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        amount: '10.5',
        password: 'user-password',
      },
      {
        onSuccess: (data) => alert(`Sent! Hash: ${data.hash}`),
        onError: (error) => alert(`Error: ${error.message}`),
      }
    );
  };

  return (
    <div>
      <h1>Wallet</h1>

      {/* Balance */}
      {balanceLoading ? (
        <p>Loading balance...</p>
      ) : (
        <p>USDC Balance: {balance?.balanceFormatted}</p>
      )}

      {/* Pending Alert */}
      {pending && pending.length > 0 && (
        <div className="alert">
          {pending.length} pending transaction(s)
        </div>
      )}

      {/* Send Button */}
      <button onClick={handleSend} disabled={isPending}>
        {isPending ? 'Sending...' : 'Send 10.5 USDC'}
      </button>

      {/* Transaction History */}
      <h2>Recent Transactions</h2>
      <ul>
        {transactions?.map((tx) => (
          <li key={tx.hash}>
            {tx.type === 'send' ? 'Sent' : 'Received'} {tx.value} {tx.tokenSymbol}
            - Status: {tx.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Best Practices

### 1. Wallet Context Required
All hooks depend on `WalletContext`. Ensure your app is wrapped:
```typescript
<WalletProvider>
  <QueryProvider>
    <App />
  </QueryProvider>
</WalletProvider>
```

### 2. Query Invalidation
Mutations automatically invalidate related queries:
- `useSendTransaction` invalidates balance and transaction queries
- Manual invalidation: `queryClient.invalidateQueries({ queryKey: ['balance'] })`

### 3. Error Handling
```typescript
const { data, error, isError } = useBalance('USDC');

if (isError && error) {
  // Handle specific errors
  if (error.message.includes('not supported')) {
    // Token not available on current network
  }
}
```

### 4. Loading States
```typescript
const { isLoading, isFetching, isRefetching } = useBalance('USDC');

// isLoading: First load
// isFetching: Any fetch (including background refetch)
// isRefetching: Explicitly triggered refetch
```

### 5. Conditional Fetching
```typescript
const { address, isUnlocked } = useWallet();

// Only fetch when wallet is ready
const { data } = useBalance('USDC', {
  enabled: isUnlocked && !!address,
});
```

### 6. Optimistic Updates
```typescript
const { mutate } = useSendTransaction();

mutate(params, {
  onMutate: async () => {
    // Show optimistic UI immediately
    return { previousBalance: balance };
  },
  onError: (error, variables, context) => {
    // Rollback on error
    if (context?.previousBalance) {
      // Restore previous balance
    }
  },
});
```

---

## Troubleshooting

### Queries Not Fetching
- Check wallet is unlocked: `isUnlocked === true`
- Check address is available: `address !== null`
- Check `enabled` option is not `false`

### Stale Data
- Adjust `staleTime` option
- Manually trigger refetch: `refetch()`
- Invalidate queries: `queryClient.invalidateQueries()`

### Memory Leaks
- Transaction monitors are cleaned up automatically
- Use `stopMonitoring()` if needed for manual cleanup

### Type Errors
- Use type guards: `isSingleTokenBalance()`, `isMultipleTokenBalances()`
- Check TypeScript types are imported correctly
- Ensure React Query types are up to date

---

## See Also

- [React Query Documentation](https://tanstack.com/query/latest)
- [Service Layer Documentation](../services/README.md)
- [Wallet Context Documentation](../context/WalletContext.tsx)
- [Usage Examples](./USAGE_EXAMPLES.tsx)
