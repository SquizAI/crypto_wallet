/**
 * Transaction Detail Modal Component
 *
 * Displays full transaction details with links to block explorer.
 */

'use client';

import { useState } from 'react';
import { Modal, Button, TransactionStatusBadge } from '@/components/ui';
import { formatAmount, formatFullDate, copyToClipboard, getExplorerUrl } from '@/lib/utils';
import { env } from '@/lib/env';
import type { Transaction } from '@/types/wallet';

export interface TransactionDetailModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Called when modal should close
   */
  onClose: () => void;

  /**
   * Transaction to display
   */
  transaction: Transaction;
}

/**
 * Transaction Detail Modal Component
 */
export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Handle copy
  const handleCopy = async (text: string, field: string) => {
    try {
      await copyToClipboard(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Get network name
  const network = env.NEXT_PUBLIC_NETWORK as 'mainnet' | 'sepolia';
  const explorerUrl = getExplorerUrl(transaction.hash, network);

  // Calculate gas cost if available
  const gasCost =
    transaction.gasUsed && transaction.gasPrice
      ? (BigInt(transaction.gasUsed) * BigInt(transaction.gasPrice)) / BigInt(1e18)
      : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      size="lg"
    >
      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">Status</span>
          <TransactionStatusBadge status={transaction.status} />
        </div>

        {/* Transaction Hash */}
        <DetailRow
          label="Transaction Hash"
          value={transaction.hash}
          onCopy={() => handleCopy(transaction.hash, 'hash')}
          isCopied={copiedField === 'hash'}
          mono
        />

        {/* From Address */}
        <DetailRow
          label="From"
          value={transaction.from}
          onCopy={() => handleCopy(transaction.from, 'from')}
          isCopied={copiedField === 'from'}
          mono
        />

        {/* To Address */}
        {transaction.to && (
          <DetailRow
            label="To"
            value={transaction.to}
            onCopy={() => handleCopy(transaction.to!, 'to')}
            isCopied={copiedField === 'to'}
            mono
          />
        )}

        {/* Amount */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">Amount</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatAmount(transaction.value, 2)} {transaction.tokenSymbol}
          </span>
        </div>

        {/* Token */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-600">Token</span>
          <span className="text-sm text-gray-900">{transaction.tokenSymbol}</span>
        </div>

        {/* Block Number */}
        {transaction.blockNumber && (
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Block Number</span>
            <span className="text-sm text-gray-900">{transaction.blockNumber}</span>
          </div>
        )}

        {/* Timestamp */}
        {transaction.timestamp && (
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Timestamp</span>
            <span className="text-sm text-gray-900">
              {formatFullDate(transaction.timestamp)}
            </span>
          </div>
        )}

        {/* Gas Used */}
        {transaction.gasUsed && (
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Gas Used</span>
            <span className="text-sm text-gray-900">
              {parseInt(transaction.gasUsed).toLocaleString()}
            </span>
          </div>
        )}

        {/* Gas Price */}
        {transaction.gasPrice && (
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Gas Price</span>
            <span className="text-sm text-gray-900">
              {(Number(transaction.gasPrice) / 1e9).toFixed(2)} Gwei
            </span>
          </div>
        )}

        {/* Total Gas Cost */}
        {gasCost !== null && (
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Gas Cost</span>
            <span className="text-sm text-gray-900">
              {Number(gasCost).toFixed(6)} ETH
            </span>
          </div>
        )}

        {/* Error Message */}
        {transaction.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-1">Error</p>
            <p className="text-sm text-red-600">{transaction.error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => window.open(explorerUrl, '_blank')}
          >
            <span className="flex items-center justify-center gap-2">
              View on Explorer
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </span>
          </Button>
          <Button variant="primary" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Detail Row Component
 */
interface DetailRowProps {
  label: string;
  value: string;
  onCopy?: () => void;
  isCopied?: boolean;
  mono?: boolean;
}

function DetailRow({ label, value, onCopy, isCopied, mono }: DetailRowProps) {
  return (
    <div className="py-3 border-b border-gray-200">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-gray-600 flex-shrink-0">
          {label}
        </span>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span
            className={`
              text-sm text-gray-900 break-all text-right
              ${mono ? 'font-mono' : ''}
            `}
          >
            {value}
          </span>
          {onCopy && (
            <button
              onClick={onCopy}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={`Copy ${label.toLowerCase()}`}
            >
              {isCopied ? (
                <svg
                  className="w-4 h-4 text-green-600"
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
              ) : (
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
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
