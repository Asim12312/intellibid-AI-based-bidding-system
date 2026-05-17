'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import TopNavBar from './components/TopNavBar';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import NewAuctionModal from './components/NewAuctionModal';
import { useAdminAuth } from './context/AuthContext';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { admin, loading, logout } = useAdminAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newAuctionOpen, setNewAuctionOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-display text-sm font-black uppercase">
        Loading admin…
      </div>
    );
  }

  if (!admin) {
    if (typeof window !== 'undefined') router.replace('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar onNewAuction={() => setNewAuctionOpen(true)} />

      <div className="flex min-h-screen flex-1 flex-col md:ml-20">
        <TopNavBar
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          onNavigate={(tab) => {
            const paths: Record<string, string> = {
              dashboard: '/admin/dashboard',
              users: '/admin/users',
              complaints: '/admin/complaints',
              monitoring: '/admin/monitoring',
            };
            const path = paths[tab];
            if (path) router.push(path);
          }}
          onPickTicket={(id) => router.push(`/admin/complaints?ticket=${id}`)}
          onLogout={logout}
        />

        <main className="flex-1 px-4 pb-10 pt-2 md:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} admin={admin} />
      <NewAuctionModal
        open={newAuctionOpen}
        onClose={() => setNewAuctionOpen(false)}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}
