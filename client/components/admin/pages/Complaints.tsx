import { useCallback, useEffect, useState } from 'react';
import { Zap, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { api, ApiException, type TicketDetail, type TicketListItem } from '../lib/api';

const LEVEL_BORDER: Record<string, string> = {
  Urgent: '#ba1a1a',
  Medium: '#a6009f',
  Low: '#5c5c5c',
};

export default function Complaints({
  focusTicketId,
  onConsumedFocus,
}: {
  focusTicketId: string | null;
  onConsumedFocus: () => void;
}) {
  const [summary, setSummary] = useState<{ activeCases: number; urgentCount: number } | null>(null);
  const [list, setList] = useState<TicketListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshList = useCallback(async () => {
    const [s, t] = await Promise.all([api.ticketsSummary(), api.ticketsList()]);
    setSummary(s.data);
    setList(t.data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [s, t] = await Promise.all([api.ticketsSummary(), api.ticketsList()]);
        if (cancelled) return;
        setSummary(s.data);
        setList(t.data);
        if (t.data.length > 0) {
          setSelectedId((prev) => {
            if (prev) return prev;
            const preferred = t.data.find((x) => x.active) || t.data[0];
            return preferred.id;
          });
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof ApiException ? e.message : 'Failed to load tickets');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!focusTicketId) return;
    setSelectedId(focusTicketId);
    onConsumedFocus();
  }, [focusTicketId, onConsumedFocus]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await api.ticketGet(selectedId);
        if (!cancelled) setDetail(r.data);
      } catch (e) {
        if (!cancelled) setErr(e instanceof ApiException ? e.message : 'Ticket load failed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const refreshDetail = async () => {
    if (!selectedId) return;
    const r = await api.ticketGet(selectedId);
    setDetail(r.data);
  };

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setErr(null);
    try {
      await fn();
      await refreshList();
      await refreshDetail();
    } catch (e) {
      setErr(e instanceof ApiException ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const openedLabel = detail?.openedAt
    ? new Date(detail.openedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {err && <div className="bg-[var(--destructive)]/10 brutal px-4 py-3 font-mono text-sm text-[var(--destructive)] font-bold">{err}</div>}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-5xl uppercase font-black tracking-tighter leading-none mb-4">Complaint Management</h1>
          <p className="text-[var(--muted-foreground)] max-w-xl font-sans">
            Review and resolve dispute tickets from the IntelliBid auction floor. AI-augmented assessment provides instant risk analysis.
          </p>
        </div>
        <div className="flex gap-4">
          <StatBox label="Active Cases" value={String(summary?.activeCases ?? '—')} color="bg-white" />
          <StatBox label="Urgent" value={String(summary?.urgentCount ?? '—').padStart(2, '0')} color="bg-[var(--destructive)]/10" textColor="text-[var(--destructive)]" />
        </div>
      </section>

      {loading ? (
        <p className="font-mono text-xs uppercase p-8">Loading…</p>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="brutal shadow-[var(--shadow-brutal)] bg-[var(--muted)]est p-4">
              <h2 className="font-mono text-xs uppercase font-black tracking-widest mb-6">Open Disputes</h2>
              <div className="space-y-4">
                {list.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedId(d.id)}
                    className={`w-full text-left brutal p-4 transition-all border-l-[12px] ${d.active ? 'bg-[var(--acid)] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : 'bg-white shadow-[4px_4px_0_0_var(--ink)] hover:translate-x-1'}`}
                    style={{ borderLeftColor: LEVEL_BORDER[d.level] || '#5c5c5c' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`${d.color} text-white font-mono text-[8px] px-2 py-0.5 uppercase font-black`}>{d.level}</span>
                      <span className="font-mono text-[10px] text-[var(--muted-foreground)] font-bold">{d.ticketId}</span>
                    </div>
                    <h3 className="font-sans font-bold text-lg leading-tight mb-1">{d.title}</h3>
                    <p className="font-mono text-[10px] text-[var(--muted-foreground)] font-medium mb-3 italic">User: {d.user}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        <Avatar />
                        <Avatar />
                      </div>
                      <span className={`font-mono text-[9px] uppercase font-black tracking-widest ${d.active ? 'text-[var(--hotpink)]' : 'text-[var(--muted-foreground)]/60'}`}>
                        {d.msg}
                      </span>
                    </div>
                  </button>
                ))}
                {list.length === 0 && <p className="font-mono text-xs text-[var(--muted-foreground)]">No open tickets.</p>}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-6">
            {!detail ? (
              <div className="brutal bg-white p-12 text-center text-[var(--muted-foreground)] font-mono text-sm">Select a ticket</div>
            ) : (
              <>
                <div className="brutal shadow-[var(--shadow-brutal)] bg-white overflow-hidden">
                  <div className="bg-[#ffd7f3] p-8 border-b-[3px] border-[var(--ink)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h2 className="font-display text-3xl uppercase font-black text-[#390036] tracking-tighter">{detail.title}</h2>
                      <div className="flex flex-wrap gap-3 mt-3">
                        <div className="bg-white brutal px-3 py-1 font-mono text-[10px] font-black uppercase">
                          <span className="text-[var(--muted-foreground)]">Auction ref:</span> {detail.auctionRef || '—'}
                        </div>
                        <div className="bg-white brutal px-3 py-1 font-mono text-[10px] font-black uppercase tracking-tight">
                          <span className="text-[var(--muted-foreground)]">Status:</span>{' '}
                          <span className="text-[var(--hotpink)]">{detail.statusLabel}</span>
                        </div>
                      </div>
                    </div>
                    {detail.aiScoreLabel && (
                      <div className="bg-[var(--acid)] brutal shadow-[4px_4px_0_0_var(--ink)] p-4 flex items-center gap-3">
                        <Zap className="text-white w-6 h-6 fill-white" />
                        <span className="font-mono text-xs font-black uppercase text-white">{detail.aiScoreLabel}</span>
                      </div>
                    )}
                  </div>

                  <div className="h-[450px] overflow-y-auto p-8 flex flex-col gap-8 bg-[radial-gradient(#e2e2e2_1px,transparent_1px)] [background-size:24px_24px]">
                    <div className="self-center">
                      <span className="font-mono text-[9px] uppercase bg-[var(--muted)] p-2 brutal font-black tracking-widest">Ticket opened: {openedLabel}</span>
                    </div>

                    {detail.messages.map((m) => {
                      const isUser = m.senderType === 'user';
                      const isAi = m.senderType === 'ai';
                      return (
                        <div
                          key={m.id}
                          className={`flex gap-4 max-w-[85%] ${isUser ? '' : isAi ? 'flex-row-reverse self-end' : 'self-center max-w-[95%]'}`}
                        >
                          {(isUser || isAi) && (
                            <div className="shrink-0 w-12 h-12 brutal shadow-[4px_4px_0_0_var(--ink)] bg-[var(--electric)]-fixed overflow-hidden">
                              {isUser && detail.user?.avatarUrl ? (
                                <img src={detail.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[var(--muted)]" />
                              )}
                            </div>
                          )}
                          <div
                            className={`brutal shadow-[4px_4px_0_0_var(--ink)] p-5 space-y-2 ${
                              isAi ? 'bg-[var(--hotpink)] text-white' : isUser ? 'bg-white' : 'bg-[var(--acid)] w-full'
                            }`}
                          >
                            <p className="font-sans text-sm font-medium leading-relaxed">&ldquo;{m.body}&rdquo;</p>
                            <span
                              className={`block font-mono text-[9px] uppercase font-black text-right ${
                                isAi ? 'text-white/50' : 'text-[var(--muted-foreground)]/50'
                              }`}
                            >
                              {m.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-8 bg-white border-t-[3px] border-[var(--ink)] flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex gap-4 w-full sm:w-auto flex-wrap">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act(() => api.ticketResolve(detail.id))}
                        className="flex-1 sm:flex-none py-5 px-10 bg-[var(--acid)] text-[var(--ink)] brutal shadow-[var(--shadow-brutal)] active:translate-x-1 active:translate-y-1 active:shadow-none font-display text-2xl uppercase font-black flex items-center gap-3 disabled:opacity-50"
                      >
                        <CheckCircle className="w-8 h-8" /> Resolve
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act(() => api.ticketEscalate(detail.id))}
                        className="flex-1 sm:flex-none py-5 px-10 bg-[var(--hotpink)] text-white brutal shadow-[var(--shadow-brutal)] active:translate-x-1 active:translate-y-1 active:shadow-none font-display text-2xl uppercase font-black flex items-center gap-3 disabled:opacity-50"
                      >
                        <ShieldAlert className="w-8 h-8" /> Escalate
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act(() => api.ticketReject(detail.id))}
                        className="w-full brutal shadow-[4px_4px_0_0_var(--ink)] px-10 py-5 font-mono text-xs uppercase font-black tracking-widest active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-[var(--muted)] disabled:opacity-50"
                      >
                        Reject Ticket
                      </button>
                      {detail.type === 'payment' && !detail.paymentOverrideApproved && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => act(() => api.ticketPaymentOverride(detail.id))}
                          className="w-full brutal bg-[var(--electric)] text-white px-6 py-3 font-mono text-[10px] font-black uppercase disabled:opacity-50"
                        >
                          Approve payment override
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 brutal shadow-[var(--shadow-brutal)] bg-white flex overflow-hidden">
                    <div className="w-1/3 border-r-[3px] border-[var(--ink)] relative overflow-hidden bg-black flex items-center min-h-[160px]">
                      {detail.auction?.imageUrl ? (
                        <img src={detail.auction.imageUrl} alt="" className="w-full h-full object-cover max-h-48" />
                      ) : (
                        <div className="w-full h-32 bg-[var(--ink)]" />
                      )}
                      {detail.auction?.status === 'live' && (
                        <div className="absolute top-2 left-2 bg-[var(--destructive)] text-white font-mono text-[8px] px-2 py-1 brutal font-black">LIVE</div>
                      )}
                    </div>
                    <div className="w-2/3 p-6 flex flex-col justify-between">
                      <div>
                        <span className="font-mono text-[10px] uppercase font-black text-[var(--muted-foreground)] tracking-widest italic">Auction Asset Reference</span>
                        <h4 className="font-sans text-xl font-bold uppercase mt-2">{detail.auction?.title || '—'}</h4>
                        <p className="font-mono text-xs font-black text-[var(--muted-foreground)] mt-2">Current Bid: {detail.auction?.currentBid || '—'}</p>
                      </div>
                      <button type="button" className="flex items-center gap-2 text-[var(--electric)] font-mono text-[10px] uppercase font-black underline mt-4 hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-3 h-3" /> Linked auction
                      </button>
                    </div>
                  </div>

                  <div className="w-full md:w-1/3 brutal shadow-[var(--shadow-brutal)] bg-[var(--electric)] p-6 flex flex-col justify-between">
                    <span className="font-mono text-[10px] uppercase font-black text-[var(--electric)] tracking-widest mb-4">User Trust Score</span>
                    <div className="flex items-end gap-2 mb-6">
                      <span className="font-display text-5xl font-black leading-none text-[var(--electric)]">{detail.user?.trustScore?.toFixed(1) ?? '—'}</span>
                      <span className="font-mono text-xs font-black text-[var(--electric)] mb-2">/ 10</span>
                    </div>
                    <div className="space-y-3">
                      <p className="font-mono text-[10px] font-black uppercase text-[var(--electric)] tracking-widest italic">
                        Verification: {detail.user?.verificationTier || 'NONE'}
                      </p>
                      <div className="w-full h-3 bg-white brutal p-[1px]">
                        <div
                          className="h-full bg-[var(--electric)]"
                          style={{ width: `${Math.min(100, ((detail.user?.trustScore ?? 0) / 10) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color, textColor = 'text-[var(--ink)]' }: { label: string; value: string; color: string; textColor?: string }) {
  return (
    <div className={`brutal shadow-[4px_4px_0_0_var(--ink)] p-5 flex flex-col min-w-[150px] ${color}`}>
      <span className="font-mono text-[10px] uppercase font-black text-[var(--muted-foreground)] tracking-widest mb-1">{label}</span>
      <span className={`font-display text-4xl font-black ${textColor}`}>{value}</span>
    </div>
  );
}

function Avatar() {
  return (
    <div className="w-8 h-8 rounded-full border-[2px] border-[var(--ink)] overflow-hidden bg-white shadow-sm">
      <div className="w-full h-full bg-[var(--muted)]" />
    </div>
  );
}
