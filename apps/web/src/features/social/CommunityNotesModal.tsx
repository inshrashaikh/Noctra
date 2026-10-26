import { useState } from 'react';
import { useCommunityNotes, type CommunityNote } from './useCommunityNotes';
import { useSettings } from '@/features/settings/useSettings';
import { Users, AlertTriangle, Plus, ThumbsUp, X, CheckCircle, Clock } from 'lucide-react';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';
import { formatAge } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export function CommunityNotesModal() {
  const { isCommunityNotesOpen, setIsCommunityNotesOpen } = useSettings();
  const { notes, confirmNote, disputeNote, addNote } = useCommunityNotes();

  const [isPosting, setIsPosting] = useState(false);
  const [segment, setSegment] = useState('');
  const [category, setCategory] = useState<CommunityNote['category']>('lighting');
  const [noteText, setNoteText] = useState('');

  if (!isCommunityNotesOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!segment.trim() || !noteText.trim()) return;
    addNote(segment, category, noteText);
    setSegment('');
    setNoteText('');
    setIsPosting(false);
    toast.success('Route observation published to community safety grid');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-noctra-border bg-noctra-surface p-6 shadow-2xl space-y-5 text-noctra-text max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-noctra-border pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-noctra-accent" />
            <h3 className="font-bold text-base tracking-wide">
              Worker Community Route Intel
            </h3>
          </div>
          <button
            onClick={() => setIsCommunityNotesOpen(false)}
            className="p-1 rounded-lg text-noctra-muted hover:text-noctra-text hover:bg-noctra-raised"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Prototype disclosure banner */}
        <div className="flex items-center justify-between rounded-lg border border-noctra-accent/40 bg-noctra-accent/10 p-3 text-xs text-noctra-accent">
          <span>Worker-verified conditions. No personal names or live locations stored.</span>
          <SimulatedBadge size="sm" />
        </div>

        {/* Action Button: Post new note */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-noctra-muted">
            Reports begin as <strong>PROBABLE</strong> and elevate to <strong>KNOWN</strong> when confirmed by a second independent commuter.
          </p>
          <button
            onClick={() => setIsPosting(!isPosting)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-noctra-accent text-noctra-bg font-bold text-xs hover:bg-noctra-accent-hover min-h-[36px]"
          >
            <Plus className="h-3.5 w-3.5" /> Post Note
          </button>
        </div>

        {/* Post Form */}
        {isPosting && (
          <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-noctra-border bg-noctra-raised space-y-3 text-xs">
            <h4 className="font-bold text-noctra-text">Report Route Segment Condition</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Segment (e.g. Wardha Rd Flyover)"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="rounded-lg border border-noctra-border bg-noctra-surface px-3 py-2 text-noctra-text focus:outline-none focus:border-noctra-accent"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="rounded-lg border border-noctra-border bg-noctra-surface px-3 py-2 text-noctra-text focus:outline-none focus:border-noctra-accent"
              >
                <option value="lighting">Dark / Streetlight Out</option>
                <option value="hazard">Road Obstacle / Construction</option>
                <option value="service_open">Safe Haven / Open Kiosk</option>
                <option value="waterlogging">Waterlogging</option>
              </select>
            </div>
            <textarea
              placeholder="Observation details (e.g. 2 of 4 lights flickered out, avoid left margin)..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-noctra-border bg-noctra-surface px-3 py-2 text-noctra-text focus:outline-none focus:border-noctra-accent"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPosting(false)}
                className="px-3 py-1 text-xs rounded border border-noctra-border text-noctra-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-noctra-accent text-noctra-bg hover:bg-noctra-accent-hover"
              >
                Publish Route Note
              </button>
            </div>
          </form>
        )}

        {/* Notes List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {notes.map((note) => {
            const isKnown = note.label === 'KNOWN';
            return (
              <div
                key={note.id}
                className="p-3.5 rounded-xl border border-noctra-border/70 bg-noctra-surface space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-noctra-text text-sm">{note.segment}</div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded border',
                      isKnown
                        ? 'border-noctra-known/40 bg-noctra-known/10 text-noctra-known'
                        : 'border-noctra-probable/40 bg-noctra-probable/10 text-noctra-probable'
                    )}
                  >
                    {isKnown ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {note.label} ({note.confirmations} {note.confirmations === 1 ? 'report' : 'confirmations'})
                  </span>
                </div>

                <p className="text-noctra-muted leading-relaxed">{note.note}</p>

                <div className="flex items-center justify-between pt-1 border-t border-noctra-border/40 text-[11px] text-noctra-dim font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Reported {formatAge(note.age_s)}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        confirmNote(note.id);
                        toast.success('Confirmed! Trust level updated.');
                      }}
                      className="inline-flex items-center gap-1 text-noctra-known hover:underline"
                    >
                      <ThumbsUp className="h-3 w-3" /> Confirm
                    </button>
                    <button
                      onClick={() => {
                        disputeNote(note.id);
                        toast.info('Report flagged for review.');
                      }}
                      className="text-noctra-muted hover:text-noctra-infeasible"
                    >
                      Not accurate
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
