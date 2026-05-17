import { useCallback, useEffect, useMemo, useState, Fragment } from 'react';
import { TrendingUp, Users, Gavel, Zap, PieChart, Activity, Shield, PhoneCall, Monitor, type LucideIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { api, ApiException, type SnapshotRow } from '../lib/api';
import { useSocket } from '../hooks/useSocket';

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Zap,
  Activity,
  Gavel,
};

export default function Overview({
  refreshSignal,
  onViewAllAuctions,
  onOpenExports,
}: {
  refreshSignal: number;
  onViewAllAuctions: () => void;
  onOpenExports: () => void;
}) {
  const { metrics: liveMetrics } = useSocket(true);
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [snapshot, setSnapshot] = useState<SnapshotRow[]>([]);
  const [health, setHealth] = useState({ serverLoad: 24, apiLatency: 15, aiInference: 40, status: 'OPTIMAL' });
  const [chart, setChart] = useState<{ name: string; value: number; color: string }[]>([]);
  const [activities, setActivities] = useState<{ id: string; label: string; time: string; icon: string; color: string }[]>([]);
  const [insight, setInsight] = useState<{ id: string; insight: string } | null>(null);
  const [busyInsight, setBusyInsight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [m, snap, h, bids, act, ins] = await Promise.all([
        api.dashboardMetrics(),
        api.dashboardSnapshot(8),
        api.systemHealth(),
        api.bidsByDay(7),
        api.activity(12),
        api.aiInsights(),
      ]);
      setMetrics(m.data as Record<string, unknown>);
      setSnapshot(snap.data);
      setHealth(h.data);
      setChart(bids.data);
      setActivities(act.data);
      setInsight(ins.data);
    } catch (e) {
      setError(e instanceof ApiException ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshSignal]);

  useEffect(() => {
    if (liveMetrics) setMetrics(liveMetrics);
  }, [liveMetrics]);

  const mergedMetrics = useMemo(() => metrics, [metrics]);

  const execProposal = async () => {
    if (!insight?.id) return;
    setBusyInsight(true);
    try {
      await api.aiExecuteProposal(insight.id);
      const ins = await api.aiInsights();
      setInsight(ins.data);
    } catch (e) {
      setError(e instanceof ApiException ? e.message : 'Execute failed');
    } finally {
      setBusyInsight(false);
    }
  };

  if (loading && !mergedMetrics) {
    return (
      <div className="p-12 font-mono text-sm uppercase text-[var(--muted-foreground)] animate-pulse">Loading dashboard…</div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="bg-[var(--destructive)]/10 brutal px-4 py-3 font-mono text-sm text-[var(--destructive)] font-bold">{error}</div>
      )}
      <section>
        <div className="flex items-end gap-4 mb-2 flex-wrap">
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tighter leading-none">Overview</h1>
          <span className="font-mono text-xs bg-[var(--acid)] brutal px-3 py-1 mb-2 font-black">LIVE DATA</span>
        </div>
        <p className="font-sans text-[var(--muted-foreground)] max-w-2xl">
          Real-time command and control for IntelliBid ecosystems. Monitor hyper-velocity bid streams, AI arbitrage agents, and platform liquidity.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Users"
          value={String(mergedMetrics?.totalUsersFormatted ?? mergedMetrics?.totalUsers ?? '—')}
          trend={String(mergedMetrics?.totalUsersTrend ?? '')}
          icon={Users}
          color="secondary"
        />
        <MetricCard
          label="Active Auctions"
          value={String(mergedMetrics?.activeAuctions ?? '—')}
          trend={String(mergedMetrics?.activeAuctionsLabel ?? 'LIVE NOW')}
          icon={Gavel}
          color="primary"
          isLive
        />
        <MetricCard
          label="Total Bids (24h)"
          value={String(mergedMetrics?.bidsLast24hFormatted ?? mergedMetrics?.bidsLast24h ?? '—')}
          trend={String(mergedMetrics?.bidsLast24hTrend ?? '')}
          icon={Zap}
          color="tertiary"
        />
        <MetricCard
          label="Revenue"
          value={String(mergedMetrics?.revenueFormatted ?? '—')}
          trend={String(mergedMetrics?.revenueTrend ?? '')}
          icon={PieChart}
          color="secondary"
          dark
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 brutal shadow-[var(--shadow-brutal)] bg-white overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-xl uppercase font-black">Live Auctions Snapshot</h3>
            <button type="button" onClick={onViewAllAuctions} className="font-mono text-xs uppercase underline font-bold">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead className="bg-[var(--muted)] uppercase text-[10px] font-black">
                <tr>
                  <th className="p-4 border-b-[3px] border-[var(--ink)]">Item</th>
                  <th className="p-4 border-b-[3px] border-[var(--ink)]">High Bid</th>
                  <th className="p-4 border-b-[3px] border-[var(--ink)]">Agent Activity</th>
                  <th className="p-4 border-b-[3px] border-[var(--ink)]">Time Left</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-[var(--muted-foreground)] font-sans">
                      No live auctions.
                    </td>
                  </tr>
                ) : (
                  snapshot.map((row) => (
                    <Fragment key={row.id}>
                      <AuctionRow
                        img={row.img}
                        name={row.name}
                        bid={row.bid}
                        status={row.status}
                        time={row.time}
                        isUrgent={row.isUrgent}
                      />
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="brutal shadow-[var(--shadow-brutal)] bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg uppercase font-black">System Health</h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[var(--acid)] rounded-full animate-pulse brutal" />
                <span className="font-mono text-[10px] font-black">{health.status}</span>
              </div>
            </div>
            <div className="space-y-5 font-mono">
              <HealthBar label="Server Load" value={health.serverLoad} color="bg-[var(--acid)]" />
              <HealthBar label="API Latency" value={health.apiLatency} color="bg-[var(--hotpink)]" />
              <HealthBar label="AI Inference" value={health.aiInference} color="bg-[var(--electric)]" />
            </div>
          </div>

          <div className="brutal shadow-[var(--shadow-brutal)] bg-[var(--ink)] text-white p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Zap className="text-[var(--acid)] w-5 h-4 fill-[var(--acid)]" />
              <h3 className="font-mono text-xs uppercase font-black tracking-widest">AI Insights</h3>
            </div>
            <p className="font-sans text-sm leading-relaxed mb-6 text-white/80 italic relative z-10">
              &ldquo;{insight?.insight || 'Loading insight…'}&rdquo;
            </p>
            <button
              type="button"
              disabled={busyInsight || !insight?.id}
              onClick={execProposal}
              className="w-full py-3 bg-[var(--acid)] text-[var(--ink)] font-mono text-[10px] uppercase font-black brutal active:translate-x-1 active:translate-y-1 active:shadow-none relative z-10 disabled:opacity-50"
            >
              {busyInsight ? 'Working…' : 'Execute Proposal'}
            </button>
          </div>
        </div>
      </div>

      <div className="brutal shadow-[var(--shadow-brutal)] bg-white p-6">
        <h3 className="font-display text-xl uppercase font-black mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Bid volume (7 days)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chart.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="brutal shadow-[var(--shadow-brutal)] bg-white p-6">
          <h3 className="font-display text-xl uppercase font-black mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {activities.map((item) => {
              const Icon = ICON_MAP[item.icon] || Activity;
              return (
                <Fragment key={item.id}>
                  <ActivityItem icon={Icon} label={item.label} time={item.time} color={item.color} />
                </Fragment>
              );
            })}
            {activities.length === 0 && <p className="text-[var(--muted-foreground)] font-mono text-xs">No activity yet.</p>}
          </div>
        </div>

        <div className="brutal shadow-[var(--shadow-brutal)] bg-[var(--electric)] text-white p-6 relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[var(--acid)] rotate-12 opacity-10 brutal group-hover:rotate-45 transition-transform duration-700" />
          <h3 className="font-display text-xl uppercase font-black mb-6 relative z-10">System Actions</h3>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <ActionButton icon={Monitor} label="Nodes" onClick={() => load()} />
            <ActionButton icon={Shield} label="Firewall" onClick={() => load()} />
            <ActionButton icon={Activity} label="Exports" onClick={onOpenExports} />
            <a href="mailto:support@intellibid.com" className="brutal shadow-[4px_4px_0_0_var(--ink)] bg-white text-[var(--ink)] p-4 flex flex-col items-center justify-center gap-2 hover:bg-[var(--acid)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none group/a">
              <PhoneCall className="w-5 h-5 group-hover/a:scale-110 transition-transform" />
              <span className="font-mono text-[9px] uppercase font-black">Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, icon: Icon, color, isLive, dark }: {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: string;
  isLive?: boolean;
  dark?: boolean;
}) {
  if (dark) {
    return (
      <div className="brutal shadow-[var(--shadow-brutal)] bg-[var(--hotpink)] p-6 flex flex-col justify-between h-44 hover:shadow-[var(--shadow-brutal-lg)] hover:-translate-x-1 hover:-translate-y-1 transition-all">
        <div className="flex justify-between items-start">
          <span className="font-mono text-[10px] uppercase font-black text-white/70 tracking-widest">{label}</span>
          <Icon className="text-white w-5 h-5" />
        </div>
        <div>
          <div className="font-display text-3xl leading-tight text-white mb-1">{value}</div>
          <div className="font-mono text-[10px] text-white/80 uppercase font-bold">{trend}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`brutal shadow-[var(--shadow-brutal)] ${color === 'primary' ? 'bg-[var(--acid)]' : color === 'tertiary' ? 'bg-[var(--electric)] text-white' : color === 'secondary' ? 'bg-[var(--sunset)] text-white' : 'brutal-surface bg-white'} p-6 flex flex-col justify-between h-44 hover:shadow-[var(--shadow-brutal-lg)] hover:-translate-x-1 hover:-translate-y-1 transition-all`}>
      <div className="flex justify-between items-start">
        <span className="font-mono text-[10px] uppercase font-black text-[var(--muted-foreground)] tracking-widest">{label}</span>
        <Icon className={`${color === 'secondary' ? 'text-[var(--hotpink)]' : color === 'tertiary' ? 'text-[var(--electric)]' : 'text-[var(--ink)]'} w-5 h-5`} />
      </div>
      <div>
        <div className="font-display text-3xl leading-tight mb-1">{value}</div>
        <div className={`font-mono text-[10px] uppercase font-black flex items-center gap-1 ${isLive ? 'bg-[var(--ink)] text-[var(--acid)] px-2 py-0.5 rounded-full inline-block' : 'text-[var(--muted-foreground)]'}`}>
          {isLive && <span className="w-1.5 h-1.5 bg-[var(--acid)] rounded-full animate-pulse mr-1" />}
          {trend}
        </div>
      </div>
    </div>
  );
}

