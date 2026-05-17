import { useCallback, useEffect, useMemo, useState, Fragment, type MouseEvent } from 'react';
import { TrendingUp, AlertTriangle, Play, Zap, MessageSquare, Pencil } from 'lucide-react';
import { api, ApiException, type AuctionCard } from '../lib/api';
import { resolveAuctionTheme } from '../lib/theme';
import { useSocket } from '../hooks/useSocket';
import EditAuctionModal from '../components/EditAuctionModal';

const FILTERS: { label: string; id: string }[] = [
  { label: 'All Auctions', id: 'all' },
  { label: 'High Value', id: 'highValue' },
  { label: 'Closing Soon', id: 'closingSoon' },
  { label: 'AI Flagged', id: 'aiFlagged' },
];

export default function AuctionMonitoring({
  refreshSignal,
  onOpenComplaints,
}: {
  refreshSignal: number;
  onOpenComplaints: () => void;
}) {
  const { monitoring: live } = useSocket(true);
  const [filter, setFilter] = useState('all');
  const [remote, setRemote] = useState({
    activeLots: 0,
    totalVolumeFormatted: '',
    totalVolumeTrend: '',
    activeLotsTrend: '',
    aiFlagsCount: 0,
    biddersOnline: 0,
  });
  const [auctions, setAuctions] = useState<AuctionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [liveRes, auct] = await Promise.all([
        api.monitoringLive(),
        api.auctionsList({ filter, limit: 60, page: 1 }),
      ]);
      setRemote(liveRes.data);
      setAuctions(auct.data);
    } catch (e) {
      const msg = e instanceof ApiException ? e.message : e instanceof Error ? e.message : 'Failed to load monitoring';
      setErr(msg.includes('401') || msg.toLowerCase().includes('token') ? 'Session expired — please sign in again.' : msg);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load, refreshSignal]);

  useEffect(() => {
    if (!live) return;
    setRemote((r) => ({
      ...r,
      ...(typeof live.activeLots === 'number' ? { activeLots: live.activeLots as number } : {}),
      ...(typeof live.biddersOnline === 'number' ? { biddersOnline: live.biddersOnline as number } : {}),
      ...(typeof live.aiFlagsCount === 'number' ? { aiFlagsCount: live.aiFlagsCount as number } : {}),
      ...(typeof live.totalVolumeFormatted === 'string' ? { totalVolumeFormatted: live.totalVolumeFormatted as string } : {}),
    }));
  }, [live]);

  const stats = useMemo(() => remote, [remote]);

  const reviewAnomalies = () => setFilter('aiFlagged');

  const clearFlag = async (id: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await api.auctionClearFlag(id);
      await load();
    } catch (ex) {
      setErr(ex instanceof ApiException ? ex.message : 'Clear flag failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {err && <div className="bg-[var(--destructive)]/10 brutal px-4 py-3 font-mono text-sm text-[var(--destructive)] font-bold">{err}</div>}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[var(--hotpink)] text-white px-4 py-1 brutal shadow-[4px_4px_0_0_var(--ink)] mb-6 font-mono text-xs font-black tracking-widest">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {stats.biddersOnline.toLocaleString()} BIDDERS ONLINE
          </div>
          <h1 className="font-display text-5xl uppercase font-black leading-[0.9] mb-4 tracking-tighter">
            Auction <span className="text-[var(--electric)] italic">Monitoring</span>
            <br />
            <span className="text-outline">Real-Time Control</span>
          </h1>
          <p className="font-sans text-[var(--muted-foreground)] max-w-lg font-medium leading-relaxed">
            IntelliBid is the AI-powered auction playground where machine intelligence meets human hustle. 3D previews, real-time bids, instant payouts — zero gatekeeping.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <div className="brutal brutal-surface shadow-[var(--shadow-brutal)] bg-white p-5 flex items-center gap-4 active:translate-x-1 active:translate-y-1 active:shadow-none">
            <Zap className="w-6 h-6 text-[var(--hotpink)]" />
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-tight">Live feed</p>
              <p className="text-[10px] text-[var(--muted-foreground)] font-bold">Socket.IO metrics when connected</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Active Lots" val={stats.activeLots ? stats.activeLots.toLocaleString() : '—'} trend={stats.activeLotsTrend || '+0%'} color="bg-[var(--acid)]" />
        <StatCard label="Total Volume" val={stats.totalVolumeFormatted || '—'} trend={stats.totalVolumeTrend || ''} color="bg-[var(--sunset)] text-white" accent="text-white" />
        <div className="md:col-span-2 bg-[var(--electric)] text-white brutal shadow-[var(--shadow-brutal)] p-6 relative overflow-hidden flex justify-between items-center group">
          <div className="z-10">
            <p className="font-mono text-[10px] uppercase font-black tracking-[0.2em] mb-2 text-white/70">AI Flags Raised</p>
            <p className="font-display text-3xl font-black uppercase">{stats.aiFlagsCount || 0} High Risk</p>
            <button type="button" onClick={reviewAnomalies} className="mt-6 bg-white text-[var(--ink)] px-6 py-2 brutal shadow-[4px_4px_0_0_var(--ink)] font-mono text-[10px] font-black uppercase active:translate-x-1 active:translate-y-1 active:shadow-none">
              Review Anomalies
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-20 rotate-12 group-hover:rotate-45 transition-transform duration-700">
            <TrendingUp className="w-48 h-48" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-4">
        {FILTERS.map((f) => (
          <Fragment key={f.id}>
            <FilterButton label={f.label} active={filter === f.id} onClick={() => setFilter(f.id)} />
          </Fragment>
        ))}
      </div>

      {loading ? (
        <p className="font-mono text-xs uppercase p-8">Loading auctions…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {auctions.map((lot) => (
            <Fragment key={lot.id}>
              <AuctionCardView lot={lot} onClearFlag={clearFlag} onEdit={() => setEditId(lot.id)} />
            </Fragment>
          ))}
        </div>
      )}

      <EditAuctionModal
        open={Boolean(editId)}
        auctionId={editId}
        onClose={() => setEditId(null)}
        onSaved={load}
      />

      <div className="fixed bottom-8 right-8 z-50">
        <button type="button" onClick={onOpenComplaints} className="w-16 h-16 bg-[var(--hotpink)] text-white rounded-full brutal shadow-[var(--shadow-brutal)] flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none group" aria-label="Open complaints">
          <MessageSquare className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, val, trend, color, accent = 'text-[var(--ink)]' }: { label: string; val: string; trend: string; color: string; accent?: string }) {
  return (
    <div className={`brutal shadow-[var(--shadow-brutal)] p-6 ${color}`}>
      <p className="font-mono text-[10px] uppercase font-black mb-1 opacity-70 tracking-widest">{label}</p>
      <p className="font-display text-3xl font-black">{val}</p>
      <div className={`mt-4 flex items-center ${accent} font-black font-mono text-xs`}>
        <TrendingUp className="w-4 h-4 mr-1" />
        <span>{trend}</span>
      </div>
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'bg-[var(--ink)] text-white px-8 py-3 brutal shadow-[4px_4px_0_0_var(--ink)] font-mono text-xs font-black uppercase tracking-widest'
          : 'bg-white text-[var(--muted-foreground)] px-8 py-3 brutal shadow-[4px_4px_0_0_var(--ink)] font-mono text-xs font-black uppercase tracking-widest hover:bg-[var(--muted)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none'
      }
    >
      {label}
    </button>
  );
}

