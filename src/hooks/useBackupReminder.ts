/**
 * useBackupReminder Hook
 *
 * Custom hook for managing backup reminder state and actions.
 * Checks backup status and calculates when to show reminders.
 *
 * Features:
 * - Automatic reminder calculation based on time intervals
 * - Snooze functionality
 * - Dismiss tracking
 * - Real-time updates via polling
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { shouldShowReminder, dismissReminder, snoozeReminder } = useBackupReminder();
 *
 *   if (shouldShowReminder) {
 *     return <BackupReminderModal onDismiss={dismissReminder} />;
 *   }
 * }
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getBackupStatus,
  calculateBackupReminderState,
  dismissBackupReminder,
  markWalletBackedUp,
  getTimeSinceLastBackup,
} from '@/services/backupService';
import type { BackupReminderState, SnoozeDuration } from '@/types/backup';

/**
 * Hook return type
 */
interface UseBackupReminderReturn {
  /**
   * Whether reminder should be shown
   */
  shouldShowReminder: boolean;

  /**
   * Whether this is a critical reminder (>30 days without backup)
   */
  isCritical: boolean;

  /**
   * Days since wallet was created
   */
  daysSinceCreation: number;

  /**
   * Days since last backup (null if never backed up)
   */
  daysSinceLastBackup: number | null;

  /**
   * Whether wallet has ever been backed up
   */
  hasBackedUp: boolean;

  /**
   * Human-readable time since last backup
   */
  timeSinceLastBackup: string;

  /**
   * Number of times user has dismissed reminder
   */
  dismissCount: number;

  /**
   * Dismiss reminder without snooze
   */
  dismissReminder: () => void;

  /**
   * Snooze reminder for specified duration
   */
  snoozeReminder: (duration: SnoozeDuration) => void;

  /**
   * Mark wallet as backed up (call after export)
   */
  markAsBackedUp: () => void;

  /**
   * Refresh reminder state
   */
  refresh: () => void;
}

/**
 * Backup reminder hook
 *
 * Automatically checks backup status and determines when to show reminders.
 * Polls every minute to check for reminder state changes.
 */
export function useBackupReminder(): UseBackupReminderReturn {
  const [reminderState, setReminderState] = useState<BackupReminderState>({
    shouldShowReminder: false,
    backupStatus: null,
    daysSinceCreation: 0,
    daysSinceLastBackup: null,
    isCritical: false,
  });

  /**
   * Calculate and update reminder state
   */
  const refresh = useCallback(() => {
    const state = calculateBackupReminderState();
    setReminderState(state);
  }, []);

  /**
   * Initialize and set up polling
   */
  useEffect(() => {
    // Initial calculation
    refresh();

    // Poll every minute to check for reminder state changes
    const interval = setInterval(() => {
      refresh();
    }, 60 * 1000); // 1 minute

    return () => clearInterval(interval);
  }, [refresh]);

  /**
   * Dismiss reminder without snooze
   */
  const dismissReminder = useCallback(() => {
    dismissBackupReminder();
    refresh();
  }, [refresh]);

  /**
   * Snooze reminder for specified duration
   */
  const snoozeReminder = useCallback(
    (duration: SnoozeDuration) => {
      dismissBackupReminder(duration);
      refresh();
    },
    [refresh]
  );

  /**
   * Mark wallet as backed up
   */
  const markAsBackedUp = useCallback(() => {
    markWalletBackedUp();
    refresh();
  }, [refresh]);

  return {
    shouldShowReminder: reminderState.shouldShowReminder,
    isCritical: reminderState.isCritical,
    daysSinceCreation: reminderState.daysSinceCreation,
    daysSinceLastBackup: reminderState.daysSinceLastBackup,
    hasBackedUp: reminderState.backupStatus?.hasBackedUp ?? false,
    timeSinceLastBackup: getTimeSinceLastBackup(),
    dismissCount: reminderState.backupStatus?.dismissCount ?? 0,
    dismissReminder,
    snoozeReminder,
    markAsBackedUp,
    refresh,
  };
}
