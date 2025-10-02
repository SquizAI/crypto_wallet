/**
 * Wallet Context
 *
 * Global wallet state management using React Context.
 * Provides wallet unlock/lock functionality and authentication state.
 *
 * Security Features:
 * - Never stores unencrypted private keys or mnemonics in state
 * - Only stores address and unlock status
 * - Automatically locks wallet on error
 * - Password validation before any wallet operations
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { address, isUnlocked, unlock, lock } = useWallet();
 *
 *   if (!isUnlocked) {
 *     return <button onClick={() => unlock(password)}>Unlock</button>;
 *   }
 *
 *   return <div>Wallet: {address}</div>;
 * }
 * ```
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  createWallet as createWalletService,
  importFromMnemonic,
  unlockWallet as unlockWalletService,
  hasWallet as hasWalletService,
  getWalletAddress,
  WalletError,
} from '@/services/walletService';
import {
  useIdleTimer,
  loadTimeoutPreference,
  TIMEOUT_OPTIONS,
  type TimeoutOption,
} from '@/hooks/useIdleTimer';
import {
  isMultiWalletMode,
  getActiveWallet,
  getAllWalletSummaries,
  switchWallet as switchWalletService,
  unlockMultiWallet,
  getActiveWallet as getActiveWalletData,
} from '@/services/multiWalletService';
import type { WalletSummary } from '@/types/multiWallet';

/**
 * Wallet context value interface
 */
interface WalletContextValue {
  /**
   * Current wallet address (null if no wallet or locked)
   */
  address: string | null;

  /**
   * Whether wallet is currently unlocked
   */
  isUnlocked: boolean;

  /**
   * Whether wallet operations are in progress
   */
  isLoading: boolean;

  /**
   * Current error message (null if no error)
   */
  error: string | null;

  /**
   * Unlock existing wallet with password
   * @param password - User password
   * @throws WalletError if unlock fails
   */
  unlock: (password: string) => Promise<void>;

  /**
   * Lock wallet and clear state
   */
  lock: () => void;

  /**
   * Create new HD wallet
   * @param password - Password to encrypt wallet (min 8 characters)
   * @returns Mnemonic phrase (MUST be shown to user once)
   */
  createWallet: (password: string) => Promise<string>;

  /**
   * Import wallet from mnemonic phrase
   * @param mnemonic - 12-24 word mnemonic phrase
   * @param password - Password to encrypt wallet (min 8 characters)
   */
  importWallet: (mnemonic: string, password: string) => Promise<void>;

  /**
   * Check if wallet exists in storage
   * @returns true if wallet exists
   */
  hasExistingWallet: () => boolean;

  /**
   * Clear error state
   */
  clearError: () => void;

  /**
   * Current session timeout preference
   */
  timeoutPreference: TimeoutOption;

  /**
   * Update session timeout preference
   * @param option - Timeout option to set
   */
  setTimeoutPreference: (option: TimeoutOption) => void;

  /**
   * Whether auto-lock warning is shown
   */
  showLockWarning: boolean;

  /**
   * Dismiss auto-lock warning
   */
  dismissLockWarning: () => void;

  /**
   * Multi-wallet support: Get all wallet summaries
   * @returns Array of wallet summaries
   */
  wallets: WalletSummary[];

  /**
   * Multi-wallet support: Current active wallet ID
   */
  activeWalletId: string | null;

  /**
   * Multi-wallet support: Switch to a different wallet
   * @param walletId - Wallet ID to switch to
   */
  switchWallet: (walletId: string) => void;

  /**
   * Multi-wallet support: Refresh wallets list
   */
  refreshWallets: () => void;

  /**
   * Multi-wallet support: Check if multi-wallet mode is enabled
   */
  isMultiWallet: boolean;
}

/**
 * Wallet context
 */
const WalletContext = createContext<WalletContextValue | null>(null);

/**
 * Wallet Provider Props
 */
interface WalletProviderProps {
  children: ReactNode;
}

