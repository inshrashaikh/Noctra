import { z } from 'zod';
import { TransportModeSchema } from '@noctra/contracts';
import { isInsideNagpur } from '@/lib/geo';

export const JourneyFormSchema = z
  .object({
    originAddress: z.string().min(1, 'Origin location is required'),
    originLat: z.number(),
    originLon: z.number(),
    destinationAddress: z.string().min(1, 'Destination location is required'),
    destinationLat: z.number(),
    destinationLon: z.number(),
    shiftEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Valid time HH:MM required'),
    deadlineTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Valid time HH:MM required'),
    modes: z.array(TransportModeSchema).min(1, 'Select at least one transport mode'),
  })
  .refine(
    (data) => isInsideNagpur(data.originLat, data.originLon),
    {
      message: 'Origin must be within the Nagpur service area',
      path: ['originAddress'],
    }
  )
  .refine(
    (data) => isInsideNagpur(data.destinationLat, data.destinationLon),
    {
      message: 'Destination must be within the Nagpur service area',
      path: ['destinationAddress'],
    }
  );

export type JourneyFormData = z.infer<typeof JourneyFormSchema>;
