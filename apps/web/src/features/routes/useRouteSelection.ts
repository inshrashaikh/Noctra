import { create } from 'zustand';

interface RouteSelectionState {
  selectedRouteId: string | null;
  hoveredRouteId: string | null;
  setSelectedRouteId: (id: string | null) => void;
  setHoveredRouteId: (id: string | null) => void;
}

export const useRouteSelection = create<RouteSelectionState>((set) => ({
  selectedRouteId: 'auto-fastest',
  hoveredRouteId: null,
  setSelectedRouteId: (id) => set({ selectedRouteId: id }),
  setHoveredRouteId: (id) => set({ hoveredRouteId: id }),
}));
