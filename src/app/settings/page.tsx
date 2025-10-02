/**
 * Settings Page
 *
 * Wallet settings including export keys, network settings, and wallet management.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { exportPrivateKey, exportMnemonic, deleteWallet, getWalletType } from '@/services';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Alert } from '@/components/ui/Alert';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { env } from '@/lib/env';

type SettingsModal = 'export-key' | 'export-mnemonic' | 'delete-wallet' | null;

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const router = useRouter();
  const { address, lock } = useWallet();
  const [mounted, setMounted] = useState(false);

  const [activeModal, setActiveModal] = useState<SettingsModal>(null);
  const [password, setPassword] = useState('');
  const [exportedData, setExportedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
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

        {/* Security & Backup */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Security & Backup</h2>

          <div className="space-y-2 sm:space-y-3">
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
                  <p className="text-xs sm:text-sm text-gray-400">Download your private key</p>
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
