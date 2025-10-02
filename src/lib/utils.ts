/**
 * Utility Functions
 * Common helpers for formatting and displaying data
 */

import { NETWORKS } from '@/constants/networks';

/**
 * Truncate Ethereum address to format: 0x1234...5678
 *
 * @param address - Ethereum address (0x prefixed)
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Truncated address
 *
 * @example
 * truncateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
 * // Returns: '0x742d...0bEb'
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address || address.length < chars * 2 + 2) {
    return address;
  }

  const prefix = address.substring(0, chars + 2); // Include '0x'
  const suffix = address.substring(address.length - chars);
  return `${prefix}...${suffix}`;
}

/**
 * Format amount with commas and decimals
 *
 * @param amount - Amount to format (string or number)
 * @param decimals - Number of decimal places (default: 2)
 * @param includeCommas - Whether to include thousand separators (default: true)
 * @returns Formatted amount string
 *
 * @example
 * formatAmount('1234.5678', 2)
 * // Returns: '1,234.57'
 *
 * formatAmount('0.000123', 6)
 * // Returns: '0.000123'
 */
export function formatAmount(
  amount: string | number,
  decimals: number = 2,
  includeCommas: boolean = true
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return '0.00';
  }

  // Format with decimals
  const formatted = num.toFixed(decimals);

  // Add thousand separators if requested
  if (includeCommas) {
    const [integerPart, decimalPart] = formatted.split('.');
    const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart ? `${withCommas}.${decimalPart}` : withCommas;
  }

  return formatted;
}

/**
 * Format timestamp to relative time (e.g., "2 min ago", "3 hours ago")
 *
 * @param timestamp - ISO 8601 timestamp string or Date object or Unix timestamp (ms)
 * @returns Relative time string
 *
 * @example
 * formatTimestamp(Date.now() - 120000)
 * // Returns: '2 min ago'
 *
 * formatTimestamp('2024-01-01T12:00:00Z')
 * // Returns: '2 months ago' (if current date is March 2024)
 */
export function formatTimestamp(timestamp: string | Date | number | null): string {
  if (!timestamp) {
    return 'Unknown';
  }

  const date = typeof timestamp === 'string'
    ? new Date(timestamp)
    : typeof timestamp === 'number'
    ? new Date(timestamp)
    : timestamp;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    // Format as date for older transactions
    return date.toLocaleDateString();
  }
}

/**
 * Format timestamp to full date and time
 *
 * @param timestamp - ISO 8601 timestamp string or Date object or Unix timestamp (ms)
 * @returns Formatted date string
 *
 * @example
 * formatFullDate('2024-01-01T12:00:00Z')
 * // Returns: 'Jan 1, 2024 12:00 PM'
 */
export function formatFullDate(timestamp: string | Date | number | null): string {
  if (!timestamp) {
    return 'Unknown';
  }

  const date = typeof timestamp === 'string'
    ? new Date(timestamp)
    : typeof timestamp === 'number'
    ? new Date(timestamp)
    : timestamp;

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get block explorer URL for a transaction
 *
 * @param txHash - Transaction hash (0x prefixed)
 * @param network - Network name ('mainnet' or 'sepolia')
 * @returns Block explorer URL
 *
 * @example
 * getExplorerUrl('0x123...', 'sepolia')
 * // Returns: 'https://sepolia.etherscan.io/tx/0x123...'
 */
export function getExplorerUrl(txHash: string, network: 'mainnet' | 'sepolia' = 'sepolia'): string {
  const networkConfig = NETWORKS[network.toUpperCase() as keyof typeof NETWORKS];
  if (!networkConfig) {
    return '#';
  }

  return `${networkConfig.blockExplorer}/tx/${txHash}`;
}

/**
 * Get address explorer URL
 *
 * @param address - Ethereum address (0x prefixed)
 * @param network - Network name ('mainnet' or 'sepolia')
 * @returns Block explorer URL
 *
 * @example
 * getAddressExplorerUrl('0x742d35...', 'sepolia')
 * // Returns: 'https://sepolia.etherscan.io/address/0x742d35...'
 */
export function getAddressExplorerUrl(address: string, network: 'mainnet' | 'sepolia' = 'sepolia'): string {
  const networkConfig = NETWORKS[network.toUpperCase() as keyof typeof NETWORKS];
  if (!networkConfig) {
    return '#';
  }

  return `${networkConfig.blockExplorer}/address/${address}`;
}

/**
 * Copy text to clipboard
 *
 * @param text - Text to copy
 * @returns Promise that resolves when copy is successful
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } finally {
      textArea.remove();
    }
  }
}

/**
 * Format USD value
 *
 * @param value - USD value (number or string)
 * @returns Formatted USD string
 *
 * @example
 * formatUSD(1234.56)
 * // Returns: '$1,234.56'
 */
export function formatUSD(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Validate Ethereum address
 *
 * @param address - Address to validate
 * @returns true if valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Class name merger utility (simple version)
 *
 * @param classes - Class names to merge
 * @returns Merged class string
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
