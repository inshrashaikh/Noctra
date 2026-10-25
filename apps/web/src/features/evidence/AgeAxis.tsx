import { EvidenceChip } from '@/components/common/EvidenceChip';

export function AgeAxis() {
  return (
    <div className="w-full space-y-8 rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-6 lg:p-8">
      {/* Age Axis Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-[#14181D]">
            Telemetry Freshness Timeline: &ldquo;Bus 14 running&rdquo;
          </span>
          <span className="font-mono text-[11px] text-[#5B6672]">
            *Freshness TTL windows shown as illustrative examples
          </span>
        </div>

        {/* Primary Time Track */}
        <div className="relative pt-8 pb-10">
          {/* Track Line with gradient step markers */}
          <div className="relative h-2 w-full rounded-full bg-[#E2DED3] overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-[#0F766E]/40" />
            <div className="absolute left-[20%] top-0 bottom-0 w-[45%] bg-[#8A5A00]/40" />
            <div className="absolute left-[65%] top-0 bottom-0 w-[35%] bg-[#5E5780]/30" />
          </div>

          {/* Points on Track */}
          <div className="absolute top-1 left-0 flex flex-col items-center">
            <EvidenceChip label="KNOWN" age="0–10 min" source="Live GPS" />
            <div className="h-4 w-0.5 bg-[#0F766E] mt-1" />
            <span className="font-mono text-[10px] text-[#5B6672] mt-1">0m (Just now)</span>
          </div>

          <div className="absolute top-1 left-[35%] flex flex-col items-center -translate-x-1/2">
            <EvidenceChip label="OUTDATED" age="10–60 min" source="Telemetry expired" />
            <div className="h-4 w-0.5 bg-[#8A5A00] mt-1" />
            <span className="font-mono text-[10px] text-[#5B6672] mt-1">25m ago</span>
          </div>

          <div className="absolute top-1 right-0 flex flex-col items-center">
            <EvidenceChip label="UNKNOWN" age="> 60 min" source="No ping" />
            <div className="h-4 w-0.5 bg-[#5E5780] mt-1" />
            <span className="font-mono text-[10px] text-[#5B6672] mt-1">2h+ (Expired)</span>
          </div>
        </div>

        {/* Separate PROBABLE Row */}
        <div className="rounded-lg border border-[#E2DED3] bg-[#F1EFE8] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-[#14181D]">
                Independent State: Incomplete or Single-Source Claims
              </span>
              <span className="rounded bg-[#FFFFFF] border border-[#E2DED3] px-1.5 py-0.2 font-mono text-[10px] text-[#5B6672]">
                Parallel Track
              </span>
            </div>
            <p className="text-xs text-[#5B6672]">
              Facts that are statistically likely or reported by a community member, pending second confirmation.
            </p>
          </div>
          <EvidenceChip
            label="PROBABLE"
            age="12 min ago"
            source="Single report"
            subject="Road open"
          />
        </div>
      </div>

      {/* 4 Columns for the four labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-[#E2DED3]">
        <div className="space-y-2 rounded-lg border border-[#E2DED3] bg-[#FFFFFF] p-4">
          <EvidenceChip label="KNOWN" age="3 min ago" />
          <p className="text-xs text-[#14181D] font-medium leading-relaxed">
            Verified from a live digital telemetry ping or physically confirmed facility register within its TTL.
          </p>
          <div className="font-mono text-[11px] text-[#5B6672]">
            e.g. Wardha Road Streetlights active via SCADA.
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-[#E2DED3] bg-[#FFFFFF] p-4">
          <EvidenceChip label="PROBABLE" age="8 min ago" />
          <p className="text-xs text-[#14181D] font-medium leading-relaxed">
            Statistically likely from regular shift transit patterns, but awaiting a direct secondary live confirmation.
          </p>
          <div className="font-mono text-[11px] text-[#5B6672]">
            e.g. Aapli Bus N7 scheduled feeder departure.
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-[#E2DED3] bg-[#FFFFFF] p-4">
          <EvidenceChip label="OUTDATED" age="45 min ago" />
          <p className="text-xs text-[#14181D] font-medium leading-relaxed">
            Was known and verified, but the data has aged past its freshness threshold without an active refresh.
          </p>
          <div className="font-mono text-[11px] text-[#5B6672]">
            e.g. Auto stand occupancy from 45 min ago.
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-[#E2DED3] bg-[#FFFFFF] p-4">
          <EvidenceChip label="UNKNOWN" age="No ping" />
          <p className="text-xs text-[#14181D] font-medium leading-relaxed">
            No reliable data is available. Noctra explicitly reports missing data rather than guessing.
          </p>
          <div className="font-mono text-[11px] text-[#5B6672]">
            e.g. On-demand cab availability at 2:30 AM.
          </div>
        </div>
      </div>

      {/* Closing Rule */}
      <div className="pt-2 text-center text-xs font-semibold text-[#5B6672]">
        &ldquo;Noctra never turns missing data into a confident answer.&rdquo;
      </div>
    </div>
  );
}
