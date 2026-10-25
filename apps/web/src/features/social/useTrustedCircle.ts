import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isNotified: boolean;
}

interface TrustedCircleState {
  contacts: TrustedContact[];
  addContact: (contact: Omit<TrustedContact, 'id' | 'isNotified'>) => void;
  removeContact: (id: string) => void;
  isSharingActive: boolean;
  setIsSharingActive: (active: boolean) => void;
  checkInStatus: 'idle' | 'pending' | 'completed' | 'alert_sent';
  checkInDeadlineIso: string;
  setCheckInStatus: (status: 'idle' | 'pending' | 'completed' | 'alert_sent') => void;
  completeCheckIn: () => void;
  resetCheckIn: () => void;
}

export const useTrustedCircle = create<TrustedCircleState>()(
  persist(
    (set, get) => ({
      contacts: [
        {
          id: 'contact-1',
          name: 'Sunita Sharma (Sister)',
          relationship: 'Family',
          phone: '+91 98220 •••••',
          isNotified: true,
        },
        {
          id: 'contact-2',
          name: 'Ramesh Patil (Colleague / AIIMS)',
          relationship: 'Co-worker',
          phone: '+91 94231 •••••',
          isNotified: false,
        },
      ],
      addContact: ({ name, relationship, phone }) => {
        const newContact: TrustedContact = {
          id: `contact-${Date.now()}`,
          name,
          relationship,
          phone,
          isNotified: true,
        };
        set({ contacts: [...get().contacts, newContact] });
      },
      removeContact: (id) => {
        set({ contacts: get().contacts.filter((c) => c.id !== id) });
      },
      isSharingActive: true,
      setIsSharingActive: (isSharingActive) => set({ isSharingActive }),
      checkInStatus: 'pending',
      checkInDeadlineIso: '2026-10-25T03:00:00+05:30',
      setCheckInStatus: (checkInStatus) => set({ checkInStatus }),
      completeCheckIn: () => set({ checkInStatus: 'completed' }),
      resetCheckIn: () => set({ checkInStatus: 'pending' }),
    }),
    {
      name: 'noctra-trusted-circle',
    }
  )
);
