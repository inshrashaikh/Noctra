import { ShieldAlert, WifiOff } from 'lucide-react';
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
        'fixed bottom-18 md:bottom-6 right-4 z-40 flex items-center gap-2 rounded-full border border-noctra-infeasible/50 bg-[#0B0E14] hover:bg-[#131822] px-3.5 py-2.5 shadow-2xl transition-all duration-200 active:scale-95 group cursor-pointer hover:border-noctra-infeasible',
        className
      )}
      aria-label="Open Offline SOS Emergency Assistant"
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute -inset-0.5 rounded-full bg-noctra-infeasible opacity-60 animate-ping" />
        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-noctra-infeasible text-white shadow-md">
          <ShieldAlert className="h-4 w-4" />
        </div>
      </div>

      <div className="flex flex-col text-left">
        <span className="text-xs font-bold text-white group-hover:text-noctra-infeasible transition-colors">
          SOS Guide
        </span>
        <span className="flex items-center gap-1 text-[9px] font-mono text-[#94A3B8]">
          <WifiOff className="h-2.5 w-2.5 text-[#38BDF8]" />
          Offline Chat
        </span>
      </div>
    </button>
  );
}
