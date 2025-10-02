/**
 * Receive Modal Component
 *
 * Display wallet address with QR code for receiving tokens.
 * Supports all available tokens (same address for all ERC-20 tokens).
 */

'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Alert } from '@/components/ui/Alert';
import { getTokensForNetwork, type TokenSymbol } from '@/constants/tokens';
import { env } from '@/lib/env';
import QRCode from 'qrcode';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultToken?: TokenSymbol;
}

export function ReceiveModal({ isOpen, onClose, defaultToken = 'USDC' }: ReceiveModalProps) {
  const { address } = useWallet();
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>(defaultToken);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Get available tokens for current network
  const availableTokens = getTokensForNetwork(env.NEXT_PUBLIC_NETWORK);

  const tokenOptions = availableTokens.map((token) => ({
    value: token.symbol,
    label: `${token.symbol} - ${token.name}`,
  }));

  // Generate QR code
  useEffect(() => {
    if (address && isOpen) {
      QRCode.toDataURL(address, {
        width: 256,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#0d1117',
        },
      })
        .then(setQrCodeUrl)
        .catch((err) => console.error('Failed to generate QR code:', err));
    }
  }, [address, isOpen]);

  // Handle copy address
  const handleCopyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Tokens"
      size="md"
    >
      <div className="space-y-6">
        {/* Token Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Token
          </label>
          <Dropdown
            options={tokenOptions}
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value as TokenSymbol)}
          />
        </div>

        {/* Info Alert */}
        <Alert variant="info">
          This address can receive all ERC-20 tokens on {env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'Ethereum Mainnet' : 'Sepolia Testnet'}.
          Only send {selectedToken} and other ERC-20 tokens to this address.
        </Alert>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-white">
              <img
                src={qrCodeUrl}
                alt="Wallet Address QR Code"
                className="w-64 h-64"
              />
            </div>
          </div>
        )}

        {/* Address Display */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Wallet Address
          </label>
          <div className="flex items-center gap-2">
            <div
              className="flex-1 px-4 py-3 rounded-xl glass-card border border-white/10 font-mono text-sm text-white break-all"
            >
              {address}
            </div>
            <Button
              variant={copied ? 'success' : 'secondary'}
              onClick={handleCopyAddress}
              className="shrink-0"
            >
              {copied ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </Button>
          </div>
          {copied && (
            <p className="mt-2 text-sm text-green-400">Address copied to clipboard!</p>
          )}
        </div>

        {/* Network Warning */}
        {env.NEXT_PUBLIC_NETWORK === 'sepolia' && (
          <Alert variant="warning">
            You are on Sepolia Testnet. Only send test tokens to this address.
          </Alert>
        )}

        {/* Close Button */}
        <Button onClick={onClose} variant="secondary" className="w-full">
          Close
        </Button>
      </div>
    </Modal>
  );
}