function AuctionCardView({
  lot,
  onClearFlag,
  onEdit,
}: {
  lot: AuctionCard;
  onClearFlag: (id: string, e: MouseEvent<HTMLButtonElement>) => void;
  onEdit: () => void;
}) {
  return (
    <div className="group brutal-surface bg-white brutal shadow-[var(--shadow-brutal)] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <div className={`relative h-72 overflow-hidden border-b-[3px] border-[var(--ink)] ${resolveAuctionTheme(lot.color)}`}>
        {lot.isAiPick && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <span className="font-display text-7xl text-outline rotate-[-12deg] tracking-tighter">RARE ART</span>
          </div>
        )}
        <img src={lot.img} alt={lot.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${lot.isAiPick ? 'opacity-90 grayscale-[0.2]' : ''}`} />

        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
          {lot.isLive && (
            <div className="bg-[var(--ink)] text-white px-3 py-1.5 brutal flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[var(--hotpink)] rounded-full animate-pulse" />
              <span className="font-mono text-[9px] font-black uppercase tracking-widest">Live</span>
            </div>
          )}
          {lot.isFlagged && (
            <div className="bg-[var(--hotpink)] text-white px-3 py-1.5 brutal flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 fill-white text-[var(--hotpink)]" />
              <span className="font-mono text-[9px] font-black uppercase tracking-widest">AI FLAG</span>
            </div>
          )}
          {lot.isAiPick && (
            <div className="bg-[var(--electric)] text-white px-3 py-1.5 brutal flex items-center gap-2">
              <Zap className="w-3 h-3 fill-white text-primary" />
              <span className="font-mono text-[9px] font-black uppercase tracking-widest">AI PICK</span>
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 bg-[var(--acid)] text-[var(--ink)] px-3 py-1.5 brutal flex items-center gap-2">
          <Play className="w-3 h-3" />
          <span className="font-mono text-[9px] font-black uppercase tracking-widest">{lot.time}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <p className="font-mono text-[10px] uppercase font-black text-[var(--muted-foreground)] tracking-[0.2em] italic mb-2">
            {lot.category} • Lot {lot.lotId}
            {lot.companyName ? ` • ${lot.companyName}` : ''}
          </p>
          <h3 className="font-display text-xl uppercase font-black leading-tight tracking-tight">{lot.title}</h3>
        </div>

        <div className="flex justify-between items-end gap-2 flex-wrap">
          <div className="space-y-1 min-w-0">
            <p className="font-mono text-[9px] uppercase font-black text-[var(--muted-foreground)]/70 tracking-widest">Top Bid</p>
            <p className="font-display text-3xl font-black leading-none">{lot.bid}</p>
            {lot.user && <p className="text-[10px] text-[var(--muted-foreground)] font-bold italic mt-2">By {lot.user}</p>}
            {lot.value && <p className="text-[10px] text-[var(--electric)] font-black uppercase mt-2">Est. Value: {lot.value}</p>}
            {lot.isFlagged && <p className="text-[10px] text-[var(--destructive)] font-black uppercase mt-2 italic">Suspicious Activity</p>}
            {lot.isFlagged && (
              <button type="button" onClick={(e) => onClearFlag(lot.id, e)} className="mt-2 font-mono text-[9px] uppercase underline font-black text-[var(--electric)]">
                Clear AI flag
              </button>
            )}
            <button
              type="button"
              onClick={onEdit}
              className="mt-3 flex items-center gap-1 font-display text-[10px] font-black uppercase text-[var(--ink)] underline"
            >
              <Pencil className="h-3 w-3" /> Edit auction
            </button>
          </div>
          <span className={`brutal shadow-[4px_4px_0_0_var(--ink)] px-8 py-4 font-display text-lg uppercase font-black inline-block ${lot.isFlagged ? 'bg-[var(--ink)] text-white' : 'bg-[var(--electric)] text-white'}`}>
            {lot.next.includes('$') || lot.next.includes('ETH') ? `Bid ${lot.next}` : lot.next}
          </span>
        </div>
      </div>
    </div>
  );
}
