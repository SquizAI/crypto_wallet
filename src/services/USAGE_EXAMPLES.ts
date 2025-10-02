/**
 * Wallet Service Usage Examples
 *
 * This file demonstrates how to use the wallet and storage services
 * in various scenarios. These are examples only - do not use in production.
 */

import {
  createWallet,
  importFromMnemonic,
  importFromPrivateKey,
  unlockWallet,
  hasWallet,
  deleteWallet,
  getWalletAddress,
  verifyPassword,
  exportPrivateKey,
  exportMnemonic,
  WalletError,
} from './walletService';

import {
  addTransaction,
  getTransactionHistory,
  updateTransaction,
} from './storageService';

import type { Transaction } from '@/types/wallet';

/**
 * Example 1: Create a new wallet
 */
export async function example1_CreateNewWallet() {
  try {
    // User provides password (validate in your UI)
    const password = 'mySecurePassword123';

    // Create wallet
    const { address, mnemonic } = await createWallet(password);

    console.log('Wallet created successfully!');
    console.log('Address:', address);
    console.log('Mnemonic (SHOW ONCE TO USER):', mnemonic);

    // IMPORTANT: Display mnemonic to user ONCE for backup
    // User must write it down before continuing

    return { address, mnemonic };
  } catch (error) {
    if (error instanceof WalletError) {
      console.error('Wallet error:', error.message);
      // Handle specific error codes
      switch (error.code) {
        case 'INVALID_PASSWORD':
          console.error('Password must be at least 8 characters');
          break;
        case 'WALLET_EXISTS':
          console.error('Wallet already exists');
          break;
        default:
          console.error('Unknown wallet error');
      }
    }
    throw error;
  }
}

/**
 * Example 2: Import wallet from mnemonic
 */
export async function example2_ImportFromMnemonic() {
  try {
    // User provides mnemonic and password
    const mnemonic =
      'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12';
    const password = 'mySecurePassword123';

    // Import wallet
    const address = await importFromMnemonic(mnemonic, password);

    console.log('Wallet imported successfully!');
    console.log('Address:', address);

    return address;
  } catch (error) {
    if (error instanceof WalletError) {
      console.error('Import error:', error.message);
      if (error.code === 'INVALID_MNEMONIC') {
        console.error('Invalid mnemonic phrase. Please check and try again.');
      }
    }
    throw error;
  }
}

/**
 * Example 3: Import wallet from private key
 */
export async function example3_ImportFromPrivateKey() {
  try {
    // User provides private key and password
    const privateKey =
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const password = 'mySecurePassword123';

    // Import wallet
    const address = await importFromPrivateKey(privateKey, password);

    console.log('Wallet imported successfully!');
    console.log('Address:', address);

    return address;
  } catch (error) {
    if (error instanceof WalletError) {
      console.error('Import error:', error.message);
      if (error.code === 'INVALID_PRIVATE_KEY') {
        console.error('Invalid private key format');
      }
    }
    throw error;
  }
}

/**
 * Example 4: Check if wallet exists (for app initialization)
 */
export async function example4_CheckWalletExists() {
  if (hasWallet()) {
    console.log('Wallet exists');

    // Get address without unlocking
    const address = getWalletAddress();
    console.log('Address:', address);

    // Show "unlock wallet" screen
    return true;
  } else {
    console.log('No wallet found');
    // Show "create or import wallet" screen
    return false;
  }
}

/**
 * Example 5: Unlock wallet for transaction
 */
export async function example5_UnlockWallet() {
  try {
    // User provides password
    const password = 'mySecurePassword123';

    // Unlock wallet
    const wallet = await unlockWallet(password);

    console.log('Wallet unlocked!');
    console.log('Address:', wallet.address);
    console.log('Has mnemonic:', wallet.mnemonic !== null);

    // Use wallet for transaction (see blockchain service examples)
    // IMPORTANT: Don't store wallet object - use immediately and discard

    return wallet;
  } catch (error) {
    if (error instanceof WalletError) {
      console.error('Unlock error:', error.message);
      if (error.code === 'DECRYPTION_FAILED') {
        console.error('Wrong password');
        // Show error to user
      }
    }
    throw error;
  }
}

/**
 * Example 6: Verify password before sensitive operation
 */
