import { useState } from 'react';
import Modal from './Modal';
import { api, ApiException } from '../lib/api';

export default function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [message, setMessage] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setMessage(null);
    try {
      await fn();
      setMessage('Download started.');
    } catch (e) {
      setMessage(e instanceof ApiException ? e.message : 'Failed');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-4 font-mono text-xs">
        <p className="text-[var(--muted-foreground)] leading-relaxed font-sans text-sm">
          Data exports use your current admin session. Ensure the backend is running.
        </p>
        {message && <p className="font-bold text-[var(--hotpink)]">{message}</p>}
        <div className="grid gap-2">
          <button type="button" className="brutal py-3 bg-[var(--muted)] uppercase font-black active:translate-x-1 active:translate-y-1 active:shadow-none" onClick={() => run(() => api.downloadExport('users'))}>
            Export users (CSV)
          </button>
          <button type="button" className="brutal py-3 bg-[var(--muted)] uppercase font-black active:translate-x-1 active:translate-y-1 active:shadow-none" onClick={() => run(() => api.downloadExport('auctions'))}>
            Export auctions (CSV)
          </button>
          <button type="button" className="brutal py-3 bg-[var(--muted)] uppercase font-black active:translate-x-1 active:translate-y-1 active:shadow-none" onClick={() => run(() => api.downloadExport('tickets'))}>
            Export tickets (CSV)
          </button>
        </div>
        <p className="text-[10px] text-[var(--muted-foreground)] uppercase">
          API base: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}
        </p>
      </div>
    </Modal>
  );
}
