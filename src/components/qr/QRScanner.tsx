/**
 * QR Scanner Component
 *
 * Modal-based QR code scanner for scanning wallet addresses.
 * Supports both mobile and desktop cameras with proper permissions handling.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { isAddress } from 'ethers';

export interface QRScannerProps {
  /**
   * Whether the scanner modal is open
   */
  isOpen: boolean;

  /**
   * Called when scanner should close
   */
  onClose: () => void;

  /**
   * Called when a valid address is scanned
   */
  onScan: (address: string) => void;

  /**
   * Optional title for the modal
   */
  title?: string;
}

type ScannerState = 'initializing' | 'ready' | 'scanning' | 'error' | 'success';

/**
 * Extract Ethereum address from scanned QR data
 * Supports various formats:
 * - Plain address: 0x1234...
 * - Ethereum URI: ethereum:0x1234...
 * - With parameters: ethereum:0x1234?value=1.5
 */
function extractAddress(qrData: string): string | null {
  // Remove whitespace
  const cleaned = qrData.trim();

  // Check for ethereum: URI scheme
  if (cleaned.toLowerCase().startsWith('ethereum:')) {
    const withoutScheme = cleaned.substring(9); // Remove 'ethereum:'
    const addressPart = withoutScheme.split('?')[0]; // Remove query params
    const address = addressPart.split('@')[0]; // Remove chain ID if present

    if (isAddress(address)) {
      return address;
    }
  }

  // Check for plain address
  if (isAddress(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * QR Scanner Component
 */
export function QRScanner({
  isOpen,
  onClose,
  onScan,
  title = 'Scan QR Code',
}: QRScannerProps) {
  const [state, setState] = useState<ScannerState>('initializing');
  const [error, setError] = useState<string | null>(null);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = 'qr-reader-region';

  // Initialize scanner when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Cleanup scanner when modal closes
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          })
          .catch((err) => {
            console.error('Error stopping scanner:', err);
          });
      }
      // Reset state
      setState('initializing');
      setError(null);
      setScannedAddress(null);
      return;
    }

    // Initialize scanner
    const initScanner = async () => {
      try {
        setState('initializing');
        setError(null);

        // Create scanner instance
        const scanner = new Html5Qrcode(qrRegionId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });

        scannerRef.current = scanner;

        // Get camera devices
        const devices = await Html5Qrcode.getCameras();

        if (!devices || devices.length === 0) {
          throw new Error('No camera found on this device');
        }

        // Prefer back camera on mobile
        const backCamera = devices.find((device) =>
          device.label.toLowerCase().includes('back')
        );
        const cameraId = backCamera?.id || devices[0].id;

        // Start scanning
        await scanner.start(
          cameraId,
          {
            fps: 10, // Scan 10 frames per second
            qrbox: { width: 250, height: 250 }, // Scanning box size
            aspectRatio: 1.0,
          },
          // Success callback
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          // Error callback (ignore - fires for every frame without QR)
          () => {}
        );

        setState('scanning');
      } catch (err) {
        console.error('Scanner initialization error:', err);
        let errorMessage = 'Failed to initialize camera';

        if (err instanceof Error) {
          if (err.message.includes('Permission')) {
            errorMessage = 'Camera permission denied. Please enable camera access in your browser settings.';
          } else if (err.message.includes('NotFoundError')) {
            errorMessage = 'No camera found on this device.';
          } else if (err.message.includes('NotAllowedError')) {
            errorMessage = 'Camera access blocked. Please allow camera access and try again.';
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        setState('error');
      }
    };

    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(initScanner, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Handle successful scan
  const handleScanSuccess = async (decodedText: string) => {
    // Extract address from QR data
    const address = extractAddress(decodedText);

    if (!address) {
      setError('Invalid QR code. Please scan a valid Ethereum address.');
      return;
    }

    // Stop scanner
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }

    // Update state
    setScannedAddress(address);
    setState('success');

    // Call onScan callback after a brief delay to show success state
    setTimeout(() => {
      onScan(address);
      onClose();
    }, 1000);
  };

  // Handle manual close
  const handleClose = async () => {
    if (scannerRef.current && state === 'scanning') {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    onClose();
  };

  // Render scanner content based on state
  const renderContent = () => {
    switch (state) {
      case 'initializing':
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Initializing Camera
            </h3>
            <p className="text-gray-400 text-sm">Please wait...</p>
          </div>
        );

      case 'scanning':
        return (
          <div className="space-y-4">
            <Alert variant="info" className="text-sm">
              Position the QR code within the frame to scan
            </Alert>

            {/* QR Scanner Container */}
            <div className="relative rounded-2xl overflow-hidden bg-black">
              <div id={qrRegionId} className="w-full" />

              {/* Overlay with targeting guides */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner guides */}
                <div className="absolute top-1/4 left-1/4 w-8 h-8 border-t-4 border-l-4 border-blue-500" />
                <div className="absolute top-1/4 right-1/4 w-8 h-8 border-t-4 border-r-4 border-blue-500" />
                <div className="absolute bottom-1/4 left-1/4 w-8 h-8 border-b-4 border-l-4 border-blue-500" />
                <div className="absolute bottom-1/4 right-1/4 w-8 h-8 border-b-4 border-r-4 border-blue-500" />
              </div>
            </div>

            <p className="text-center text-gray-400 text-sm">
              Scanning for QR code...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
              <svg
                className="w-8 h-8 text-green-500"
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
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Address Scanned Successfully!
            </h3>
            {scannedAddress && (
              <p className="text-gray-400 text-sm font-mono break-all px-4">
                {scannedAddress}
              </p>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4">
            <Alert variant="error">{error}</Alert>

            <div className="text-center py-4">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-white mb-2">
                Camera Access Required
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Please enable camera access in your browser settings to use the QR scanner.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      closeOnBackdropClick={state !== 'scanning'}
    >
      {renderContent()}

      {(state === 'error' || state === 'scanning') && (
        <ModalFooter>
          <Button variant="secondary" onClick={handleClose} className="w-full">
            {state === 'error' ? 'Close' : 'Cancel'}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
}
