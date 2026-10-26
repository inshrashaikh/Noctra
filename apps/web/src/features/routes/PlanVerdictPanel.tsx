import type { PlanVerdict, SafeHavenHandoff } from '@noctra/contracts';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Hospital,
  PhoneCall,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface PlanVerdictPanelProps {
  verdict?: PlanVerdict;
  safeHaven?: SafeHavenHandoff | null;
  shiftEndTime?: string;
  deadlineTime?: string;
}

export function PlanVerdictPanel({
  verdict,
  safeHaven,
  shiftEndTime = '02:15',
  deadlineTime = '03:00',
}: PlanVerdictPanelProps) {
  if (!verdict) return null;

  const isRobust = verdict.status === 'ROBUST';
  const isAtRisk = verdict.status === 'AT_RISK';
  const diff = verdict.replan_diff;

  return (
    <div className="rounded-xl border border-noctra-border bg-noctra-surface p-4 space-y-3.5 shadow-sm">
      {/* Overall Verdict Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRobust ? (
            <ShieldCheck className="h-4.5 w-4.5 text-noctra-known" />
          ) : isAtRisk ? (
            <AlertTriangle className="h-4.5 w-4.5 text-noctra-at-risk" />
          ) : (
            <ShieldAlert className="h-4.5 w-4.5 text-noctra-infeasible" />
          )}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-noctra-text">
              Noctra Deadline Verdict
            </h4>
            <div className="text-[10px] font-mono text-noctra-muted">
              Shift window: {shiftEndTime} &rarr; {deadlineTime}
            </div>
          </div>
        </div>

        <span
          className={cn(
            'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border',
            isRobust
              ? 'border-noctra-known/40 bg-noctra-known/15 text-noctra-known'
              : isAtRisk
              ? 'border-noctra-at-risk/40 bg-noctra-at-risk/15 text-noctra-at-risk'
              : 'border-noctra-infeasible/40 bg-noctra-infeasible/15 text-noctra-infeasible'
          )}
        >
          {verdict.status}
        </span>
      </div>

      {/* Honest Warning Notice if deadline cannot be met with supported evidence */}
      {!verdict.meets_deadline_supported && (
        <div className="rounded-lg border border-noctra-infeasible/40 bg-noctra-infeasible/10 p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-noctra-infeasible">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Honest Noctra Epistemic Verdict</span>
          </div>
          <p className="text-[11px] text-noctra-text">
            No sufficiently supported plan meets your {deadlineTime} deadline under verified nocturnal conditions.
            Do not embark on unverified options. Proceed to the nearest verified safe haven below.
          </p>
        </div>
      )}

      {/* Summary Sentence */}
      <p className="text-xs text-noctra-muted leading-relaxed">
        {verdict.summary}
      </p>

      {/* Replan Comparison Diff (What Changed) */}
      {diff && (
        <div className="rounded-lg border border-noctra-accent/40 bg-noctra-raised p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-noctra-border/60 pb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-noctra-accent">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>What Changed (Replan Diff)</span>
            </div>
            {diff.status_changed && (
              <span className="text-[10px] font-mono text-noctra-at-risk font-semibold">
                Status: {diff.previous_status} &rarr; {verdict.status}
              </span>
            )}
          </div>

          <p className="text-[11px] text-noctra-text">{diff.explanation}</p>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
            <div className="rounded bg-noctra-surface p-1.5 border border-noctra-border text-noctra-muted">
              <span>Slack Impact: </span>
              <span className={cn('font-bold', (diff.slack_delta_min || 0) < 0 ? 'text-noctra-infeasible' : 'text-noctra-known')}>
                {diff.slack_delta_min && diff.slack_delta_min > 0 ? `+${diff.slack_delta_min}m` : `${diff.slack_delta_min || 0}m`}
              </span>
            </div>
            <div className="rounded bg-noctra-surface p-1.5 border border-noctra-border text-noctra-muted">
              <span>Decide-by Delta: </span>
              <span className="font-bold text-noctra-accent">
                {diff.decide_by_delta_min && diff.decide_by_delta_min < 0 ? `${diff.decide_by_delta_min}m earlier` : 'Unchanged'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Safe-Haven Handoff Card */}
      {safeHaven && (
        <div className="rounded-lg border border-noctra-border bg-noctra-raised/80 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-noctra-text">
              <Hospital className="h-4 w-4 text-noctra-accent" />
              <span>Verified Staffed Safe-Haven Fallback</span>
            </div>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-noctra-known/15 text-noctra-known border border-noctra-known/30 font-semibold">
              Open 24×7
            </span>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-noctra-text">{safeHaven.primary.name}</div>
            <div className="text-[11px] text-noctra-muted flex items-center justify-between">
              <span>{safeHaven.primary.hours_label}</span>
              <span className="font-mono text-noctra-accent">
                ~{safeHaven.walk_time_min}m walk (Arrives {safeHaven.arrival_hm})
              </span>
            </div>
          </div>

          {safeHaven.secondary && (
            <div className="pt-1.5 border-t border-noctra-border/40 text-[11px] text-noctra-muted flex items-center justify-between">
              <span>Secondary: {safeHaven.secondary.name}</span>
              <span className="font-mono">{safeHaven.secondary.hours_label}</span>
            </div>
          )}

          {safeHaven.phone_or_contact && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-noctra-muted pt-1 border-t border-noctra-border/40">
              <PhoneCall className="h-3 w-3 text-noctra-accent" />
              <span>{safeHaven.phone_or_contact}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
