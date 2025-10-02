/**
 * ImportWallet Component
 *
 * Import existing wallet from recovery phrase or private key.
 * Features:
 * - Tab switcher for import methods
 * - Mnemonic word validation
 * - Private key validation
 * - Password setup for encryption
 */

'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export interface ImportWalletProps {
  /**
   * Callback when wallet is imported successfully
   */
  onSuccess: () => void;

  /**
   * Callback to go back
   */
  onBack?: () => void;
}

type ImportMethod = 'mnemonic' | 'privateKey';

/**
 * Validate mnemonic phrase
 */
function validateMnemonic(mnemonic: string): string | null {
  const words = mnemonic.trim().split(/\s+/);

  if (words.length !== 12 && words.length !== 24) {
    return 'Recovery phrase must be 12 or 24 words';
  }

  if (words.some((word) => !word || word.length < 2)) {
    return 'Invalid words in recovery phrase';
  }

  return null;
}

/**
 * Validate private key
 */
function validatePrivateKey(privateKey: string): string | null {
  const trimmed = privateKey.trim();

  if (!trimmed.startsWith('0x')) {
    return 'Private key must start with 0x';
  }

  if (trimmed.length !== 66) {
    return 'Private key must be 64 characters (66 with 0x prefix)';
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(trimmed)) {
    return 'Private key contains invalid characters';
  }

  return null;
}

/**
 * ImportWallet component for importing existing wallets
 */
export function ImportWallet({ onSuccess, onBack }: ImportWalletProps) {
  const { importWallet, isLoading, error, clearError } = useWallet();
  const [method, setMethod] = useState<ImportMethod>('mnemonic');
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setValidationError('');
      clearError();

      // Validate password
      if (password.length < 8) {
        setValidationError('Password must be at least 8 characters');
        return;
      }

      if (password !== confirmPassword) {
        setValidationError('Passwords do not match');
        return;
      }

      try {
        if (method === 'mnemonic') {
          // Validate mnemonic
          const mnemonicError = validateMnemonic(mnemonic);
          if (mnemonicError) {
            setValidationError(mnemonicError);
            return;
          }

          // Import from mnemonic
          await importWallet(mnemonic.trim(), password);
        } else {
          // Validate private key
          const pkError = validatePrivateKey(privateKey);
          if (pkError) {
            setValidationError(pkError);
            return;
          }

          // Note: importWallet currently only supports mnemonic
          // Private key import would need to be added to walletService
          setValidationError('Private key import not yet implemented');
          return;
        }

        // Clear sensitive data
        setMnemonic('');
        setPrivateKey('');
        setPassword('');
        setConfirmPassword('');

        onSuccess();
      } catch (err) {
        // Error handled by context
        console.error('Wallet import failed:', err);
      }
    },
    [method, mnemonic, privateKey, password, confirmPassword, importWallet, onSuccess, clearError]
  );

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const hasInput = method === 'mnemonic' ? mnemonic.trim() : privateKey.trim();
  const canSubmit = hasInput && password.length >= 8 && passwordsMatch && !isLoading;

  return (
    <Card variant="elevated" className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Import Wallet</CardTitle>
        <CardDescription>
          Restore your wallet using your recovery phrase or private key.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {(error || validationError) && (
            <Alert variant="danger">
              {error || validationError}
            </Alert>
          )}

          {/* Method Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setMethod('mnemonic')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
                method === 'mnemonic'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Recovery Phrase
            </button>
            <button
              type="button"
              onClick={() => setMethod('privateKey')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
                method === 'privateKey'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Private Key
            </button>
          </div>

          {/* Mnemonic Input */}
          {method === 'mnemonic' && (
            <div>
              <label
                htmlFor="mnemonic"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recovery Phrase
              </label>
              <textarea
                id="mnemonic"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="Enter your 12 or 24 word recovery phrase separated by spaces"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                autoComplete="off"
                spellCheck={false}
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate each word with a space
              </p>
            </div>
          )}

          {/* Private Key Input */}
          {method === 'privateKey' && (
            <div>
              <Alert variant="warning" className="mb-4">
                Private key import is currently not supported. Please use the recovery
                phrase method.
              </Alert>
              <Input
                label="Private Key"
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="0x..."
                disabled
                autoComplete="off"
                helperText="Must start with 0x followed by 64 hexadecimal characters"
              />
            </div>
          )}

          {/* Password Setup */}
          <div className="border-t pt-6 space-y-4">
            <p className="text-sm font-medium text-gray-700">
              Create a password to encrypt your wallet:
            </p>

            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 8 characters)"
              required
              showStrength
              autoComplete="new-password"
              disabled={isLoading}
            />

            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              autoComplete="new-password"
              disabled={isLoading}
              error={
                confirmPassword && !passwordsMatch
                  ? 'Passwords do not match'
                  : undefined
              }
            />
          </div>

          {/* Security Info */}
          <Alert variant="info">
            Your wallet will be encrypted with this password and stored securely in your
            browser.
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onBack && (
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              fullWidth={!onBack}
              disabled={!canSubmit || method === 'privateKey'}
              isLoading={isLoading}
            >
              Import Wallet
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
