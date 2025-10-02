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

import { useState, useCallback, useRef } from 'react';
import { useWallet } from '@/context/WalletContext';
import { importWalletFromFile } from '@/services/walletService';
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

type ImportMethod = 'mnemonic' | 'privateKey' | 'file';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePassword, setFilePassword] = useState('');
  const [isFileImporting, setIsFileImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.json')) {
        setValidationError('Please select a valid wallet backup file (.json)');
        return;
      }

      setSelectedFile(file);
      setValidationError('');
    }
  }, []);

  // Handle file import
  const handleFileImport = useCallback(async () => {
    if (!selectedFile) {
      setValidationError('Please select a backup file');
      return;
    }

    if (!filePassword) {
      setValidationError('Password is required');
      return;
    }

    if (filePassword.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    setValidationError('');
    setIsFileImporting(true);

    try {
      const address = await importWalletFromFile(selectedFile, filePassword);

      // Clear sensitive data
      setSelectedFile(null);
      setFilePassword('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Show success and redirect
      alert(`Wallet imported successfully!\nAddress: ${address}`);
      onSuccess();
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to import wallet from file');
    } finally {
      setIsFileImporting(false);
    }
  }, [selectedFile, filePassword, onSuccess]);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const hasInput = method === 'mnemonic' ? mnemonic.trim() : privateKey.trim();
  const canSubmit = hasInput && password.length >= 8 && passwordsMatch && !isLoading;
  const canImportFile = selectedFile && filePassword.length >= 8 && !isFileImporting;

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
          <div className="flex gap-2 border-b border-white/20">
            <button
              type="button"
              onClick={() => setMethod('file')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
                method === 'file'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Backup File
            </button>
            <button
              type="button"
              onClick={() => setMethod('mnemonic')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
                method === 'mnemonic'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Recovery Phrase
            </button>
            <button
              type="button"
              onClick={() => setMethod('privateKey')}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
                method === 'privateKey'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Private Key
            </button>
          </div>

          {/* File Import */}
          {method === 'file' && (
            <>
              <div>
                <label
                  htmlFor="backup-file"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Wallet Backup File
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="backup-file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left flex items-center gap-3"
                    >
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        {selectedFile ? (
                          <div>
                            <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                            <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">Choose wallet backup file...</p>
                        )}
                      </div>
                    </button>
                  </div>

                  {selectedFile && (
                    <div className="space-y-3">
                      <PasswordInput
                        label="Wallet Password"
                        value={filePassword}
                        onChange={(e) => {
                          setFilePassword(e.target.value);
                          setValidationError('');
                        }}
                        placeholder="Enter the password for this wallet"
                        disabled={isFileImporting}
                        autoComplete="current-password"
                      />

                      <Alert variant="info">
                        Enter the password that was used to create this wallet backup.
                      </Alert>

                      <Button
                        type="button"
                        variant="primary"
                        fullWidth
                        onClick={handleFileImport}
                        disabled={!canImportFile}
                        loading={isFileImporting}
                      >
                        Import from File
                      </Button>
                    </div>
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Select a wallet backup file (.json) exported from this app
                </p>
              </div>

              <Alert variant="info">
                Import a wallet from a previously exported backup file. You'll need the password that was used when the wallet was created.
              </Alert>

              {onBack && (
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={onBack}
                  disabled={isFileImporting}
                >
                  Back
                </Button>
              )}
            </>
          )}

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
