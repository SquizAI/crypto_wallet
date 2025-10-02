/**
 * CreateWallet Component - Glassmorphic Design
 *
 * Premium wallet creation with animated strength bar and glassmorphic checkmarks.
 * October 2025 - Modern UI Design
 */

'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export interface CreateWalletProps {
  /**
   * Callback when wallet is created successfully
   * @param mnemonic - The generated mnemonic phrase
   */
  onSuccess: (mnemonic: string) => void;

  /**
   * Callback to go back
   */
  onBack?: () => void;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: 'Contains uppercase letter',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: 'Contains lowercase letter',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: 'Contains number',
    test: (pwd) => /\d/.test(pwd),
  },
  {
    label: 'Contains special character',
    test: (pwd) => /[^a-zA-Z0-9]/.test(pwd),
  },
];

/**
 * Check if password meets all requirements
 */
function isPasswordValid(password: string): boolean {
  return passwordRequirements.every((req) => req.test(password));
}

/**
 * CreateWallet component with glassmorphic design
 */
export function CreateWallet({ onSuccess, onBack }: CreateWalletProps) {
  const { createWallet, isLoading, error, clearError } = useWallet();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setValidationError('');
      clearError();

      // Validate password requirements
      if (!isPasswordValid(password)) {
        setValidationError('Please meet all password requirements');
        return;
      }

      // Validate password match
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match');
        return;
      }

      try {
        // Create wallet and get mnemonic
        const mnemonic = await createWallet(password);

        // Clear sensitive data from state
        setPassword('');
        setConfirmPassword('');

        // Pass mnemonic to parent (will be shown once)
        onSuccess(mnemonic);
      } catch (err) {
        // Error handled by context
        console.error('Wallet creation failed:', err);
      }
    },
    [password, confirmPassword, createWallet, onSuccess, clearError]
  );

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const canSubmit = isPasswordValid(password) && passwordsMatch && !isLoading;

  return (
    <Card variant="elevated" className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Wallet</CardTitle>
        <CardDescription>
          Choose a strong password to encrypt your wallet. You&apos;ll need this password to
          unlock and access your funds.
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

          {/* Password Input */}
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password"
            required
            showStrength
            autoComplete="new-password"
            disabled={isLoading}
            fullWidth
          />

          {/* Password Requirements Checklist */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-200 tracking-wide">
              Password Requirements:
            </p>
            <ul className="space-y-2">
              {passwordRequirements.map((req, index) => {
                const isMet = req.test(password);
                return (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-sm transition-all duration-300"
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        isMet ? 'gradient-success glow-green' : 'glass'
                      }`}
                    >
                      {isMet && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="white"
                          className="w-3 h-3 animate-bounce-success"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`transition-colors duration-300 ${
                        isMet ? 'text-green-300 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {req.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Confirm Password Input */}
          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
            disabled={isLoading}
            error={
              confirmPassword && !passwordsMatch
                ? 'Passwords do not match'
                : undefined
            }
            fullWidth
          />

          {/* Security Warning */}
          <Alert variant="warning" title="Security Notice">
            This password encrypts your wallet locally. If you forget it, you&apos;ll need
            your recovery phrase to restore access. Store it in a secure location.
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onBack && (
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                disabled={isLoading}
                size="lg"
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              fullWidth={!onBack}
              disabled={!canSubmit}
              isLoading={isLoading}
              size="lg"
            >
              Create Wallet
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
