import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";

export default function SellerInsights({ insights }) {
  if (!insights || insights.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
        case 'warning': return <AlertTriangle size={20} className="text-white" />;
        case 'optimization': return <Sparkles size={20} className="text-white" />;
        case 'trend': return <TrendingUp size={20} className="text-white" />;
        default: return <Sparkles size={20} className="text-white" />;
    }
  };

  const getColor = (type) => {
      switch (type) {
          case 'warning': return 'var(--hotpink)';
          case 'optimization': return 'var(--electric)';
          case 'trend': return 'var(--acid)';
          default: return 'var(--ink)';
      }
  };

  return (
    <div className="bg-white border-[3px] border-[var(--ink)] rounded-2xl overflow-hidden shadow-[4px_4px_0_0_var(--ink)]">
      <div className="p-5 border-b-[3px] border-[var(--ink)] bg-[var(--acid)] text-[var(--ink)] flex justify-between items-center">
        <h2 className="font-display text-xl font-black uppercase tracking-tighter flex items-center gap-2">
          <Sparkles size={24} /> AI Sales Insights
        </h2>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col gap-4">
          {insights.map((insight, i) => (
            <motion.div 
              key={insight.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="border-[3px] border-[var(--ink)] rounded-xl overflow-hidden bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--ink)] transition-all flex flex-col md:flex-row"
            >
              <div 
                className="p-4 flex items-center justify-center border-b-[3px] md:border-b-0 md:border-r-[3px] border-[var(--ink)] w-full md:w-16 shrink-0"
                style={{ background: getColor(insight.type) }}
              >
                  {getIcon(insight.type)}
              </div>
              <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-lg mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm font-medium opacity-80">{insight.description}</p>
                </div>
                <button className="whitespace-nowrap flex items-center justify-center gap-2 px-4 py-2 bg-[var(--ink)] text-white border-[2px] border-[var(--ink)] font-bold text-xs uppercase rounded-lg shadow-[2px_2px_0_0_var(--acid)] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_var(--acid)] transition-all">
                  {insight.action} <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
