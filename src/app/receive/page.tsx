/**
 * Receive Page
 *
 * Dedicated receive page with QR code and address display.
 */

'use client';

import { useRouter } from 'next/navigation';
import { ReceiveModal } from '@/components/modals/ReceiveModal';

export default function ReceivePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <ReceiveModal
        isOpen={true}
        onClose={() => router.push('/')}
      />
    </div>
  );
}
