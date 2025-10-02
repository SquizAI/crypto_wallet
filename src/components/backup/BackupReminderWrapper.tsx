/**
 * Backup Reminder Wrapper
 *
 * Global wrapper component that monitors backup status and shows reminders.
 * Should be placed in the root layout to work across all pages.
 *
 * Features:
 * - Automatic reminder based on time intervals
 * - Only shows when wallet is unlocked
 * - Respects snooze/dismiss settings
 */

'use client';

import { useBackupReminder } from '@/hooks/useBackupReminder';
import { BackupReminderModal } from './BackupReminderModal';
import { useWallet } from '@/context/WalletContext';

/**
 * Wrapper component that shows backup reminders globally
 */
export function BackupReminderWrapper() {
  const { isUnlocked } = useWallet();
  const {
    shouldShowReminder,
    isCritical,
    daysSinceCreation,
    daysSinceLastBackup,
    dismissReminder,
    snoozeReminder,
  } = useBackupReminder();

  // Only show reminder when wallet is unlocked
  const showModal = isUnlocked && shouldShowReminder;

  return (
    <BackupReminderModal
      isOpen={showModal}
      onDismiss={dismissReminder}
      onSnooze={snoozeReminder}
      isCritical={isCritical}
      daysSinceCreation={daysSinceCreation}
      daysSinceLastBackup={daysSinceLastBackup}
    />
  );
}
