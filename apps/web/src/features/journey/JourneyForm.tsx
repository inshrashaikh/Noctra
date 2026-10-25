import React, { useState } from 'react';
import { MapPin, Navigation, Clock, ShieldCheck, Car, Bike, Footprints, Bus } from 'lucide-react';
import type { TransportMode } from '@noctra/contracts';
import { cn } from '@/lib/cn';
import { useJourneyStore, type JourneyFormData } from './useJourneyForm';

const NAGPUR_LOCATIONS = [
  { name: 'AIIMS Nagpur, Medical Square', lat: 21.1497, lon: 79.0806 },
  { name: 'Dharampeth Residential Area', lat: 21.1453, lon: 79.0588 },
  { name: 'Sitabuldi Interchange', lat: 21.1466, lon: 79.0833 },
  { name: 'Nagpur Railway Station', lat: 21.1524, lon: 79.0889 },
  { name: 'MIHAN / Infotech Park', lat: 21.0667, lon: 79.0500 },
  { name: 'Sadar Residency Road', lat: 21.1620, lon: 79.0820 },
];

const MODES: { id: TransportMode; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'transit', label: 'Metro/Bus', icon: Bus },
  { id: 'auto', label: 'Auto', icon: Car },
  { id: 'two_wheeler', label: 'Bike', icon: Bike },
  { id: 'cab', label: 'Cab', icon: Car },
  { id: 'walk', label: 'Walk', icon: Footprints },
];

export const SHIFT_PRESETS = [
  { id: 'evening', label: 'Evening', shift: '22:00', deadline: '22:45', desc: 'Metro + Bus active' },
  { id: 'midnight', label: 'Midnight', shift: '00:00', deadline: '00:45', desc: 'Night bus only' },
  { id: 'late_night', label: '2:15 AM', shift: '02:15', deadline: '03:00', desc: 'Transit closed, Auto' },
  { id: 'early_morning', label: '4:30 AM', shift: '04:30', deadline: '05:30', desc: 'Trains / Standby' },
];

interface JourneyFormProps {
  onSubmit: (data: JourneyFormData) => void;
  isLoading?: boolean;
}

