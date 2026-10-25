import { create } from 'zustand';
import type { AlertEvent } from '@/types/domain';

interface AlertsState {
  alerts: AlertEvent[];
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  addAlert: (alert: AlertEvent) => void;
  dismissAlert: (id: string) => void;
  clearAll: () => void;
}

export const useAlerts = create<AlertsState>((set) => ({
  alerts: [
    {
      id: 'init-info-1',
      severity: 'info',
      title: 'Night Shift Window Initialized',
      body: 'Monitoring AIIMS Nagpur → Dharampeth corridor (02:15 - 03:00 AM window).',
      timestamp_iso: new Date().toISOString(),
      dismissible: true,
      source_class: 'simulated',
    },
  ],
  isDrawerOpen: false,
  setIsDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts.slice(0, 19)] })),
  dismissAlert: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
  clearAll: () => set({ alerts: [] }),
}));
