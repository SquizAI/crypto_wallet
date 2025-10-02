/**
 * Send Page
 *
 * Dedicated send transaction page with form integration.
 */

'use client';

import { useRouter } from 'next/navigation';
import { SendModal } from '@/components/modals/SendModal';

export default function SendPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <SendModal
        isOpen={true}
        onClose={() => router.push('/')}
      />
    </div>
  );
}
