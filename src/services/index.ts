/**
 * Services Index
 *
 * Central export point for all wallet services
 */

// Encryption Service
export { encrypt, decrypt } from './encryptionService';

// Storage Service
export {
  setWallet,
  getWallet,
  clearWallet,
  setTransactionHistory,
  getTransactionHistory,
  clearTransactionHistory,
  addTransaction,
  updateTransaction,
  hasWallet as storageHasWallet,
  clearAllData,
} from './storageService';

// Wallet Service
export {
  createWallet,
  importFromMnemonic,
  importFromPrivateKey,
  unlockWallet,
  hasWallet,
  deleteWallet,
  getWalletAddress,
  getWalletType,
  verifyPassword,
  exportPrivateKey,
  exportMnemonic,
  exportWalletToFile,
  importWalletFromFile,
  WalletError,
} from './walletService';

// Contract Service
export {
  getTokenBalance,
  getAllBalances,
  getTokenInfo,
  sendToken,
  estimateTransferGas,
  getGasPrice,
} from './contractService';

// Transaction Service
export {
  waitForTransaction,
  getTransaction,
  getTransactionReceipt,
  monitorTransaction,
  trackTransaction,
  saveTransaction,
  getStoredTransactionHistory,
  updateTransactionStatus,
  getPendingTransactions,
  recheckPendingTransactions,
  createTransactionRecord,
  cleanupAllMonitors,
} from './transactionService';

// Types
export type {
  WalletData,
  Transaction,
  TransactionStatus,
  TransactionType,
  UnlockedWallet,
} from '@/types/wallet';

export type {
  TokenBalance,
  GasEstimate,
  TransactionMonitor,
} from '@/types/contract';
