import type { ReactNode } from 'react';

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white brutal shadow-[var(--shadow-brutal)] p-6 z-10 text-[var(--ink)]">
        <div className="flex justify-between items-start gap-4 mb-4">
          <h2 className="font-display text-xl uppercase font-black">{title}</h2>
          <button type="button" className="font-mono text-xs font-black uppercase brutal px-2 py-1" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
