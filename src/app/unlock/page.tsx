/**
 * Unlock Wallet Page
 *
 * Password entry screen for unlocking an existing wallet.
 * Automatically redirects to dashboard on successful unlock.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Alert } from '@/components/ui/Alert';

export default function UnlockPage() {
  const router = useRouter();
  const { unlock, isUnlocked, hasExistingWallet, address, error: walletError } = useWallet();

  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet exists
  useEffect(() => {
    if (!hasExistingWallet()) {
      router.push('/onboarding');
      return;
    }

    if (isUnlocked) {
      router.push('/');
    }
  }, [hasExistingWallet, isUnlocked, router]);

  // Update error from wallet context
  useEffect(() => {
    if (walletError) {
      setError(walletError);
    }
  }, [walletError]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError(null);
    setIsUnlocking(true);

    try {
      await unlock(password);
      // Redirect handled by useEffect above
    } catch (err) {
      console.error('Unlock error:', err);
      setError(err instanceof Error ? err.message : 'Failed to unlock wallet');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-2xl shadow-blue-500/50">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Unlock Wallet</h1>
          <p className="text-gray-400">Enter your password to access your wallet</p>

          {address && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-sm text-gray-300 font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
          )}
        </div>

        {/* Unlock Form */}
        <div className="glass-strong rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleUnlock} className="space-y-6">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter your wallet password"
                autoFocus
                disabled={isUnlocking}
              />
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="error">
                {error}
              </Alert>
            )}

            {/* Unlock Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isUnlocking || !password}
              loading={isUnlocking}
            >
              {isUnlocking ? 'Unlocking...' : 'Unlock Wallet'}
            </Button>

            {/* Help Text */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/onboarding')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Forgot your password? Restore wallet with recovery phrase
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your wallet is encrypted and stored locally on your device.
            <br />
            We never have access to your password or private keys.
          </p>
        </div>
      </div>
    </div>
  );
}
