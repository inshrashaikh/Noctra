import { useState, useEffect } from 'react';
import { ArrowRight, Check, X, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { useOnboarding } from './useOnboarding';
import { router } from '@/app/router';
import { cn } from '@/lib/cn';

interface Slide {
  image: string;
  tag: string;
  title: string;
  problem: string;
  solution: string;
  highlight: string;
}

const ONBOARDING_SLIDES: Slide[] = [
  {
    image: '/onboarding/slide1_nurse.png',
    tag: 'SCENARIO 01 • LATE SHIFT COMMUTE',
    title: 'The City Sleeps. You Keep It Running.',
    problem: 'Ghost bus timetables & dark isolated streets after 11 PM.',
    solution:
      'Designed for nurses, security guards, BPO techies, and night workers. Noctra charts illuminated corridors and active night transit so you never walk in the dark.',
    highlight: 'Verified Lit Corridors & Real-Time Active Transit',
  },
  {
    image: '/onboarding/slide2_planb.png',
    tag: 'SCENARIO 02 • CONTINGENCY ENGINE',
    title: 'Never Stranded with a Hard Plan B',
    problem: 'Waiting for a bus that never arrives traps you at midnight.',
    solution:
      'Noctra calculates worst-case travel buffers and sets a strict "Decide-By" moment to switch to an auto-rickshaw or two-wheeler before your deadline.',
    highlight: 'Automatic Plan B Triggers Before Point-of-No-Return',
  },
  {
    image: '/onboarding/slide3_havens.png',
    tag: 'SCENARIO 03 • 24×7 SHELTER & GUARDIAN',
    title: 'Verified Safe Havens & 1-Tap 112 SOS',
    problem: 'Cellular dead zones & feeling uneasy on empty roads.',
    solution:
      'Instant routing to verified open hospital emergency desks, 24×7 pharmacies, and police booths along your GPS path—plus automated check-ins with your circle.',
    highlight: 'Offline Emergency Cache & 1-Tap 112 Speed-Dial',
  },
];

export function OnboardingModal() {
  const { isOpen, hasSeenOnboarding, closeOnboarding, openOnboarding } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Always reset to first scenario whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  // Auto-launch the "Get Started" walkthrough for first-time visitors
  useEffect(() => {
    if (!hasSeenOnboarding) {
      openOnboarding();
    }
  }, [hasSeenOnboarding, openOnboarding]);

  if (!isOpen) return null;

  const isLast = currentSlide === ONBOARDING_SLIDES.length - 1;
  const slide = ONBOARDING_SLIDES[currentSlide];

  const handleFinish = () => {
    closeOnboarding();
    router.navigate({ to: '/planner' });
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    closeOnboarding();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-noctra-surface border border-noctra-border shadow-2xl transition-all">
        {/* Top Accent Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-rose-400 to-sky-400" />

        {/* Header Strip with Skip & Progress */}
        <div className="flex items-center justify-between px-4 pt-3 pb-0.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-noctra-primary">
              Noctra Safe Shift Protocol
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1 text-xs font-medium text-noctra-muted hover:text-noctra-text px-2 py-0.5 rounded-md transition-colors"
            title="Skip and go to app"
          >
            <span>Skip</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="px-4 pb-4 pt-1 text-center">
          {/* Background-less Cartoon Scenario Illustration */}
          <div className="relative my-1 mx-auto w-full max-w-[240px] h-[130px] sm:h-[150px] flex items-center justify-center overflow-hidden rounded-xl">
            {/* Ambient subtle aura - adapts to light and dark theme */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-sky-500/15 dark:via-sky-500/5 dark:to-transparent rounded-xl transition-colors" />

            <img
              src={slide.image}
              alt={slide.title}
              className="relative z-10 max-h-[120px] sm:max-h-[140px] w-auto max-w-[95%] object-contain select-none"
              loading="eager"
            />
          </div>

          {/* Slide Tag Pill */}
          <div className="inline-flex items-center gap-1 rounded-full bg-noctra-accent/15 px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider text-noctra-accent-text border border-noctra-accent/30 mb-1">
            <Sparkles className="h-3 w-3 text-noctra-accent" />
            {slide.tag}
          </div>

          {/* Title */}
          <h2
            id="onboarding-title"
            className="text-base sm:text-lg font-bold tracking-tight text-noctra-text mb-1"
          >
            {slide.title}
          </h2>

          {/* Problem Callout Box */}
          <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-left text-xs mb-1.5 text-rose-800 dark:text-rose-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
            <span className="font-medium text-[11px] leading-tight">{slide.problem}</span>
          </div>

          {/* Solution Description */}
          <p className="text-xs text-noctra-muted leading-relaxed mb-2 max-w-sm mx-auto text-left sm:text-center">
            {slide.solution}
          </p>

          {/* Feature Highlight Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-noctra-raised border border-noctra-border px-2.5 py-1 text-[11px] font-medium text-noctra-text mb-2.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.2]" />
            <span className="font-semibold">{slide.highlight}</span>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {ONBOARDING_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to scenario ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200 cursor-pointer',
                  i === currentSlide
                    ? 'w-6 bg-[#12233A] dark:bg-[#38BDF8]'
                    : 'w-1.5 bg-noctra-border hover:bg-noctra-muted'
                )}
              />
            ))}
          </div>

          {/* Bottom Action Buttons matching Noctra Web Design System */}
          <div className="flex items-center gap-2">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => prev - 1)}
                className="flex-1 rounded-lg border border-noctra-border bg-noctra-raised py-2.5 text-xs font-semibold text-noctra-text hover:bg-noctra-border transition-colors cursor-pointer"
              >
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-4 text-xs font-semibold transition-colors shadow-sm cursor-pointer',
                currentSlide > 0 ? 'flex-2' : 'w-full',
                isLast
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
                  : 'bg-[#12233A] dark:bg-[#38BDF8] text-white dark:text-[#0B0E14] hover:bg-[#1B3252] dark:hover:bg-[#0EA5E9]'
              )}
            >
              {isLast ? (
                <>
                  <span>Get Started — Enter Noctra Grid</span>
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                </>
              ) : (
                <>
                  <span>Next Scenario</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
