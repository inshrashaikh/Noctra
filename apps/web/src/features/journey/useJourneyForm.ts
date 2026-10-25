import { create } from 'zustand';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { JourneyFormSchema, type JourneyFormData } from './schema';
export type { JourneyFormData };

interface JourneyFormStore {
  pickMode: 'none' | 'origin' | 'destination';
  setPickMode: (mode: 'none' | 'origin' | 'destination') => void;
}

export const useJourneyStore = create<JourneyFormStore>((set) => ({
  pickMode: 'none',
  setPickMode: (mode) => set({ pickMode: mode }),
}));

export const DEFAULT_JOURNEY_VALUES: JourneyFormData = {
  originAddress: 'AIIMS Nagpur, Medical Square',
  originLat: 21.1497,
  originLon: 79.0806,
  destinationAddress: 'Dharampeth Residential Area',
  destinationLat: 21.1453,
  destinationLon: 79.0588,
  shiftEndTime: '02:15',
  deadlineTime: '03:00',
  modes: ['transit', 'auto', 'two_wheeler', 'cab', 'walk'],
};

export function useJourneyForm(onSubmit: (data: JourneyFormData) => void) {
  const form = useForm<JourneyFormData>({
    resolver: zodResolver(JourneyFormSchema),
    defaultValues: DEFAULT_JOURNEY_VALUES,
  });

  return {
    ...form,
    handleSubmit: form.handleSubmit(onSubmit),
  };
}
