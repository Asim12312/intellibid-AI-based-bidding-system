import { useState, type FormEvent } from 'react';
import Modal from './Modal';
import { api, ApiException } from '../lib/api';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function NewAuctionModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sneakers');
  const [imageUrl, setImageUrl] = useState('');
  const [startingBid, setStartingBid] = useState('1000');
  const [hours, setHours] = useState('24');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const endsAt = new Date(Date.now() + (parseFloat(hours) || 24) * 3600000).toISOString();
      await api.auctionCreate({
        title,
        category,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
        startingBid: parseFloat(startingBid),
        currentBid: parseFloat(startingBid),
        endsAt,
        status: 'live',
      });
      setTitle('');
      setImageUrl('');
      onCreated();
      onClose();
    } catch (e) {
      setErr(e instanceof ApiException ? e.message : 'Failed to create');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New auction">
      <form onSubmit={submit} className="space-y-4 font-sans">
        {err && <p className="text-[var(--destructive)] text-sm font-bold">{err}</p>}
        <p className="font-display text-xs font-black uppercase text-[var(--muted-foreground)]">
          Listed under company: <span className="text-[var(--ink)]">IntelliBid</span>
        </p>
        <div>
          <label className="font-mono text-[10px] uppercase font-black block mb-1">Title</label>
          <input className="w-full border-[3px] border-[var(--ink)] px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase font-black block mb-1">Category</label>
          <input className="w-full border-[3px] border-[var(--ink)] px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase font-black block mb-1">Image URL</label>
          <input className="w-full border-[3px] border-[var(--ink)] px-3 py-2 text-sm" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." type="url" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase font-black block mb-1">Starting bid (USD)</label>
            <input className="w-full border-[3px] border-[var(--ink)] px-3 py-2 text-sm" type="number" min="1" step="1" value={startingBid} onChange={(e) => setStartingBid(e.target.value)} required />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase font-black block mb-1">Duration (hours)</label>
            <input className="w-full border-[3px] border-[var(--ink)] px-3 py-2 text-sm" type="number" min="1" value={hours} onChange={(e) => setHours(e.target.value)} required />
          </div>
        </div>
        <button type="submit" disabled={busy} className="w-full bg-[var(--electric)] text-white brutal py-3 font-mono text-xs font-black uppercase active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50">
          {busy ? 'Creating…' : 'Create auction'}
        </button>
      </form>
    </Modal>
  );
}
