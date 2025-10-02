/**
 * Backup Reminder Modal
 *
 * Glassmorphic modal that prompts users to back up their wallet.
 * Shows at periodic intervals (24h, 7d, 30d) if wallet hasn't been backed up.
 *
 * Features:
 * - Snooze options (1 day, 3 days, 1 week)
 * - Critical warning state for 30+ days without backup
 * - Direct link to backup in settings
 * - Dismissible with tracking
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { SnoozeDuration } from '@/types/backup';

export interface BackupReminderModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Called when user dismisses reminder
   */
  onDismiss: () => void;

  /**
   * Called when user snoozes reminder
   */
  onSnooze: (duration: SnoozeDuration) => void;

  /**
   * Whether this is a critical reminder (>30 days without backup)
   */
  isCritical?: boolean;

  /**
   * Days since wallet was created
   */
  daysSinceCreation: number;

  /**
   * Days since last backup (null if never backed up)
   */
  daysSinceLastBackup: number | null;
}

/**
 * Backup reminder modal component
 */
export function BackupReminderModal({
  isOpen,
  onDismiss,
  onSnooze,
  isCritical = false,
  daysSinceCreation,
  daysSinceLastBackup,
}: BackupReminderModalProps) {
  const router = useRouter();
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  const handleBackupNow = () => {
    // Navigate to settings page where backup option is available
    router.push('/settings');
    onDismiss();
  };

  const handleSnooze = (duration: SnoozeDuration) => {
    onSnooze(duration);
    setShowSnoozeOptions(false);
  };

  const handleDismiss = () => {
    onDismiss();
    setShowSnoozeOptions(false);
  };

  // Determine message based on backup status
  const getMessage = () => {
    if (daysSinceLastBackup !== null) {
      // Has backed up before
      return {
        title: 'Time to Update Your Backup',
        message: `It's been ${daysSinceLastBackup} days since your last wallet backup. Regular backups help protect your funds.`,
      };
    } else if (daysSinceCreation >= 30) {
      // Critical - never backed up, 30+ days
      return {
        title: 'Critical: Backup Your Wallet Now',
        message: `Your wallet has not been backed up in ${daysSinceCreation} days. If you lose access to this device, your funds may be lost forever.`,
      };
    } else if (daysSinceCreation >= 7) {
      // Warning - never backed up, 7+ days
      return {
        title: 'Don\'t Forget to Backup',
        message: `It's been ${daysSinceCreation} days since you created your wallet. Back it up now to ensure you never lose access to your funds.`,
      };
    } else {
      // First reminder - 24+ hours
      return {
        title: 'Backup Your Wallet',
        message: 'Protect your funds by creating a backup of your wallet. This only takes a minute and could save you from losing access to your assets.',
      };
    }
  };

  const { title, message } = getMessage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDismiss}
      title={title}
      size="md"
      closeOnBackdropClick={false}
    >
      {/* Warning Alert */}
      <Alert variant={isCritical ? 'error' : 'warning'} className="mb-4">
        <div className="flex items-start gap-3">
          <svg
            className={`w-6 h-6 shrink-0 ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm">{message}</p>
        </div>
      </Alert>

      {/* Info Section */}
      <div className="space-y-4 mb-6">
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <h3 className="text-base font-semibold text-white mb-3">
            Why backup is important:
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-400 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Recover your wallet if you lose this device</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-400 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Access your wallet from multiple devices</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-400 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Protect against device failure or loss</span>
            </li>
          </ul>
        </div>

        {isCritical && (
          <div className="glass-card rounded-xl p-4 border border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-400 mb-1">
                  Critical Warning
                </p>
                <p className="text-sm text-gray-300">
                  Without a backup, if you lose access to this device or browser data,
                  your funds will be permanently lost. This cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!showSnoozeOptions ? (
        <div className="space-y-3">
          <Button
            onClick={handleBackupNow}
            className="w-full"
            variant={isCritical ? 'danger' : 'primary'}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Backup Now
          </Button>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setShowSnoozeOptions(true)}
              variant="secondary"
              className="flex-1"
            >
              Remind Me Later
            </Button>
            <Button onClick={handleDismiss} variant="ghost" className="flex-1">
              Dismiss
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-400 mb-3">Remind me in:</p>

          <button
            onClick={() => handleSnooze('ONE_DAY')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 transition-all touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-white font-medium">1 Day</span>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            onClick={() => handleSnooze('THREE_DAYS')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 transition-all touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-white font-medium">3 Days</span>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            onClick={() => handleSnooze('ONE_WEEK')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 transition-all touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-white font-medium">1 Week</span>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <Button
            onClick={() => setShowSnoozeOptions(false)}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      )}
    </Modal>
  );
}
