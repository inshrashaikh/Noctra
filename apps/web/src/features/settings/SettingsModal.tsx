import { useSettings } from './useSettings';
import { useI18n, type Language } from '@/lib/i18n';
import type { TransportMode } from '@noctra/contracts';
import { X, Globe, Type, Car, Bike, Footprints, Bus, HelpCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';

const MODE_OPTIONS: { id: TransportMode; label: string; icon: typeof Car }[] = [
  { id: 'auto', label: 'Auto-Rickshaw', icon: Car },
  { id: 'two_wheeler', label: 'Two-Wheeler / Bike', icon: Bike },
  { id: 'cab', label: 'Cab / Taxi', icon: Car },
  { id: 'walk', label: 'Walking', icon: Footprints },
  { id: 'transit', label: 'Metro / Transit', icon: Bus },
];

export function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    textSize,
    setTextSize,
    preferredModes,
    togglePreferredMode,
    setIsOnboardingOpen,
  } = useSettings();
  const { language, setLanguage, t } = useI18n();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-noctra-border bg-noctra-surface p-6 shadow-2xl space-y-6 text-noctra-text">
        <div className="flex items-center justify-between border-b border-noctra-border pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-noctra-accent" />
            <h3 className="font-bold text-base tracking-wide">
              {t.navSettings} &amp; Accessibility
            </h3>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg text-noctra-muted hover:text-noctra-text hover:bg-noctra-raised"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-noctra-muted flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-noctra-accent" />
            Interface Language / भाषा
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ['en', 'English'],
                ['hi', 'हिन्दी'],
                ['mr', 'मराठी'],
              ] as [Language, string][]
            ).map(([code, name]) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={cn(
                  'rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all select-none',
                  language === code
                    ? 'border-noctra-accent bg-noctra-accent/15 text-noctra-accent shadow-sm'
                    : 'border-noctra-border bg-noctra-raised text-noctra-muted hover:border-noctra-muted'
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Text Scaling for Low-light / Night fatigue */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-noctra-muted flex items-center gap-1.5">
            <Type className="h-4 w-4 text-noctra-accent" />
            Text Scaling (Night Readability)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTextSize('normal')}
              className={cn(
                'rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all select-none',
                textSize === 'normal'
                  ? 'border-noctra-accent bg-noctra-accent/15 text-noctra-accent'
                  : 'border-noctra-border bg-noctra-raised text-noctra-muted hover:border-noctra-muted'
              )}
            >
              Standard (16px)
            </button>
            <button
              type="button"
              onClick={() => setTextSize('large')}
              className={cn(
                'rounded-xl border py-2.5 px-3 text-sm font-bold transition-all select-none',
                textSize === 'large'
                  ? 'border-noctra-accent bg-noctra-accent/15 text-noctra-accent'
                  : 'border-noctra-border bg-noctra-raised text-noctra-muted hover:border-noctra-muted'
              )}
            >
              Large / High Legibility (+15%)
            </button>
          </div>
        </div>

        {/* Preferred Travel Modes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-noctra-muted">
            Default Transport Modes
          </label>
          <div className="flex flex-wrap gap-2">
            {MODE_OPTIONS.map(({ id, label, icon: Icon }) => {
              const active = preferredModes.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => togglePreferredMode(id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all select-none min-h-[44px]',
                    active
                      ? 'border-noctra-accent bg-noctra-accent/15 text-noctra-accent'
                      : 'border-noctra-border bg-noctra-raised text-noctra-muted hover:border-noctra-muted'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Onboarding walkthrough re-trigger */}
        <div className="pt-2 border-t border-noctra-border/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setIsSettingsOpen(false);
              setIsOnboardingOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs text-noctra-accent hover:underline"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Re-run 3-Step Night Safety Briefing
          </button>
          <SimulatedBadge size="sm" />
        </div>
      </div>
    </div>
  );
}
