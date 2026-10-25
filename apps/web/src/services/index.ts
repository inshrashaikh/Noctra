import type { PlanService } from './planService';
import { mockPlanService } from './mock/mockPlanService';
import { apiPlanService } from './api/apiPlanService';
import { isMockMode } from '@/app/env';

/**
 * Single entry point for plan service.
 * Dispatches to Mock or Real API client depending on VITE_DATA_MODE.
 */
export const planService: PlanService = isMockMode()
  ? mockPlanService
  : apiPlanService;

export type { PlanService };
