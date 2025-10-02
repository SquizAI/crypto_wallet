/**
 * React Hooks Usage Examples
 *
 * This file demonstrates how to use the custom blockchain data hooks
 * in your React components. These examples show common patterns and
 * best practices for integrating with the wallet application.
 */

'use client';

import { useState } from 'react';
import {
  useBalance,
  useSendTransaction,
  useTransactionHistory,
  usePendingTransactions,
  useTransactionCounts,
  isSingleTokenBalance,
  isMultipleTokenBalances,
} from '@/hooks';

/**
 * Example 1: Display Single Token Balance
 *
 * Shows how to fetch and display a single token balance (e.g., USDC)
 */
export function BalanceDisplay() {
  const { data: balance, isLoading, error, refetch } = useBalance('USDC');

  if (isLoading) {
    return <div>Loading USDC balance...</div>;
  }

  if (error) {
    return <div>Error loading balance: {error.message}</div>;
  }

  if (!balance) {
    return <div>No balance data</div>;
  }

  return (
    <div>
      <h2>USDC Balance</h2>
      <p>{balance.balanceFormatted} USDC</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}

/**
 * Example 2: Display All Token Balances
 *
 * Fetches and displays balances for all supported tokens
 */
export function AllBalancesDisplay() {
  // Fetch all balances by passing no token symbol
  const { data: balances, isLoading, error } = useBalance();

  if (isLoading) {
    return <div>Loading balances...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!balances || !isMultipleTokenBalances(balances)) {
    return <div>No balances available</div>;
  }

  return (
    <div>
      <h2>Your Balances</h2>
      {balances.map((balance) => (
        <div key={balance.tokenAddress}>
          <strong>{balance.symbol}:</strong> {balance.balanceFormatted}
        </div>
      ))}
    </div>
  );
}

/**
 * Example 3: Balance with Auto-Refetch
 *
 * Automatically refetch balance every 10 seconds
 */
export function LiveBalanceDisplay() {
  const { data: balance } = useBalance('USDC', {
    refetchInterval: 10000, // 10 seconds
  });

  return (
    <div>
      <h3>Live USDC Balance</h3>
      <p>{balance?.balanceFormatted || '0.00'} USDC</p>
      <small>Updates every 10 seconds</small>
    </div>
  );
}

/**
 * Example 4: Send Transaction Form
 *
 * Complete form for sending tokens with validation and feedback
 */
export function SendTokenForm() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: sendToken, isPending, error, data } = useSendTransaction();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    sendToken(
      {
        tokenSymbol: 'USDC',
        recipient,
        amount,
        password,
      },
      {
        onSuccess: (data) => {
          alert(`Transaction sent! Hash: ${data.hash}`);
          // Reset form
          setRecipient('');
          setAmount('');
          setPassword('');
        },
        onError: (error) => {
          console.error('Transaction failed:', error);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Send USDC</h2>

      <div>
        <label>Recipient Address:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          required
        />
      </div>

      <div>
        <label>Amount:</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10.50"
          required
        />
      </div>

      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <div style={{ color: 'red' }}>{error.message}</div>}

      {data && (
        <div style={{ color: 'green' }}>
          Transaction sent! Hash: {data.hash}
          <br />
          Gas estimate: {data.gasEstimate.estimatedCostFormatted} ETH
        </div>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}

/**
 * Example 5: Transaction History List
 *
 * Displays all transactions with status indicators
 */
export function TransactionHistoryList() {
  const { data: transactions, isLoading, error } = useTransactionHistory();

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!transactions || transactions.length === 0) {
    return <div>No transactions yet</div>;
  }

  return (
    <div>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.hash}>
            <div>
              <strong>{tx.type === 'send' ? 'Sent' : 'Received'}</strong>
              <span> {tx.value} {tx.tokenSymbol}</span>
            </div>
            <div>
              To: {tx.to?.substring(0, 10)}...
            </div>
            <div>
              Status: <span className={`status-${tx.status}`}>{tx.status}</span>
            </div>
            {tx.timestamp && (
              <div>
                Date: {new Date(tx.timestamp).toLocaleString()}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 6: Pending Transactions Badge
 *
 * Shows a badge with the number of pending transactions
 */
export function PendingTransactionsBadge() {
  const { data: pending } = usePendingTransactions();
  const count = pending?.length || 0;

  if (count === 0) {
    return null;
  }

  return (
    <div style={{ background: 'yellow', padding: '4px 8px', borderRadius: '4px' }}>
      {count} pending transaction{count !== 1 ? 's' : ''}
    </div>
  );
}

/**
 * Example 7: Transaction Counts Dashboard
 *
 * Shows a summary of transaction counts by status
 */
export function TransactionSummary() {
  const { data: counts } = useTransactionCounts();

  return (
    <div>
      <h3>Transaction Summary</h3>
      <div>Total: {counts?.total || 0}</div>
      <div>Pending: {counts?.pending || 0}</div>
      <div>Confirmed: {counts?.confirmed || 0}</div>
      <div>Failed: {counts?.failed || 0}</div>
    </div>
  );
}

/**
 * Example 8: Filtered Transaction List
 *
 * Shows only confirmed transactions, limited to 10
 */
export function RecentConfirmedTransactions() {
  const { data: transactions } = useTransactionHistory({
    statusFilter: 'confirmed',
    limit: 10,
  });

  return (
    <div>
      <h3>Recent Confirmed Transactions</h3>
      {transactions?.map((tx) => (
        <div key={tx.hash}>
          {tx.value} {tx.tokenSymbol} - {new Date(tx.timestamp!).toLocaleDateString()}
        </div>
      ))}
    </div>
  );
}

/**
 * Example 9: Multi-Token Dashboard
 *
 * Complete dashboard showing balances and transaction history
 */
export function WalletDashboard() {
  // Fetch all balances
  const { data: balances, isLoading: balancesLoading } = useBalance();

  // Fetch recent transactions
  const { data: transactions, isLoading: txLoading } = useTransactionHistory({
    limit: 5,
  });

  // Fetch pending count
  const { data: counts } = useTransactionCounts();

  return (
    <div>
      <h1>Wallet Dashboard</h1>

      {/* Balances Section */}
      <section>
        <h2>Balances</h2>
        {balancesLoading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {balances && isMultipleTokenBalances(balances) && balances.map((balance) => (
              <div key={balance.symbol}>
                <strong>{balance.symbol}:</strong> {balance.balanceFormatted}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Transactions Alert */}
      {counts && counts.pending > 0 && (
        <div style={{ background: 'lightyellow', padding: '10px', margin: '10px 0' }}>
          You have {counts.pending} pending transaction{counts.pending !== 1 ? 's' : ''}
        </div>
      )}

      {/* Recent Transactions */}
      <section>
        <h2>Recent Transactions</h2>
        {txLoading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {transactions?.map((tx) => (
              <div key={tx.hash} style={{ borderBottom: '1px solid #ccc', padding: '8px 0' }}>
                <div>
                  {tx.type === 'send' ? '↑ Sent' : '↓ Received'} {tx.value} {tx.tokenSymbol}
                </div>
                <div style={{ fontSize: '0.8em', color: '#666' }}>
                  {tx.status === 'pending' && '⏳ Pending'}
                  {tx.status === 'confirmed' && '✅ Confirmed'}
                  {tx.status === 'failed' && '❌ Failed'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * Example 10: Send with Balance Check
 *
 * Form that checks balance before allowing send
 */
export function SendWithBalanceCheck() {
  const [amount, setAmount] = useState('');
  const { data: balance } = useBalance('USDC');
  const { mutate: sendToken, isPending } = useSendTransaction();

  const hasEnoughBalance = balance && parseFloat(amount) <= parseFloat(balance.balanceFormatted);

  return (
    <div>
      <h3>Send USDC</h3>
      <div>
        Available: {balance?.balanceFormatted || '0.00'} USDC
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />

      {amount && !hasEnoughBalance && (
        <div style={{ color: 'red' }}>Insufficient balance</div>
      )}

      <button disabled={!hasEnoughBalance || isPending}>
        {isPending ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
