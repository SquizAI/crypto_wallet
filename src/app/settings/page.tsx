/**
 * Settings Page
 *
 * Wallet settings including export keys, network settings, and wallet management.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { useTheme } from '@/context/ThemeContext';
import { exportPrivateKey, exportMnemonic, exportWalletToFile, deleteWallet, getWalletType } from '@/services';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Alert } from '@/components/ui/Alert';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { env } from '@/lib/env';
import { TIMEOUT_OPTIONS, getTimeoutLabel, type TimeoutOption } from '@/hooks/useIdleTimer';
import { getBackupStatus, getTimeSinceLastBackup } from '@/services/backupService';

type SettingsModal = 'export-key' | 'export-mnemonic' | 'export-wallet' | 'delete-wallet' | null;

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const router = useRouter();
  const { address, lock, timeoutPreference, setTimeoutPreference } = useWallet();
  const [mounted, setMounted] = useState(false);

  const [activeModal, setActiveModal] = useState<SettingsModal>(null);
  const [password, setPassword] = useState('');
  const [exportedData, setExportedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backupStatusText, setBackupStatusText] = useState<string>('Never');
  const [hasBackedUp, setHasBackedUp] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load backup status
    const status = getBackupStatus();
    if (status) {
      setHasBackedUp(status.hasBackedUp);
      setBackupStatusText(getTimeSinceLastBackup());
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const walletType = getWalletType();
  const isHDWallet = walletType === 'hd';

  // Handle export private key
  const handleExportPrivateKey = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const privateKey = await exportPrivateKey(password);
      setExportedData(privateKey);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export private key');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle export mnemonic
  const handleExportMnemonic = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const mnemonic = await exportMnemonic(password);
      setExportedData(mnemonic);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export recovery phrase');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle export wallet file
  const handleExportWallet = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const blob = await exportWalletToFile(password);

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stablecoin-wallet-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Close modal and show success
      setPassword('');
      closeModal();

      // Update backup status
      setHasBackedUp(true);
      setBackupStatusText(getTimeSinceLastBackup());

      alert('Wallet backup file downloaded successfully! Keep this file secure.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export wallet');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete wallet
  const handleDeleteWallet = async () => {
    if (!password) {
      setError('Password is required to delete wallet');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Verify password first
      await exportPrivateKey(password);

      // Delete wallet
      deleteWallet();

      // Lock and redirect
      lock();
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete wallet');
      setIsProcessing(false);
    }
  };

  // Close modal and reset state
  const closeModal = () => {
    setActiveModal(null);
    setPassword('');
    setExportedData(null);
    setError(null);
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-sm sm:text-base text-gray-400">Manage your wallet and security settings</p>
        </div>

        {/* Appearance */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Appearance</h2>
          <p className="text-sm text-gray-400 mb-4">
            Customize the app appearance
          </p>
          <ThemeToggle showLabel />
        </div>

        {/* Wallet Info */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Wallet Information</h2>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-3 border-b border-white/10">
              <span className="text-sm sm:text-base text-gray-400">Wallet Address</span>
              <button
                onClick={() => address && copyToClipboard(address)}
                className="font-mono text-sm text-white hover:text-blue-400 transition-colors text-left sm:text-right break-all touch-manipulation"
              >
                <span className="sm:hidden">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
                <span className="hidden sm:inline">{address?.slice(0, 10)}...{address?.slice(-8)}</span>
              </button>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-sm sm:text-base text-gray-400">Wallet Type</span>
              <span className="text-sm sm:text-base text-white">{isHDWallet ? 'HD Wallet' : 'Imported'}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-sm sm:text-base text-gray-400">Network</span>
              <span className="text-sm sm:text-base text-white capitalize">{env.NEXT_PUBLIC_NETWORK}</span>
            </div>
          </div>
        </div>

        {/* Session Timeout */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Session Timeout</h2>
          <p className="text-sm text-gray-400 mb-4">
            Automatically lock wallet after period of inactivity
          </p>

          <div className="space-y-2">
            {(Object.keys(TIMEOUT_OPTIONS) as TimeoutOption[]).map((option) => (
              <button
                key={option}
                onClick={() => setTimeoutPreference(option)}
                className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all touch-manipulation ${
                  timeoutPreference === option
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 active:bg-white/15'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    timeoutPreference === option
                      ? 'border-blue-500'
                      : 'border-gray-400'
                  }`}>
                    {timeoutPreference === option && (
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base text-white font-medium">
                      {getTimeoutLabel(option)}
                    </p>
                    {option !== 'never' && (
                      <p className="text-xs text-gray-400">
                        Lock after {getTimeoutLabel(option).toLowerCase()} of inactivity
                      </p>
                    )}
                    {option === 'never' && (
                      <p className="text-xs text-gray-400">
                        Wallet will remain unlocked (not recommended)
                      </p>
                    )}
                  </div>
                </div>
                {timeoutPreference === option && (
                  <svg className="w-5 h-5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {timeoutPreference !== 'never' && (
            <Alert variant="info" className="mt-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-300">
                  You will receive a warning 30 seconds before auto-lock. Any activity resets the timer.
                </p>
              </div>
            </Alert>
          )}
        </div>

        {/* Security & Backup */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Security & Backup</h2>

          {/* Backup Status Indicator */}
          <div className="mb-4 p-4 rounded-xl border bg-white/5 border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-400">Backup Status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasBackedUp ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className={`text-sm font-semibold ${hasBackedUp ? 'text-green-400' : 'text-yellow-400'}`}>
                  {hasBackedUp ? 'Backed Up' : 'Not Backed Up'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Last Backup</span>
              <span className="text-sm text-white">{backupStatusText}</span>
            </div>
            {!hasBackedUp && (
              <Alert variant="warning" className="mt-3">
                <p className="text-xs">
                  Your wallet has not been backed up. Export a backup file to protect your funds.
                </p>
              </Alert>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            {/* Export Wallet File */}
            <button
              onClick={() => setActiveModal('export-wallet')}
              className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 transition-all touch-manipulation"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base text-white font-medium">Export Wallet Backup</p>
                  <p className="text-xs sm:text-sm text-gray-400">Download encrypted backup file</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Export Private Key */}
            <button
              onClick={() => setActiveModal('export-key')}
              className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 transition-all touch-manipulation"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base text-white font-medium">Export Private Key</p>
                  <p className="text-xs sm:text-sm text-gray-400">View your private key</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Export Mnemonic (HD Wallets Only) */}
            {isHDWallet && (
              <button
                onClick={() => setActiveModal('export-mnemonic')}
                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 transition-all touch-manipulation"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base text-white font-medium">Export Recovery Phrase</p>
                    <p className="text-xs sm:text-sm text-gray-400">View your 12-word recovery phrase</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-red-500/30">
          <h2 className="text-lg sm:text-xl font-semibold text-red-400 mb-3 sm:mb-4">Danger Zone</h2>

          <button
            onClick={() => setActiveModal('delete-wallet')}
            className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/25 border border-red-500/30 transition-all touch-manipulation"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm sm:text-base text-white font-medium">Delete Wallet</p>
                <p className="text-xs sm:text-sm text-gray-400">Permanently remove this wallet</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Export Private Key Modal */}
        <Modal
          isOpen={activeModal === 'export-key'}
          onClose={closeModal}
          title="Export Private Key"
        >
          {!exportedData ? (
            <>
              <Alert variant="warning">
                Never share your private key with anyone. Anyone with your private key can access your funds.
              </Alert>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter Password
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Wallet password"
                  autoFocus
                />
              </div>

              {error && <Alert variant="error" className="mt-4">{error}</Alert>}

              <ModalFooter>
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button onClick={handleExportPrivateKey} loading={isProcessing}>
                  Export
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <Alert variant="warning">
                Copy your private key and store it securely. Do not share it with anyone.
              </Alert>

              <div className="mt-4 p-4 rounded-xl bg-black/50 border border-white/10 break-all font-mono text-sm text-white">
                {exportedData}
              </div>

              <ModalFooter>
                <Button variant="secondary" onClick={closeModal}>Close</Button>
                <Button onClick={() => copyToClipboard(exportedData)}>
                  Copy to Clipboard
                </Button>
              </ModalFooter>
            </>
          )}
        </Modal>

        {/* Export Mnemonic Modal */}
        <Modal
          isOpen={activeModal === 'export-mnemonic'}
          onClose={closeModal}
          title="Export Recovery Phrase"
        >
          {!exportedData ? (
            <>
              <Alert variant="warning">
                Never share your recovery phrase. Anyone with it can access your wallet.
              </Alert>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter Password
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Wallet password"
                  autoFocus
                />
              </div>

              {error && <Alert variant="error" className="mt-4">{error}</Alert>}

              <ModalFooter>
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button onClick={handleExportMnemonic} loading={isProcessing}>
                  Export
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <Alert variant="warning">
                Write down these words in order and store them securely.
              </Alert>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {exportedData.split(' ').map((word, index) => (
                  <div
                    key={index}
                    className="p-2 sm:p-3 rounded-lg bg-white/5 border border-white/10 text-center"
                  >
                    <span className="text-xs text-gray-500">{index + 1}.</span>{' '}
                    <span className="text-sm sm:text-base text-white font-medium">{word}</span>
                  </div>
                ))}
              </div>

              <ModalFooter>
                <Button variant="secondary" onClick={closeModal}>Close</Button>
                <Button onClick={() => copyToClipboard(exportedData)}>
                  Copy to Clipboard
                </Button>
              </ModalFooter>
            </>
          )}
        </Modal>

        {/* Export Wallet File Modal */}
        <Modal
          isOpen={activeModal === 'export-wallet'}
          onClose={closeModal}
          title="Export Wallet Backup"
        >
          <Alert variant="warning">
            This will download an encrypted backup file of your wallet. Keep this file secure and use the same password to restore it later.
          </Alert>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Wallet password"
              autoFocus
            />
          </div>

          <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-gray-300">
              <strong>Backup includes:</strong>
              <br />
              - Encrypted private key
              <br />
              - Encrypted recovery phrase (if available)
              <br />
              - Wallet address and metadata
            </p>
          </div>

          {error && <Alert variant="error" className="mt-4">{error}</Alert>}

          <ModalFooter>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleExportWallet} loading={isProcessing}>
              Download Backup
            </Button>
          </ModalFooter>
        </Modal>

        {/* Delete Wallet Modal */}
        <Modal
          isOpen={activeModal === 'delete-wallet'}
          onClose={closeModal}
          title="Delete Wallet"
        >
          <Alert variant="error">
            This action cannot be undone. Make sure you have backed up your private key or recovery phrase before deleting.
          </Alert>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Password to Confirm
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Wallet password"
              autoFocus
            />
          </div>

          {error && <Alert variant="error" className="mt-4">{error}</Alert>}

          <ModalFooter>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button
              variant="danger"
              onClick={handleDeleteWallet}
              loading={isProcessing}
            >
              Delete Wallet
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
}
