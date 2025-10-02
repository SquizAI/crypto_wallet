/**
 * Backup Service
 *
 * Manages wallet backup status tracking and reminder logic.
 * Stores backup metadata in localStorage to track when user last backed up wallet.
 *
 * Features:
 * - Track backup status (last backup timestamp)
 * - Calculate when to show reminders (24h, 7d, 30d intervals)
 * - Snooze functionality with configurable durations
 * - SSR compatible (checks typeof window)
 */

import type {
  BackupStatus,
  BackupReminderState,
  SnoozeDuration,
} from '@/types/backup';
import { BACKUP_REMINDER_INTERVALS, SNOOZE_DURATIONS } from '@/types/backup';

/**
 * Storage key for backup status
 */
const BACKUP_STATUS_KEY = 'stablecoin_wallet_backup_status';

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = '__backup_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get backup status from localStorage
 *
 * @returns Backup status or null if not found
 */
export function getBackupStatus(): BackupStatus | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const data = localStorage.getItem(BACKUP_STATUS_KEY);
    if (!data) {
      return null;
    }

    return JSON.parse(data) as BackupStatus;
  } catch (error) {
    console.error('Failed to parse backup status:', error);
    return null;
  }
}

/**
 * Initialize backup status for a new wallet
 *
 * @param walletCreatedAt - Timestamp when wallet was created
 */
export function initializeBackupStatus(walletCreatedAt: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  // Don't overwrite existing status
  const existing = getBackupStatus();
  if (existing) {
    return;
  }

  const status: BackupStatus = {
    hasBackedUp: false,
    lastBackupAt: null,
    walletCreatedAt,
    dismissCount: 0,
    lastDismissedAt: null,
  };

  try {
    localStorage.setItem(BACKUP_STATUS_KEY, JSON.stringify(status));
  } catch (error) {
    console.error('Failed to initialize backup status:', error);
  }
}

/**
 * Update backup status when user exports wallet
 *
 * Resets dismiss count and updates last backup timestamp
 */
