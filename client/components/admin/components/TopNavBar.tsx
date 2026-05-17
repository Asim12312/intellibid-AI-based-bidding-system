import { Search, Bell, Settings, LogOut, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAdminAuth } from '../context/AuthContext';
import { api, ApiException } from '../lib/api';

export default function TopNavBar({
  onOpenSettings,
  onOpenProfile,
  onNavigate,
  onPickTicket,
  onLogout,
}: {
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onNavigate: (tab: 'dashboard' | 'users' | 'complaints' | 'monitoring') => void;
  onPickTicket: (mongoId: string) => void;
  onLogout?: () => void;
}) {
  const { admin, logout } = useAdminAuth();
  const handleLogout = onLogout || logout;
  const [q, setQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchData, setSearchData] = useState<Awaited<ReturnType<typeof api.search>>['data'] | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<{ _id: string; title: string; body: string; read: boolean }[]>([]);
  const [unread, setUnread] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(async (term: string) => {
    const t = term.trim();
    if (t.length < 2) {
      setSearchData(null);
      return;
    }
    setSearchLoading(true);
    try {
      const r = await api.search(t);
      setSearchData(r.data);
    } catch {
      setSearchData(null);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => runSearch(q), 320);
    return () => clearTimeout(id);
  }, [q, runSearch]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const loadNotifs = async () => {
    try {
      const r = await api.notificationsList();
      setNotifs(r.data);
      setUnread(r.unreadCount);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadNotifs();
    const id = setInterval(loadNotifs, 45000);
    return () => clearInterval(id);
  }, []);

  const runLogout = async () => {
    try {
      await handleLogout();
    } catch {
      /* ignore */
    }
  };

  return (
    <header className="sticky top-0 z-40 mb-6 flex h-16 w-full items-center justify-between border-b-[3px] border-[var(--ink)] bg-[var(--background)] px-4 shadow-[var(--shadow-brutal)] sm:px-6">
      <div className="flex items-center gap-4 sm:gap-8 min-w-0">
        <span className="font-display text-xl sm:text-2xl font-black uppercase text-[var(--ink)] tracking-tighter shrink-0">
          IntelliBid
        </span>
        <div ref={searchRef} className="relative flex-1 max-w-md min-w-0 hidden sm:block">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="pl-10 pr-4 py-2 bg-white border-[3px] border-[var(--ink)] focus:ring-0 focus:border-[var(--electric)] w-full font-mono text-sm uppercase tracking-tight"
              placeholder="Search systems..."
              type="search"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] w-4 h-4" />
          </div>
          {searchOpen && (q.trim().length >= 2 || searchLoading) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white brutal shadow-[var(--shadow-brutal)] max-h-80 overflow-y-auto z-[60]">
              {searchLoading && <p className="p-3 font-mono text-[10px] uppercase">Searching…</p>}
              {!searchLoading && searchData && (
                <div className="divide-y-[3px] divide-[var(--ink)]">
                  {searchData.users?.length ? (
                    <div className="p-2">
                      <p className="font-mono text-[9px] font-black uppercase text-[var(--muted-foreground)] px-2">Users</p>
                      {searchData.users.map((u) => (
                        <button
                          key={u._id}
                          type="button"
                          className="w-full text-left px-2 py-2 hover:bg-[var(--acid)] font-mono text-xs uppercase"
                          onClick={() => {
                            onNavigate('users');
                            setSearchOpen(false);
                            setQ('');
                          }}
                        >
                          {u.name} <span className="text-[var(--muted-foreground)] lowercase">{u.platformId}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {searchData.auctions?.length ? (
                    <div className="p-2">
                      <p className="font-mono text-[9px] font-black uppercase text-[var(--muted-foreground)] px-2">Auctions</p>
                      {searchData.auctions.map((a) => (
                        <button
                          key={a._id}
                          type="button"
                          className="w-full text-left px-2 py-2 hover:bg-[var(--acid)] font-mono text-xs uppercase"
                          onClick={() => {
                            onNavigate('monitoring');
                            setSearchOpen(false);
                            setQ('');
                          }}
                        >
                          {a.title}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {searchData.tickets?.length ? (
                    <div className="p-2">
                      <p className="font-mono text-[9px] font-black uppercase text-[var(--muted-foreground)] px-2">Tickets</p>
                      {searchData.tickets.map((t) => (
                        <button
                          key={t._id}
                          type="button"
                          className="w-full text-left px-2 py-2 hover:bg-[var(--acid)] font-mono text-xs uppercase"
                          onClick={() => {
                            onPickTicket(t._id);
                            onNavigate('complaints');
                            setSearchOpen(false);
                            setQ('');
                          }}
                        >
                          {t.title}{' '}
                          <span className="text-[var(--muted-foreground)]">{t.ticketId}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {!searchLoading && searchData && !searchData.users?.length && !searchData.auctions?.length && !searchData.tickets?.length && (
                    <p className="p-3 font-mono text-xs text-[var(--muted-foreground)]">No results</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div ref={notifRef} className="relative">
          <button
            type="button"
            className="p-2 hover:bg-[var(--acid)] brutal active:translate-x-1 active:translate-y-1 active:shadow-none transition-all relative"
            onClick={() => {
              setNotifOpen((v) => !v);
              if (!notifOpen) loadNotifs();
            }}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--destructive)] text-white text-[9px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[var(--ink)]">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute top-full right-0 mt-1 w-80 max-h-96 overflow-y-auto bg-white brutal shadow-[var(--shadow-brutal)] z-[60]">
              {notifs.length === 0 ? (
                <p className="p-4 font-mono text-xs text-[var(--muted-foreground)]">No notifications</p>
              ) : (
                notifs.map((n) => (
                  <button
                    key={n._id}
                    type="button"
                    className={`w-full text-left p-3 border-b-[3px] border-[var(--ink)] hover:bg-[var(--muted)] ${n.read ? 'opacity-70' : 'bg-[var(--acid)]/30'}`}
                    onClick={async () => {
                      try {
                        await api.notificationMarkRead(n._id);
                        await loadNotifs();
                      } catch (e) {
                        if (e instanceof ApiException && e.status === 404) await loadNotifs();
                      }
                    }}
                  >
                    <p className="font-mono text-[10px] font-black uppercase">{n.title}</p>
                    <p className="font-sans text-xs mt-1">{n.body}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <button type="button" className="p-2 hover:bg-[var(--acid)] brutal active:translate-x-1 active:translate-y-1 active:shadow-none transition-all" onClick={onOpenSettings} aria-label="Settings">
          <Settings className="w-5 h-5" />
        </button>
        <div className="h-10 w-[3px] bg-[var(--ink)] mx-1 hidden sm:block" />
        <button
          type="button"
          className="hidden sm:flex items-center gap-3 mr-1"
          onClick={onOpenProfile}
        >
          <span className="font-mono text-xs font-bold uppercase truncate max-w-[120px]">{admin?.name || 'Admin'}</span>
          {admin?.avatarUrl ? (
            <img alt="" className="w-10 h-10 brutal shadow-[4px_4px_0_0_var(--ink)] bg-white object-cover shrink-0" src={admin.avatarUrl} />
          ) : (
            <div className="w-10 h-10 brutal flex items-center justify-center bg-white">
              <User className="w-5 h-5" />
            </div>
          )}
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[var(--hotpink)] text-white brutal shadow-[4px_4px_0_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-none uppercase font-mono text-xs font-bold"
          onClick={runLogout}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
