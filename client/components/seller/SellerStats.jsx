import { motion } from "framer-motion";
import { DollarSign, Package, Truck, Eye } from "lucide-react";

export default function SellerStats({ stats }) {
  const cards = [
    {
      title: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "var(--acid)",
      textColor: "var(--ink)"
    },
    {
      title: "Active Listings",
      value: stats?.activeListingsCount || 0,
      icon: Package,
      color: "var(--electric)",
      textColor: "white"
    },
    {
      title: "Pending Shipments",
      value: stats?.pendingShipments || 0,
      icon: Truck,
      color: "var(--hotpink)",
      textColor: "white"
    },
    {
      title: "Total Views",
      value: (stats?.totalViews || 0).toLocaleString(),
      icon: Eye,
      color: "var(--sunset)",
      textColor: "white"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-2xl border-[3px] border-[var(--ink)] p-6 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--ink)]"
            style={{ background: card.color, color: card.textColor }}
          >
            <div className="flex justify-between items-start mb-4">
              <div 
                className="p-3 rounded-xl border-[3px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]"
                style={{ background: "white", color: "var(--ink)" }}
              >
                <Icon size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-widest opacity-90 mb-1">
                {card.title}
              </p>
              <h3 className="font-display text-4xl font-black tracking-tighter">
                {card.value}
              </h3>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
