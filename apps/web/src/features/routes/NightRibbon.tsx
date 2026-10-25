import type { Candidate } from '@noctra/contracts';
import { cn } from '@/lib/cn';

export interface NightRibbonProps {
  candidate?: Candidate | null;
  shiftEndTime?: string; // e.g. "2:15"
  deadlineTime?: string; // e.g. "3:00"
  decideByTime?: string; // e.g. "2:32"
  spareMinutes?: number;
  className?: string;
}

export function NightRibbon({
  candidate,
  shiftEndTime = '2:15',
  deadlineTime = '3:00',
  decideByTime = '2:32',
  spareMinutes = 14,
  className,
}: NightRibbonProps) {
  // Window: 45 minutes (02:15 to 03:00)
  const windowMinutes = 45;

  const optArrival = candidate ? Math.min(windowMinutes, candidate.eta.optimistic_min) : 20;
  const expArrival = candidate ? Math.min(windowMinutes, candidate.eta.expected_min) : 27;
  const pessArrival = candidate ? Math.min(windowMinutes, candidate.eta.pessimistic_min) : 31;

  const optPct = (optArrival / windowMinutes) * 100;
  const expPct = (expArrival / windowMinutes) * 100;
  const pessPct = (pessArrival / windowMinutes) * 100;

  // Decide by 2:32 AM is 17 min after 2:15 AM
  const decideByPct = (17 / windowMinutes) * 100;

  const actualSpare = candidate ? candidate.slack_min.pessimistic : spareMinutes;
  const isOnTime = actualSpare >= 0;

  return (
    <div className={cn('rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-4 text-[#14181D] space-y-3', className)}>
      {/* Header Row */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#14181D]">Night Ribbon Timeline</span>
        <div className="flex items-center gap-3 font-mono text-[11px] text-[#5B6672]">
          <span>Ends <strong className="text-[#14181D]">{shiftEndTime} AM</strong></span>
          <span>→</span>
          <span>Home by <strong className="text-[#14181D]">{deadlineTime} AM</strong></span>
        </div>
      </div>

      {/* Main Track (Navy nested bands at three opacities) */}
      <div className="relative h-9 w-full rounded-lg bg-[#F1EFE8] overflow-hidden flex items-center border border-[#E2DED3]">
        {/* Worst arrival band (15% navy) */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-[#12233A]/15 border-r border-[#12233A]/30"
          style={{ width: `${Math.min(100, pessPct)}%` }}
          title={`Worst arrival: +${pessArrival}m`}
        />

        {/* Expected arrival band (35% navy) */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-[#12233A]/35 border-r border-[#12233A]/50"
          style={{ width: `${Math.min(100, expPct)}%` }}
          title={`Expected arrival: +${expArrival}m`}
        />

        {/* Best arrival band (70% navy) */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-[#12233A]/70 border-r-2 border-[#12233A]"
          style={{ width: `${Math.min(100, optPct)}%` }}
          title={`Best arrival: +${optArrival}m`}
        />

        {/* Amber Decide By Marker */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center justify-center z-10"
          style={{ left: `${decideByPct}%` }}
        >
          <div className="h-full w-1 bg-[#F2B54A]" />
          <div className="absolute -top-1 rounded bg-[#F2B54A] px-1 py-0.2 text-[9px] font-mono font-bold text-[#14181D] whitespace-nowrap shadow-xs">
            Decide by {decideByTime}
          </div>
        </div>

        {/* Overlaid Time Ticks */}
        <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-mono pointer-events-none select-none text-[#5B6672]">
          <span className="font-semibold text-[#14181D]">{shiftEndTime}</span>
          <span className="font-semibold text-[#14181D]">{deadlineTime}</span>
        </div>
      </div>

      {/* Footer Status Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-[#E2DED3]/60">
        <div className="flex items-center gap-3 font-mono text-[11px] text-[#5B6672]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#12233A]/70" /> Best ({optArrival}m)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#12233A]/35" /> Expected ({expArrival}m)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#12233A]/15" /> Worst ({pessArrival}m)
          </span>
        </div>

        <div className="font-mono text-xs font-semibold">
          {isOnTime ? (
            <span className="text-[#0F766E]">
              ON TIME, {actualSpare} min spare (worst case)
            </span>
          ) : (
            <span className="text-[#A12828]">
              LATE, misses deadline by {Math.abs(actualSpare)} min
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
