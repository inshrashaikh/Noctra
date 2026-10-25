import { create } from 'zustand';
import type { Tier } from '@noctra/contracts';

interface ConnectivityState {
  tier: Tier;
  isOnline: boolean;
  setTier: (tier: Tier) => void;
  setIsOnline: (online: boolean) => void;
}

export const useConnectivity = create<ConnectivityState>((set) => ({
  tier: 0,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  setTier: (tier) => set({ tier }),
  setIsOnline: (isOnline) => set({ isOnline }),
}));
