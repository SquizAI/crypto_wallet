/**
 * Export Button Component
 *
 * Exports analytics data to CSV or PDF format
 */

'use client';

import { useState } from 'react';
import type {
  ExportFormat,
  PortfolioMetrics,
  AssetAllocation,
  TransactionVolume,
  PortfolioSnapshot,
} from '@/types/analytics';
import { stringify } from 'csv-stringify/sync';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportButtonProps {
  /**
   * Portfolio metrics
   */
  metrics: PortfolioMetrics;

  /**
   * Asset allocation data
   */
  allocation: AssetAllocation[];

  /**
   * Transaction volumes
   */
  volumes: TransactionVolume[];

  /**
   * Historical snapshots (optional)
   */
  snapshots?: PortfolioSnapshot[];
}

export function ExportButton({
  metrics,
  allocation,
  volumes,
  snapshots = [],
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  /**
   * Export to CSV
   */
  const exportToCSV = () => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      // Prepare CSV data
      const data: any[] = [];

      // Metrics section
      data.push(['Portfolio Analytics Report']);
      data.push(['Generated:', new Date().toISOString()]);
      data.push([]);

      data.push(['Portfolio Metrics']);
      data.push(['Current Value', `$${metrics.currentValue.toFixed(2)}`]);
      data.push([
        '24h Change',
        `$${metrics.change24h.absolute.toFixed(2)} (${metrics.change24h.percentage.toFixed(2)}%)`,
      ]);
      data.push([
        '7d Change',
        `$${metrics.change7d.absolute.toFixed(2)} (${metrics.change7d.percentage.toFixed(2)}%)`,
      ]);
      data.push([
        '30d Change',
        `$${metrics.change30d.absolute.toFixed(2)} (${metrics.change30d.percentage.toFixed(2)}%)`,
      ]);
      data.push(['Total Transactions', metrics.totalTransactions]);
      data.push([
        'Average Transaction Size',
        `$${metrics.averageTransactionSize.toFixed(2)}`,
      ]);
      data.push(['Most Used Token', metrics.mostUsedToken || 'N/A']);
      data.push(['Total Sent', `$${metrics.totalSent.toFixed(2)}`]);
      data.push(['Total Received', `$${metrics.totalReceived.toFixed(2)}`]);
      data.push(['Net Flow', `$${metrics.netFlow.toFixed(2)}`]);
      data.push([]);

      // Asset allocation section
      data.push(['Asset Allocation']);
      data.push(['Token', 'Balance', 'USD Value', 'Percentage', 'Price']);
      allocation.forEach((asset) => {
        data.push([
          asset.token,
          asset.balance,
          `$${asset.usdValue.toFixed(2)}`,
          `${asset.percentage.toFixed(2)}%`,
          `$${asset.tokenPrice.toFixed(6)}`,
        ]);
      });
      data.push([]);

      // Transaction volumes section
      data.push(['Transaction Volumes']);
      data.push([
        'Token',
        'Send Count',
        'Receive Count',
        'Send Volume',
        'Receive Volume',
        'Send USD',
        'Receive USD',
      ]);
      volumes.forEach((vol) => {
        data.push([
          vol.token,
          vol.sendCount,
          vol.receiveCount,
          vol.sendVolume,
          vol.receiveVolume,
          `$${vol.sendVolumeUSD.toFixed(2)}`,
          `$${vol.receiveVolumeUSD.toFixed(2)}`,
        ]);
      });

      // Convert to CSV
      const csv = stringify(data);

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export to PDF
   */
  const exportToPDF = () => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text('Portfolio Analytics Report', 14, 22);

      // Date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

      let yPos = 40;

      // Portfolio Metrics
      doc.setFontSize(14);
      doc.text('Portfolio Metrics', 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Current Value', `$${metrics.currentValue.toFixed(2)}`],
          [
            '24h Change',
            `$${metrics.change24h.absolute.toFixed(2)} (${metrics.change24h.percentage.toFixed(2)}%)`,
          ],
          [
            '7d Change',
            `$${metrics.change7d.absolute.toFixed(2)} (${metrics.change7d.percentage.toFixed(2)}%)`,
          ],
          [
            '30d Change',
            `$${metrics.change30d.absolute.toFixed(2)} (${metrics.change30d.percentage.toFixed(2)}%)`,
          ],
          ['Total Transactions', metrics.totalTransactions.toString()],
          [
            'Average Transaction',
            `$${metrics.averageTransactionSize.toFixed(2)}`,
          ],
          ['Most Used Token', metrics.mostUsedToken || 'N/A'],
          ['Total Sent', `$${metrics.totalSent.toFixed(2)}`],
          ['Total Received', `$${metrics.totalReceived.toFixed(2)}`],
          ['Net Flow', `$${metrics.netFlow.toFixed(2)}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
      });

      // Asset Allocation
      yPos = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Asset Allocation', 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['Token', 'Balance', 'USD Value', 'Share']],
        body: allocation.map((asset) => [
          asset.token,
          parseFloat(asset.balance).toFixed(6),
          `$${asset.usdValue.toFixed(2)}`,
          `${asset.percentage.toFixed(2)}%`,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
      });

      // Transaction Volumes
      yPos = (doc as any).lastAutoTable.finalY + 15;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text('Transaction Volumes', 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['Token', 'Sent', 'Received', 'Send USD', 'Receive USD']],
        body: volumes.map((vol) => [
          vol.token,
          `${vol.sendCount} txs`,
          `${vol.receiveCount} txs`,
          `$${vol.sendVolumeUSD.toFixed(2)}`,
          `$${vol.receiveVolumeUSD.toFixed(2)}`,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
      });

      // Save PDF
      doc.save(
        `portfolio-analytics-${new Date().toISOString().split('T')[0]}.pdf`
      );
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="
          flex items-center gap-2 px-4 py-2 rounded-xl
          bg-gradient-to-r from-blue-500 to-cyan-500
          text-white font-medium
          hover:shadow-lg hover:shadow-blue-500/25
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {isExporting ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Export</span>
          </>
        )}
      </button>

      {/* Export Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 z-50 glass-strong rounded-xl border border-white/10 shadow-xl overflow-hidden">
            <button
              onClick={exportToCSV}
              className="
                w-full flex items-center gap-3 px-4 py-3
                text-white hover:bg-white/10
                transition-colors duration-200
              "
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium">Export as CSV</span>
            </button>
            <button
              onClick={exportToPDF}
              className="
                w-full flex items-center gap-3 px-4 py-3
                text-white hover:bg-white/10
                transition-colors duration-200
              "
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">Export as PDF</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
