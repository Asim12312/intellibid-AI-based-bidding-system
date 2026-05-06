"use client";

export default function SellerProductsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-5xl font-black tracking-tighter">Products.</h1>
          <p className="mt-2 text-lg text-[var(--ink)]/70">Manage your listings and drafts.</p>
        </div>
        <button className="brutal bg-[var(--electric)] text-white px-6 py-3 font-display font-black uppercase shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:-translate-y-1">
          + New Listing
        </button>
      </header>
      <div className="brutal-lg bg-white p-10 text-center">
        <h2 className="font-display text-2xl font-black mb-4">You have 42 active listings</h2>
        <p className="text-[var(--ink)]/70">Placeholder for products table...</p>
      </div>
    </main>
  );
}