function AuctionRow({ img, name, bid, status, time, isUrgent }: {
  img: string;
  name: string;
  bid: string;
  status: string;
  time: string;
  isUrgent?: boolean;
}) {
  return (
    <tr className="hover:bg-[var(--muted)] transition-colors group">
      <td className="p-4 border-b-[3px] border-r-[3px] border-[var(--ink)] align-middle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 brutal shadow-[4px_4px_0_0_var(--ink)] shrink-0 overflow-hidden bg-[var(--electric)]">
            <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold">{name}</span>
        </div>
      </td>
      <td className="p-4 border-b-[3px] border-r-[3px] border-[var(--ink)] font-black align-middle">{bid}</td>
      <td className="p-4 border-b-[3px] border-r-[3px] border-[var(--ink)] align-middle">
        <span className={`${status === 'MANUAL ONLY' ? 'bg-[var(--muted)] border-[var(--ink)]/30' : 'bg-[var(--acid)] border-[var(--ink)]'} border-[1px] px-2 py-1 rounded-full text-[9px] font-black uppercase inline-block`}>
          {status}
        </span>
      </td>
      <td className={`p-4 border-b-[3px] border-[var(--ink)] align-middle ${isUrgent ? 'text-[var(--destructive)] font-black' : 'font-bold'}`}>{time}</td>
    </tr>
  );
}

function HealthBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase text-[var(--muted-foreground)]">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full h-4 bg-[var(--muted)] brutal p-[2px]">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ActivityItem({ icon: Icon, label, time, color }: { icon: LucideIcon; label: string; time: string; color: string }) {
  return (
    <div className={`flex items-start gap-4 p-4 border-l-[6px] ${color} bg-[var(--muted)] brutal transition-all hover:translate-x-1`}>
      <div className="w-10 h-10 brutal flex items-center justify-center shrink-0 bg-white">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="font-sans text-sm font-bold">{label}</p>
        <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-black tracking-widest">{time}</span>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="brutal shadow-[4px_4px_0_0_var(--ink)] bg-white text-[var(--ink)] p-4 flex flex-col items-center justify-center gap-2 hover:bg-[var(--acid)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none group"
    >
      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="font-mono text-[9px] uppercase font-black">{label}</span>
    </button>
  );
}
