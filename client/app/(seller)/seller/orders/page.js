"use client";

export default function SellerOrdersPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
      <header className="mb-10">
        <h1 className="font-display text-5xl font-black tracking-tighter">Orders.</h1>
        <p className="mt-2 text-lg text-[var(--ink)]/70">Track shipments and payments.</p>
      </header>
      <div className="brutal-lg bg-white p-10 text-center">
        <h2 className="font-display text-2xl font-black mb-4">You have 8 pending orders</h2>
        <p className="text-[var(--ink)]/70">Placeholder for orders tracking table...</p>
      </div>
    </main>
  );
}
