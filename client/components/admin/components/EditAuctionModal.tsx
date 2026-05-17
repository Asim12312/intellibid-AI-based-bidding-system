import { useEffect, useState, type FormEvent } from 'react';
import Modal from './Modal';
import { api, ApiException, type AuctionCard } from '../lib/api';

type Props = {
  open: boolean;
  auctionId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditAuctionModal({ open, auctionId, onClose, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [currentBid, setCurrentBid] = useState('');
  const [status, setStatus] = useState('live');
  const [companyName, setCompanyName] = useState('IntelliBid');
  const [hoursLeft, setHoursLeft] = useState('24');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open || !auctionId) return;
    setErr('');
    (async () => {
      try {
        const r = await api.auctionGet(auctionId);
        const a = r.data as AuctionCard & { startingBid?: number; endsAt?: string };
        setTitle(a.title || '');
        setCategory(a.category || '');
        setImageUrl(a.imageUrl || a.img || '');
        setStartingBid(String(a.startingBid ?? ''));
        setCurrentBid(String(a.currentBid ?? ''));
        setStatus(a.status || (a.isLive ? 'live' : 'ended'));
        setCompanyName(a.companyName || 'IntelliBid');
        if (a.endsAt) {
          const hrs = Math.max(1, Math.round((new Date(a.endsAt).getTime() - Date.now()) / 3600000));
          setHoursLeft(String(hrs));
        }
      } catch (e) {
        setErr(e instanceof ApiException ? e.message : 'Failed to load auction');
      }
    })();
  }, [open, auctionId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auctionId) return;
    setErr('');
    setBusy(true);
    try {
      const endsAt = new Date(Date.now() + (parseFloat(hoursLeft) || 24) * 3600000).toISOString();
      await api.auctionUpdate(auctionId, {
        title,
        category,
        imageUrl,
        startingBid: parseFloat(startingBid),
        currentBid: parseFloat(currentBid),
        status,
        endsAt,
        companyName,
      });
      onSaved();
      onClose();
    } catch (e) {
      setErr(e instanceof ApiException ? e.message : 'Failed to update');
    } finally {
      setBusy(false);
    }
  };

  const field = (label: string, child: React.ReactNode) => (
    <div>
      <label className="mb-1 block font-display text-[10px] font-black uppercase">{label}</label>
      {child}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Edit auction">
      <form onSubmit={submit} className="space-y-4">
        {err && <p className="text-sm font-bold text-[var(--destructive)]">{err}</p>}
        <p className="font-display text-xs font-black uppercase text-[var(--muted-foreground)]">
          Company: <span className="text-[var(--ink)]">{companyName}</span>
        </p>
        {field('Title', <input className="brutal w-full px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} required />)}
        {field('Category', <input className="brutal w-full px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)} required />)}
        {field('Image URL', <input className="brutal w-full px-3 py-2 text-sm" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} type="url" />)}
        <div className="grid grid-cols-2 gap-3">
          {field('Starting bid', <input className="brutal w-full px-3 py-2 text-sm" type="number" min="0" value={startingBid} onChange={(e) => setStartingBid(e.target.value)} />)}
          {field('Current bid', <input className="brutal w-full px-3 py-2 text-sm" type="number" min="0" value={currentBid} onChange={(e) => setCurrentBid(e.target.value)} />)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field('Status', (
            <select className="brutal w-full px-3 py-2 text-sm font-bold" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="live">Live</option>
              <option value="scheduled">Scheduled</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
          ))}
          {field('Ends in (hours)', <input className="brutal w-full px-3 py-2 text-sm" type="number" min="1" value={hoursLeft} onChange={(e) => setHoursLeft(e.target.value)} />)}
        </div>
        <button type="submit" disabled={busy} className="brutal w-full bg-[var(--hotpink)] py-3 font-display text-xs font-black uppercase text-white disabled:opacity-50">
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </Modal>
  );
}

function div({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
