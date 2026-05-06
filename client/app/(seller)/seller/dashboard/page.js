"use client";

export default function SellerDashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
      <header className="mb-10">
        <h1 className="font-display text-5xl font-black tracking-tighter md:text-7xl">
          Seller <span className="text-stroke">Dashboard.</span>
        </h1>
        <p className="mt-3 text-lg text-[var(--ink)]/70">Overview of your shop, active listings, and revenue.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="brutal-lg bg-[var(--sunset)] p-6 text-white shadow-[6px_6px_0_0_var(--ink)]">
          <div className="font-display text-4xl font-black">$15,200</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-wide">Total Sales (30d)</div>
        </div>
        <div className="brutal-lg bg-[var(--acid)] p-6 shadow-[6px_6px_0_0_var(--ink)]">
          <div className="font-display text-4xl font-black">42</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-wide">Active Listings</div>
        </div>
        <div className="brutal-lg bg-[var(--electric)] p-6 text-white shadow-[6px_6px_0_0_var(--ink)]">
          <div className="font-display text-4xl font-black">8</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-wide">Pending Orders</div>
        </div>
      </div>
      
      <div className="brutal-lg bg-white p-10 text-center">
        <h2 className="font-display text-2xl font-black mb-4">More features coming soon</h2>
        <p className="text-[var(--ink)]/70">This is a placeholder for the seller dashboard.</p>
      </div>
    </main>
  );
}
