import { Check } from 'lucide-react';

export function NightRibbon() {
  return (
    <div aria-label="Journey timing: on time with 14 minutes spare in the worst case">
      <div className="mb-6 flex justify-between font-mono text-xs text-noctra-muted">
        <span>2:15</span><span>2:30</span><span>2:45</span><span>3:00</span>
      </div>
      <div className="relative h-[76px]">
        <div className="absolute left-0 right-0 top-7 h-px bg-noctra-border-strong" />
        <div className="absolute left-0 top-5 h-5 w-[69%] rounded-sm bg-noctra-primary/20" title="Worst-case arrival 2:46" />
        <div className="absolute left-0 top-[22px] h-3 w-[53%] rounded-sm bg-noctra-primary/45" title="Expected arrival 2:39" />
        <div className="absolute left-0 top-6 h-2 w-[38%] rounded-sm bg-noctra-primary" title="Best-case arrival 2:32" />
        <div className="absolute left-[38%] top-0 h-14 w-0.5 bg-noctra-accent-text">
          <span className="absolute -left-1 top-0 size-2.5 rounded-sm bg-noctra-accent" />
          <span className="absolute left-2 top-[-3px] whitespace-nowrap rounded-sm bg-noctra-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold text-noctra-text">Decide by 2:32</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-noctra-border pt-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-noctra-known"><Check className="size-4" aria-hidden="true" />ON TIME</span>
        <span className="font-mono text-xs text-noctra-muted">14 min spare <span className="font-sans">(worst case)</span></span>
      </div>
    </div>
  );
}
