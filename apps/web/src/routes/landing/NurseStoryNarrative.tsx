import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Clock,
  Shield,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';
import { cn } from '@/lib/cn';

interface NarrativeStep {
  time: string;
  title: string;
  phase: string;
  summary: string;
  detail: string;
  evidenceBadge: {
    label: 'KNOWN' | 'PROBABLE' | 'OUTDATED' | 'UNKNOWN';
    source: string;
    description: string;
  };
  stat: {
    label: string;
    value: string;
    color: string;
  };
}

const NARRATIVE_STEPS: NarrativeStep[] = [
  {
    time: '02:15 AM',
    phase: 'Shift Finish',
    title: 'GMCH Hospital ICU — Shift Closes',
    summary:
      'Priya completes a 10-hour intensive care shift. The night ward doors close. Her target is home at Dharampeth by 03:00 AM.',
    detail:
      'Daytime transit apps assume frequent buses and instant cabs. But at 2:15 AM, city streets are quiet, the regular N7 bus ended at 01:45 AM, and ride-hail apps show endless searching spinners.',
    evidenceBadge: {
      label: 'OUTDATED',
      source: 'Municipal Transit Schedule',
      description: 'Daytime bus timetables expired at 23:00. No verified night departures.',
    },
    stat: {
      label: 'Target Slack',
      value: '45 min to deadline',
      color: 'text-noctra-accent',
    },
  },
  {
    time: '02:18 AM',
    phase: 'Epistemic Truth',
    title: 'Noctra Cockpit: Telling What Is Real',
    summary:
      'Instead of guessing or inventing cab arrival times, Noctra classifies every road segment with explicit confidence labels.',
    detail:
      'Wardha Road streetlighting is KNOWN to be operational via municipal sensor telemetry. Ride availability is honestly declared UNKNOWN. No false promises.',
    evidenceBadge: {
      label: 'UNKNOWN',
      source: 'Ride Fleet API',
      description: 'Ride availability is UNKNOWN until driver accepts. We do not invent wait times.',
    },
    stat: {
      label: 'Lighting Proxy',
      value: '88% lit corridors',
      color: 'text-noctra-known',
    },
  },
  {
    time: '02:22 AM',
    phase: 'Decision Engine',
    title: 'Plan A with a Hard "Decide By" Deadline',
    summary:
      'Noctra computes Plan A (Metro + Lit Walk) with a fallback Plan B (Shared Auto Corridor via Sitabuldi).',
    detail:
      'Priya is instructed: "Decide by 02:28 AM". If Metro Gate 2 is locked upon arrival, do not wait or panic — immediately pivot to Plan B.',
    evidenceBadge: {
      label: 'KNOWN',
      source: 'Metro Ops Telemetry',
      description: 'Orange Line night shuttle operational until 02:35 AM.',
    },
    stat: {
      label: 'Decide-by Clock',
      value: '6 min to pivot',
      color: 'text-noctra-accent',
    },
  },
  {
    time: '02:32 AM',
    phase: 'En-Route Refuges',
    title: '24×7 Safe Refuges & Trusted Circle',
    summary:
      'En route along the corridor, Noctra continuously maps verified 24×7 safe havens and tracks check-in deadlines.',
    detail:
      'Within 400m are Sitabuldi Police Assistance Booth and Apollo 24h Pharmacy. Priya shares a live tracking link with her family. If she fails to check in by 03:00 AM, an alert triggers.',
    evidenceBadge: {
      label: 'KNOWN',
      source: 'Verified Refuge Registry',
      description: 'Police Assistance Booth open with 24×7 on-duty personnel.',
    },
    stat: {
      label: 'Nearest Refuge',
      value: '350m (Police Booth)',
      color: 'text-noctra-known',
    },
  },
  {
    time: '02:44 AM',
    phase: 'Safe Arrival',
    title: 'Home at Dharampeth: Mission Complete',
    summary:
      'Priya arrives safely home at 02:44 AM — 16 minutes before her hard deadline.',
    detail:
      'With a single tap on "I\'m Safely Home", her Trusted Circle is reassured. No anxiety, no guessing, no stranded darkness.',
    evidenceBadge: {
      label: 'KNOWN',
      source: 'Worker Safe Check-in',
      description: 'Arrival confirmed by worker at 02:44 AM.',
    },
    stat: {
      label: 'Buffer Saved',
      value: '+16 min cushion',
      color: 'text-noctra-known',
    },
  },
];

