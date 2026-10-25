import { useState } from 'react';
import { useSettings } from './useSettings';
import { Moon, Shield, ArrowRight, Check, MapPin, Eye, WifiOff } from 'lucide-react';
import { cn } from '@/lib/cn';

export function OnboardingModal() {
  const { isOnboardingOpen, setIsOnboardingOpen, setHasSeenOnboarding } = useSettings();
  const [step, setStep] = useState(1);

  if (!isOnboardingOpen) return null;

  const handleComplete = () => {
    setHasSeenOnboarding(true);
    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-noctra-border bg-noctra-surface p-6 shadow-2xl space-y-5 text-noctra-text">
        {/* Step indicator */}
        <div className="flex items-center justify-between border-b border-noctra-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-noctra-accent fill-noctra-accent" />
            <span className="font-bold text-sm tracking-wide">Welcome to Noctra</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-1.5 w-6 rounded-full transition-all',
                  step === s ? 'bg-noctra-accent' : 'bg-noctra-raised'
                )}
              />
            ))}
          </div>
        </div>

        {/* Step 1: The City That Sleeps While You Work */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-noctra-accent/15 text-noctra-accent border border-noctra-accent/30">
              <MapPin className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-noctra-text">
              The city sleeps. You keep it running.
            </h3>
            <p className="text-sm text-noctra-muted leading-relaxed">
              When your shift finishes at 2:15 AM, daytime transit apps fail: bus timetables go silent, cab availability fluctuates, and safety corridors vanish.
            </p>
            <p className="text-xs text-noctra-muted/90 bg-noctra-raised p-3 rounded-lg border border-noctra-border">
              Noctra is your night-time cockpit: honest arrival bands, hard deadline buffers, and verified 24×7 safe havens along your journey.
            </p>
          </div>
        )}

        {/* Step 2: The Four Epistemic Labels */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-noctra-known/15 text-noctra-known border border-noctra-known/30">
              <Eye className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-noctra-text">
              No Confident Lies. Complete Transparency.
            </h3>
            <p className="text-sm text-noctra-muted leading-relaxed">
              Every fact Noctra shows is stamped with an epistemic truth label that decays over time:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg border border-noctra-known/30 bg-noctra-known/10 text-noctra-known">
                <strong>KNOWN</strong>: Live telemetry within TTL.
              </div>
              <div className="p-2.5 rounded-lg border border-noctra-probable/30 bg-noctra-probable/10 text-noctra-probable">
                <strong>PROBABLE</strong>: Inferred with high statistical likelihood.
              </div>
              <div className="p-2.5 rounded-lg border border-noctra-outdated/30 bg-noctra-outdated/10 text-noctra-outdated">
                <strong>OUTDATED</strong>: Aged past freshness window.
              </div>
              <div className="p-2.5 rounded-lg border border-dashed border-noctra-unknown/50 bg-noctra-unknown/10 text-noctra-unknown">
                <strong>UNKNOWN</strong>: Data absent. We tell you plainly.
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Offline Resilience & Social Safety */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-noctra-at-risk/15 text-noctra-at-risk border border-noctra-at-risk/30">
              <WifiOff className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-noctra-text">
              Works when the signal vanishes.
            </h3>
            <p className="text-sm text-noctra-muted leading-relaxed">
              If cellular networks degrade, Noctra automatically operates in Tier 1 (cached timings) or Tier 2 (local emergency cache with 112 speed-dial).
            </p>
            <div className="p-3 rounded-lg border border-noctra-border bg-noctra-raised space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-noctra-accent">
                <Shield className="h-4 w-4" />
                Trusted Circle & Community Notes
              </div>
              <p className="text-noctra-muted">
                Share tracking links with family, auto-prompt "I'm Home" check-ins, and read real peer hazard notes along your route.
              </p>
            </div>
          </div>
        )}

        {/* Modal footer controls */}
        <div className="flex items-center justify-between pt-3 border-t border-noctra-border/60">
          <button
            type="button"
            onClick={handleComplete}
            className="text-xs text-noctra-muted hover:text-noctra-text underline underline-offset-4"
          >
            Skip Orientation
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-noctra-border text-noctra-muted hover:text-noctra-text"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-noctra-accent text-noctra-bg hover:bg-noctra-accent-hover transition-colors"
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-noctra-accent text-noctra-bg hover:bg-noctra-accent-hover transition-colors lamp-glow"
              >
                <Check className="h-3.5 w-3.5" /> Start Exploring Noctra
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
