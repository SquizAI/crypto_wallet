/**
 * Wallet Context Usage Examples
 *
 * This file demonstrates how to use the WalletContext and React Query
 * in various common scenarios throughout the application.
 *
 * NOTE: These are example components, not production code.
 * Use these patterns in your actual components.
 */

'use client';

import { useWallet } from './WalletContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

// ============================================================================
// Example 1: Basic Wallet Unlock Form
// ============================================================================

/**
 * Simple unlock form that uses wallet context
 */
export function UnlockWalletForm() {
  const { unlock, isLoading, error, clearError } = useWallet();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await unlock(password);
      setPassword(''); // Clear password on success
      // Navigate to dashboard or show success message
    } catch (err) {
      // Error is already set in context
      console.error('Unlock failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        disabled={isLoading}
        required
        minLength={8}
      />

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Unlocking...' : 'Unlock Wallet'}
      </button>
    </form>
  );
}

// ============================================================================
// Example 2: Create Wallet Flow
// ============================================================================

/**
 * Wallet creation form that shows mnemonic to user
 */
export function CreateWalletForm() {
  const { createWallet, isLoading, error } = useWallet();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mnemonic, setMnemonic] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const newMnemonic = await createWallet(password);
      setMnemonic(newMnemonic);
      // Show mnemonic backup screen
    } catch (err) {
      console.error('Create wallet failed:', err);
    }
  };

  // Show mnemonic backup screen after creation
  if (mnemonic) {
    return (
      <div>
        <h2>Backup Your Recovery Phrase</h2>
        <div className="mnemonic-display">
          {mnemonic.split(' ').map((word, i) => (
            <span key={i}>
              {i + 1}. {word}
            </span>
          ))}
        </div>
        <button onClick={() => {/* Navigate to dashboard */}}>
          I&apos;ve Saved My Recovery Phrase
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleCreate}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Create password (min 8 characters)"
        required
        minLength={8}
      />

      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm password"
        required
        minLength={8}
      />

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Wallet'}
      </button>
    </form>
  );
}

// ============================================================================
// Example 3: Import Wallet Flow
// ============================================================================

/**
 * Import wallet from mnemonic phrase
 */
export function ImportWalletForm() {
  const { importWallet, isLoading, error } = useWallet();
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await importWallet(mnemonic, password);
      // Navigate to dashboard
    } catch (err) {
      console.error('Import failed:', err);
    }
  };

  return (
    <form onSubmit={handleImport}>
      <textarea
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
        placeholder="Enter 12-24 word recovery phrase"
        rows={4}
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Create password for this wallet"
        required
        minLength={8}
      />

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Importing...' : 'Import Wallet'}
      </button>
    </form>
  );
}

// ============================================================================
// Example 4: Protected Dashboard Component
// ============================================================================

/**
 * Dashboard that requires unlocked wallet
 */