/**
 * Wallet Provider Component
 *
 * Wraps the application and provides wallet state to all components.
 * Should be placed inside QueryProvider for proper data fetching.
 *
 * @example
 * ```tsx
 * <QueryProvider>
 *   <WalletProvider>
 *     <App />
 *   </WalletProvider>
 * </QueryProvider>
 * ```
 */
export function WalletProvider({ children }: WalletProviderProps) {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeoutPreference, setTimeoutPreferenceState] = useState<TimeoutOption>('15min');
  const [showLockWarning, setShowLockWarning] = useState(false);

  // Multi-wallet state
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [activeWalletId, setActiveWalletIdState] = useState<string | null>(null);
  const [isMultiWallet, setIsMultiWallet] = useState(false);

  /**
   * Initialize wallet state on mount
   * Sets address if wallet exists (but keeps it locked)
   * Loads timeout preference from localStorage
   * Checks for multi-wallet mode
   */
  useEffect(() => {
    try {
      // Check if multi-wallet mode is enabled
      const isMulti = isMultiWalletMode();
      setIsMultiWallet(isMulti);

      if (isMulti) {
        // Multi-wallet mode: load active wallet
        const activeWallet = getActiveWalletData();
        if (activeWallet) {
          setAddress(activeWallet.address);
          setActiveWalletIdState(activeWallet.id);
        }

        // Load all wallets
        const allWallets = getAllWalletSummaries();
        setWallets(allWallets);
      } else {
        // Single wallet mode (backward compatibility)
        if (hasWalletService()) {
          const walletAddress = getWalletAddress();
          if (walletAddress) {
            setAddress(walletAddress);
          }
        }
      }

      // Load timeout preference
      const savedPreference = loadTimeoutPreference();
      setTimeoutPreferenceState(savedPreference);
    } catch (err) {
      console.error('Failed to initialize wallet state:', err);
    }
  }, []);

  /**
   * Handle auto-lock when user is idle
   */
  const handleAutoLock = useCallback(() => {
    if (isUnlocked) {
      setIsUnlocked(false);
      setShowLockWarning(false);
      setError(null);
      router.push('/unlock');
    }
  }, [isUnlocked, router]);

  /**
   * Handle warning before auto-lock
   */
  const handleLockWarning = useCallback(() => {
    if (isUnlocked) {
      setShowLockWarning(true);
    }
  }, [isUnlocked]);

  /**
   * Idle timer - auto-lock wallet on inactivity
   */
  useIdleTimer({
    timeout: TIMEOUT_OPTIONS[timeoutPreference],
    onIdle: handleAutoLock,
    onWarning: handleLockWarning,
    warningTime: 30000, // 30 seconds warning
    enabled: isUnlocked, // Only active when wallet is unlocked
  });

  /**
   * Unlock wallet with password
   * Validates password and sets unlocked state
   */
  const unlock = useCallback(async (password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate password and unlock wallet
      const unlockedWallet = await unlockWalletService(password);

      // Set state (but don't store sensitive data)
      setAddress(unlockedWallet.address);
      setIsUnlocked(true);

      // Security: Don't store the unlocked wallet instance
      // It will be garbage collected after this function
    } catch (err) {
      // Handle wallet errors
      if (err instanceof WalletError) {
        setError(err.message);

        // Lock wallet on authentication failure
        if (err.code === 'DECRYPTION_FAILED') {
          setIsUnlocked(false);
        }
      } else {
        setError('Failed to unlock wallet. Please try again.');
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Lock wallet and clear state
   * Removes sensitive data from memory
   */
  const lock = useCallback(() => {
    setIsUnlocked(false);
    setShowLockWarning(false);
    setError(null);

    // Keep address visible even when locked
    // Address is public information and useful for UI
  }, []);

  /**
   * Create new HD wallet
   * Returns mnemonic that MUST be shown to user
   */
  const createWallet = useCallback(async (password: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // Create wallet and get mnemonic
      const { address: newAddress, mnemonic } =
        await createWalletService(password);

      // Set state
      setAddress(newAddress);
      setIsUnlocked(true);

      // Initialize backup status for new wallet
      if (typeof window !== 'undefined') {
        import('@/services/backupService').then(({ initializeBackupStatus }) => {
          initializeBackupStatus(new Date().toISOString());
        }).catch((err) => {
          console.error('Failed to initialize backup status:', err);
        });
      }

      return mnemonic;
    } catch (err) {
      // Handle wallet errors
      if (err instanceof WalletError) {
        setError(err.message);
      } else {
        setError('Failed to create wallet. Please try again.');
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Import wallet from mnemonic phrase
   */
  const importWallet = useCallback(
    async (mnemonic: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Import wallet
        const importedAddress = await importFromMnemonic(mnemonic, password);

        // Set state
        setAddress(importedAddress);
        setIsUnlocked(true);

        // Initialize backup status for imported wallet
        if (typeof window !== 'undefined') {
          import('@/services/backupService').then(({ initializeBackupStatus }) => {
            initializeBackupStatus(new Date().toISOString());
          }).catch((err) => {
            console.error('Failed to initialize backup status:', err);
          });
        }
      } catch (err) {
        // Handle wallet errors
        if (err instanceof WalletError) {
          setError(err.message);
        } else {
          setError('Failed to import wallet. Please try again.');
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Check if wallet exists in storage
   */
  const hasExistingWallet = useCallback((): boolean => {
    return hasWalletService();
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Update timeout preference
   * Saves to localStorage and updates state
   */
  const setTimeoutPreference = useCallback((option: TimeoutOption) => {
    setTimeoutPreferenceState(option);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallet-timeout-preference', option);
    }
  }, []);

  /**
   * Dismiss lock warning
   * This resets the idle timer as user is active
   */
  const dismissLockWarning = useCallback(() => {
    setShowLockWarning(false);
  }, []);

  /**
   * Switch to a different wallet
   */
  const switchWallet = useCallback((walletId: string) => {
    try {
      switchWalletService(walletId);

      // Update state
      const activeWallet = getActiveWalletData();
      if (activeWallet) {
        setAddress(activeWallet.address);
        setActiveWalletIdState(activeWallet.id);
      }

      // Refresh wallet list
      const allWallets = getAllWalletSummaries();
      setWallets(allWallets);

      // Lock wallet when switching (require re-authentication)
      setIsUnlocked(false);
    } catch (err) {
      console.error('Failed to switch wallet:', err);
      setError('Failed to switch wallet. Please try again.');
    }
  }, []);

  /**
   * Refresh wallets list
   */
  const refreshWallets = useCallback(() => {
    try {
      const isMulti = isMultiWalletMode();
      setIsMultiWallet(isMulti);

      if (isMulti) {
        const allWallets = getAllWalletSummaries();
        setWallets(allWallets);

        const activeWallet = getActiveWalletData();
        if (activeWallet) {
          setAddress(activeWallet.address);
          setActiveWalletIdState(activeWallet.id);
        }
      }
    } catch (err) {
      console.error('Failed to refresh wallets:', err);
    }
  }, []);

  // Context value
  const value: WalletContextValue = {
    address,
    isUnlocked,
    isLoading,
    error,
    unlock,
    lock,
    createWallet,
    importWallet,
    hasExistingWallet,
    clearError,
    timeoutPreference,
    setTimeoutPreference,
    showLockWarning,
    dismissLockWarning,
    wallets,
    activeWalletId,
    switchWallet,
    refreshWallets,
    isMultiWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

/**
 * useWallet Hook
 *
 * Access wallet context in any component
 *
 * @throws Error if used outside WalletProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { address, isUnlocked, unlock } = useWallet();
 *
 *   if (!isUnlocked) {
 *     return <UnlockForm onSubmit={unlock} />;
 *   }
 *
 *   return <div>Address: {address}</div>;
 * }
 * ```
 */
export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }

  return context;
}
