import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EvidenceLabel } from '@noctra/contracts';

export interface CommunityNote {
  id: string;
  segment: string;
  category: 'lighting' | 'hazard' | 'service_open' | 'stray_dogs' | 'waterlogging';
  note: string;
  label: EvidenceLabel;
  confirmations: number;
  age_s: number;
  reportedAtIso: string;
}

interface CommunityNotesState {
  notes: CommunityNote[];
  confirmNote: (id: string) => void;
  disputeNote: (id: string) => void;
  addNote: (segment: string, category: CommunityNote['category'], note: string) => void;
}

export const useCommunityNotes = create<CommunityNotesState>()(
  persist(
    (set, get) => ({
      notes: [
        {
          id: 'note-1',
          segment: 'Wardha Road Underpass (near Medical Sq)',
          category: 'lighting',
          note: 'Streetlights out for 150m stretch under the flyover. High-beam required if on two-wheeler.',
          label: 'PROBABLE',
          confirmations: 1,
          age_s: 900, // 15 mins ago
          reportedAtIso: '2026-10-25T02:00:00+05:30',
        },
        {
          id: 'note-2',
          segment: 'Ramdaspeth Canal Road',
          category: 'hazard',
          note: 'Water pipe repair crew working on right lane. Cones placed, pass on left.',
          label: 'KNOWN',
          confirmations: 2,
          age_s: 1500, // 25 mins ago
          reportedAtIso: '2026-10-25T01:50:00+05:30',
        },
        {
          id: 'note-3',
          segment: 'Dharampeth Children Park Lane',
          category: 'service_open',
          note: 'Chai & snack stall open with good lighting and night guards stationed.',
          label: 'PROBABLE',
          confirmations: 1,
          age_s: 2400, // 40 mins ago
          reportedAtIso: '2026-10-25T01:35:00+05:30',
        },
      ],
      confirmNote: (id) => {
        set({
          notes: get().notes.map((n) => {
            if (n.id !== id) return n;
            const newCount = n.confirmations + 1;
            return {
              ...n,
              confirmations: newCount,
              label: newCount >= 2 ? 'KNOWN' : 'PROBABLE',
            };
          }),
        });
      },
      disputeNote: (id) => {
        set({
          notes: get().notes.filter((n) => n.id !== id),
        });
      },
      addNote: (segment, category, note) => {
        const newNote: CommunityNote = {
          id: `note-${Date.now()}`,
          segment,
          category,
          note,
          label: 'PROBABLE',
          confirmations: 1,
          age_s: 0,
          reportedAtIso: new Date().toISOString(),
        };
        set({ notes: [newNote, ...get().notes] });
      },
    }),
    {
      name: 'noctra-community-notes',
    }
  )
);
