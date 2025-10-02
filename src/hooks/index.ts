/**
 * Hooks Index
 *
 * Central export point for all custom React hooks.
 * These hooks integrate blockchain services with React Query patterns.
 */

// Balance hooks
export {
  useBalance,
  isSingleTokenBalance,
  isMultipleTokenBalances,
  type UseBalanceOptions,
} from './useBalance';

// Transaction sending hooks
export {
  useSendTransaction,
  useEstimateGas,
  type SendTransactionParams,
  type SendTransactionResult,
} from './useSendTransaction';

// Transaction history hooks
export {
  useTransactionHistory,
  usePendingTransactions,
  useConfirmedTransactions,
  useFailedTransactions,
  useTransactionCounts,
  useTransaction,
  type UseTransactionHistoryOptions,
} from './useTransactionHistory';

// Idle timer hooks
export {
  useIdleTimer,
  loadTimeoutPreference,
  saveTimeoutPreference,
  getTimeoutLabel,
  TIMEOUT_OPTIONS,
  type UseIdleTimerOptions,
  type TimeoutOption,
} from './useIdleTimer';

// Backup reminder hooks
export {
  useBackupReminder,
} from './useBackupReminder';
