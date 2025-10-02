/**
 * usePriceAlerts Hook
 *
 * Custom hook for managing price alerts and monitoring.
 * Handles alert checking, price updates, and notification triggering.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import type {
  PriceAlert,
  AlertToken,
  AlertCondition,
  TokenPrice,
} from '@/types/alerts';
import {
  getAllAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  toggleAlertStatus,
  checkAlerts,
  getAlertStats,
  formatAlertCondition,
  resetAlert,
} from '@/services/alertService';
import { getTokenPrices, getTokenPrice } from '@/services/priceService';

/**
 * Price monitoring interval (60 seconds)
 */
const MONITORING_INTERVAL = 60 * 1000;

/**
 * usePriceAlerts hook return type
 */
interface UsePriceAlertsReturn {
  /**
   * All price alerts
   */
  alerts: PriceAlert[];

  /**
   * Current token prices
   */
  prices: Record<AlertToken, TokenPrice> | null;

  /**
   * Loading state for initial data
   */
  isLoading: boolean;

  /**
   * Error state
   */
  error: string | null;

  /**
   * Alert statistics
   */
  stats: {
    total: number;
    active: number;
    triggered: number;
    disabled: number;
  };

  /**
   * Create a new alert
   */
  createNewAlert: (
    token: AlertToken,
    condition: AlertCondition,
    targetValue: number,
    label?: string
  ) => Promise<PriceAlert>;

  /**
   * Update an existing alert
   */
  updateExistingAlert: (alertId: string, updates: Partial<PriceAlert>) => void;

  /**
   * Delete an alert
   */
  deleteExistingAlert: (alertId: string) => void;

  /**
   * Toggle alert status
   */
  toggleAlert: (alertId: string) => void;

  /**
   * Reset a triggered alert
   */
  resetTriggeredAlert: (alertId: string) => void;

  /**
   * Manually refresh prices
   */
  refreshPrices: () => Promise<void>;

  /**
   * Last price update timestamp
   */
  lastUpdate: Date | null;
}

/**
 * usePriceAlerts Hook
 */
export function usePriceAlerts(): UsePriceAlertsReturn {
  const { addNotification } = useNotifications();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [prices, setPrices] = useState<Record<AlertToken, TokenPrice> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load alerts from storage
   */
  const loadAlerts = useCallback(() => {
    try {
      const storedAlerts = getAllAlerts();
      setAlerts(storedAlerts);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Failed to load alerts');
    }
  }, []);

  /**
   * Fetch current prices
   */
  const fetchPrices = useCallback(async (forceRefresh = false) => {
    try {
      const currentPrices = await getTokenPrices(forceRefresh);
      setPrices(currentPrices);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    }
  }, []);

  /**
   * Check alerts and trigger notifications
   */
  const checkAndNotify = useCallback(async () => {
    try {
      const triggeredAlerts = await checkAlerts();

      // Create notifications for triggered alerts
      for (const alert of triggeredAlerts) {
        const tokenPrice = prices?.[alert.token];

        if (tokenPrice) {
          addNotification(
            'price_alert',
            `Price Alert: ${alert.token}`,
            `${formatAlertCondition(alert)} - Current price: $${tokenPrice.usd.toFixed(4)}`,
            'high',
            {
              alertId: alert.id,
              token: alert.token,
              currentPrice: tokenPrice.usd,
              targetPrice: alert.targetValue,
            }
          );
        }
      }

      // Reload alerts to get updated state
      loadAlerts();
    } catch (err) {
      console.error('Failed to check alerts:', err);
    }
  }, [prices, addNotification, loadAlerts]);

  /**
   * Initialize: load alerts and fetch initial prices
   */
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      loadAlerts();
      await fetchPrices();
      setIsLoading(false);
    };

    initialize();
  }, [loadAlerts, fetchPrices]);

  /**
   * Start price monitoring interval
   */
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start monitoring if there are active alerts
    const activeAlerts = alerts.filter((a) => a.status === 'active');

    if (activeAlerts.length > 0) {
      intervalRef.current = setInterval(async () => {
        await fetchPrices(true); // Force refresh
        await checkAndNotify();
      }, MONITORING_INTERVAL);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [alerts, fetchPrices, checkAndNotify]);

  /**
   * Create a new alert
   */
  const createNewAlert = useCallback(
    async (
      token: AlertToken,
      condition: AlertCondition,
      targetValue: number,
      label?: string
    ): Promise<PriceAlert> => {
      try {
        // Get current price for percentage-based alerts
        let basePrice: number | undefined;
        if (condition === 'percent_up' || condition === 'percent_down') {
          const tokenPrice = await getTokenPrice(token);
          basePrice = tokenPrice.usd;
        }

        const newAlert = createAlert(token, condition, targetValue, label, basePrice);
        loadAlerts();

        // Add notification
        addNotification(
          'system',
          'Alert Created',
          `New price alert for ${token}: ${formatAlertCondition(newAlert)}`,
          'low'
        );

        return newAlert;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create alert';
        setError(message);
        throw err;
      }
    },
    [loadAlerts, addNotification]
  );

  /**
   * Update an existing alert
   */
  const updateExistingAlert = useCallback(
    (alertId: string, updates: Partial<PriceAlert>) => {
      try {
        updateAlert(alertId, updates);
        loadAlerts();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update alert';
        setError(message);
        throw err;
      }
    },
    [loadAlerts]
  );

  /**
   * Delete an alert
   */
  const deleteExistingAlert = useCallback(
    (alertId: string) => {
      try {
        deleteAlert(alertId);
        loadAlerts();

        addNotification('system', 'Alert Deleted', 'Price alert has been removed', 'low');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete alert';
        setError(message);
        throw err;
      }
    },
    [loadAlerts, addNotification]
  );

  /**
   * Toggle alert status
   */
  const toggleAlert = useCallback(
    (alertId: string) => {
      try {
        const updatedAlert = toggleAlertStatus(alertId);
        loadAlerts();

        const statusText = updatedAlert.status === 'active' ? 'enabled' : 'disabled';
        addNotification(
          'system',
          `Alert ${statusText}`,
          `Price alert has been ${statusText}`,
          'low'
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to toggle alert';
        setError(message);
      }
    },
    [loadAlerts, addNotification]
  );

  /**
   * Reset a triggered alert
   */
  const resetTriggeredAlert = useCallback(
    (alertId: string) => {
      try {
        resetAlert(alertId);
        loadAlerts();

        addNotification('system', 'Alert Reset', 'Alert has been reactivated', 'low');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reset alert';
        setError(message);
      }
    },
    [loadAlerts, addNotification]
  );

  /**
   * Manually refresh prices
   */
  const refreshPrices = useCallback(async () => {
    await fetchPrices(true);
    await checkAndNotify();
  }, [fetchPrices, checkAndNotify]);

  /**
   * Get alert statistics
   */
  const stats = getAlertStats();

  return {
    alerts,
    prices,
    isLoading,
    error,
    stats,
    createNewAlert,
    updateExistingAlert,
    deleteExistingAlert,
    toggleAlert,
    resetTriggeredAlert,
    refreshPrices,
    lastUpdate,
  };
}
