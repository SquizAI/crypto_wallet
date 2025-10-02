/**
 * QR Display Component
 *
 * Display wallet address as a QR code with download and copy functionality.
 * Used in the Receive modal and other places where addresses need to be shared.
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';

export interface QRDisplayProps {
  /**
   * The data to encode in the QR code (typically an Ethereum address)
   */
  data: string;

  /**
   * Size of the QR code in pixels
   * @default 256
   */
  size?: number;

  /**
   * Whether to show download button
   * @default true
   */
  showDownload?: boolean;

  /**
   * Whether to show copy button
   * @default true
   */
  showCopy?: boolean;

  /**
   * Optional label for the QR code (shown on download)
   * @default "Wallet Address"
   */
  label?: string;

  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * QR Display Component
 */
export function QRDisplay({
  data,
  size = 256,
  showDownload = true,
  showCopy = true,
  label = 'Wallet Address',
  className = '',
}: QRDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code
  useEffect(() => {
    if (data) {
      // Generate data URL for display
      QRCode.toDataURL(data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then(setQrCodeUrl)
        .catch((err) => console.error('Failed to generate QR code:', err));

      // Generate canvas for download (higher quality)
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          data,
          {
            width: size * 2, // Higher resolution for download
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'H', // Highest error correction for downloads
          },
          (err) => {
            if (err) console.error('Failed to generate QR canvas:', err);
          }
        );
      }
    }
  }, [data, size]);

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Handle download QR code
  const handleDownload = async () => {
    if (!canvasRef.current) return;

    try {
      setDownloading(true);

      // Convert canvas to blob
      canvasRef.current.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          setDownloading(false);
          return;
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${label.toLowerCase().replace(/\s+/g, '-')}-qr-code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 'image/png');
    } catch (err) {
      console.error('Failed to download QR code:', err);
      setDownloading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* QR Code Display */}
      <div className="relative">
        {qrCodeUrl && (
          <div className="p-4 rounded-2xl bg-white inline-block shadow-lg">
            <img
              src={qrCodeUrl}
              alt={`QR Code for ${label}`}
              className="block"
              style={{ width: size, height: size }}
            />
          </div>
        )}

        {/* Hidden canvas for high-quality download */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      </div>

      {/* Action Buttons */}
      {(showDownload || showCopy) && (
        <div className="flex gap-2 mt-4">
          {showCopy && (
            <Button
              variant={copied ? 'success' : 'secondary'}
              onClick={handleCopy}
              className="flex items-center gap-2"
              size="sm"
            >
              {copied ? (
                <>
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
                  Copied!
                </>
              ) : (
                <>
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
                  Copy Address
                </>
              )}
            </Button>
          )}

          {showDownload && (
            <Button
              variant="secondary"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2"
              size="sm"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download QR
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
