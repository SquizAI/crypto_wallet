/**
 * useIdleTimer Hook
 *
 * Tracks user activity and triggers callback after period of inactivity.
 * Monitors mouse movements, keyboard events, touch events, and scrolling.
 *
 * Features:
 * - Configurable timeout duration
 * - Warning notification before timeout
 * - Automatic cleanup on unmount
 * - Respects localStorage preferences
 * - Can be disabled (timeout: 'never')
 *
 * @example
 * ```tsx
 * function App() {
 *   useIdleTimer({
 *     timeout: 900000, // 15 minutes
 *     onIdle: () => {
 *       console.log('User is idle, locking wallet');
 *       lock();
 *     },
 *     onWarning: () => {
 *       console.log('Warning: wallet will lock soon');
 *     },
 *   });
 * }
 * ```
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Timeout duration options (in milliseconds)
 */
export const TIMEOUT_OPTIONS = {
  '5min': 5 * 60 * 1000,
  '15min': 15 * 60 * 1000,
  '30min': 30 * 60 * 1000,
  '1hr': 60 * 60 * 1000,
  never: null,
} as const;

export type TimeoutOption = keyof typeof TIMEOUT_OPTIONS;

/**
 * Get timeout duration label for display
 */
export function getTimeoutLabel(option: TimeoutOption): string {
  const labels: Record<TimeoutOption, string> = {
    '5min': '5 minutes',
    '15min': '15 minutes',
    '30min': '30 minutes',
    '1hr': '1 hour',
    never: 'Never',
  };
  return labels[option];
}

/**
 * useIdleTimer options
 */
export interface UseIdleTimerOptions {
  /**
   * Timeout duration in milliseconds
   * Set to null to disable idle timeout
   */
  timeout: number | null;

  /**
   * Callback when user becomes idle (timeout reached)
   */
  onIdle: () => void;

  /**
   * Callback for warning before timeout (optional)
   * Default: 30 seconds before timeout
   */
  onWarning?: () => void;

  /**
   * Warning time in milliseconds before timeout
   * Default: 30000 (30 seconds)
   */
  warningTime?: number;

  /**
   * Events to track for activity
   * Default: ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll']
   */
  events?: string[];

  /**
   * Whether timer is enabled
   * Default: true
   */
  enabled?: boolean;
}

/**
 * Custom hook for tracking user idle time
 *
 * Automatically resets timer on any user activity and triggers
 * callbacks when user becomes idle or when warning threshold is reached.
 */
export function useIdleTimer({
  timeout,
  onIdle,
  onWarning,
  warningTime = 30000, // 30 seconds default
  events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'],
  enabled = true,
}: UseIdleTimerOptions) {
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  /**
   * Start idle timer
   */
  const startTimer = useCallback(() => {
    clearTimers();
    warningShownRef.current = false;

    // Don't start timer if disabled or timeout is null
    if (!enabled || timeout === null) {
      return;
    }

    // Start warning timer if onWarning callback provided
    if (onWarning && warningTime > 0 && warningTime < timeout) {
      const warningDelay = timeout - warningTime;
      warningTimerRef.current = setTimeout(() => {
        if (!warningShownRef.current) {
          warningShownRef.current = true;
          onWarning();
        }
      }, warningDelay);
    }

    // Start idle timer
    idleTimerRef.current = setTimeout(() => {
      onIdle();
    }, timeout);
  }, [enabled, timeout, onIdle, onWarning, warningTime, clearTimers]);

  /**
   * Reset timer on user activity
   */
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    startTimer();
  }, [startTimer]);

  /**
   * Throttled version of resetTimer to avoid excessive calls
   */
  const throttledResetTimer = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // Only reset if more than 1 second since last activity
    // This prevents excessive timer resets on rapid events
    if (timeSinceLastActivity > 1000) {
      resetTimer();
    }
  }, [resetTimer]);

  /**
   * Set up event listeners and timer
   */
  useEffect(() => {
    // Don't set up if disabled or timeout is null
    if (!enabled || timeout === null) {
      clearTimers();
      return;
    }

    // Start initial timer
    startTimer();

    // Add event listeners for user activity
    events.forEach((event) => {
      window.addEventListener(event, throttledResetTimer, { passive: true });
    });

    // Cleanup on unmount
    return () => {
      clearTimers();
      events.forEach((event) => {
        window.removeEventListener(event, throttledResetTimer);
      });
    };
  }, [enabled, timeout, events, throttledResetTimer, startTimer, clearTimers]);

  /**
   * Return API for manual control
   */
  return {
    /**
     * Manually reset the idle timer
     */
    reset: resetTimer,

    /**
     * Get remaining time until idle (in milliseconds)
     */
    getRemainingTime: () => {
      if (!enabled || timeout === null) {
        return null;
      }
      const elapsed = Date.now() - lastActivityRef.current;
      return Math.max(0, timeout - elapsed);
    },

    /**
     * Check if warning has been shown
     */
    isWarningShown: () => warningShownRef.current,
  };
}

/**
 * Load timeout preference from localStorage
 */
export function loadTimeoutPreference(): TimeoutOption {
  if (typeof window === 'undefined') {
    return '15min'; // Default for SSR
  }

  try {
    const stored = localStorage.getItem('wallet-timeout-preference');
    if (stored && stored in TIMEOUT_OPTIONS) {
      return stored as TimeoutOption;
    }
  } catch (error) {
    console.error('Failed to load timeout preference:', error);
  }

  return '15min'; // Default
}

/**
 * Save timeout preference to localStorage
 */
export function saveTimeoutPreference(option: TimeoutOption): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('wallet-timeout-preference', option);
  } catch (error) {
    console.error('Failed to save timeout preference:', error);
  }
}
