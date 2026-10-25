import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TransportMode } from '@noctra/contracts';

interface SettingsState {
  textSize: 'normal' | 'large';
  setTextSize: (size: 'normal' | 'large') => void;
  preferredModes: TransportMode[];
  togglePreferredMode: (mode: TransportMode) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (val: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isTrustedCircleOpen: boolean;
  setIsTrustedCircleOpen: (open: boolean) => void;
  isCommunityNotesOpen: boolean;
  setIsCommunityNotesOpen: (open: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      textSize: 'normal',
      setTextSize: (textSize) => {
        set({ textSize });
        if (typeof document !== 'undefined') {
          if (textSize === 'large') {
            document.documentElement.classList.add('text-scale-large');
          } else {
            document.documentElement.classList.remove('text-scale-large');
          }
        }
      },
      preferredModes: ['auto', 'two_wheeler', 'walk'],
      togglePreferredMode: (mode) => {
        const current = get().preferredModes;
        const next = current.includes(mode)
          ? current.filter((m) => m !== mode)
          : [...current, mode];
        if (next.length > 0) set({ preferredModes: next });
      },
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
      isOnboardingOpen: false,
      setIsOnboardingOpen: (isOnboardingOpen) => set({ isOnboardingOpen }),
      isSettingsOpen: false,
      setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
      isTrustedCircleOpen: false,
      setIsTrustedCircleOpen: (isTrustedCircleOpen) => set({ isTrustedCircleOpen }),
      isCommunityNotesOpen: false,
      setIsCommunityNotesOpen: (isCommunityNotesOpen) => set({ isCommunityNotesOpen }),
    }),
    {
      name: 'noctra-settings-pref',
      partialize: (state) => ({
        textSize: state.textSize,
        preferredModes: state.preferredModes,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    }
  )
);
