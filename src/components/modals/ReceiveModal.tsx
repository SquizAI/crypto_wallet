/**
 * Receive Modal Component
 *
 * Display wallet address with QR code for receiving tokens.
 * Supports all available tokens (same address for all ERC-20 tokens).
 */

'use client';

import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Alert } from '@/components/ui/Alert';
import { QRDisplay } from '@/components/qr';
import { getTokensForNetwork, type TokenSymbol } from '@/constants/tokens';
import { env } from '@/lib/env';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultToken?: TokenSymbol;
}

export function ReceiveModal({ isOpen, onClose, defaultToken = 'USDC' }: ReceiveModalProps) {
  const { address } = useWallet();
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>(defaultToken);

  // Get available tokens for current network
  const availableTokens = getTokensForNetwork(env.NEXT_PUBLIC_NETWORK);

  const tokenOptions = availableTokens.map((token) => ({
    value: token.symbol,
    label: `${token.symbol} - ${token.name}`,
  }));

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

        {/* QR Code with Download/Copy */}
        {address && (
          <QRDisplay
            data={address}
            size={256}
            showDownload={true}
            showCopy={true}
            label={`${selectedToken} Wallet Address`}
          />
        )}

        {/* Address Display */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Wallet Address
          </label>
          <div
            className="px-4 py-3 rounded-xl glass-card border border-white/10 font-mono text-sm text-white break-all text-center"
          >
            {address}
          </div>
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