export function JourneyForm({ onSubmit, isLoading }: JourneyFormProps) {
  const { pickMode, setPickMode } = useJourneyStore();
  const [selectedModes, setSelectedModes] = useState<TransportMode[]>([
    'transit',
    'auto',
    'two_wheeler',
    'cab',
    'walk',
  ]);
  const [origin, setOrigin] = useState(NAGPUR_LOCATIONS[0]);
  const [destination, setDestination] = useState(NAGPUR_LOCATIONS[1]);
  const [shiftEnd, setShiftEnd] = useState('02:15');
  const [deadline, setDeadline] = useState('03:00');
  const [error, setError] = useState<string | null>(null);

  const toggleMode = (mode: TransportMode) => {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handlePresetClick = (newShift: string, newDeadline: string) => {
    setShiftEnd(newShift);
    setDeadline(newDeadline);
    setError(null);
    onSubmit({
      originAddress: origin.name,
      originLat: origin.lat,
      originLon: origin.lon,
      destinationAddress: destination.name,
      destinationLat: destination.lat,
      destinationLon: destination.lon,
      shiftEndTime: newShift,
      deadlineTime: newDeadline,
      modes: selectedModes,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedModes.length === 0) {
      setError('Please select at least one transport mode');
      return;
    }

    const [sh, sm] = shiftEnd.split(':').map(Number);
    const [dh, dm] = deadline.split(':').map(Number);
    const startM = sh * 60 + sm;
    let endM = dh * 60 + dm;
    if (endM <= startM) endM += 1440;

    if (startM === endM) {
      setError('Deadline must be strictly after shift end time');
      return;
    }

    onSubmit({
      originAddress: origin.name,
      originLat: origin.lat,
      originLon: origin.lon,
      destinationAddress: destination.name,
      destinationLat: destination.lat,
      destinationLon: destination.lon,
      shiftEndTime: shiftEnd,
      deadlineTime: deadline,
      modes: selectedModes,
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {/* Demo Shift Presets */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-noctra-muted flex items-center justify-between">
          <span>Shift Window Presets</span>
          <span className="text-[10px] text-noctra-accent font-mono">1-Click Test</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {SHIFT_PRESETS.map((p) => {
            const isCurrent = shiftEnd === p.shift && deadline === p.deadline;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetClick(p.shift, p.deadline)}
                className={cn(
                  'rounded-lg border p-2 text-left transition-all select-none',
                  isCurrent
                    ? 'border-noctra-accent bg-noctra-accent/15 text-noctra-text shadow-sm'
                    : 'border-noctra-border bg-noctra-surface hover:bg-noctra-raised text-noctra-muted'
                )}
              >
                <div className="font-mono text-xs font-bold text-noctra-accent">{p.shift}</div>
                <div className="text-[10px] text-noctra-text font-medium mt-0.5">{p.label}</div>
                <div className="text-[9px] text-noctra-muted leading-tight truncate">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Origin */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-noctra-muted flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-noctra-accent" />
            Origin (Workplace)
          </span>
          <button
            type="button"
            onClick={() => setPickMode(pickMode === 'origin' ? 'none' : 'origin')}
            className={cn(
              'text-[11px] underline underline-offset-2',
              pickMode === 'origin' ? 'text-noctra-accent font-bold' : 'text-noctra-muted'
            )}
          >
            {pickMode === 'origin' ? 'Click on map' : 'Pick on map'}
          </button>
        </label>
        <select
          value={origin.name}
          onChange={(e) => {
            const loc = NAGPUR_LOCATIONS.find((l) => l.name === e.target.value);
            if (loc) setOrigin(loc);
          }}
          className="w-full rounded-lg border border-noctra-border bg-noctra-surface px-3 py-2 text-sm text-noctra-text focus:border-noctra-accent focus:outline-none"
        >
          {NAGPUR_LOCATIONS.map((loc) => (
            <option key={loc.name} value={loc.name} className="bg-noctra-raised text-noctra-text">
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Destination */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-noctra-muted flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 text-noctra-probable" />
            Destination (Home)
          </span>
          <button
            type="button"
            onClick={() => setPickMode(pickMode === 'destination' ? 'none' : 'destination')}
            className={cn(
              'text-[11px] underline underline-offset-2',
              pickMode === 'destination' ? 'text-noctra-accent font-bold' : 'text-noctra-muted'
            )}
          >
            {pickMode === 'destination' ? 'Click on map' : 'Pick on map'}
          </button>
        </label>
        <select
          value={destination.name}
          onChange={(e) => {
            const loc = NAGPUR_LOCATIONS.find((l) => l.name === e.target.value);
            if (loc) setDestination(loc);
          }}
          className="w-full rounded-lg border border-noctra-border bg-noctra-surface px-3 py-2 text-sm text-noctra-text focus:border-noctra-accent focus:outline-none"
        >
          {NAGPUR_LOCATIONS.map((loc) => (
            <option key={loc.name} value={loc.name} className="bg-noctra-raised text-noctra-text">
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Timing Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-noctra-muted flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Shift End
          </label>
          <input
            type="time"
            value={shiftEnd}
            onChange={(e) => setShiftEnd(e.target.value)}
            className="w-full rounded-lg border border-noctra-border bg-noctra-surface px-3 py-2 text-sm font-mono text-noctra-text focus:border-noctra-accent focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-noctra-muted flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-noctra-known" /> Deadline
          </label>
          <input
            type="time"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-lg border border-noctra-border bg-noctra-surface px-3 py-2 text-sm font-mono text-noctra-text focus:border-noctra-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Mode Chips */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-noctra-muted">
          Available Modes
        </label>
        <div className="flex flex-wrap gap-2">
          {MODES.map(({ id, label, icon: Icon }) => {
            const active = selectedModes.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleMode(id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all select-none border min-h-[44px]',
                  active
                    ? 'border-noctra-accent bg-noctra-accent/15 text-noctra-accent font-semibold'
                    : 'border-noctra-border bg-noctra-surface text-noctra-muted hover:border-noctra-muted'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="text-xs font-medium text-noctra-infeasible bg-noctra-infeasible/10 p-2.5 rounded-lg border border-noctra-infeasible/30">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-noctra-accent px-4 py-3 text-sm font-bold text-noctra-bg transition-colors hover:bg-noctra-accent-hover disabled:opacity-50 min-h-[48px]"
      >
        {isLoading ? 'Computing Feasible Routes...' : 'Calculate Safe Return Paths'}
      </button>
    </form>
  );
}
