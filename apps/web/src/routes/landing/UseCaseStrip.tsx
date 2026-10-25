import { useState } from 'react';
import {
  Shield,
  Clock,
  MapPin,
  Fuel,
  Factory,
  ChevronDown,
  ArrowRight,
  Headphones,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';
import { cn } from '@/lib/cn';

interface PersonaUseCase {
  id: string;
  icon: LucideIcon;
  persona: string;
  shiftHours: string;
  location: string;
  need: string;
  routeHighlight: {
    origin: string;
    destination: string;
    planA: string;
    planB: string;
    criticalSlack: string;
    proxyEvidence: string;
  };
}

const PERSONAS: PersonaUseCase[] = [
  {
    id: 'nurse',
    icon: Clock,
    persona: 'ICU Staff Nurse',
    shiftHours: '04:00 PM – 02:15 AM',
    location: 'GMCH Hospital to Mankapur',
    need: 'Off at 2:15 AM. Must reach home by 3:00 AM. Noctra shows the safest route with 14 min spare.',
    routeHighlight: {
      origin: 'GMCH Medical Square',
      destination: 'Mankapur Sports Complex',
      planA: 'Metro Orange Line + Well-lit arterial walk',
      planB: 'Sitabuldi shared auto stand (decide by 02:28 AM)',
      criticalSlack: '14 min buffer',
      proxyEvidence: '88% lit corridors (KNOWN)',
    },
  },
  {
    id: 'guard',
    icon: Shield,
    persona: 'Night Security Guard',
    shiftHours: '07:00 PM – 03:00 AM',
    location: 'Civil Lines Commercial Complex',
    need: 'Shift ends at 3:00 AM. Last bus left at 2:45 AM. Noctra surfaces illuminated walk + shared auto fallback.',
    routeHighlight: {
      origin: 'Civil Lines High Court Rd',
      destination: 'Pardi Naka',
      planA: 'Pedestrian corridor along lit collector road',
      planB: 'Dial-a-ride / 24h fuel station shelter point',
      criticalSlack: '18 min buffer',
      proxyEvidence: 'Police checkpoint at 450m (KNOWN)',
    },
  },
  {
    id: 'delivery',
    icon: Fuel,
    persona: 'Delivery Fleet Rider',
    shiftHours: '08:00 PM – 01:30 AM',
    location: 'Dharampeth to Wardha Road Hub',
    need: 'Finished deliveries at 1:30 AM with two-wheeler low on fuel. Noctra maps open 24×7 pumps along the way.',
    routeHighlight: {
      origin: 'Dharampeth Coffee House Sq',
      destination: 'Chhatrapati Square',
      planA: 'Wardha Road with guaranteed open 24h HPCL pump',
      planB: 'Rahate Colony fuel station fallback',
      criticalSlack: '22 min buffer',
      proxyEvidence: 'Fuel Station 24×7 verified (KNOWN)',
    },
  },
  {
    id: 'factory',
    icon: Factory,
    persona: 'Factory Shift Technician',
    shiftHours: '03:30 PM – 11:45 PM / 03:30 AM',
    location: 'Hingna MIDC Industrial Zone',
    need: 'Unannounced road work on Hingna main road. Noctra detects detour and flags dark refuge gaps.',
    routeHighlight: {
      origin: 'MIDC Hingna Gate 1',
      destination: 'Trimurti Nagar',
      planA: 'Ring Road lighted bypass',
      planB: 'Slow bypass with police patrol point',
      criticalSlack: '12 min buffer',
      proxyEvidence: 'Road closure alert active (KNOWN)',
    },
  },
  {
    id: 'sanitation',
    icon: MapPin,
    persona: 'Municipal Sanitation Worker',
    shiftHours: '11:00 PM – 04:30 AM',
    location: 'Sitabuldi Market Corridors',
    need: 'Navigating quiet alleyways in pre-dawn hours. Noctra maps continuous safe refuge clusters.',
    routeHighlight: {
      origin: 'Sitabuldi Flyover Underpass',
      destination: 'Mahal Central',
      planA: 'Central Avenue lit pedestrian way',
      planB: 'Main police station shelter corridor',
      criticalSlack: '25 min buffer',
      proxyEvidence: 'Refuge gap < 300m (KNOWN)',
    },
  },
  {
    id: 'callcenter',
    icon: Headphones,
    persona: 'Call-Center Executive',
    shiftHours: '06:00 PM – 02:30 AM',
    location: 'MIHAN SEZ / IT Park to Pratap Nagar',
    need: 'Company cab cancelled at 2:30 AM. Noctra activates immediate Plan B with a 7-minute decision window.',
    routeHighlight: {
      origin: 'Nagpur IT Park, Gayatri Nagar',
      destination: 'Pratap Nagar Ring Rd',
      planA: 'Rapid e-rickshaw feeder to metro corridor',
      planB: 'Walking corridor with 24h pharmacy waypoints',
      criticalSlack: '9 min buffer (TIGHT)',
      proxyEvidence: 'Ride availability UNKNOWN (Honest)',
    },
  },
];

export function UseCaseStrip() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 border-b border-noctra-border/60 bg-noctra-bg">
      <div className="mx-auto max-w-7xl">
        {/* Header with Problem Statement Citation */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-noctra-border bg-noctra-surface px-3 py-1 font-mono text-xs text-noctra-muted">
            <span>Problem 1.1: The City That Sleeps While You Work</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-noctra-text sm:text-4xl">
            Built for the Night Shift
          </h2>
          <p className="mx-auto max-w-3xl text-base text-noctra-muted leading-relaxed">
            <span className="text-noctra-text font-medium">
              &ldquo;Millions of workers live on a different schedule.&rdquo;
            </span>{' '}
            Daytime routing algorithms assume open stores, frequent transit, and
            uniform safety. Noctra models the specific realities of those who keep
            the city alive while everyone else is asleep.
          </p>
        </div>

        {/* 6 Personas Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={cn(
                  'flex flex-col justify-between rounded-2xl border transition-all duration-200',
                  isExpanded
                    ? 'border-noctra-accent bg-noctra-raised shadow-lg ring-1 ring-noctra-accent/40'
                    : 'border-noctra-border bg-noctra-surface hover:border-noctra-border/90 hover:bg-noctra-raised/40'
                )}
              >
                <div className="p-5 space-y-3.5">
                  {/* Top Bar with Icon & Tag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-noctra-accent/15 text-noctra-accent border border-noctra-accent/30">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-noctra-text">
                          {item.persona}
                        </h3>
                        <div className="font-mono text-[11px] text-noctra-accent font-semibold">
                          {item.shiftHours}
                        </div>
                      </div>
                    </div>
                    <SimulatedBadge size="sm" />
                  </div>

                  <div className="text-xs text-noctra-muted/90 font-medium">
                    📍 {item.location}
                  </div>

                  <p className="text-xs text-noctra-muted leading-relaxed">
                    {item.need}
                  </p>

                  {/* Expandable Mini Interactive Preview */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-noctra-border/60 space-y-2 text-xs animate-in fade-in-50 duration-150">
                      <div className="rounded-lg bg-noctra-surface p-2.5 space-y-1.5 font-mono text-[11px] border border-noctra-border/80">
                        <div className="flex justify-between text-noctra-text">
                          <span className="text-noctra-muted">Plan A:</span>
                          <span className="font-semibold text-right max-w-[180px] truncate">
                            {item.routeHighlight.planA}
                          </span>
                        </div>
                        <div className="flex justify-between text-noctra-accent">
                          <span className="text-noctra-muted">Plan B:</span>
                          <span className="font-semibold text-right max-w-[180px] truncate">
                            {item.routeHighlight.planB}
                          </span>
                        </div>
                        <div className="flex justify-between text-noctra-known pt-1 border-t border-noctra-border/60">
                          <span>Slack Buffer:</span>
                          <span className="font-bold">{item.routeHighlight.criticalSlack}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-noctra-muted flex items-center justify-between">
                        <span>{item.routeHighlight.proxyEvidence}</span>
                        <span className="italic">Proxy (not crime data)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="px-5 py-3 border-t border-noctra-border/60 flex items-center justify-between bg-noctra-surface/40 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-noctra-accent hover:underline"
                  >
                    <span>{isExpanded ? 'Hide Route Plan' : 'Inspect Route Plan'}</span>
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>

                  <Link
                    to="/planner"
                    className="inline-flex items-center gap-1 text-xs font-bold text-noctra-text hover:text-noctra-accent"
                  >
                    <span>Test Plan</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
