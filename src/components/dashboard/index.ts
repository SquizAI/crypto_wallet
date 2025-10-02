/**
 * Dashboard Components Index
 *
 * Exports all dashboard components including ultra-modern redesigned components.
 */

// Ultra-Modern Dashboard Components
export { PortfolioValue } from './PortfolioValue';
export { PerformanceChart } from './PerformanceChart';
export { AssetsCard } from './AssetsCard';
export { TransactionsCard } from './TransactionsCard';

// Legacy Dashboard Components
export { DashboardLayout, type DashboardLayoutProps, type DashboardTab } from './DashboardLayout';
export { BalanceCard, type BalanceCardProps } from './BalanceCard';
export { WalletOverview, type WalletOverviewProps } from './WalletOverview';
export { SendModal, type SendModalProps } from './SendModal';
export { ReceiveModal, type ReceiveModalProps } from './ReceiveModal';
export { TransactionList, type TransactionListProps } from './TransactionList';
export { TransactionDetailModal, type TransactionDetailModalProps } from './TransactionDetailModal';
