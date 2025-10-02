/**
 * Lock Warning Banner Component
 *
 * Displays a warning banner when wallet is about to auto-lock due to inactivity.
 * Shows countdown and allows user to dismiss (which counts as activity).
 */

'use client';

import { useWallet } from '@/context/WalletContext';
import { useEffect, useState } from 'react';

export function LockWarningBanner() {
  const { showLockWarning, dismissLockWarning } = useWallet();
  const [countdown, setCountdown] = useState(30);

  // Reset countdown when warning is shown
  useEffect(() => {
    if (showLockWarning) {
      setCountdown(30);
    }
  }, [showLockWarning]);

  // Countdown timer
  useEffect(() => {
    if (!showLockWarning) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showLockWarning]);

  if (!showLockWarning) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 shadow-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
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
          </div>

          {/* Message */}
          <div className="flex-1">
            <p className="text-sm sm:text-base font-semibold text-white">
              Wallet will auto-lock in {countdown} second{countdown !== 1 ? 's' : ''} due to inactivity
            </p>
            <p className="text-xs sm:text-sm text-white/90 hidden sm:block">
              Move your mouse or press any key to stay unlocked
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={dismissLockWarning}
          className="flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-lg font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-white/50 touch-manipulation"
          aria-label="Dismiss warning and stay unlocked"
        >
          I'm here
        </button>
      </div>
    </div>
  );
}
