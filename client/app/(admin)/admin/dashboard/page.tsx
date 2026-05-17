'use client';

import Overview from '@/components/admin/pages/Overview';

export default function AdminDashboardPage() {
  return (
    <Overview
      refreshSignal={0}
      onViewAllAuctions={() => {
        window.location.href = '/admin/monitoring';
      }}
      onOpenExports={() => {}}
    />
  );
}
