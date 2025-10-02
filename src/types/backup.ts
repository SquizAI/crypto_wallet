/**
 * Backup Type Definitions
 *
 * Types for wallet backup tracking and reminder system
 */

/**
 * Backup status tracking data stored in localStorage
 */
export interface BackupStatus {
  /**
   * Whether wallet has ever been backed up
   */
  hasBackedUp: boolean;

  /**
   * Timestamp of last backup (ISO 8601 format)
   * null if never backed up
   */
  lastBackupAt: string | null;

  /**
   * Timestamp when wallet was created (ISO 8601 format)
   */
  walletCreatedAt: string;

  /**
   * Number of times user has dismissed backup reminders
   */
  dismissCount: number;

  /**
   * Timestamp of last reminder dismissal (ISO 8601 format)
   * null if never dismissed
   */
  lastDismissedAt: string | null;

  /**
   * Whether user has permanently disabled reminders
   * @deprecated Use dismissCount threshold instead
   */
  permanentlyDisabled?: boolean;
}

/**
 * Backup reminder intervals in milliseconds
 */
export const BACKUP_REMINDER_INTERVALS = {
  /** Show reminder after 24 hours if not backed up */
  FIRST_REMINDER: 24 * 60 * 60 * 1000, // 24 hours

  /** Show reminder after 7 days if not backed up */
  SECOND_REMINDER: 7 * 24 * 60 * 60 * 1000, // 7 days

  /** Show reminder after 30 days if not backed up */
  THIRD_REMINDER: 30 * 24 * 60 * 60 * 1000, // 30 days

  /** After permanent dismiss, show reminder after 90 days */
  LONG_TERM_REMINDER: 90 * 24 * 60 * 60 * 1000, // 90 days
} as const;

/**
 * Snooze duration options in milliseconds
 */
export const SNOOZE_DURATIONS = {
  /** Snooze for 1 day */
  ONE_DAY: 24 * 60 * 60 * 1000,

  /** Snooze for 3 days */
  THREE_DAYS: 3 * 24 * 60 * 60 * 1000,

  /** Snooze for 1 week */
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Snooze duration type
 */
export type SnoozeDuration = keyof typeof SNOOZE_DURATIONS;

/**
 * Backup reminder state
 */
export interface BackupReminderState {
  /**
   * Whether reminder should be shown
   */
  shouldShowReminder: boolean;

  /**
   * Backup status data
   */
  backupStatus: BackupStatus | null;

  /**
   * Days since wallet was created
   */
  daysSinceCreation: number;

  /**
   * Days since last backup (null if never backed up)
   */
  daysSinceLastBackup: number | null;

  /**
   * Whether this is a critical reminder (>30 days)
   */
  isCritical: boolean;
}