export function WalletDashboard() {
  const { address, isUnlocked, lock } = useWallet();

  // Redirect to unlock if not unlocked
  if (!isUnlocked) {
    return <UnlockWalletForm />;
  }

  return (
    <div>
      <header>
        <span>Address: {address}</span>
        <button onClick={lock}>Lock Wallet</button>
      </header>

      <div>
        {/* Balance cards, transaction history, etc. */}
        <BalanceCards address={address!} />
        <TransactionHistory address={address!} />
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: Balance Fetching with React Query
// ============================================================================

/**
 * Custom hook for fetching token balance
 */
function useTokenBalance(tokenAddress: string, walletAddress: string | null) {
  return useQuery({
    queryKey: ['balance', tokenAddress, walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;

      // Use ContractService to fetch balance
      // const service = new ContractService(rpcUrl);
      // const balance = await service.getTokenBalance(tokenAddress, walletAddress);
      // return balance;

      // Placeholder for example
      return '1000.50';
    },
    enabled: !!walletAddress, // Only fetch if address exists
    staleTime: 30000, // Consider fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Balance display component
 */
function BalanceCards({ address }: { address: string }) {
  // Fetch USDC balance
  const {
    data: usdcBalance,
    isLoading: isLoadingUsdc,
    error: usdcError,
  } = useTokenBalance('0x...usdc...', address);

  // Fetch USDT balance
  const {
    data: usdtBalance,
    isLoading: isLoadingUsdt,
    error: usdtError,
  } = useTokenBalance('0x...usdt...', address);

  if (isLoadingUsdc || isLoadingUsdt) {
    return <div>Loading balances...</div>;
  }

  if (usdcError || usdtError) {
    return <div>Error loading balances</div>;
  }

  return (
    <div>
      <div className="balance-card">
        <h3>USDC</h3>
        <p>{usdcBalance}</p>
      </div>

      <div className="balance-card">
        <h3>USDT</h3>
        <p>{usdtBalance}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Example 6: Send Transaction with React Query Mutation
// ============================================================================

/**
 * Send transaction form with mutation
 */
function SendTransactionForm() {
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  // Mutation for sending transaction
  const sendMutation = useMutation({
    mutationFn: async (data: { to: string; amount: string }) => {
      // Use TransactionService to send
      // const service = new TransactionService(rpcUrl);
      // const tx = await service.sendToken(...);
      // return tx;

      // Placeholder
      return { hash: '0x123...' };
    },
    onSuccess: () => {
      // Invalidate balance queries to refetch
      queryClient.invalidateQueries({ queryKey: ['balance'] });

      // Reset form
      setRecipient('');
      setAmount('');

      alert('Transaction sent successfully!');
    },
    onError: (error) => {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMutation.mutate({ to: recipient, amount });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient address (0x...)"
        required
      />

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        step="0.01"
        min="0"
        required
      />

      <button type="submit" disabled={sendMutation.isPending}>
        {sendMutation.isPending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}

// ============================================================================
// Example 7: Transaction History with React Query
// ============================================================================

/**
 * Custom hook for fetching transaction history
 */
function useTransactionHistory(address: string | null) {
  return useQuery({
    queryKey: ['transactions', address],
    queryFn: async () => {
      if (!address) return [];

      // Fetch from blockchain explorer API or local storage
      // const transactions = await fetchTransactions(address);
      // return transactions;

      // Placeholder
      return [
        {
          hash: '0x123...',
          from: address,
          to: '0xabc...',
          value: '100',
          timestamp: Date.now(),
          status: 'confirmed',
        },
      ];
    },
    enabled: !!address,
    staleTime: 60000, // Consider fresh for 1 minute
  });
}

/**
 * Transaction history component
 */
function TransactionHistory({ address }: { address: string }) {
  const { data: transactions, isLoading, error } = useTransactionHistory(address);

  if (isLoading) return <div>Loading transactions...</div>;
  if (error) return <div>Error loading transactions</div>;
  if (!transactions?.length) return <div>No transactions yet</div>;

  return (
    <div>
      <h2>Recent Transactions</h2>
      <ul>
        {transactions.map((tx: { hash: string; value: string; status: string }) => (
          <li key={tx.hash}>
            <span>{tx.hash}</span>
            <span>{tx.value}</span>
            <span>{tx.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// Example 8: Conditional Rendering Based on Wallet State
// ============================================================================

/**
 * Main app component with routing based on wallet state
 */
export function App() {
  const { hasExistingWallet, isUnlocked } = useWallet();

  // No wallet exists - show onboarding
  if (!hasExistingWallet()) {
    return (
      <div>
        <h1>Welcome to Stablecoin Wallet</h1>
        <CreateWalletForm />
        <ImportWalletForm />
      </div>
    );
  }

  // Wallet exists but locked - show unlock
  if (!isUnlocked) {
    return (
      <div>
        <h1>Unlock Your Wallet</h1>
        <UnlockWalletForm />
      </div>
    );
  }

  // Wallet unlocked - show dashboard
  return <WalletDashboard />;
}

// ============================================================================
// Example 9: Lock Wallet on Inactivity
// ============================================================================

/**
 * Hook to automatically lock wallet after inactivity
 */
function useAutoLock(timeoutMinutes: number = 15) {
  const { lock, isUnlocked } = useWallet();

  // useEffect(() => {
  //   if (!isUnlocked) return;

  //   let timeout: NodeJS.Timeout;

  //   const resetTimer = () => {
  //     clearTimeout(timeout);
  //     timeout = setTimeout(() => {
  //       lock();
  //     }, timeoutMinutes * 60 * 1000);
  //   };

  //   // Reset on user activity
  //   window.addEventListener('mousedown', resetTimer);
  //   window.addEventListener('keydown', resetTimer);
  //   window.addEventListener('touchstart', resetTimer);

  //   resetTimer(); // Start timer

  //   return () => {
  //     clearTimeout(timeout);
  //     window.removeEventListener('mousedown', resetTimer);
  //     window.removeEventListener('keydown', resetTimer);
  //     window.removeEventListener('touchstart', resetTimer);
  //   };
  // }, [isUnlocked, lock, timeoutMinutes]);
}

// ============================================================================
// Example 10: Error Boundary for Wallet Operations
// ============================================================================

/**
 * Error boundary component for wallet errors
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class WalletErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Wallet error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div role="alert" className="error-container">
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={() => this.setState({ hasError: false, error: null })}>
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
