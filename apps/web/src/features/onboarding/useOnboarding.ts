import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  isOpen: boolean;
  hasSeenOnboarding: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  resetOnboarding: () => void;
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      isOpen: false,
      hasSeenOnboarding: false,
      openOnboarding: () => set({ isOpen: true }),
      closeOnboarding: () => set({ isOpen: false, hasSeenOnboarding: true }),
      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
      resetOnboarding: () => set({ isOpen: true, hasSeenOnboarding: false }),
    }),
    {
      name: 'noctra-onboarding-vibe-v1',
      partialize: (state) => ({ hasSeenOnboarding: state.hasSeenOnboarding }),
    }
  )
);
