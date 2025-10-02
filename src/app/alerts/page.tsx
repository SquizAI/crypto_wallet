/**
 * Price Alerts Page
 *
 * Manage price alerts for USDC, USDT, and DAI tokens.
 * Features alert creation, editing, monitoring, and price display.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { PriceAlertForm } from '@/components/alerts/PriceAlertForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { PriceAlert, AlertToken } from '@/types/alerts';
import { formatAlertCondition } from '@/services/alertService';

/**
 * Token price display card
 */
function TokenPriceCard({ token, price }: { token: AlertToken; price: number }) {
  return (
    <div className="glass border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{token}</h3>
          <p className="text-2xl font-bold text-blue-400">${price.toFixed(4)}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <span className="text-2xl">$</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Alert card component
 */
function AlertCard({
  alert,
  currentPrice,
  onToggle,
  onReset,
  onDelete,
}: {
  alert: PriceAlert;
  currentPrice?: number;
  onToggle: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    triggered: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    disabled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="glass border border-white/10 rounded-xl p-5 transition-all duration-200 hover:border-white/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white">{alert.token}</h3>
            <Badge className={statusColors[alert.status]}>
              {alert.status}
            </Badge>
          </div>

          {alert.label && (
            <p className="text-sm text-gray-400 mb-2">{alert.label}</p>
          )}

          <p className="text-sm text-gray-300">
            {formatAlertCondition(alert)}
          </p>

          {currentPrice && (
            <p className="text-xs text-gray-500 mt-1">
              Current price: ${currentPrice.toFixed(4)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
            aria-label={alert.status === 'active' ? 'Disable alert' : 'Enable alert'}
          >
            {alert.status === 'active' ? (
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )}
          </button>

          {alert.status === 'triggered' && (
            <button
              onClick={onReset}
              className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
              aria-label="Reset alert"
            >
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          <button
            onClick={onDelete}
            className="p-2 rounded-lg glass hover:bg-red-500/20 transition-colors"
            aria-label="Delete alert"
          >
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Alert metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/10">
        <span>Created {new Date(alert.createdAt).toLocaleDateString()}</span>
        {alert.triggerCount > 0 && (
          <span>Triggered {alert.triggerCount}x</span>
        )}
      </div>
    </div>
  );
}

/**
 * Price Alerts Page
 */
export default function AlertsPage() {
  const router = useRouter();
  const { isUnlocked } = useWallet();
  const {
    alerts,
    prices,
    isLoading,
    error,
    stats,
    createNewAlert,
    deleteExistingAlert,
    toggleAlert,
    resetTriggeredAlert,
    refreshPrices,
    lastUpdate,
  } = usePriceAlerts();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect if wallet is locked
  if (!isUnlocked) {
    router.push('/unlock');
    return null;
  }

  /**
   * Handle alert creation
   */
  const handleCreateAlert = async (
    token: AlertToken,
    condition: any,
    targetValue: number,
    label?: string
  ) => {
    await createNewAlert(token, condition, targetValue, label);
    setShowCreateModal(false);
  };

  /**
   * Handle manual price refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPrices();
    setIsRefreshing(false);
  };

  // Get current prices as Record
  const currentPrices = prices
    ? {
        USDC: prices.USDC.usd,
        USDT: prices.USDT.usd,
        DAI: prices.DAI.usd,
      }
    : undefined;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Price Alerts
            </h1>
            <p className="text-gray-400">
              Set custom price alerts for your stablecoins
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              loading={isRefreshing}
              disabled={isRefreshing}
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>

            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Alert
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Current Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {prices && (
                <>
                  <TokenPriceCard token="USDC" price={prices.USDC.usd} />
                  <TokenPriceCard token="USDT" price={prices.USDT.usd} />
                  <TokenPriceCard token="DAI" price={prices.DAI.usd} />
                </>
              )}
            </div>

            {/* Last Update */}
            {lastUpdate && (
              <p className="text-xs text-gray-500 text-center">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            )}

            {/* Alert Statistics */}
            <div className="glass border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Alert Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
                  <p className="text-sm text-gray-400 mt-1">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{stats.active}</p>
                  <p className="text-sm text-gray-400 mt-1">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-400">{stats.triggered}</p>
                  <p className="text-sm text-gray-400 mt-1">Triggered</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-400">{stats.disabled}</p>
                  <p className="text-sm text-gray-400 mt-1">Disabled</p>
                </div>
              </div>
            </div>

            {/* Alerts List */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Your Alerts</h2>

              {alerts.length === 0 ? (
                <div className="glass border border-white/10 rounded-xl p-12 text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-600 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-white mb-2">No alerts yet</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first price alert to get notified of market movements
                  </p>
                  <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    Create First Alert
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {alerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      currentPrice={prices?.[alert.token]?.usd}
                      onToggle={() => toggleAlert(alert.id)}
                      onReset={() => resetTriggeredAlert(alert.id)}
                      onDelete={() => deleteExistingAlert(alert.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Alert Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Price Alert"
      >
        <PriceAlertForm
          onSubmit={handleCreateAlert}
          onCancel={() => setShowCreateModal(false)}
          currentPrices={currentPrices}
        />
      </Modal>
    </div>
  );
}
