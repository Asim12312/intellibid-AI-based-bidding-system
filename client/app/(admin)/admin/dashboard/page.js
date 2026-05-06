"use client";

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
      <header className="mb-10">
        <h1 className="font-display text-5xl font-black tracking-tighter md:text-7xl">
          System <span className="text-[var(--acid)] text-stroke">Admin.</span>
        </h1>
        <p className="mt-3 text-lg text-[var(--ink)]/70">Platform overview and health.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-4 mb-10">
        <div className="brutal-lg bg-[var(--ink)] text-white p-6 shadow-[6px_6px_0_0_var(--acid)]">
          <div className="font-display text-4xl font-black">12.4k</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-wide">Total Users</div>
        </div>
        <div className="brutal-lg bg-white p-6 shadow-[6px_6px_0_0_var(--ink)]">
          <div className="font-display text-4xl font-black">4,219</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-wide">Live Auctions</div>
        </div>
        <div className="brutal-lg bg-[var(--electric)] text-white p-6 shadow-[6px_6px_0_0_var(--ink)]">
          <div className="font-display text-4xl font-black">$2.1M</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-wide">Volume (24h)</div>
        </div>
        <div className="brutal-lg bg-[var(--hotpink)] text-white p-6 shadow-[6px_6px_0_0_var(--ink)]">
          <div className="font-display text-4xl font-black">99.9%</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-wide">Uptime</div>
        </div>
      </div>
      
      <div className="brutal-lg bg-white p-10 text-center">
        <h2 className="font-display text-2xl font-black mb-4">Reports and Management Tools</h2>
        <p className="text-[var(--ink)]/70">This is a placeholder for the admin dashboard.</p>
      </div>
    </main>
  );
}
