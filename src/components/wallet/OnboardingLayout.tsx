/**
 * OnboardingLayout Component - Glassmorphic Design
 *
 * Premium onboarding interface with animated mesh background and floating particles.
 * October 2025 - Modern UI Design
 */

'use client';

import { useState, useCallback } from 'react';
import { CreateWallet } from './CreateWallet';
import { RecoveryPhrase } from './RecoveryPhrase';
import { ImportWallet } from './ImportWallet';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export interface OnboardingLayoutProps {
  /**
   * Callback when onboarding is complete
   */
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'create' | 'import' | 'recovery';

/**
 * OnboardingLayout component for wallet setup with glassmorphic design
 */
export function OnboardingLayout({ onComplete }: OnboardingLayoutProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [mnemonic, setMnemonic] = useState<string>('');

  const handleCreateSuccess = useCallback((generatedMnemonic: string) => {
    setMnemonic(generatedMnemonic);
    setStep('recovery');
  }, []);

  const handleRecoveryConfirm = useCallback(() => {
    // Clear mnemonic from memory
    setMnemonic('');
    onComplete();
  }, [onComplete]);

  const handleImportSuccess = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="min-h-screen animate-mesh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-particle w-32 h-32 top-1/4 left-1/4 opacity-30" style={{ animationDelay: '0s' }} />
        <div className="floating-particle w-24 h-24 top-1/3 right-1/4 opacity-20" style={{ animationDelay: '2s' }} />
        <div className="floating-particle w-40 h-40 bottom-1/4 left-1/3 opacity-25" style={{ animationDelay: '4s' }} />
        <div className="floating-particle w-28 h-28 top-2/3 right-1/3 opacity-15" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Welcome Screen */}
        {step === 'welcome' && (
          <Card variant="elevated" className="max-w-3xl mx-auto">
            <CardContent className="p-8 md:p-12">
              {/* Logo/Branding */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-3xl mb-6 shadow-2xl glow-blue">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="w-10 h-10"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                    />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                  Welcome to <span className="text-gradient">Stablecoin Wallet</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300">
                  Your secure gateway to the future of digital assets
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="text-center p-6 rounded-2xl glass hover:bg-white/10 transition-all duration-300 card-lift">
                  <div className="inline-flex items-center justify-center w-14 h-14 gradient-primary rounded-2xl mb-4 glow-blue">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="white"
                      className="w-7 h-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-white mb-2 text-lg">Bank-Grade Security</h3>
                  <p className="text-sm text-gray-300">
                    Military-grade encryption protects your assets
                  </p>
                </div>

                <div className="text-center p-6 rounded-2xl glass hover:bg-white/10 transition-all duration-300 card-lift">
                  <div className="inline-flex items-center justify-center w-14 h-14 gradient-success rounded-2xl mb-4 glow-green">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="white"
                      className="w-7 h-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-white mb-2 text-lg">Lightning Fast</h3>
                  <p className="text-sm text-gray-300">
                    Instant transactions on Ethereum network
                  </p>
                </div>

                <div className="text-center p-6 rounded-2xl glass hover:bg-white/10 transition-all duration-300 card-lift">
                  <div className="inline-flex items-center justify-center w-14 h-14 gradient-secondary rounded-2xl mb-4 glow-purple">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="white"
                      className="w-7 h-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-white mb-2 text-lg">Simple & Intuitive</h3>
                  <p className="text-sm text-gray-300">
                    Designed for everyone, from beginners to experts
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() => setStep('create')}
                  className="text-lg font-bold"
                >
                  Create New Wallet
                </Button>

                <Button
                  variant="secondary"
                  fullWidth
                  size="lg"
                  onClick={() => setStep('import')}
                  className="text-lg"
                >
                  Import Existing Wallet
                </Button>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 text-center mt-8 leading-relaxed">
                By continuing, you agree to our Terms of Service and Privacy Policy.
                <br />
                Always keep your recovery phrase and password safe.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Create Wallet Flow */}
        {step === 'create' && (
          <CreateWallet
            onSuccess={handleCreateSuccess}
            onBack={() => setStep('welcome')}
          />
        )}

        {/* Recovery Phrase Display */}
        {step === 'recovery' && mnemonic && (
          <RecoveryPhrase
            mnemonic={mnemonic}
            onConfirm={handleRecoveryConfirm}
          />
        )}

        {/* Import Wallet Flow */}
        {step === 'import' && (
          <ImportWallet
            onSuccess={handleImportSuccess}
            onBack={() => setStep('welcome')}
          />
        )}
      </div>
    </div>
  );
}
