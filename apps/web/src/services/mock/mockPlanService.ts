import type {
  PlanRequest,
  PlanResponse,
  ReplanRequest,
  ServicesRequest,
  Service,
  StatusResponse,
  SimEvent,
} from '@noctra/contracts';
import type { PlanService } from '../planService';
import type { AlertEvent } from '@/types/domain';
import { NURSE_PLAN_RESPONSE } from '@/mocks/fixtures/nurse-2-15am';
import { STATUS_FIXTURE } from '@/mocks/fixtures/status';
import { TIER_2_PLAN_RESPONSE, TIER_2_STATUS } from '@/mocks/fixtures/tier-2';
import { findAndRankServices } from '@/lib/servicesEngine';
import { planWithDeadlines, replanWithDeadlines } from '@/lib/deadlineEngine';

class MockPlanServiceImpl implements PlanService {
  private currentPlan: PlanResponse = structuredClone(NURSE_PLAN_RESPONSE);
  private currentStatus: StatusResponse = structuredClone(STATUS_FIXTURE);
  private alertListeners: Set<(alert: AlertEvent) => void> = new Set();
  private simulatedTimeOffsetMin = 0;

  async plan(req: PlanRequest): Promise<PlanResponse> {
    // Artificial small delay for realistic UX feeling
    await new Promise((r) => setTimeout(r, 80));
    this.currentPlan = planWithDeadlines(req);
    return structuredClone(this.currentPlan);
  }

  async replan(req: ReplanRequest): Promise<PlanResponse> {
    await new Promise((r) => setTimeout(r, 100));
    this.currentPlan = planWithDeadlines(req);
    if (req.reason?.includes('closure')) {
      for (const c of this.currentPlan.candidates) {
        if (c.mode === 'auto') {
          c.status = 'AT_RISK';
          c.reject_reasons.push('Road closure on Wardha Road underpass; detour adds 6m');
          c.eta.expected_min += 6;
          c.eta.pessimistic_min += 10;
          c.slack_min.expected -= 6;
          c.slack_min.pessimistic -= 10;
        }
      }
    }
    return structuredClone(this.currentPlan);
  }

  async getServices(req: ServicesRequest): Promise<Service[]> {
    await new Promise((r) => setTimeout(r, 60));
    const result = findAndRankServices(req);
    return structuredClone(result.services);
  }

  async getStatus(): Promise<StatusResponse> {
    return structuredClone(this.currentStatus);
  }

  subscribeAlerts(onAlert: (alert: AlertEvent) => void): () => void {
    this.alertListeners.add(onAlert);
    return () => {
      this.alertListeners.delete(onAlert);
    };
  }

  private dispatchAlert(alert: AlertEvent) {
    this.alertListeners.forEach((listener) => listener(alert));
  }

  async sendSimEvent(event: SimEvent): Promise<void> {
    switch (event.type) {
      case 'closure': {
        const prev = this.currentPlan;
        this.currentPlan = replanWithDeadlines({
          origin: { lat: 21.0378, lon: 79.0345 },
          destination: { lat: 21.1458, lon: 79.0882 },
          shift_end_iso: '2026-10-25T02:15:00+05:30',
          deadline_iso: '2026-10-25T03:00:00+05:30',
          modes: ['transit', 'auto', 'cab', 'two_wheeler', 'walk'],
          reason: 'Road closure detected near Ramdaspeth on Wardha Road',
          scenario_type: 'closure',
          previous_plan: prev,
        });
        this.dispatchAlert({
          id: `alert-closure-${Date.now()}`,
          severity: 'warning',
          title: 'Road Closure Detected',
          body: 'Wardha Road closed near Ramdaspeth due to burst pipe. Detour adds 6m.',
          timestamp_iso: new Date().toISOString(),
          dismissible: true,
          source_class: 'simulated',
        });
        break;
      }
      case 'clear_closure': {
        this.currentPlan = planWithDeadlines({
          origin: { lat: 21.0378, lon: 79.0345 },
          destination: { lat: 21.1458, lon: 79.0882 },
          shift_end_iso: '2026-10-25T02:15:00+05:30',
          deadline_iso: '2026-10-25T03:00:00+05:30',
          modes: ['transit', 'auto', 'cab', 'two_wheeler', 'walk'],
        });
        this.dispatchAlert({
          id: `alert-clear-${Date.now()}`,
          severity: 'info',
          title: 'Road Reopened',
          body: 'Wardha Road hazard cleared. Original fastest route restored.',
          timestamp_iso: new Date().toISOString(),
          dismissible: true,
          source_class: 'simulated',
        });
        break;
      }
      case 'ride_unavailable': {
        const prev = this.currentPlan;
        this.currentPlan = replanWithDeadlines({
          origin: { lat: 21.0378, lon: 79.0345 },
          destination: { lat: 21.1458, lon: 79.0882 },
          shift_end_iso: '2026-10-25T02:15:00+05:30',
          deadline_iso: '2026-10-25T03:00:00+05:30',
          modes: ['transit', 'auto', 'cab', 'two_wheeler', 'walk'],
          reason: 'Ride availability feeds degraded to UNKNOWN',
          scenario_type: 'ride_unavailable',
          previous_plan: prev,
        });
        this.dispatchAlert({
          id: `alert-ride-${Date.now()}`,
          severity: 'warning',
          title: 'Ride Feeds Degraded',
          body: 'Auto and cab availability status changed to UNKNOWN.',
          timestamp_iso: new Date().toISOString(),
          dismissible: true,
          source_class: 'simulated',
        });
        break;
      }
      case 'ride_available': {
        this.currentPlan = planWithDeadlines({
          origin: { lat: 21.0378, lon: 79.0345 },
          destination: { lat: 21.1458, lon: 79.0882 },
          shift_end_iso: '2026-10-25T02:15:00+05:30',
          deadline_iso: '2026-10-25T03:00:00+05:30',
          modes: ['transit', 'auto', 'cab', 'two_wheeler', 'walk'],
        });
        break;
      }
      case 'feed_outage':
      case 'network_kill': {
        this.currentPlan = structuredClone(TIER_2_PLAN_RESPONSE);
        this.currentStatus = structuredClone(TIER_2_STATUS);
        this.dispatchAlert({
          id: `alert-tier2-${Date.now()}`,
          severity: 'critical',
          title: 'Network / Feed Outage (Tier 2)',
          body: 'Offline mode active. Showing cached journey plan. Emergency: Call 112.',
          timestamp_iso: new Date().toISOString(),
          dismissible: true,
          source_class: 'simulated',
        });
        break;
      }
      case 'feed_restore':
      case 'network_restore': {
        this.currentPlan = structuredClone(NURSE_PLAN_RESPONSE);
        this.currentStatus = structuredClone(STATUS_FIXTURE);
        this.dispatchAlert({
          id: `alert-restore-${Date.now()}`,
          severity: 'info',
          title: 'Connection Restored (Tier 0)',
          body: 'All night mobility feeds are operational.',
          timestamp_iso: new Date().toISOString(),
          dismissible: true,
          source_class: 'simulated',
        });
        break;
      }
      case 'clock_advance': {
        const mins = (event.payload?.minutes as number) ?? 10;
        this.simulatedTimeOffsetMin += mins;
        // Age all evidence items
        for (const c of this.currentPlan.candidates) {
          for (const ev of c.evidence) {
            ev.age_s += mins * 60;
          }
        }
        break;
      }
    }
  }
}

export const mockPlanService = new MockPlanServiceImpl();
