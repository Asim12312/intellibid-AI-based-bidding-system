import { useCallback, useEffect, useState, Fragment, type ReactNode, type FormEvent } from 'react';
import { UserPlus, Search, Eye, Edit, Ban, ChevronLeft, ChevronRight, TrendingUp, Shield } from 'lucide-react';
import { api, ApiException, type UserRow } from '../lib/api';
import Modal from '../components/Modal';

const STATUS_OPTIONS = [
  { label: 'Status: All', value: '' },
  { label: 'Status: Active', value: 'active' },
  { label: 'Status: Banned', value: 'banned' },
  { label: 'Status: Flagged', value: 'flagged' },
];

export default function UserManagement() {
  const [summary, setSummary] = useState<{ totalUsersFormatted: string; activeNow: number; risk: { flaggedProfiles: number; recentBans: number; avgRiskScore: number } } | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [regBars, setRegBars] = useState<{ day: number; heightPercent: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [auditBusy, setAuditBusy] = useState(false);
  const [auditMsg, setAuditMsg] = useState<string | null>(null);

  const [detailUser, setDetailUser] = useState<UserRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', username: '' });

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const [sum, list, reg] = await Promise.all([
        api.usersSummary(),
        api.usersList({ page, limit, search, status }),
        api.registrations(),
      ]);
      setSummary(sum.data);
      setUsers(list.data);
      setTotalPages(list.pagination.totalPages);
      setTotal(list.pagination.total);
      setRegBars(reg.data);
    } catch (e) {
      setErr(e instanceof ApiException ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const applyFilters = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const runAudit = async () => {
    setAuditBusy(true);
    setAuditMsg(null);
    try {
      const r = await api.aiAuditUsers();
      const s = (r as { data?: { summary?: string } }).data?.summary;
      setAuditMsg(s || 'Audit complete.');
      await load();
    } catch (e) {
      setAuditMsg(e instanceof ApiException ? e.message : 'Audit failed');
    } finally {
      setAuditBusy(false);
    }
  };

  const openEdit = (u: UserRow) => {
    setDetailUser(u);
    setEditName(u.name);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!detailUser) return;
    try {
      await api.userUpdate(detailUser.id, { name: editName });
      setEditOpen(false);
      await load();
    } catch (e) {
      setErr(e instanceof ApiException ? e.message : 'Update failed');
    }
  };

  const banUser = async (u: UserRow) => {
    if (!window.confirm(`Ban ${u.name}?`)) return;
    try {
      await api.userBan(u.id, 'Policy violation');
      await load();
    } catch (e) {
      setErr(e instanceof ApiException ? e.message : 'Ban failed');
    }
  };

  const unbanUser = async (u: UserRow) => {
    try {
      await api.userUnban(u.id);
      await load();
    } catch (e) {
      setErr(e instanceof ApiException ? e.message : 'Unban failed');
    }
  };

  const addUser = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.userCreate({
        name: addForm.name,
        email: addForm.email,
        username: addForm.username || undefined,
      });
      setAddOpen(false);
      setAddForm({ name: '', email: '', username: '' });
      await load();
    } catch (ex) {
      setErr(ex instanceof ApiException ? ex.message : 'Create failed');
    }
  };

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {err && (
        <div className="bg-[var(--destructive)]/10 brutal px-4 py-3 font-mono text-sm text-[var(--destructive)] font-bold">{err}</div>
      )}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-5xl uppercase font-black tracking-tighter leading-none mb-4">User Management</h1>
          <p className="text-[var(--muted-foreground)] max-w-xl font-sans">
            Review system users, monitor bidding activity, and enforce platform safety standards with AI-assisted risk scoring.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#adc6ff] text-[#001a41] brutal p-4 shadow-[4px_4px_0_0_var(--ink)] flex flex-col items-center min-w-[140px]">
            <span className="font-mono text-[10px] uppercase font-black tracking-widest mb-1">Total Users</span>
            <span className="font-display text-3xl font-black">{summary?.totalUsersFormatted ?? '—'}</span>
          </div>
          <div className="bg-[var(--acid)] text-[var(--ink)] brutal p-4 shadow-[4px_4px_0_0_var(--ink)] flex flex-col items-center min-w-[140px]">
            <span className="font-mono text-[10px] uppercase font-black tracking-widest mb-1">Active Now</span>
            <span className="font-display text-3xl font-black">{summary?.activeNow ?? '—'}</span>
          </div>
        </div>
      </section>

      <div className="bg-white brutal p-6 shadow-[var(--shadow-brutal)] flex flex-wrap gap-4 items-center">
        <div className="flex-grow flex items-center bg-[var(--muted)] brutal px-4 py-3 min-w-[200px]">
          <Search className="text-[var(--ink)] mr-3 w-5 h-5 shrink-0" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full bg-transparent border-none focus:ring-0 font-mono uppercase text-xs font-black placeholder:text-[var(--muted-foreground)]/50"
            placeholder="SEARCH BY NAME, ID OR EMAIL..."
            type="search"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-white brutal px-4 py-3 font-mono uppercase text-xs font-black min-w-[180px] focus:ring-0 focus:border-primary"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={applyFilters}
            className="bg-[var(--hotpink)] text-white font-mono text-xs font-black px-8 py-3 brutal shadow-[4px_4px_0_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-widest"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="bg-white brutal shadow-[var(--shadow-brutal)] overflow-hidden">
        {loading ? (
          <p className="p-8 font-mono text-xs uppercase text-[var(--muted-foreground)]">Loading…</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-[var(--ink)] text-white uppercase text-xs font-black">
                    <th className="p-6 border-r border-white/20 tracking-widest">ID</th>
                    <th className="p-6 border-r border-white/20 tracking-widest">Name / Account</th>
                    <th className="p-6 border-r border-white/20 tracking-widest">Status</th>
                    <th className="p-6 border-r border-white/20 tracking-widest">Last Activity</th>
                    <th className="p-6 tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b-[3px] border-[var(--ink)] hover:bg-[var(--muted)] transition-colors group">
                      <td className="p-6 text-[var(--muted-foreground)] font-bold">{user.platformId}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 brutal shadow-[4px_4px_0_0_var(--ink)] flex-shrink-0 bg-[var(--muted)] overflow-hidden ${user.isBanned ? 'grayscale' : ''}`}>
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            ) : (
                              <div className="w-full h-full bg-[var(--electric)]" />
                            )}
                          </div>
                          <div>
                            <div className={`font-black uppercase text-sm ${user.isBanned ? 'text-[var(--muted-foreground)] line-through' : ''}`}>{user.name}</div>
                            <div className="text-[10px] text-[var(--muted-foreground)] lowercase font-bold italic">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`brutal px-3 py-1 text-[9px] font-black uppercase ${user.isBanned ? 'bg-[var(--destructive)] text-white' : 'bg-[var(--acid)] text-[var(--ink)]'}`}>
                            {user.status}
                          </span>
                          {user.isFlagged && (
                            <span className="bg-[var(--hotpink)] text-white text-[8px] font-black px-2 py-0.5 border-[2px] border-[var(--ink)] uppercase">
                              AI Flagged: Suspect Bid
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-[10px] text-[var(--muted-foreground)] uppercase">
                        <div className="font-black text-[var(--ink)] mb-1">{user.activity}</div>
                        <div className="font-bold tracking-tight">{user.detail}</div>
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2 flex-wrap">
                          <ActionButton icon={<Eye className="w-3.5 h-3.5" />} color="bg-white" onClick={() => setDetailUser(user)} />
                          {!user.isBanned && (
                            <ActionButton icon={<Edit className="w-3.5 h-3.5" />} color="bg-white" onClick={() => openEdit(user)} />
                          )}
                          {user.isBanned ? (
                            <button type="button" onClick={() => unbanUser(user)} className="px-4 py-1.5 brutal bg-[var(--acid)] text-[10px] font-black uppercase shadow-[4px_4px_0_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-none">
                              Unban
                            </button>
                          ) : (
                            <ActionButton icon={<Ban className="w-3.5 h-3.5" />} color="bg-[var(--destructive)]/10" onClick={() => banUser(user)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[var(--muted)] p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t-[3px] border-[var(--ink)]">
              <span className="font-mono text-[10px] uppercase font-black text-[var(--muted-foreground)] tracking-widest">
                Showing {from} to {to} of {total} results
              </span>
              <div className="flex gap-2 flex-wrap justify-center">
                <PaginationButton
                  icon={<ChevronLeft className="w-4 h-4" />}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                />
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let n = i + 1;
                  if (totalPages > 5 && page > 3) n = page - 2 + i;
                  if (n > totalPages) return null;
                  return (
                    <Fragment key={n}>
                      <PaginationButton label={String(n)} active={n === page} onClick={() => setPage(n)} />
                    </Fragment>
                  );
                })}
                <PaginationButton
                  icon={<ChevronRight className="w-4 h-4" />}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 brutal shadow-[var(--shadow-brutal)] bg-white p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-xl uppercase font-black flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Registration Velocity
            </h3>
          </div>
          <div className="h-48 w-full bg-[var(--muted)] brutal relative overflow-hidden flex items-end justify-between px-4 pb-2">
            {regBars.map((b, i) => (
              <div
                key={i}
                className={`w-[8%] brutal ${i % 2 === 0 ? 'bg-[var(--hotpink)]' : 'bg-[var(--electric)]'}`}
                style={{ height: `${Math.max(8, b.heightPercent)}%` }}
              />
            ))}
            {regBars.length === 0 && <span className="font-mono text-xs p-4">No registration data</span>}
          </div>
        </div>

        <div className="bg-[var(--acid)] brutal shadow-[var(--shadow-brutal)] p-6">
          <h3 className="font-display text-xl uppercase font-black mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Risk Overview
          </h3>
          <div className="space-y-4 font-mono text-xs">
            <RiskItem label="Flagged Profiles" value={String(summary?.risk.flaggedProfiles ?? '—')} />
            <RiskItem label="Recent Bans" value={String(summary?.risk.recentBans ?? '—')} />
            <RiskItem label="Avg Risk Score" value={String(summary?.risk.avgRiskScore ?? '—')} />
          </div>
          {auditMsg && <p className="mt-4 font-sans text-xs font-bold">{auditMsg}</p>}
          <button
            type="button"
            onClick={runAudit}
            disabled={auditBusy}
            className="w-full mt-8 bg-[var(--ink)] text-white font-mono text-xs font-black py-4 uppercase brutal shadow-[4px_4px_0_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-none tracking-widest disabled:opacity-50"
          >
            {auditBusy ? 'Running…' : 'Run AI Audit'}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="fixed bottom-8 right-8 bg-[var(--acid)] text-[var(--ink)] h-16 w-16 brutal shadow-[var(--shadow-brutal)] rounded-full flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none z-50 group"
      >
        <UserPlus className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </button>

      <Modal open={!!detailUser && !editOpen} onClose={() => setDetailUser(null)} title="User">
        {detailUser && (
          <div className="font-mono text-xs space-y-2">
            <p className="font-display text-lg font-sans uppercase">{detailUser.name}</p>
            <p>{detailUser.platformId}</p>
            <p className="lowercase">{detailUser.email}</p>
            <p>Status: {detailUser.status}</p>
            <p className="uppercase text-[10px]">Last: {detailUser.activity}</p>
            <p className="font-sans text-sm">{detailUser.detail}</p>
          </div>
        )}
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit user">
        <div className="space-y-4">
          <input className="w-full border-[3px] border-[var(--ink)] px-3 py-2 font-mono text-sm" value={editName} onChange={(e) => setEditName(e.target.value)} />
          <button type="button" onClick={saveEdit} className="w-full bg-[var(--electric)] text-white brutal py-3 font-mono text-xs font-black uppercase">
            Save
          </button>
        </div>
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add user">
        <form onSubmit={addUser} className="space-y-3 font-mono text-xs">
          <input required placeholder="Name" className="w-full border-[3px] px-3 py-2" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
          <input required type="email" placeholder="Email" className="w-full border-[3px] px-3 py-2" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} />
          <input placeholder="Username" className="w-full border-[3px] px-3 py-2" value={addForm.username} onChange={(e) => setAddForm((f) => ({ ...f, username: e.target.value }))} />
          <button type="submit" className="w-full bg-[var(--hotpink)] text-white brutal py-3 font-black uppercase">
            Create
          </button>
        </form>
      </Modal>
    </div>
  );
}

function ActionButton({ icon, color, onClick }: { icon: ReactNode; color: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`p-2 brutal shadow-[4px_4px_0_0_var(--ink)] ${color} active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all active:translate-x-1 active:translate-y-1 active:shadow-none`}>
      {icon}
    </button>
  );
}

function PaginationButton({
  label,
  icon,
  active,
  onClick,
  disabled,
}: {
  label?: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`h-10 w-10 flex items-center justify-center brutal shadow-[4px_4px_0_0_var(--ink)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-40 ${active ? 'bg-[var(--acid)] text-[var(--ink)] font-black' : 'bg-white hover:bg-[var(--muted)]'}`}
    >
      {label ?? icon}
    </button>
  );
}

function RiskItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b-[2px] border-[var(--ink)]/10 pb-3 h-10 items-center">
      <span className="uppercase font-bold tracking-tight text-[var(--muted-foreground)]">{label}</span>
      <span className="font-black text-base">{value}</span>
    </div>
  );
}
