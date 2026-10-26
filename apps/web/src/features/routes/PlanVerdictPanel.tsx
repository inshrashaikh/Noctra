import type { PlanVerdict, SafeHavenHandoff } from '@noctra/contracts';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
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
    <div className="space-y-3">
      {/* Sleek Verdict Header Banner */}
      <div
        className={cn(
          'rounded-xl border p-3.5 transition-all text-xs space-y-2',
          isRobust
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : isAtRisk
            ? 'border-amber-500/30 bg-amber-500/5'
            : 'border-rose-500/30 bg-rose-500/5'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isRobust ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : isAtRisk ? (
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span className="font-bold uppercase tracking-wider text-[11px] text-noctra-text">
              Noctra Verdict
            </span>
            <span className="text-[10px] font-mono text-noctra-muted">
              ({shiftEndTime} &rarr; {deadlineTime})
            </span>
          </div>

          <span
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border',
              isRobust
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                : isAtRisk
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
                : 'border-rose-500/40 bg-rose-500/15 text-rose-400'
            )}
          >
            {verdict.status}
          </span>
        </div>

        <p className="text-xs text-noctra-text/90 leading-relaxed font-sans">
          {verdict.summary}
        </p>

        {/* Replan Diff Strip */}
        {diff && (
          <div className="pt-2 border-t border-noctra-border/40 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="flex items-center gap-1 text-noctra-accent font-semibold">
                <RefreshCw className="h-3 w-3" />
                Replan Diff
              </span>
              {diff.status_changed && (
                <span className="text-amber-400">
                  {diff.previous_status} &rarr; {verdict.status}
                </span>
              )}
            </div>
            <p className="text-noctra-muted">{diff.explanation}</p>
            <div className="flex items-center gap-4 text-[10px] font-mono text-noctra-muted">
              <span>
                Slack Impact:{' '}
                <strong className={cn((diff.slack_delta_min || 0) < 0 ? 'text-rose-400' : 'text-emerald-400')}>
                  {diff.slack_delta_min && diff.slack_delta_min > 0 ? `+${diff.slack_delta_min}m` : `${diff.slack_delta_min || 0}m`}
                </strong>
              </span>
              <span>
                Decide-by:{' '}
                <strong className="text-noctra-accent">
                  {diff.decide_by_delta_min && diff.decide_by_delta_min < 0 ? `${diff.decide_by_delta_min}m earlier` : 'Unchanged'}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Critical Infeasible / Safe Haven Fallback Notice */}
      {!verdict.meets_deadline_supported && safeHaven && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <ShieldAlert className="h-4 w-4" />
              <span>No Supported Plan Meets Deadline — Safe Haven Activated</span>
            </div>
            <span className="text-[9px] font-mono uppercase bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30 font-semibold">
              Emergency
            </span>
          </div>

          <div className="rounded-lg bg-black/40 border border-white/5 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{safeHaven.primary.name}</span>
              <span className="font-mono text-noctra-accent text-[11px]">
                ~{safeHaven.walk_time_min}m walk ({safeHaven.arrival_hm})
              </span>
            </div>
            <div className="text-[11px] text-noctra-muted">
              {safeHaven.primary.hours_label} · Verified 24x7 staffed with security post.
            </div>
            {safeHaven.phone_or_contact && (
              <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-noctra-accent">
                <PhoneCall className="h-3 w-3" />
                <span>{safeHaven.phone_or_contact}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
