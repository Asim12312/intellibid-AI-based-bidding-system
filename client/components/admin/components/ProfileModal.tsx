import Modal from './Modal';
import type { AdminProfile } from '../context/AuthContext';

export default function ProfileModal({
  open,
  onClose,
  admin,
}: {
  open: boolean;
  onClose: () => void;
  admin: AdminProfile | null;
}) {
  if (!admin) return null;
  return (
    <Modal open={open} onClose={onClose} title="Admin profile">
      <div className="flex gap-4 items-start">
        <img src={admin.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'} alt="" className="w-20 h-20 brutal object-cover" />
        <div className="font-mono text-xs space-y-2">
          <p className="font-display text-lg uppercase font-black font-sans">{admin.name}</p>
          <p className="lowercase text-[var(--muted-foreground)]">{admin.email}</p>
          <p className="uppercase font-black text-[10px]">Role: {admin.role.replace('_', ' ')}</p>
        </div>
      </div>
    </Modal>
  );
}
