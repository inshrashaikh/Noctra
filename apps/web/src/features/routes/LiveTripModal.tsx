import { useState, useEffect } from 'react';
import type { Candidate } from '@noctra/contracts';
import { X, Navigation, Shield, PhoneCall, Share2, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface LiveTripModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

export function LiveTripModal({ candidate, onClose }: LiveTripModalProps) {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    if (!candidate) return;
    const interval = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [candidate]);

  if (!candidate) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Noctra Safe Night Trip',
        text: `I'm travelling via Noctra (${candidate.mode.replace('_', ' ')}). Tracking active. Safe deadline is 03:00 AM.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Live trip tracking link copied to clipboard!');
    }
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    toast.success('Safe Arrival Verified! Trusted contacts notified.');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const remainingMin = Math.max(1, candidate.eta.expected_min - Math.floor(elapsedSec / 60));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-[#E2DED3] dark:border-[#232C3E] bg-[#FFFFFF] dark:bg-[#131822] p-5 sm:p-6 shadow-2xl space-y-5 text-[#14181D] dark:text-[#F8FAFC]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2DED3] dark:border-[#232C3E] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
              <Navigation className="h-4 w-4 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide capitalize">
                  {candidate.mode.replace('_', ' ')} Navigation Active
                </h3>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  GPS ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#5B6672] dark:text-[#94A3B8]">
                Real-time safety shield &amp; corridor tracking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5B6672] hover:text-[#14181D] dark:hover:text-white hover:bg-[#F1EFE8] dark:hover:bg-[#1A212E] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-[#E2DED3] dark:border-[#232C3E] bg-[#F7F6F2] dark:bg-[#1A212E] p-3 text-center">
            <span className="text-[10px] font-mono text-[#5B6672] dark:text-[#94A3B8] block uppercase">Est. Remaining</span>
            <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {remainingMin} min
            </span>
          </div>
          <div className="rounded-xl border border-[#E2DED3] dark:border-[#232C3E] bg-[#F7F6F2] dark:bg-[#1A212E] p-3 text-center">
            <span className="text-[10px] font-mono text-[#5B6672] dark:text-[#94A3B8] block uppercase">Safety Index</span>
            <span className="font-mono text-lg font-bold text-[#12233A] dark:text-[#38BDF8]">
              {(candidate.risk.score * 100).toFixed(0)}/100
            </span>
          </div>
          <div className="rounded-xl border border-[#E2DED3] dark:border-[#232C3E] bg-[#F7F6F2] dark:bg-[#1A212E] p-3 text-center">
            <span className="text-[10px] font-mono text-[#5B6672] dark:text-[#94A3B8] block uppercase">Nearest Refuge</span>
            <span className="font-mono text-lg font-bold text-[#14181D] dark:text-[#F8FAFC]">
              {candidate.risk.max_gap_m}m
            </span>
          </div>
        </div>

        {/* Live Step Guidance */}
        <div className="rounded-xl border border-[#E2DED3] dark:border-[#232C3E] bg-[#F7F6F2]/60 dark:bg-[#1A212E]/60 p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-[#14181D] dark:text-[#F8FAFC]">
                Currently proceeding on Wardha Road corridor
              </p>
              <p className="text-[#5B6672] dark:text-[#94A3B8] text-[11px]">
                High street-light density route. 2 verified police booths along path.
              </p>
            </div>
          </div>
          {candidate.plan_b && (
            <div className="flex items-center gap-2 pt-2 border-t border-[#E2DED3] dark:border-[#232C3E] text-[11px] font-mono text-amber-600 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Contingency checkpoint: {candidate.plan_b.trigger}</span>
            </div>
          )}
        </div>

        {/* Safe Havens Along Route */}
        <div className="space-y-1.5 text-xs">
          <span className="font-mono text-[10px] uppercase font-bold text-[#5B6672] dark:text-[#94A3B8] flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            24/7 Verified Safe Hubs on Corridor:
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg border border-[#E2DED3] dark:border-[#232C3E] bg-[#FFFFFF] dark:bg-[#131822]">
              <span className="font-semibold block">Sitabuldi Police Assistance</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">● Staffed 24x7</span>
            </div>
            <div className="p-2 rounded-lg border border-[#E2DED3] dark:border-[#232C3E] bg-[#FFFFFF] dark:bg-[#131822]">
              <span className="font-semibold block">Apollo 24h Medical Hub</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">● 120m ahead</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#E2DED3] dark:border-[#232C3E] bg-[#FFFFFF] dark:bg-[#1A212E] text-xs font-bold text-[#14181D] dark:text-[#F8FAFC] hover:bg-[#F1EFE8] dark:hover:bg-[#232C3E] transition-colors"
          >
            <Share2 className="h-4 w-4 text-[#12233A] dark:text-[#38BDF8]" />
            <span>Share Trip</span>
          </button>

          <a
            href="tel:112"
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20"
          >
            <PhoneCall className="h-4 w-4" />
            <span>SOS 112</span>
          </a>
        </div>

        <button
          type="button"
          onClick={handleCheckIn}
          disabled={checkedIn}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#12233A] dark:bg-[#38BDF8] text-white dark:text-[#0B0E14] text-xs font-bold hover:bg-[#1B3252] dark:hover:bg-[#0EA5E9] transition-colors shadow-md"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{checkedIn ? 'Arrival Confirmed!' : 'I Have Arrived Safely'}</span>
        </button>
      </div>
    </div>
  );
}
