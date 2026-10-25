import { EvidenceChip } from './EvidenceChip';

const stages = [
  { range: '0–10 min', status: 'KNOWN' as const, age: '4 min ago' },
  { range: '10–60 min', status: 'OUTDATED' as const, age: '32 min ago' },
  { range: 'Beyond 60 min', status: 'UNKNOWN' as const, age: '2 hr ago' },
];

export function AgeAxis() {
  return (
    <div className="border-y border-noctra-border py-8">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold">Example fact: “Bus 14 running”</p>
        <p className="text-xs text-noctra-muted">Example times are illustrative.</p>
      </div>
      <div className="relative grid gap-8 md:grid-cols-3 md:gap-6">
        <div className="absolute left-0 right-0 top-[5px] hidden h-px bg-noctra-border-strong md:block" />
        {stages.map((stage) => (
          <div key={stage.status} className="relative md:pt-6">
            <span className="absolute left-0 top-0 hidden size-[11px] rounded-full border-2 border-noctra-surface bg-noctra-primary md:block" />
            <p className="mb-3 font-mono text-xs text-noctra-muted">{stage.range}</p>
            <EvidenceChip status={stage.status} age={stage.age} source="Transit feed" />
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-3 border-t border-noctra-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-noctra-muted">Incomplete evidence is different from old evidence.</p>
        <EvidenceChip status="PROBABLE" age="8 min ago" source="1 community report" />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-noctra-muted"><span>Just now</span><span>Hours ago</span></div>
    </div>
  );
}
