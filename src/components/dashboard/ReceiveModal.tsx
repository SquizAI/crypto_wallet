/**
 * Receive Modal Component
 *
 * Modal displaying wallet address and QR code for receiving tokens.
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Modal, Button, Alert } from '@/components/ui';
import { useWallet } from '@/context/WalletContext';
import { copyToClipboard } from '@/lib/utils';
import type { TokenSymbol } from '@/constants/tokens';

export interface ReceiveModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Called when modal should close
   */
  onClose: () => void;

  /**
   * Token symbol for context
   */
  tokenSymbol?: TokenSymbol;
}

/**
 * Receive Modal Component
 */
export function ReceiveModal({ isOpen, onClose, tokenSymbol }: ReceiveModalProps) {
  const { address } = useWallet();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && address) {
      QRCode.toDataURL(address, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Failed to generate QR code:', err));
    }
  }, [isOpen, address]);

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  // Handle copy address
  const handleCopy = async () => {
    if (address) {
      try {
        await copyToClipboard(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  if (!address) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tokenSymbol ? `Receive ${tokenSymbol}` : 'Receive Tokens'}
      size="md"
    >
      <div className="space-y-6">
        {/* Instructions */}
        <Alert variant="info" className="text-sm">
          Scan the QR code or copy your wallet address to receive {tokenSymbol || 'tokens'}.
        </Alert>

        {/* QR Code */}
        <div className="flex justify-center">
          {qrCodeUrl ? (
            <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
              <Image
                src={qrCodeUrl}
                alt="Wallet address QR code"
                width={256}
                height={256}
                className="w-64 h-64"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Wallet Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Wallet Address
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
              <p className="text-sm font-mono text-gray-900 break-all">
                {address}
              </p>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={handleCopy}
              aria-label="Copy address"
              className="flex-shrink-0"
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Warning */}
        <Alert variant="warning" className="text-sm">
          <strong>Important:</strong> Only send {tokenSymbol || 'tokens'} on the Ethereum network to this address.
          Sending from other networks may result in loss of funds.
        </Alert>

        {/* Close Button */}
        <div className="pt-2">
          <Button onClick={onClose} variant="primary" fullWidth>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
