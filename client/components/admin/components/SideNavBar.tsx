import { LayoutDashboard, Users, MessageSquare, Monitor, Settings, HelpCircle, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SideNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewAuction: () => void;
  onSettings: () => void;
}

export default function SideNavBar({ activeTab, setActiveTab, onNewAuction, onSettings }: SideNavBarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'monitoring', label: 'Monitoring', icon: Monitor },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r-[3px] border-[var(--ink)] shadow-[6px_0px_0px_0px_rgba(0,0,0,1)] z-40 hidden md:flex flex-col pt-24">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-[var(--acid)] brutal flex items-center justify-center shadow-[4px_4px_0_0_var(--ink)]">
            <span className="font-display font-black text-[var(--ink)]">IB</span>
          </div>
          <div>
            <h2 className="font-display text-lg leading-tight uppercase font-black">Admin Panel</h2>
            <p className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">AI Control Center</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewAuction}
          className="w-full mt-6 bg-[var(--electric)] text-white brutal shadow-[4px_4px_0_0_var(--ink)] p-4 font-mono text-xs font-black uppercase flex items-center justify-center gap-2 hover:scale-[0.98] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <Plus className="w-4 h-4" />
          New Auction
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={cn(
              'w-full flex items-center gap-4 p-4 transition-all uppercase font-mono text-sm font-bold tracking-tight',
              activeTab === item.id
                ? 'bg-[var(--electric)] text-white brutal shadow-[4px_4px_0_0_var(--ink)] scale-[0.96]'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
            )}
          >
            <item.icon className={cn('w-5 h-5', activeTab === item.id ? 'text-white' : 'text-[var(--muted-foreground)]')} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t-[3px] border-[var(--ink)] p-4 bg-[var(--muted)]">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onSettings}
            className="w-full flex items-center gap-4 p-3 text-[var(--muted-foreground)] hover:bg-white hover:brutal transition-all font-mono text-xs uppercase font-bold"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <a
            href="mailto:support@intellibid.com"
            className="w-full flex items-center gap-4 p-3 text-[var(--muted-foreground)] hover:bg-white hover:brutal transition-all font-mono text-xs uppercase font-bold"
          >
            <HelpCircle className="w-4 h-4" />
            Support
          </a>
        </div>
      </div>
    </aside>
  );
}