export function NurseStoryNarrative() {
  const [activeStep, setActiveStep] = useState(0);
  const current = NARRATIVE_STEPS[activeStep];

  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-8 border-y border-noctra-border/60 bg-noctra-surface/40">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-noctra-accent/40 bg-noctra-accent/10 px-3 py-1 font-mono text-xs text-noctra-accent">
            <span>Scroll Narrative</span>
            <span>•</span>
            <span className="font-semibold uppercase tracking-wider">
              Illustrative Scenario
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-noctra-text sm:text-4xl">
            One Night,{' '}
            <span className="font-mono text-noctra-accent">02:15 AM</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-noctra-muted">
            Follow Priya, an ICU nurse at Government Medical College &amp; Hospital
            (GMCH) Nagpur, as Noctra guides her decision journey home.
          </p>
        </div>

        {/* Narrative Interactive Stepper */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Timeline Step Selector (4 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {NARRATIVE_STEPS.map((step, idx) => {
              const isSelected = activeStep === idx;
              return (
                <button
                  key={step.time}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    'w-full text-left rounded-xl border p-4 transition-all duration-200 flex items-center justify-between',
                    isSelected
                      ? 'border-noctra-accent bg-noctra-raised shadow-md'
                      : 'border-noctra-border bg-noctra-surface/60 hover:bg-noctra-raised/50 hover:border-noctra-border/90'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold',
                        isSelected
                          ? 'bg-noctra-accent text-noctra-bg'
                          : 'bg-noctra-surface text-noctra-muted border border-noctra-border'
                      )}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-noctra-accent">
                          {step.time}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-noctra-muted">
                          {step.phase}
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-noctra-text mt-0.5 line-clamp-1">
                        {step.title}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform',
                      isSelected ? 'text-noctra-accent translate-x-1' : 'text-noctra-muted'
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Live Story Cockpit Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-noctra-border bg-noctra-surface p-6 shadow-xl space-y-6 overflow-hidden">
              {/* Card Ambient Glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-noctra-accent/10 blur-3xl"
              />

              {/* Step Header */}
              <div className="flex items-center justify-between border-b border-noctra-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 rounded-full bg-noctra-accent animate-pulse" />
                  <span className="font-mono text-sm font-bold text-noctra-accent">
                    {current.time} IST
                  </span>
                  <span className="text-xs text-noctra-muted font-medium">
                    ({current.phase})
                  </span>
                </div>
                <SimulatedBadge size="sm" />
              </div>

              {/* Narrative Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-noctra-text">
                  {current.title}
                </h3>
                <p className="text-sm font-medium text-noctra-text/90 leading-relaxed">
                  {current.summary}
                </p>
                <p className="text-xs text-noctra-muted leading-relaxed">
                  {current.detail}
                </p>
              </div>

              {/* Live Epistemic Provenance Card */}
              <div className="rounded-xl border border-noctra-border bg-noctra-raised p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-noctra-text flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-noctra-accent" />
                    Epistemic Classification
                  </span>
                  <span className="font-mono text-[11px] text-noctra-muted">
                    Source: {current.evidenceBadge.source}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-bold border',
                      current.evidenceBadge.label === 'KNOWN' &&
                        'border-noctra-known/40 bg-noctra-known/15 text-noctra-known',
                      current.evidenceBadge.label === 'PROBABLE' &&
                        'border-noctra-probable/40 bg-noctra-probable/15 text-noctra-probable',
                      current.evidenceBadge.label === 'OUTDATED' &&
                        'border-noctra-outdated/40 bg-noctra-outdated/15 text-noctra-outdated',
                      current.evidenceBadge.label === 'UNKNOWN' &&
                        'border-dashed border-noctra-unknown/50 bg-noctra-unknown/15 text-noctra-unknown'
                    )}
                  >
                    {current.evidenceBadge.label === 'KNOWN' && <CheckCircle2 className="h-3 w-3" />}
                    {current.evidenceBadge.label === 'OUTDATED' && <Clock className="h-3 w-3" />}
                    {current.evidenceBadge.label === 'UNKNOWN' && <HelpCircle className="h-3 w-3" />}
                    {current.evidenceBadge.label}
                  </span>
                  <span className="text-xs text-noctra-muted">
                    {current.evidenceBadge.description}
                  </span>
                </div>
              </div>

              {/* Bottom Metrics & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-noctra-border/60">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-noctra-raised px-3 py-1.5 border border-noctra-border">
                    <div className="text-[10px] text-noctra-muted uppercase font-mono">
                      {current.stat.label}
                    </div>
                    <div className={cn('text-sm font-bold font-mono', current.stat.color)}>
                      {current.stat.value}
                    </div>
                  </div>
                  <div className="text-[11px] text-noctra-muted max-w-[200px]">
                    Environmental risk proxy (not crime data)
                  </div>
                </div>

                <Link
                  to="/planner"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-noctra-accent px-4 py-2.5 text-xs font-bold text-noctra-bg hover:bg-noctra-accent-hover transition-colors shadow-sm"
                >
                  Explore in Planner
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
