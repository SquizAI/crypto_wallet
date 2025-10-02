/**
 * Alert Service
 *
 * Manages price alerts - creation, storage, monitoring, and triggering.
 * Integrates with notification system when alerts are triggered.
 */

import type {
  PriceAlert,
  AlertToken,
  AlertCondition,
  AlertStatus,
  TokenPrice,
} from '@/types/alerts';
import { getTokenPrices } from './priceService';

/**
 * LocalStorage key for alerts
 */
const ALERTS_STORAGE_KEY = 'price-alerts';

/**
 * Get all alerts from storage
 */
export function getAllAlerts(): PriceAlert[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (!stored) return [];

    return JSON.parse(stored) as PriceAlert[];
  } catch (error) {
    console.error('Failed to load alerts:', error);
    return [];
  }
}

/**
 * Save alerts to storage
 */
function saveAlerts(alerts: PriceAlert[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error('Failed to save alerts:', error);
    throw new Error('Failed to save alert');
  }
}

/**
 * Generate unique alert ID
 */
function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new price alert
 */
export function createAlert(
  token: AlertToken,
  condition: AlertCondition,
  targetValue: number,
  label?: string,
  basePrice?: number
): PriceAlert {
  const alert: PriceAlert = {
    id: generateAlertId(),
    token,
    condition,
    targetValue,
    status: 'active',
    createdAt: new Date().toISOString(),
    triggeredAt: null,
    triggerCount: 0,
    label,
    basePrice,
  };

  const alerts = getAllAlerts();
  alerts.push(alert);
  saveAlerts(alerts);

  return alert;
}

/**
 * Update an existing alert
 */
export function updateAlert(alertId: string, updates: Partial<PriceAlert>): PriceAlert {
  const alerts = getAllAlerts();
  const index = alerts.findIndex((a) => a.id === alertId);

  if (index === -1) {
    throw new Error('Alert not found');
  }

  const updatedAlert = {
    ...alerts[index],
    ...updates,
  };

  alerts[index] = updatedAlert;
  saveAlerts(alerts);

  return updatedAlert;
}

/**
 * Delete an alert
 */
export function deleteAlert(alertId: string): void {
  const alerts = getAllAlerts();
  const filtered = alerts.filter((a) => a.id !== alertId);

  if (filtered.length === alerts.length) {
    throw new Error('Alert not found');
  }

  saveAlerts(filtered);
}

/**
 * Toggle alert status (active/disabled)
 */
export function toggleAlertStatus(alertId: string): PriceAlert {
  const alerts = getAllAlerts();
  const alert = alerts.find((a) => a.id === alertId);

  if (!alert) {
    throw new Error('Alert not found');
  }

  const newStatus: AlertStatus = alert.status === 'active' ? 'disabled' : 'active';

  return updateAlert(alertId, { status: newStatus });
}

/**
 * Get alert by ID
 */
export function getAlertById(alertId: string): PriceAlert | null {
  const alerts = getAllAlerts();
  return alerts.find((a) => a.id === alertId) || null;
}

/**
 * Get active alerts for a specific token
 */
export function getActiveAlertsByToken(token: AlertToken): PriceAlert[] {
  const alerts = getAllAlerts();
  return alerts.filter((a) => a.token === token && a.status === 'active');
}

/**
 * Get all active alerts
 */
export function getActiveAlerts(): PriceAlert[] {
  const alerts = getAllAlerts();
  return alerts.filter((a) => a.status === 'active');
}

/**
 * Check if alert condition is met
 */
export function isAlertTriggered(alert: PriceAlert, currentPrice: number): boolean {
  switch (alert.condition) {
    case 'above':
      return currentPrice > alert.targetValue;

    case 'below':
      return currentPrice < alert.targetValue;

    case 'percent_up':
      if (!alert.basePrice) return false;
      const percentIncrease = ((currentPrice - alert.basePrice) / alert.basePrice) * 100;
      return percentIncrease >= alert.targetValue;

    case 'percent_down':
      if (!alert.basePrice) return false;
      const percentDecrease = ((alert.basePrice - currentPrice) / alert.basePrice) * 100;
      return percentDecrease >= alert.targetValue;

    default:
      return false;
  }
}

/**
 * Check all active alerts against current prices
 * Returns list of triggered alerts
 */
export async function checkAlerts(): Promise<PriceAlert[]> {
  const activeAlerts = getActiveAlerts();
  if (activeAlerts.length === 0) return [];

  try {
    // Fetch current prices
    const prices = await getTokenPrices();
    const triggeredAlerts: PriceAlert[] = [];

    // Check each alert
    for (const alert of activeAlerts) {
      const tokenPrice = prices[alert.token];
      if (!tokenPrice) continue;

      const isTriggered = isAlertTriggered(alert, tokenPrice.usd);

      if (isTriggered) {
        // Update alert as triggered
        const updatedAlert = updateAlert(alert.id, {
          status: 'triggered',
          triggeredAt: new Date().toISOString(),
          triggerCount: alert.triggerCount + 1,
        });

        triggeredAlerts.push(updatedAlert);
      }
    }

    return triggeredAlerts;
  } catch (error) {
    console.error('Failed to check alerts:', error);
    return [];
  }
}

/**
 * Reset triggered alert to active status
 */
export function resetAlert(alertId: string): PriceAlert {
  return updateAlert(alertId, {
    status: 'active',
  });
}

/**
 * Clear all alerts
 */
export function clearAllAlerts(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(ALERTS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear alerts:', error);
  }
}

/**
 * Get alert statistics
 */
export function getAlertStats(): {
  total: number;
  active: number;
  triggered: number;
  disabled: number;
} {
  const alerts = getAllAlerts();

  return {
    total: alerts.length,
    active: alerts.filter((a) => a.status === 'active').length,
    triggered: alerts.filter((a) => a.status === 'triggered').length,
    disabled: alerts.filter((a) => a.status === 'disabled').length,
  };
}

/**
 * Format alert condition as human-readable text
 */
export function formatAlertCondition(alert: PriceAlert): string {
  const { condition, targetValue, token } = alert;

  switch (condition) {
    case 'above':
      return `${token} price goes above $${targetValue.toFixed(4)}`;
    case 'below':
      return `${token} price falls below $${targetValue.toFixed(4)}`;
    case 'percent_up':
      return `${token} price increases by ${targetValue.toFixed(2)}%`;
    case 'percent_down':
      return `${token} price decreases by ${targetValue.toFixed(2)}%`;
    default:
      return 'Unknown condition';
  }
}
