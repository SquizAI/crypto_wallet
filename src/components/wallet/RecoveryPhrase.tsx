/**
 * RecoveryPhrase Component - Glassmorphic Design
 *
 * Premium recovery phrase display with glassmorphic tiles and hover effects.
 * October 2025 - Modern UI Design
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export interface RecoveryPhraseProps {
  /**
   * The 12-word mnemonic phrase
   */
  mnemonic: string;

  /**
   * Callback when user confirms they've saved the phrase
   */
  onConfirm: () => void;
}

/**
 * RecoveryPhrase component with premium glassmorphic design
 */
export function RecoveryPhrase({ mnemonic, onConfirm }: RecoveryPhraseProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const words = mnemonic.trim().split(/\s+/);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [mnemonic]);

  const handleDownload = useCallback(() => {
    const element = document.createElement('a');
    const file = new Blob([mnemonic], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recovery-phrase.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  }, [mnemonic]);

  const handleConfirm = useCallback(() => {
    if (isSaved) {
      onConfirm();
    }
  }, [isSaved, onConfirm]);

  return (
    <Card variant="elevated" className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Your Recovery Phrase</CardTitle>
        <CardDescription>
          Write down these 12 words in order and store them safely. This is the ONLY way to
          recover your wallet if you forget your password.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Security Warnings */}
        <Alert variant="danger" title="Critical Security Information">
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Never share your recovery phrase with anyone</li>
            <li>Store it in a safe, offline location</li>
            <li>Anyone with this phrase can access your wallet</li>
            <li>If you lose it, you cannot recover your wallet</li>
          </ul>
        </Alert>

        {/* Mnemonic Grid */}
        <div className="glass-strong p-8 rounded-2xl border-2 border-white/20 card-lift">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {words.map((word, index) => (
              <div
                key={index}
                className="glass-card p-4 rounded-xl transition-all duration-300 hover:bg-white/10 hover:scale-105 hover-glow-blue card-lift cursor-default"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-blue-400 w-8 font-bold">
                    {String(index + 1).padStart(2, '0')}.
                  </span>
                  <span className="font-semibold text-white text-lg tracking-wide">{word}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={handleCopy}
            className="flex-1"
            size="lg"
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                Copied to Clipboard!
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.988 3.012A2.25 2.25 0 0118 5.25v6.5A2.25 2.25 0 0115.75 14H13.5V7A2.5 2.5 0 0011 4.5H8.128a2.252 2.252 0 011.884-1.488A2.25 2.25 0 0112.25 1h1.5a2.25 2.25 0 012.238 2.012zM11.5 3.25a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v.25h-3v-.25z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M2 7a1 1 0 011-1h8a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V7zm2 3.25a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zm0 3.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
                Copy to Clipboard
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={handleDownload}
            className="flex-1"
            size="lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
            Download as Text
          </Button>
        </div>

        <Alert variant="warning">
          After downloading or copying, store your recovery phrase in a secure location
          like a password manager or safe. Never store it in plain text on your
          computer or take a screenshot.
        </Alert>

        {/* Confirmation Checkbox */}
        <div className="glass-card p-6 rounded-xl border border-white/20">
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={isSaved}
                onChange={(e) => setIsSaved(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                  isSaved
                    ? 'gradient-success border-green-400 glow-green'
                    : 'glass border-white/30 group-hover:border-white/50'
                }`}
              >
                {isSaved && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="white"
                    className="w-4 h-4 animate-bounce-success"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed">
              I understand that I am responsible for saving my recovery phrase and that it is the ONLY way to recover my wallet. I also understand that anyone with access to this phrase can access my funds. I have securely stored my recovery phrase.
            </span>
          </label>
        </div>

        {/* Continue Button */}
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!isSaved}
          fullWidth
          size="lg"
          className="text-lg font-bold"
        >
          I&apos;ve Saved My Recovery Phrase - Continue
        </Button>
      </CardContent>
    </Card>
  );
}
