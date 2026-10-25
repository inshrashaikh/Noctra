/**
 * App-level domain types that extend the contracts layer.
 * These types exist only in the web app; they are NOT part of the API contract.
 */
import type {
  PlanResponse,
  Tier,
  SimEvent,
  EvidenceLabel,
} from '@noctra/contracts';

// ── Map State ──────────────────────────────────────────────────────

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface MapState {
  viewport: MapViewport;
  selectedCandidateId: string | null;
  hoveredCandidateId: string | null;
  showServices: boolean;
  showRiskOverlay: boolean;
}

// ── Alert Events ───────────────────────────────────────────────────

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertEvent {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  timestamp_iso: string;
  candidate_id?: string;
  dismissible: boolean;
  auto_dismiss_ms?: number;
  source_class: 'simulated' | 'live';
}

// ── Demo / Simulation ──────────────────────────────────────────────

export type DemoScenarioId =
  | 'nurse-2-15am'
  | 'closure'
  | 'ride-unknown'
  | 'tier-2-offline';

export interface DemoScenario {
  id: DemoScenarioId;
  label: string;
  description: string;
  events: SimEvent[];
}

// ── Plan Lifecycle ─────────────────────────────────────────────────

export type PlanPhase =
  | 'idle'
  | 'loading'
  | 'active'
  | 'replanning'
  | 'stale'
  | 'error';

export interface PlanState {
  phase: PlanPhase;
  plan: PlanResponse | null;
  selectedCandidateId: string | null;
  lastUpdated: string | null;
  error: string | null;
}

// ── Connectivity ───────────────────────────────────────────────────

export type ConnectivityStatus = 'online' | 'degraded' | 'offline';

export interface ConnectivityState {
  status: ConnectivityStatus;
  tier: Tier;
  lastChecked: string | null;
}

// ── Evidence UI Helpers ────────────────────────────────────────────

export interface EvidenceBadge {
  label: EvidenceLabel;
  colorClass: string;
  iconName: string;
}

// ── Service filter ─────────────────────────────────────────────────

export interface ServiceFilter {
  kinds: string[];
  maxDistance_m: number;
  onlyOpen: boolean;
}

// ── Notification preferences ───────────────────────────────────────

export interface NotificationPrefs {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  criticalOnly: boolean;
}
