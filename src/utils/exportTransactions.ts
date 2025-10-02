/**
 * Transaction Export Utilities
 *
 * Export transaction history to CSV and PDF formats for accounting/tax purposes
 *
 * Features:
 * - CSV export with all transaction details
 * - PDF export with professional branding
 * - Formatted dates and amounts
 * - Clickable transaction hashes (URLs)
 */

import { stringify } from 'csv-stringify/browser/esm/sync';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction } from '@/types/wallet';
import { formatUnits } from 'ethers';

/**
 * Extended jsPDF type with autoTable method
 */
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
  lastAutoTable?: {
    finalY: number;
  };
}

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp: string | number | null): string {
  if (!timestamp) return 'Pending';

  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Format amount with token decimals
 */
function formatAmount(value: string, decimals: number): string {
  try {
    return formatUnits(value, decimals);
  } catch {
    return value;
  }
}

/**
 * Get Etherscan URL for transaction
 */
function getEtherscanUrl(hash: string): string {
  const network = process.env.NEXT_PUBLIC_NETWORK;
  const baseUrl = network === 'sepolia'
    ? 'https://sepolia.etherscan.io'
    : 'https://etherscan.io';
  return `${baseUrl}/tx/${hash}`;
}

/**
 * Shorten address for display
 */
function shortenAddress(address: string | null): string {
  if (!address) return 'N/A';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Export transactions to CSV
 *
 * @param transactions - Array of transactions to export
 * @returns CSV content as string
 */
export function exportToCSV(transactions: Transaction[]): string {
  // Prepare data rows
  const rows = transactions.map((tx) => ({
    Date: formatDate(tx.timestamp),
    Type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
    Token: tx.tokenSymbol,
    Amount: formatAmount(tx.value, tx.tokenDecimals),
    From: tx.from,
    To: tx.to || 'N/A',
    Hash: tx.hash,
    'Etherscan URL': getEtherscanUrl(tx.hash),
    Status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
    'Block Number': tx.blockNumber?.toString() || 'Pending',
    'Gas Used': tx.gasUsed || 'N/A',
    'Gas Price (Gwei)': tx.gasPrice
      ? formatUnits(tx.gasPrice, 9)
      : 'N/A',
    'Chain ID': tx.chainId.toString(),
    Error: tx.error || '',
  }));

  // Generate CSV
  const csv = stringify(rows, {
    header: true,
    columns: [
      'Date',
      'Type',
      'Token',
      'Amount',
      'From',
      'To',
      'Hash',
      'Etherscan URL',
      'Status',
      'Block Number',
      'Gas Used',
      'Gas Price (Gwei)',
      'Chain ID',
      'Error',
    ],
  });

  return csv;
}

/**
 * Download CSV file
 *
 * @param transactions - Array of transactions to export
 * @param filename - Optional filename (default: transactions_TIMESTAMP.csv)
 */
export function downloadCSV(
  transactions: Transaction[],
  filename?: string
): void {
  const csv = exportToCSV(transactions);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename || `transactions_${Date.now()}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export transactions to PDF
 *
 * @param transactions - Array of transactions to export
 * @param walletAddress - User's wallet address
 * @returns PDF document as jsPDF instance
 */
export function exportToPDF(
  transactions: Transaction[],
  walletAddress: string
): jsPDF {
  // Create PDF document
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  }) as jsPDFWithAutoTable;

  // Add branding header
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction History', pageWidth / 2, 15, { align: 'center' });

  // Wallet info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Wallet Address: ${walletAddress}`, 14, 25);
  doc.text(`Export Date: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Total Transactions: ${transactions.length}`, 14, 35);

  // Network info
  const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';
  doc.text(`Network: ${network.charAt(0).toUpperCase() + network.slice(1)}`, pageWidth - 14, 25, { align: 'right' });

  // Separator line
  doc.setLineWidth(0.5);
  doc.line(14, 38, pageWidth - 14, 38);

  // Prepare table data
  const tableData = transactions.map((tx) => [
    formatDate(tx.timestamp),
    tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
    tx.tokenSymbol,
    formatAmount(tx.value, tx.tokenDecimals),
    shortenAddress(tx.type === 'send' ? tx.to : tx.from),
    tx.hash.slice(0, 10) + '...',
    tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
    tx.gasUsed ? parseInt(tx.gasUsed).toLocaleString() : 'N/A',
  ]);

  // Add table
  autoTable(doc, {
    startY: 42,
    head: [['Date', 'Type', 'Token', 'Amount', 'From/To', 'Hash', 'Status', 'Gas']],
    body: tableData,
    theme: 'striped',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 35 }, // Date
      1: { cellWidth: 20, halign: 'center' }, // Type
      2: { cellWidth: 20, halign: 'center' }, // Token
      3: { cellWidth: 30, halign: 'right' }, // Amount
      4: { cellWidth: 30 }, // From/To
      5: { cellWidth: 35 }, // Hash
      6: { cellWidth: 25, halign: 'center' }, // Status
      7: { cellWidth: 25, halign: 'right' }, // Gas
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;

      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Footer branding
      doc.text(
        'Generated by Stablecoin Wallet',
        pageWidth - 14,
        pageHeight - 10,
        { align: 'right' }
      );
    },
  });

  return doc;
}

/**
 * Download PDF file
 *
 * @param transactions - Array of transactions to export
 * @param walletAddress - User's wallet address
 * @param filename - Optional filename (default: transactions_TIMESTAMP.pdf)
 */
export function downloadPDF(
  transactions: Transaction[],
  walletAddress: string,
  filename?: string
): void {
  const doc = exportToPDF(transactions, walletAddress);
  doc.save(filename || `transactions_${Date.now()}.pdf`);
}

/**
 * Get export statistics
 *
 * @param transactions - Array of transactions
 * @returns Export statistics
 */
export function getExportStats(transactions: Transaction[]): {
  total: number;
  confirmed: number;
  pending: number;
  failed: number;
  sent: number;
  received: number;
  tokens: Record<string, number>;
} {
  const stats = {
    total: transactions.length,
    confirmed: 0,
    pending: 0,
    failed: 0,
    sent: 0,
    received: 0,
    tokens: {} as Record<string, number>,
  };

  transactions.forEach((tx) => {
    // Status counts
    if (tx.status === 'confirmed') stats.confirmed++;
    if (tx.status === 'pending') stats.pending++;
    if (tx.status === 'failed') stats.failed++;

    // Type counts
    if (tx.type === 'send') stats.sent++;
    if (tx.type === 'receive') stats.received++;

    // Token counts
    stats.tokens[tx.tokenSymbol] = (stats.tokens[tx.tokenSymbol] || 0) + 1;
  });

  return stats;
}
