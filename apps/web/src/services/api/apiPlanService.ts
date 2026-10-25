import type {
  PlanRequest,
  PlanResponse,
  ReplanRequest,
  ServicesRequest,
  Service,
  StatusResponse,
} from '@noctra/contracts';
import type { PlanService } from '../planService';
import type { AlertEvent } from '@/types/domain';
import { env } from '@/app/env';

export class ApiPlanService implements PlanService {
  private baseUrl: string;

  constructor(baseUrl = env.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  async plan(req: PlanRequest): Promise<PlanResponse> {
    const res = await fetch(`${this.baseUrl}/api/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Plan request failed: ${res.statusText}`);
    return res.json();
  }

  async replan(req: ReplanRequest): Promise<PlanResponse> {
    const res = await fetch(`${this.baseUrl}/api/replan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Replan request failed: ${res.statusText}`);
    return res.json();
  }

  async getServices(req: ServicesRequest): Promise<Service[]> {
    const params = new URLSearchParams({
      lat: req.lat.toString(),
      lon: req.lon.toString(),
    });
    if (req.kinds?.length) {
      params.set('kinds', req.kinds.join(','));
    }
    if (req.radius_m) {
      params.set('radius_m', req.radius_m.toString());
    }
    if (req.need) {
      params.set('need', req.need);
    }
    if (req.arrival_time_iso) {
      params.set('arrival_time_iso', req.arrival_time_iso);
    }
    if (req.deadline_iso) {
      params.set('deadline_iso', req.deadline_iso);
    }
    if (req.origin_lat !== undefined && req.origin_lon !== undefined) {
      params.set('origin_lat', req.origin_lat.toString());
      params.set('origin_lon', req.origin_lon.toString());
    }
    if (req.dest_lat !== undefined && req.dest_lon !== undefined) {
      params.set('dest_lat', req.dest_lat.toString());
      params.set('dest_lon', req.dest_lon.toString());
    }
    const res = await fetch(`${this.baseUrl}/api/services?${params}`);
    if (!res.ok) throw new Error(`Services request failed: ${res.statusText}`);
    return res.json();
  }

  async getStatus(): Promise<StatusResponse> {
    const res = await fetch(`${this.baseUrl}/api/status`);
    if (!res.ok) throw new Error(`Status request failed: ${res.statusText}`);
    return res.json();
  }

  subscribeAlerts(onAlert: (alert: AlertEvent) => void): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/api/stream`);
    eventSource.onmessage = (event) => {
      try {
        const alert = JSON.parse(event.data) as AlertEvent;
        onAlert(alert);
      } catch (err) {
        console.error('Failed to parse alert stream event', err);
      }
    };
    return () => eventSource.close();
  }
}

export const apiPlanService = new ApiPlanService();