export async function example6_VerifyPassword() {
  try {
    // User provides password
    const password = 'mySecurePassword123';

    // Verify without full unlock
    const isValid = await verifyPassword(password);

    if (isValid) {
      console.log('Password correct');
      // Proceed with operation
      return true;
    } else {
      console.log('Wrong password');
      // Show error to user
      return false;
    }
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}

/**
 * Example 7: Export private key (for backup)
 */
export async function example7_ExportPrivateKey() {
  try {
    // User provides password
    const password = 'mySecurePassword123';

    // Export private key
    const privateKey = await exportPrivateKey(password);

    console.log('Private key exported');
    console.log('Private key:', privateKey);

    // SECURITY WARNING:
    // - Display in secure modal with blur/copy protection
    // - Warn user to never share private key
    // - Clear from memory immediately after display

    return privateKey;
  } catch (error) {
    if (error instanceof WalletError) {
      console.error('Export error:', error.message);
    }
    throw error;
  }
}

/**
 * Example 8: Export mnemonic (for backup)
 */
export async function example8_ExportMnemonic() {
  try {
    // User provides password
    const password = 'mySecurePassword123';

    // Export mnemonic
    const mnemonic = await exportMnemonic(password);

    if (mnemonic) {
      console.log('Mnemonic exported');
      console.log('Mnemonic:', mnemonic);

      // SECURITY WARNING:
      // - Display in secure modal
      // - Warn user to write down and store safely
      // - Never share mnemonic online

      return mnemonic;
    } else {
      console.log('No mnemonic available (imported from private key)');
      return null;
    }
  } catch (error) {
    if (error instanceof WalletError) {
      console.error('Export error:', error.message);
    }
    throw error;
  }
}

/**
 * Example 9: Delete wallet
 */
export async function example9_DeleteWallet() {
  try {
    // IMPORTANT: Warn user that this cannot be undone
    // Ensure they have backed up mnemonic/private key

    if (hasWallet()) {
      deleteWallet();
      console.log('Wallet deleted successfully');
      return true;
    } else {
      console.log('No wallet to delete');
      return false;
    }
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

/**
 * Example 10: Track transaction
 */
export async function example10_TrackTransaction() {
  try {
    // After sending a transaction, store it
    const tx: Transaction = {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      to: '0xRecipientAddress',
      value: '1000000000000000000', // 1 ETH in wei
      tokenAddress: null, // null for ETH
      tokenSymbol: 'ETH',
      tokenDecimals: 18,
      status: 'pending',
      type: 'send',
      blockNumber: null,
      timestamp: null,
      gasUsed: null,
      gasPrice: null,
      chainId: 11155111, // Sepolia
    };

    // Add to history
    addTransaction(tx);
    console.log('Transaction tracked');

    // Later, update when confirmed
    setTimeout(() => {
      updateTransaction(tx.hash, {
        status: 'confirmed',
        blockNumber: 1234567,
        timestamp: new Date().toISOString(),
        gasUsed: '21000',
        gasPrice: '50000000000',
      });
      console.log('Transaction confirmed');
    }, 5000);

    return tx;
  } catch (error) {
    console.error('Transaction tracking error:', error);
    throw error;
  }
}

/**
 * Example 11: Get transaction history
 */
export async function example11_GetTransactionHistory() {
  try {
    const transactions = getTransactionHistory();

    console.log(`Found ${transactions.length} transactions`);

    // Display in UI
    transactions.forEach(tx => {
      console.log('---');
      console.log('Hash:', tx.hash);
      console.log('Type:', tx.type);
      console.log('Status:', tx.status);
      console.log('Amount:', tx.value);
      console.log('Token:', tx.tokenSymbol);
    });

    return transactions;
  } catch (error) {
    console.error('History error:', error);
    throw error;
  }
}

/**
 * Example 12: Complete wallet creation flow (UI)
 */
export async function example12_CompleteWalletCreationFlow() {
  try {
    // Step 1: User enters password
    const password = 'mySecurePassword123';

    // Step 2: Validate password (in your UI)
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Step 3: Create wallet
    const { address, mnemonic } = await createWallet(password);

    // Step 4: Show mnemonic to user (CRITICAL)
    console.log('IMPORTANT: Write down your recovery phrase');
    console.log(mnemonic);
    console.log('You will need this to recover your wallet');

    // Step 5: Verify user wrote it down
    // (implement mnemonic verification in UI)

    // Step 6: Success - navigate to wallet screen
    console.log('Wallet created:', address);

    return { address, mnemonic };
  } catch (error) {
    console.error('Wallet creation failed:', error);
    throw error;
  }
}

/**
 * Example 13: Complete wallet unlock flow (UI)
 */
export async function example13_CompleteWalletUnlockFlow() {
  try {
    // Step 1: Check if wallet exists
    if (!hasWallet()) {
      throw new Error('No wallet found');
    }

    // Step 2: Get address to display
    const address = getWalletAddress();
    console.log('Unlocking wallet:', address);

    // Step 3: User enters password
    const password = 'mySecurePassword123';

    // Step 4: Unlock wallet
    const wallet = await unlockWallet(password);

    // Step 5: Success - you can now use wallet for transactions
    console.log('Wallet unlocked successfully');

    // Step 6: Use wallet immediately (don't store)
    // Example: Sign a message
    // const signature = await signMessage(wallet);

    return wallet;
  } catch (error) {
    if (error instanceof WalletError && error.code === 'DECRYPTION_FAILED') {
      console.error('Wrong password - please try again');
    } else {
      console.error('Unlock failed:', error);
    }
    throw error;
  }
}
