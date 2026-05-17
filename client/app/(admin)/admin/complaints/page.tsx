'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Complaints from '@/components/admin/pages/Complaints';

function ComplaintsContent() {
  const searchParams = useSearchParams();
  const ticket = searchParams.get('ticket');

  return <Complaints focusTicketId={ticket} onConsumedFocus={() => {}} />;
}

export default function AdminComplaintsPage() {
  return (
    <Suspense fallback={<div className="p-8 font-mono uppercase text-sm">Loading complaints…</div>}>
      <ComplaintsContent />
    </Suspense>
  );
}
