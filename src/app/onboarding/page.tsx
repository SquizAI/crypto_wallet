/**
 * Onboarding Page
 *
 * Demo page for the wallet onboarding flow.
 * Shows the complete wallet creation and import process.
 */

'use client';

import { useState } from 'react';
import { OnboardingLayout } from '@/components/wallet/OnboardingLayout';
import { useWallet } from '@/context/WalletContext';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const { hasExistingWallet } = useWallet();
  const [showOnboarding, setShowOnboarding] = useState(!hasExistingWallet());

  const handleComplete = () => {
    setShowOnboarding(false);
    // Redirect to main app or dashboard
    router.push('/');
  };

  if (!showOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-strong rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-white/10">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8 text-green-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Wallet Setup Complete!
          </h2>
          <p className="text-gray-300 mb-6">
            Your wallet has been created successfully. You can now start using the app.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <OnboardingLayout onComplete={handleComplete} />;
}
