import type { Evidence } from '@noctra/contracts';
import { cn } from '@/lib/cn';
import { Activity } from 'lucide-react';

interface FreshnessMeterProps {
  evidenceList: Evidence[];
  className?: string;
}

export function FreshnessMeter({ evidenceList, className }: FreshnessMeterProps) {
  const total = evidenceList.length || 1;
  const known = evidenceList.filter((e) => e.label === 'KNOWN').length;
  const probable = evidenceList.filter((e) => e.label === 'PROBABLE').length;
  const outdated = evidenceList.filter((e) => e.label === 'OUTDATED').length;
  const unknown = evidenceList.filter((e) => e.label === 'UNKNOWN').length;

  const knownPct = Math.round((known / total) * 100);
  const probablePct = Math.round((probable / total) * 100);
  const outdatedPct = Math.round((outdated / total) * 100);
  const unknownPct = Math.round((unknown / total) * 100);

  return (
    <div
      className={cn(
        'rounded-xl border border-noctra-border bg-noctra-surface p-4 space-y-3',
        className
      )}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-noctra-text flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-noctra-accent" />
          Evidence Freshness Profile
        </span>
        <span className="font-mono text-noctra-muted text-[11px]">
          {evidenceList.length} observed claims
        </span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-2 w-full rounded-full overflow-hidden bg-noctra-raised">
        {knownPct > 0 && (
          <div style={{ width: `${knownPct}%` }} className="bg-noctra-known" title={`KNOWN: ${knownPct}%`} />
        )}
        {probablePct > 0 && (
          <div style={{ width: `${probablePct}%` }} className="bg-noctra-probable" title={`PROBABLE: ${probablePct}%`} />
        )}
        {outdatedPct > 0 && (
          <div style={{ width: `${outdatedPct}%` }} className="bg-noctra-outdated" title={`OUTDATED: ${outdatedPct}%`} />
        )}
        {unknownPct > 0 && (
          <div style={{ width: `${unknownPct}%` }} className="bg-noctra-unknown" title={`UNKNOWN: ${unknownPct}%`} />
        )}
      </div>

      {/* Legend with counts */}
      <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-center">
        <div className="rounded border border-noctra-known/20 bg-noctra-known/5 p-1 text-noctra-known">
          KNOWN: {known}
        </div>
        <div className="rounded border border-noctra-probable/20 bg-noctra-probable/5 p-1 text-noctra-probable">
          PROBABLE: {probable}
        </div>
        <div className="rounded border border-noctra-outdated/20 bg-noctra-outdated/5 p-1 text-noctra-outdated">
          OUTDATED: {outdated}
        </div>
        <div className="rounded border border-noctra-unknown/20 bg-noctra-unknown/5 p-1 text-noctra-unknown">
          UNKNOWN: {unknown}
        </div>
      </div>
    </div>
  );
}
