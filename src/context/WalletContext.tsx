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
import {
  createWallet as createWalletService,
  importFromMnemonic,
  unlockWallet as unlockWalletService,
  hasWallet as hasWalletService,
  getWalletAddress,
  WalletError,
} from '@/services/walletService';

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
  const [address, setAddress] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize wallet state on mount
   * Sets address if wallet exists (but keeps it locked)
   */
  useEffect(() => {
    try {
      if (hasWalletService()) {
        const walletAddress = getWalletAddress();
        if (walletAddress) {
          setAddress(walletAddress);
        }
      }
    } catch (err) {
      console.error('Failed to initialize wallet state:', err);
    }
  }, []);

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
