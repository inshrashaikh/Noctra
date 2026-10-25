import type {
  PlanRequest,
  PlanResponse,
  ReplanRequest,
  ServicesRequest,
  Service,
  StatusResponse,
  SimEvent,
} from '@noctra/contracts';
import type { AlertEvent } from '@/types/domain';

export interface PlanService {
  plan(req: PlanRequest): Promise<PlanResponse>;
  replan(req: ReplanRequest): Promise<PlanResponse>;
  getServices(req: ServicesRequest): Promise<Service[]>;
  getStatus(): Promise<StatusResponse>;
  subscribeAlerts(onAlert: (alert: AlertEvent) => void): () => void;
  sendSimEvent?(event: SimEvent): Promise<void>;
}
