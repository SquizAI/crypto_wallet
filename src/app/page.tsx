'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { useBalance } from '@/hooks/useBalance';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { PortfolioValue } from '@/components/dashboard/PortfolioValue';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { AssetsCard } from '@/components/dashboard/AssetsCard';
import { TransactionsCard } from '@/components/dashboard/TransactionsCard';
import { SendModal } from '@/components/modals/SendModal';
import { ReceiveModal } from '@/components/modals/ReceiveModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { TOKENS } from '@/constants/tokens';

export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const { address, isUnlocked, hasExistingWallet } = useWallet();
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all token balances
  const { data: balances, isLoading: balancesLoading } = useBalance();

  // Fetch recent transactions (limit to 5)
  const { data: transactions, isLoading: transactionsLoading } = useTransactionHistory({
    limit: 5,
  });

  // Show loading state during SSR/hydration
  if (!mounted) {
    return null;
  }

  // Show landing page if no wallet or not unlocked
  if (!isUnlocked || !address) {
    return <LandingPage hasWallet={hasExistingWallet()} />;
  }

  // Transform balances for AssetsCard
  const assets = balances
    ? balances.map((balance) => ({
        symbol: balance.symbol,
        name: TOKENS[balance.symbol]?.name || balance.symbol,
        balance: balance.balanceFormatted,
        usdValue: balance.balanceFormatted, // Stablecoins are ~$1
        icon: '',
      }))
    : [];

  // Calculate total value
  const totalValue = balances
    ? balances.reduce((sum, balance) => sum + parseFloat(balance.balanceFormatted), 0)
    : 0;

  // Transform transactions for TransactionsCard
  const recentTransactions = transactions
    ? transactions.map((tx) => ({
        id: tx.hash,
        type: tx.status === 'pending' ? ('pending' as const) : (tx.type as 'send' | 'receive'),
        amount: tx.value,
        token: tx.tokenSymbol,
        timestamp: tx.timestamp ? formatTimestamp(tx.timestamp) : 'Pending',
        address: tx.type === 'send' ? tx.to || '' : tx.from,
      }))
    : [];

  return (
    <div className="min-h-screen relative">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 relative z-10">
        {/* Two Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Portfolio Value */}
            {balancesLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <PortfolioValue
                totalValue={totalValue}
                change24h={0} // Stablecoins don't change much
                onSendClick={() => setShowSendModal(true)}
                onReceiveClick={() => setShowReceiveModal(true)}
              />
            )}

            {/* Performance Chart */}
            <PerformanceChart />
          </div>

          {/* Secondary Column (1/3 width) */}
          <div className="space-y-4 sm:space-y-6">
            {/* Assets */}
            {balancesLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <AssetsCard
                assets={assets}
                onTokenClick={(symbol) => router.push(`/token/${symbol}`)}
              />
            )}

            {/* Recent Transactions */}
            {transactionsLoading ? (
              <Skeleton className="h-96" />
            ) : (
              <TransactionsCard
                transactions={recentTransactions}
                onTransactionClick={(hash) => router.push(`/transactions?hash=${hash}`)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <SendModal isOpen={showSendModal} onClose={() => setShowSendModal(false)} />
      <ReceiveModal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} />
    </div>
  );
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp: string | number | null): string {
  if (!timestamp) return 'Unknown';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}

/**
 * Landing Page Component
 * Shown when user is not logged in
 */
function LandingPage({ hasWallet }: { hasWallet: boolean }) {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-32">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Headline */}
            <div className="space-y-3 sm:space-y-4 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
                  Your Secure Gateway
                </span>
                <br />
                <span className="text-white">to Stablecoins</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto px-4">
                Manage USDC, USDT, and DAI with bank-level security on Ethereum
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 animate-fade-in-delay px-4">
              <button
                onClick={() => router.push('/onboarding')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50 active:scale-95"
              >
                {hasWallet ? 'Unlock Wallet' : 'Create Wallet'}
              </button>

              {!hasWallet && (
                <button
                  onClick={() => router.push('/onboarding')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-700 hover:border-gray-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 bg-gray-900/50 backdrop-blur-sm active:scale-95"
                >
                  Import Wallet
                </button>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 text-xs sm:text-sm text-gray-500 animate-fade-in-delay-2 px-4">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🔐</span>
                <span>Your keys, your crypto</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🌐</span>
                <span className="hidden sm:inline">Ethereum Mainnet & Sepolia</span>
                <span className="sm:hidden">Ethereum Network</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">💎</span>
                <span>USDC, USDT, DAI</span>
              </div>
            </div>
          </div>

          {/* Hero Card - Glassmorphic */}
          <div className="mt-8 sm:mt-12 md:mt-16 max-w-5xl mx-auto animate-fade-in-delay-3">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />

              {/* Card */}
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-4 sm:p-6 md:p-8 lg:p-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  {/* Mock Balance Cards */}
                  {[
                    { symbol: 'USDC', balance: '1,234.56', color: 'from-blue-500 to-blue-600' },
                    { symbol: 'USDT', balance: '2,345.67', color: 'from-emerald-500 to-emerald-600' },
                    { symbol: 'DAI', balance: '3,456.78', color: 'from-purple-500 to-purple-600' },
                  ].map((token) => (
                    <div
                      key={token.symbol}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 md:p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r ${token.color}`} />
                        <span className="text-base sm:text-lg font-semibold text-white">{token.symbol}</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-white">{token.balance}</div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1">≈ ${token.balance} USD</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
              Why Choose Our Wallet?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 px-4">
              Built with security, speed, and simplicity in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="group">
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 sm:p-8 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 active:scale-95">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300" />
                <div className="relative">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🔒</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                    Bank-Level Security
                  </h3>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>AES-256-GCM encryption</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>Password-protected keys</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>Never leaves your device</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 sm:p-8 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105 active:scale-95">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300" />
                <div className="relative">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⚡</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                    Lightning Fast
                  </h3>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Real-time balances</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Instant transactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>Live status updates</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 sm:p-8 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 active:scale-95">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300" />
                <div className="relative">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎯</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                    Simple & Intuitive
                  </h3>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>Clean interface</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>Easy token swaps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>QR code support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
              Get Started in 3 Steps
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 px-4">
              Start managing your stablecoins in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connecting Lines (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 opacity-20 -z-10" />

            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white mx-auto mb-4 sm:mb-6">
                  1
                </div>
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔑</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                  Create or Import Wallet
                </h3>
                <p className="text-sm sm:text-base text-gray-400">
                  Secure your wallet with a password and save your recovery phrase
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white mx-auto mb-4 sm:mb-6">
                  2
                </div>
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">💰</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                  Add Stablecoins
                </h3>
                <p className="text-sm sm:text-base text-gray-400">
                  Receive USDC, USDT, or DAI to your new wallet address
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white mx-auto mb-4 sm:mb-6">
                  3
                </div>
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🚀</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                  Send & Receive Instantly
                </h3>
                <p className="text-sm sm:text-base text-gray-400">
                  Transfer tokens with just a few clicks and track all transactions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm sm:text-base text-gray-400 mb-2">
                Built with Next.js, ethers.js, and React Query
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Open source • Non-custodial • Secure
              </p>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors"
              >
                Docs
              </a>
            </div>
          </div>
        </footer>
      </main>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.8s ease-out 0.6s both;
        }
      `}</style>
    </div>
  );
}
