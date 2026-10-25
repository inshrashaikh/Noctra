import { Shield, Clock, MapPin, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ─── Simulated mock data — source_class="simulated" ─── */
const MOCK_ROUTE = {
  source_class: 'simulated' as const,
  origin: 'Bajaj Nagar Metro Stn',
  destination: 'Mankapur, Nagpur',
  departure: '2:30 AM',
  arrival: '3:08 AM',
  duration: '38 min',
  status: 'ROBUST' as const,
  legs: [
    { mode: 'Walk', detail: '6 min to bus stop', evidence: 'KNOWN' as const },
    { mode: 'Night Bus N7', detail: '22 min', evidence: 'PROBABLE' as const },
    { mode: 'Walk', detail: '10 min to home', evidence: 'KNOWN' as const },
  ],
};

const MOCK_RIBBON = [
  { time: '2:30', label: 'Shift ends', active: true },
  { time: '2:36', label: 'Reach bus stop', active: false },
  { time: '2:45', label: 'Last N7 departs', active: false },
  { time: '3:08', label: 'Arrive home', active: false },
];

const evidenceColors: Record<string, string> = {
  KNOWN: 'bg-noctra-known/15 text-noctra-known border-noctra-known/30',
  PROBABLE: 'bg-noctra-probable/15 text-noctra-probable border-noctra-probable/30',
  OUTDATED: 'bg-noctra-outdated/15 text-noctra-outdated border-noctra-outdated/30',
  UNKNOWN: 'bg-noctra-unknown/15 text-noctra-unknown border-noctra-unknown/30',
};

function EvidenceChip({ label }: { label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
        'font-mono text-xs font-semibold',
        evidenceColors[label],
      )}
    >
      {label === 'KNOWN' && <Check className="h-3 w-3" />}
      {label === 'PROBABLE' && <Clock className="h-3 w-3" />}
      {label}
    </span>
  );
}

/**
 * Product Preview — a realistic-looking dashboard mockup.
 * All data is clearly labeled SIMULATED.
 */
export function ProductPreview() {
  return (
    <section className="relative px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Section header */}
        <h2 className="mb-3 text-center text-2xl font-bold text-noctra-text">
          See what Noctra looks like
        </h2>
        <p className="mb-10 text-center text-noctra-muted">
          A preview of the route planner dashboard with simulated data.
        </p>

        {/* Dashboard mockup card */}
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border border-noctra-border',
            'bg-noctra-surface shadow-md',
          )}
        >
          {/* SIMULATED badge */}
          <div
            className={cn(
              'absolute top-3 right-3 z-10 rounded-full',
              'bg-noctra-outdated/20 px-3 py-1 font-mono text-xs',
              'font-semibold text-noctra-outdated',
            )}
          >
            SIMULATED
          </div>

          {/* Route card */}
          <div className="border-b border-noctra-border p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-noctra-muted">
                  <MapPin className="h-4 w-4" />
                  {MOCK_ROUTE.origin}
                  <span className="text-noctra-accent">→</span>
                  {MOCK_ROUTE.destination}
                </div>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-mono text-2xl font-bold text-noctra-text">
                    {MOCK_ROUTE.departure}
                  </span>
                  <span className="text-noctra-muted">—</span>
                  <span className="font-mono text-2xl font-bold text-noctra-text">
                    {MOCK_ROUTE.arrival}
                  </span>
                  <span className="text-sm text-noctra-muted">
                    ({MOCK_ROUTE.duration})
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  'mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1',
                  'bg-noctra-known/15 font-mono text-xs font-semibold text-noctra-known',
                )}
              >
                <Shield className="h-3 w-3" />
                {MOCK_ROUTE.status}
              </span>
            </div>

            {/* Legs */}
            <div className="space-y-2">
              {MOCK_ROUTE.legs.map((leg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center justify-between rounded-lg',
                    'bg-noctra-raised px-4 py-2.5',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-noctra-text">
                      {leg.mode}
                    </span>
                    <span className="text-sm text-noctra-muted">
                      {leg.detail}
                    </span>
                  </div>
                  <EvidenceChip label={leg.evidence} />
                </div>
              ))}
            </div>
          </div>

          {/* Night ribbon */}
          <div className="flex items-center gap-0 p-5">
            {MOCK_RIBBON.map((step, i) => (
              <div key={i} className="flex flex-1 flex-col items-center">
                <span
                  className={cn(
                    'font-mono text-sm font-semibold',
                    step.active ? 'text-noctra-accent' : 'text-noctra-muted',
                  )}
                >
                  {step.time}
                </span>
                <div className="relative my-1.5 flex w-full items-center justify-center">
                  <div
                    className={cn(
                      'h-3 w-3 rounded-full border-2',
                      step.active
                        ? 'border-noctra-accent bg-noctra-accent'
                        : 'border-noctra-border bg-noctra-surface',
                    )}
                  />
                  {i < MOCK_RIBBON.length - 1 && (
                    <div className="absolute left-1/2 h-0.5 w-full bg-noctra-border" />
                  )}
                </div>
                <span className="text-center text-xs text-noctra-muted">
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Environmental risk disclaimer */}
          <div className="flex items-center gap-2 border-t border-noctra-border px-5 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-noctra-outdated" />
            <span className="text-xs text-noctra-muted">
              Environmental risk proxy (not crime data) · All data is simulated
              for demonstration purposes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