export function markWalletBackedUp(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  const existing = getBackupStatus();
  if (!existing) {
    // Create new status if doesn't exist
    const status: BackupStatus = {
      hasBackedUp: true,
      lastBackupAt: new Date().toISOString(),
      walletCreatedAt: new Date().toISOString(),
      dismissCount: 0,
      lastDismissedAt: null,
    };

    try {
      localStorage.setItem(BACKUP_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Failed to mark wallet backed up:', error);
    }

    return;
  }

  // Update existing status
  const updated: BackupStatus = {
    ...existing,
    hasBackedUp: true,
    lastBackupAt: new Date().toISOString(),
    dismissCount: 0, // Reset dismiss count on backup
    lastDismissedAt: null,
  };

  try {
    localStorage.setItem(BACKUP_STATUS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update backup status:', error);
  }
}

/**
 * Dismiss backup reminder with optional snooze
 *
 * @param snoozeDuration - Optional snooze duration
 */
export function dismissBackupReminder(snoozeDuration?: SnoozeDuration): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  const existing = getBackupStatus();
  if (!existing) {
    return;
  }

  const now = new Date();
  let dismissedAt = now.toISOString();

  // If snooze duration provided, set dismissed timestamp to future
  if (snoozeDuration) {
    const snoozeDurationMs = SNOOZE_DURATIONS[snoozeDuration];
    const snoozeUntil = new Date(now.getTime() + snoozeDurationMs);
    dismissedAt = snoozeUntil.toISOString();
  }

  const updated: BackupStatus = {
    ...existing,
    dismissCount: existing.dismissCount + 1,
    lastDismissedAt: dismissedAt,
  };

  try {
    localStorage.setItem(BACKUP_STATUS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to dismiss backup reminder:', error);
  }
}

/**
 * Calculate if backup reminder should be shown
 *
 * Logic:
 * - Don't show if already backed up recently (within 30 days)
 * - Show after 24 hours if never backed up
 * - Show after 7 days if not backed up
 * - Show after 30 days if not backed up
 * - Respect snooze/dismiss timestamps
 *
 * @returns Backup reminder state with all relevant information
 */
export function calculateBackupReminderState(): BackupReminderState {
  const backupStatus = getBackupStatus();

  // Default state - no reminder
  const defaultState: BackupReminderState = {
    shouldShowReminder: false,
    backupStatus: null,
    daysSinceCreation: 0,
    daysSinceLastBackup: null,
    isCritical: false,
  };

  if (!backupStatus) {
    return defaultState;
  }

  const now = Date.now();
  const walletCreatedAt = new Date(backupStatus.walletCreatedAt).getTime();
  const timeSinceCreation = now - walletCreatedAt;
  const daysSinceCreation = Math.floor(timeSinceCreation / (24 * 60 * 60 * 1000));

  // Calculate days since last backup
  let daysSinceLastBackup: number | null = null;
  if (backupStatus.lastBackupAt) {
    const lastBackupAt = new Date(backupStatus.lastBackupAt).getTime();
    const timeSinceBackup = now - lastBackupAt;
    daysSinceLastBackup = Math.floor(timeSinceBackup / (24 * 60 * 60 * 1000));
  }

  // Don't show reminder if backed up within last 30 days
  if (backupStatus.hasBackedUp && daysSinceLastBackup !== null && daysSinceLastBackup < 30) {
    return {
      shouldShowReminder: false,
      backupStatus,
      daysSinceCreation,
      daysSinceLastBackup,
      isCritical: false,
    };
  }

  // Check if currently snoozed
  if (backupStatus.lastDismissedAt) {
    const lastDismissedAt = new Date(backupStatus.lastDismissedAt).getTime();
    if (now < lastDismissedAt) {
      // Still snoozed
      return {
        shouldShowReminder: false,
        backupStatus,
        daysSinceCreation,
        daysSinceLastBackup,
        isCritical: false,
      };
    }
  }

  // Determine if reminder should be shown based on time intervals
  let shouldShowReminder = false;
  let isCritical = false;

  if (!backupStatus.hasBackedUp) {
    // Never backed up - show reminder at intervals
    if (timeSinceCreation >= BACKUP_REMINDER_INTERVALS.THIRD_REMINDER) {
      // 30+ days - critical
      shouldShowReminder = true;
      isCritical = true;
    } else if (timeSinceCreation >= BACKUP_REMINDER_INTERVALS.SECOND_REMINDER) {
      // 7+ days
      shouldShowReminder = true;
    } else if (timeSinceCreation >= BACKUP_REMINDER_INTERVALS.FIRST_REMINDER) {
      // 24+ hours
      shouldShowReminder = true;
    }
  } else if (daysSinceLastBackup !== null && daysSinceLastBackup >= 30) {
    // Backed up before, but more than 30 days ago
    shouldShowReminder = true;
    isCritical = daysSinceLastBackup >= 90;
  }

  return {
    shouldShowReminder,
    backupStatus,
    daysSinceCreation,
    daysSinceLastBackup,
    isCritical,
  };
}

/**
 * Clear backup status (used when wallet is deleted)
 */
export function clearBackupStatus(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(BACKUP_STATUS_KEY);
  } catch (error) {
    console.error('Failed to clear backup status:', error);
  }
}

/**
 * Get formatted time since last backup for display
 *
 * @returns Human-readable string like "3 days ago" or "Never"
 */
export function getTimeSinceLastBackup(): string {
  const backupStatus = getBackupStatus();

  if (!backupStatus || !backupStatus.lastBackupAt) {
    return 'Never';
  }

  const now = Date.now();
  const lastBackupAt = new Date(backupStatus.lastBackupAt).getTime();
  const timeSinceBackup = now - lastBackupAt;

  const days = Math.floor(timeSinceBackup / (24 * 60 * 60 * 1000));
  const hours = Math.floor(timeSinceBackup / (60 * 60 * 1000));
  const minutes = Math.floor(timeSinceBackup / (60 * 1000));

  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
}
