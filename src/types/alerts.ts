/**
 * Price Alert Type Definitions
 *
 * Types for price alerts, notifications, and price data
 */

/**
 * Supported tokens for price alerts
 */
export type AlertToken = 'USDC' | 'USDT' | 'DAI';

/**
 * Alert condition types
 */
export type AlertCondition = 'above' | 'below' | 'percent_up' | 'percent_down';

/**
 * Alert status
 */
export type AlertStatus = 'active' | 'triggered' | 'disabled';

/**
 * Price alert configuration
 */
export interface PriceAlert {
  /**
   * Unique alert identifier
   */
  id: string;

  /**
   * Token to monitor
   */
  token: AlertToken;

  /**
   * Alert condition type
   */
  condition: AlertCondition;

  /**
   * Target price (for above/below) or percentage (for percent_up/percent_down)
   */
  targetValue: number;

  /**
   * Alert status
   */
  status: AlertStatus;

  /**
   * Alert creation timestamp (ISO 8601)
   */
  createdAt: string;

  /**
   * Last triggered timestamp (ISO 8601), null if never triggered
   */
  triggeredAt: string | null;

  /**
   * Number of times alert has been triggered
   */
  triggerCount: number;

  /**
   * Optional alert label/note
   */
  label?: string;

  /**
   * Base price for percentage alerts (set when alert is created)
   */
  basePrice?: number;
}

/**
 * Token price data from API
 */
export interface TokenPrice {
  /**
   * Token symbol
   */
  token: AlertToken;

  /**
   * Current USD price
   */
  usd: number;

  /**
   * 24h price change percentage
   */
  usd_24h_change: number;

  /**
   * Last updated timestamp
   */
  last_updated: string;
}

/**
 * Notification types
 */
export type NotificationType = 'price_alert' | 'transaction' | 'system' | 'info';

/**
 * Notification priority
 */
export type NotificationPriority = 'low' | 'medium' | 'high';

/**
 * In-app notification
 */
export interface Notification {
  /**
   * Unique notification identifier
   */
  id: string;

  /**
   * Notification type
   */
  type: NotificationType;

  /**
   * Notification priority
   */
  priority: NotificationPriority;

  /**
   * Notification title
   */
  title: string;

  /**
   * Notification message/description
   */
  message: string;

  /**
   * Whether notification has been read
   */
  read: boolean;

  /**
   * Notification creation timestamp (ISO 8601)
   */
  timestamp: string;

  /**
   * Associated alert ID (for price alert notifications)
   */
  alertId?: string;

  /**
   * Associated token (for price alerts)
   */
  token?: AlertToken;

  /**
   * Additional metadata
   */
  metadata?: {
    currentPrice?: number;
    targetPrice?: number;
    percentageChange?: number;
    [key: string]: any;
  };
}

/**
 * Alert form data
 */
export interface AlertFormData {
  token: AlertToken;
  condition: AlertCondition;
  targetValue: string;
  label?: string;
}

/**
 * Price cache entry
 */
export interface PriceCacheEntry {
  prices: Record<AlertToken, TokenPrice>;
  lastFetch: number;
}

/**
 * Browser notification permission state
 */
export type NotificationPermission = 'default' | 'granted' | 'denied';

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  /**
   * Enable browser notifications
   */
  browserNotifications: boolean;

  /**
   * Enable in-app notifications
   */
  inAppNotifications: boolean;

  /**
   * Enable sound for notifications
   */
  sound: boolean;

  /**
   * Auto-dismiss notifications after X milliseconds (0 = no auto-dismiss)
   */
  autoDismissMs: number;
}
