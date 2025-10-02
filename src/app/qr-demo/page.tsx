/**
 * QR Code Demo Page
 *
 * Demonstration page for QR Scanner and QR Display components
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { QRScanner, QRDisplay } from '@/components/qr';
import { Alert } from '@/components/ui/Alert';

export default function QRDemoPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);

  // Example addresses for display
  const exampleAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  const handleScan = (address: string) => {
    setScannedAddress(address);
    setIsScannerOpen(false);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            QR Code Demo
          </h1>
          <p className="text-gray-400">
            Test the QR Scanner and QR Display components
          </p>
        </div>

        {/* QR Scanner Section */}
        <div className="glass-strong rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">QR Scanner</h2>
          <p className="text-gray-400 mb-4">
            Click the button below to open the camera and scan a QR code containing
            an Ethereum wallet address.
          </p>

          <Button onClick={() => setIsScannerOpen(true)} variant="primary">
            <svg
              className="w-5 h-5 mr-2"
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
            Open QR Scanner
          </Button>

          {scannedAddress && (
            <Alert variant="success" className="mt-4">
              <strong>Successfully Scanned:</strong>
              <p className="font-mono text-sm mt-2 break-all">
                {scannedAddress}
              </p>
            </Alert>
          )}
        </div>

        {/* QR Display Section */}
        <div className="glass-strong rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">QR Display</h2>
          <p className="text-gray-400 mb-4">
            Display a wallet address as a QR code. Users can copy the address or
            download the QR code as an image.
          </p>

          <div className="flex justify-center">
            <QRDisplay
              data={exampleAddress}
              size={256}
              showDownload={true}
              showCopy={true}
              label="Example Wallet Address"
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 font-mono break-all">
              {exampleAddress}
            </p>
          </div>
        </div>

        {/* Integration Examples */}
        <div className="glass-strong rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Integration Points
          </h2>

          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">
                1. Send Transaction
              </h3>
              <p className="text-sm">
                QR scanner integrated into the recipient address field. Click the
                QR icon next to the address input to scan.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                2. Receive Transaction
              </h3>
              <p className="text-sm">
                QR display shows your wallet address with copy and download
                buttons for easy sharing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                3. Address Book
              </h3>
              <p className="text-sm">
                QR scanner available when adding new addresses. Quickly add
                contacts by scanning their QR codes.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="glass-strong rounded-2xl p-6 mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Supported QR Formats
          </h2>

          <div className="space-y-3 text-gray-300 text-sm">
            <div>
              <code className="bg-black/30 px-2 py-1 rounded text-blue-400">
                0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
              </code>
              <p className="mt-1 text-gray-400">Plain Ethereum address</p>
            </div>

            <div>
              <code className="bg-black/30 px-2 py-1 rounded text-blue-400">
                ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
              </code>
              <p className="mt-1 text-gray-400">Ethereum URI scheme</p>
            </div>

            <div>
              <code className="bg-black/30 px-2 py-1 rounded text-blue-400 break-all">
                ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?value=1.5
              </code>
              <p className="mt-1 text-gray-400">
                Ethereum URI with parameters (address extracted)
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
        title="Scan Wallet Address"
      />
    </div>
  );
}
