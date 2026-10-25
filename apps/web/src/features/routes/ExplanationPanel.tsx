import type { Explanation } from '@noctra/contracts';
import { Sparkles, HelpCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ExplanationPanelProps {
  explanation: Explanation;
  missingInformation: string[];
  className?: string;
}

export function ExplanationPanel({
  explanation,
  missingInformation,
  className,
}: ExplanationPanelProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-noctra-border bg-noctra-surface p-4 space-y-3 text-xs',
        className
      )}
    >
      <h4 className="font-semibold uppercase tracking-wider text-noctra-muted flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-noctra-accent" />
        Decision Logic Engine Synthesis
      </h4>

      {/* Why Chosen */}
      <div className="rounded-lg border border-noctra-border bg-noctra-raised/60 p-3">
        <div className="font-bold text-noctra-known mb-1">
          Why recommended candidate was selected:
        </div>
        <p className="text-noctra-text leading-relaxed">{explanation.why_chosen}</p>
      </div>

      {/* Why Rejected */}
      {explanation.why_rejected.length > 0 && (
        <div className="space-y-1.5">
          <div className="font-semibold text-noctra-muted">
            Discarded Alternative Candidates:
          </div>
          <div className="space-y-1.5">
            {explanation.why_rejected.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 rounded-lg border border-noctra-border/50 bg-noctra-surface p-2.5 text-noctra-muted"
              >
                <AlertCircle className="h-3.5 w-3.5 text-noctra-infeasible shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-noctra-text font-bold uppercase mr-1">
                    {item.id}:
                  </span>
                  <span>{item.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Information / Honest Unknowns */}
      {missingInformation.length > 0 && (
        <div className="rounded-lg border border-noctra-unknown/30 bg-noctra-unknown/5 p-3">
          <div className="font-bold text-noctra-unknown flex items-center gap-1.5 mb-1">
            <HelpCircle className="h-3.5 w-3.5" />
            Active Epistemic Gaps (What Noctra Cannot Verify):
          </div>
          <ul className="list-disc list-inside space-y-1 text-noctra-muted">
            {missingInformation.map((info, idx) => (
              <li key={idx}>{info}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
