'use client';

import AuctionMonitoring from '@/components/admin/pages/AuctionMonitoring';

export default function AdminMonitoringPage() {
  return (
    <AuctionMonitoring
      refreshSignal={0}
      onOpenComplaints={() => {
        window.location.href = '/admin/complaints';
      }}
    />
  );
}
