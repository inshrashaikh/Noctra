import { ShieldAlert } from 'lucide-react';
import { useEmergencyChatbot } from './useEmergencyChatbot';
import { cn } from '@/lib/cn';

interface FloatingSOSButtonProps {
  className?: string;
}

export function FloatingSOSButton({ className }: FloatingSOSButtonProps) {
  const { openChat, isOpen } = useEmergencyChatbot();

  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={() => openChat()}
      className={cn(
        'fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-[#0B0E14] hover:bg-[#131822] px-3 py-2 text-xs font-semibold shadow-lg hover:shadow-rose-950/30 transition-all duration-150 active:scale-95 group cursor-pointer hover:border-rose-500',
        className
      )}
      aria-label="Open Offline SOS Emergency Assistant"
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
        <ShieldAlert className="h-3.5 w-3.5" />
      </div>

      <div className="flex items-center gap-1.5 font-mono text-[11px]">
        <span className="font-bold text-white group-hover:text-rose-400 transition-colors">
          112 SOS Guide
        </span>
        <span className="text-[9px] text-[#38BDF8] bg-[#38BDF8]/10 px-1 rounded">
          Offline
        </span>
      </div>
    </button>
  );
}
