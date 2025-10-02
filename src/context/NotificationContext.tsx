/**
 * Notification Context
 *
 * Global notification state management for in-app notifications
 * and browser notification integration.
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
import type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationPreferences,
  AlertToken,
} from '@/types/alerts';

/**
 * Notification context value
 */
interface NotificationContextValue {
  /**
   * All notifications
   */
  notifications: Notification[];

  /**
   * Unread notification count
   */
  unreadCount: number;

  /**
   * Notification preferences
   */
  preferences: NotificationPreferences;

  /**
   * Browser notification permission status
   */
  browserPermission: NotificationPermission;

  /**
   * Add a new notification
   */
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    priority?: NotificationPriority,
    metadata?: Notification['metadata']
  ) => void;

  /**
   * Mark notification as read
   */
  markAsRead: (notificationId: string) => void;

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => void;

  /**
   * Delete a notification
   */
  deleteNotification: (notificationId: string) => void;

  /**
   * Clear all notifications
   */
  clearAll: () => void;

  /**
   * Update notification preferences
   */
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;

  /**
   * Request browser notification permission
   */
  requestBrowserPermission: () => Promise<NotificationPermission>;

  /**
   * Show browser notification
   */
  showBrowserNotification: (title: string, body: string, icon?: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

/**
 * LocalStorage keys
 */
const NOTIFICATIONS_KEY = 'app-notifications';
const PREFERENCES_KEY = 'notification-preferences';

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES: NotificationPreferences = {
  browserNotifications: true,
  inAppNotifications: true,
  sound: false,
  autoDismissMs: 5000,
};

/**
 * Notification Provider
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  /**
   * Load notifications and preferences from storage on mount
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Load notifications
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Notification[];
        setNotifications(parsed);
      }

      // Load preferences
      const storedPrefs = localStorage.getItem(PREFERENCES_KEY);
      if (storedPrefs) {
        const parsed = JSON.parse(storedPrefs) as NotificationPreferences;
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }

      // Check browser notification permission
      if ('Notification' in window) {
        setBrowserPermission(Notification.permission);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  /**
   * Save notifications to storage
   */
  const saveNotifications = useCallback((notifications: Notification[]) => {
    if (typeof window === 'undefined') return;

    try {
      // Keep only last 100 notifications
      const toSave = notifications.slice(-100);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(toSave));
      setNotifications(toSave);
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }, []);

  /**
   * Save preferences to storage
   */
  const savePreferences = useCallback((prefs: NotificationPreferences) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, []);

  /**
   * Generate unique notification ID
   */
  const generateId = useCallback((): string => {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  /**
   * Add a new notification
   */
  const addNotification = useCallback(
    (
      type: NotificationType,
      title: string,
      message: string,
      priority: NotificationPriority = 'medium',
      metadata?: Notification['metadata']
    ) => {
      if (!preferences.inAppNotifications) return;

      const notification: Notification = {
        id: generateId(),
        type,
        priority,
        title,
        message,
        read: false,
        timestamp: new Date().toISOString(),
        metadata,
      };

      const updated = [...notifications, notification];
      saveNotifications(updated);

      // Show browser notification if enabled
      if (preferences.browserNotifications && browserPermission === 'granted') {
        showBrowserNotification(title, message);
      }

      // Play sound if enabled
      if (preferences.sound) {
        playNotificationSound();
      }
    },
    [notifications, preferences, browserPermission, generateId, saveNotifications]
  );

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    (notificationId: string) => {
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(
    (notificationId: string) => {
      const updated = notifications.filter((n) => n.id !== notificationId);
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  /**
   * Update preferences
   */
  const updatePreferences = useCallback(
    (updates: Partial<NotificationPreferences>) => {
      const updated = { ...preferences, ...updates };
      savePreferences(updated);
    },
    [preferences, savePreferences]
  );

  /**
   * Request browser notification permission
   */
  const requestBrowserPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, []);

  /**
   * Show browser notification
   */
  const showBrowserNotification = useCallback(
    (title: string, body: string, icon = '/icon.svg') => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;

      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon,
            badge: '/icon.svg',
            tag: 'stablecoin-wallet',
          });
        } catch (error) {
          console.error('Failed to show browser notification:', error);
        }
      }
    },
    []
  );

  /**
   * Play notification sound
   */
  const playNotificationSound = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // Use a simple beep sound (can be replaced with actual audio file)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }, []);

  /**
   * Calculate unread count
   */
  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    preferences,
    browserPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updatePreferences,
    requestBrowserPermission,
    showBrowserNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * useNotifications Hook
 *
 * Access notification context in any component
 */
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }

  return context;
}
