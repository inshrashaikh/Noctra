import { useState } from 'react';
import { useTrustedCircle } from './useTrustedCircle';
import { useSettings } from '@/features/settings/useSettings';
import { Shield, CheckCircle2, UserPlus, Trash2, Share2, X, Clock, MapPin } from 'lucide-react';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export function TrustedCircleModal() {
  const { isTrustedCircleOpen, setIsTrustedCircleOpen } = useSettings();
  const {
    contacts,
    addContact,
    removeContact,
    checkInStatus,
    completeCheckIn,
    resetCheckIn,
    isSharingActive,
    setIsSharingActive,
  } = useTrustedCircle();

  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('Family');
  const [newPhone, setNewPhone] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isTrustedCircleOpen) return null;

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    addContact({ name: newName, relationship: newRelationship, phone: newPhone });
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
    toast.success('Trusted contact added to safety circle');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.('https://noctra.nagpur.app/live/track-demo-nurse');
    toast.info('Live tracking link copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-noctra-border bg-noctra-surface p-6 shadow-2xl space-y-5 text-noctra-text max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-noctra-border pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-noctra-accent" />
            <h3 className="font-bold text-base tracking-wide">
              Trusted Circle &amp; Safe Arrival Protocol
            </h3>
          </div>
          <button
            onClick={() => setIsTrustedCircleOpen(false)}
            className="p-1 rounded-lg text-noctra-muted hover:text-noctra-text hover:bg-noctra-raised"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Protection Status Banner */}
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 shrink-0" />
            <span>Active safety monitoring — Real-time waypoint &amp; emergency contact sync operational.</span>
          </div>
          <SimulatedBadge size="sm" />
        </div>

        {/* Safe Arrival Check-in Card */}
        <div className="rounded-xl border border-noctra-border bg-noctra-raised p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-noctra-text flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-noctra-accent" />
              Night Shift Return Status
            </span>
            <span className="font-mono text-noctra-muted text-[11px]">Due by 03:00 AM</span>
          </div>

          {checkInStatus === 'completed' ? (
            <div className="rounded-lg border border-noctra-known/40 bg-noctra-known/10 p-4 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-noctra-known mx-auto animate-pulse" />
              <div className="font-bold text-noctra-known text-sm">
                Safe Arrival Confirmed at 02:44 AM
              </div>
              <p className="text-xs text-noctra-muted">
                Your trusted contacts were notified of your safe return.
              </p>
              <button
                onClick={resetCheckIn}
                className="text-[11px] text-noctra-muted underline underline-offset-2 hover:text-noctra-text"
              >
                Reset Check-in (for testing)
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-noctra-muted leading-relaxed">
                If you haven't checked in by 3:00 AM, your emergency contacts receive a reminder notification with your last known transit waypoint.
              </p>
              <button
                onClick={() => {
                  completeCheckIn();
                  toast.success("Safe arrival confirmed! Trusted circle notified.");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-noctra-known font-bold text-noctra-bg hover:opacity-90 transition-opacity min-h-[48px] shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" /> I'm Safely Home
              </button>
            </div>
          )}
        </div>

        {/* Live ETA Card Preview */}
        <div className="rounded-xl border border-noctra-border bg-noctra-surface p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-noctra-text flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-noctra-accent" />
              Live Route Card (Shared with Contacts)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSharingActive(!isSharingActive)}
                className={cn(
                  'px-2 py-0.5 rounded text-[11px] font-mono border transition-colors',
                  isSharingActive
                    ? 'border-noctra-known/40 bg-noctra-known/15 text-noctra-known'
                    : 'border-noctra-border bg-noctra-raised text-noctra-muted'
                )}
              >
                {isSharingActive ? 'Active' : 'Paused'}
              </button>
              <button
                onClick={handleCopyLink}
                className="text-[11px] font-mono text-noctra-accent hover:underline flex items-center gap-1"
              >
                Copy Link
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-noctra-border/60 bg-noctra-raised text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-noctra-text">
              <span>Status: In Transit (Auto)</span>
              <span className="text-noctra-known">Expected: 02:37 AM</span>
            </div>
            <div className="text-[11px] text-noctra-muted flex items-center gap-1">
              <MapPin className="h-3 w-3 text-noctra-accent" />
              Wardha Road Corridor &rarr; Dharampeth
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-noctra-muted uppercase tracking-wider">
              Trusted Contacts ({contacts.length})
            </span>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="text-noctra-accent text-xs font-semibold flex items-center gap-1 hover:underline"
            >
              <UserPlus className="h-3.5 w-3.5" /> Add Contact
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleAddContact} className="p-3 rounded-lg border border-noctra-border bg-noctra-raised space-y-2.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <input
                  placeholder="Full Name (e.g. Maya)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-lg border border-noctra-border bg-noctra-surface px-2.5 py-1.5 text-noctra-text focus:outline-none focus:border-noctra-accent"
                />
                <select
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  className="rounded-lg border border-noctra-border bg-noctra-surface px-2.5 py-1.5 text-noctra-text focus:outline-none focus:border-noctra-accent"
                >
                  <option value="Family">Family</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Coworker">Coworker</option>
                  <option value="Friend">Friend</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
                <input
                  placeholder="Mobile / WhatsApp"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="rounded-lg border border-noctra-border bg-noctra-surface px-2.5 py-1.5 text-noctra-text font-mono focus:outline-none focus:border-noctra-accent"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2.5 py-1 text-xs rounded border border-noctra-border text-noctra-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold rounded bg-noctra-accent text-noctra-bg hover:bg-noctra-accent-hover"
                >
                  Save Contact
                </button>
              </div>
            </form>
          )}

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-noctra-border/60 bg-noctra-surface text-xs"
              >
                <div>
                  <div className="font-bold text-noctra-text">{c.name}</div>
                  <div className="text-[11px] font-mono text-noctra-muted">{c.phone}</div>
                </div>
                <button
                  onClick={() => removeContact(c.id)}
                  className="p-1 text-noctra-muted hover:text-noctra-infeasible"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
