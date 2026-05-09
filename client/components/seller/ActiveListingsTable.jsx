import { motion } from "framer-motion";
import { Clock, Eye, TrendingUp, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function ActiveListingsTable({ listings }) {
  if (!listings || listings.length === 0) {
    return (
      <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl p-8 text-center shadow-[4px_4px_0_0_var(--ink)]">
        <div className="text-4xl mb-4">📦</div>
        <h3 className="font-display text-xl font-black uppercase tracking-tight mb-2">No Active Listings</h3>
        <p className="font-medium opacity-70 mb-6">You aren't selling anything right now.</p>
        <Link href="/seller/products/create" className="inline-flex items-center gap-2 bg-[var(--electric)] text-white px-6 py-3 rounded-xl border-[3px] border-[var(--ink)] font-bold uppercase text-sm shadow-[2px_2px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_var(--ink)] transition-all">
          Create Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl overflow-hidden shadow-[4px_4px_0_0_var(--ink)]">
      <div className="p-5 border-b-[3px] border-[var(--ink)] bg-[var(--background)] flex justify-between items-center">
        <h2 className="font-display text-xl font-black uppercase tracking-tighter">Active Listings</h2>
        <Link href="/seller/products" className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-[var(--electric)] transition-colors">
          Manage All
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-[3px] border-[var(--ink)] bg-gray-50">
              <th className="p-4 font-display text-xs font-black uppercase tracking-widest text-gray-500">Product</th>
              <th className="p-4 font-display text-xs font-black uppercase tracking-widest text-gray-500">Current Highest Bid</th>
              <th className="p-4 font-display text-xs font-black uppercase tracking-widest text-gray-500">Activity</th>
              <th className="p-4 font-display text-xs font-black uppercase tracking-widest text-gray-500">Time Left</th>
              <th className="p-4 font-display text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((item, i) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border-b-[3px] border-[var(--ink)] last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg border-[2px] border-[var(--ink)] object-cover bg-gray-100" />
                    <span className="font-bold">{item.title}</span>
                  </div>
                </td>
                <td className="p-4 font-bold text-[var(--acid)] drop-shadow-[1px_1px_0_var(--ink)] text-lg">
                  ${item.currentBid.toLocaleString()}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-4 text-sm font-bold opacity-80">
                    <span className="flex items-center gap-1"><TrendingUp size={14} className="text-[var(--electric)]"/> {item.bidCount} Bids</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-sm font-bold bg-[var(--sunset)] text-white px-3 py-1.5 rounded-lg border-[2px] border-[var(--ink)] w-max shadow-[2px_2px_0_0_var(--ink)]">
                    <Clock size={14} /> 
                    {new Date(item.endTime).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4 text-right">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                    </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
