import { Link } from '@tanstack/react-router';
import { Moon, ArrowLeft } from 'lucide-react';

/**
 * About / Data Provenance page.
 * Explains what Noctra is, how it works, and data sourcing.
 */
export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Back link */}
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-noctra-muted transition-colors hover:text-noctra-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      {/* Header */}
      <div className="mb-12 flex items-center gap-3">
        <Moon className="h-8 w-8 text-noctra-accent" />
        <h1 className="text-3xl font-bold text-noctra-text">About Noctra</h1>
      </div>

      {/* What is Noctra */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-noctra-text">
          What is Noctra?
        </h2>
        <p className="mb-4 leading-relaxed text-noctra-muted">
          Noctra is a night-time decision engine designed for night-shift
          workers in Nagpur. When your shift ends at 2 AM and you need to be
          home by 3 AM, Noctra helps you make informed decisions about your
          journey — showing you feasible plans, deadline slack, route risks,
          and nearby essential services.
        </p>
        <p className="leading-relaxed text-noctra-muted">
          Built for CASCADE &apos;26 at IIIT Nagpur, addressing Problem 1.1:
          &quot;The City That Sleeps While You Work.&quot;
        </p>
      </section>

      {/* How it thinks */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-noctra-text">
          How Noctra Thinks
        </h2>
        <p className="mb-4 leading-relaxed text-noctra-muted">
          Every piece of information in Noctra carries an evidence label that
          tells you exactly how much to trust it:
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full bg-noctra-known" />
            <span className="text-noctra-muted">
              <strong className="text-noctra-text">KNOWN</strong> — Verified
              from a live source within its freshness window.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full border-2 border-noctra-probable bg-noctra-probable/30" />
            <span className="text-noctra-muted">
              <strong className="text-noctra-text">PROBABLE</strong> —
              Statistically likely but not confirmed right now.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full border-2 border-noctra-outdated bg-noctra-outdated/30" />
            <span className="text-noctra-muted">
              <strong className="text-noctra-text">OUTDATED</strong> — Was
              known, but the data has aged past its freshness window.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full border-2 border-dashed border-noctra-unknown" />
            <span className="text-noctra-muted">
              <strong className="text-noctra-text">UNKNOWN</strong> — No data
              available. Noctra tells you what it doesn&apos;t know.
            </span>
          </li>
        </ul>
      </section>

      {/* Data Provenance */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-noctra-text">
          Data Provenance
        </h2>
        <p className="mb-4 leading-relaxed text-noctra-muted">
          Noctra is designed to source data from multiple tiers:
        </p>
        <ul className="space-y-2 text-noctra-muted">
          <li>
            <strong className="text-noctra-text">Tier 0:</strong> Live data
            feeds — real-time transit, traffic, ride availability.
          </li>
          <li>
            <strong className="text-noctra-text">Tier 1:</strong> Cached /
            static data — when live feeds are unavailable, Noctra falls back
            to recent cached data with OUTDATED labels.
          </li>
          <li>
            <strong className="text-noctra-text">Tier 2:</strong> Offline —
            when the backend is unreachable, Noctra shows the last stored plan
            with degraded labels and emergency contact (112).
          </li>
        </ul>
      </section>

      {/* Risk disclaimer */}
      <section className="mb-10 rounded-xl border border-noctra-border bg-noctra-surface p-6">
        <h3 className="mb-2 text-lg font-semibold text-noctra-accent">
          ⚠ Risk Disclaimer
        </h3>
        <p className="text-noctra-muted">
          Route risk scores in Noctra are an{' '}
          <strong className="text-noctra-text">
            Environmental risk proxy (not crime data)
          </strong>
          . They consider factors like lighting, road conditions, and refuge
          availability — not crime statistics. Do not interpret risk scores as
          safety guarantees.
        </p>
      </section>

      {/* Current state */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-noctra-text">
          Current State
        </h2>
        <p className="leading-relaxed text-noctra-muted">
          This prototype uses simulated data to demonstrate the Noctra
          experience. All data carries a{' '}
          <span className="inline-flex items-center rounded-md border border-noctra-accent/50 bg-noctra-accent/10 px-2 py-0.5 text-xs font-medium text-noctra-accent">
            SIMULATED
          </span>{' '}
          badge. No claims are presented as verified. The real engine
          integration is planned as the next phase.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-noctra-border pt-8 text-sm text-noctra-muted">
        <p className="mb-2">
          Map data © OpenStreetMap contributors.
        </p>
        <p>
          Built for CASCADE &apos;26 at IIIT Nagpur.
        </p>
      </footer>
    </div>
  );
}
