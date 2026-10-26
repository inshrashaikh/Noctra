import { z } from 'zod';

// ── Enums & Literals ──────────────────────────────────────────────

export const TransportModeSchema = z.enum([
  'walk',
  'two_wheeler',
  'cab',
  'auto',
  'transit',
]);
export type TransportMode = z.infer<typeof TransportModeSchema>;

export const RouteKindSchema = z.enum(['fastest', 'balanced', 'safest']);
export type RouteKind = z.infer<typeof RouteKindSchema>;

export const CandidateStatusSchema = z.enum([
  'ROBUST',
  'AT_RISK',
  'INFEASIBLE',
]);
export type CandidateStatus = z.infer<typeof CandidateStatusSchema>;

export const EvidenceLabelSchema = z.enum([
  'KNOWN',
  'PROBABLE',
  'OUTDATED',
  'UNKNOWN',
]);
export type EvidenceLabel = z.infer<typeof EvidenceLabelSchema>;

export const SourceClassSchema = z.enum([
  'live',
  'cached',
  'static',
  'simulated',
]);
export type SourceClass = z.infer<typeof SourceClassSchema>;

export const TierSchema = z.union([z.literal(0), z.literal(1), z.literal(2)]);
export type Tier = z.infer<typeof TierSchema>;

export const ServiceKindSchema = z.enum([
  'hospital',
  'pharmacy',
  'police',
  'fuel',
  'atm',
  'shelter',
  'restaurant',
  'dhaba',
  'chai_stall',
  'canteen_24h',
  'water',
]);
export type ServiceKind = z.infer<typeof ServiceKindSchema>;

export const NeedTypeSchema = z.enum([
  'medicine',
  'food',
  'fuel',
  'emergency',
  'cash',
  'rest_shelter',
  'water',
]);
export type NeedType = z.infer<typeof NeedTypeSchema>;

export const OpeningStatusSchema = z.enum([
  'OPEN_AT_ARRIVAL',
  'CLOSING_SOON',
  'CLOSED_AT_ARRIVAL',
  'OPENS_LATER',
  'UNKNOWN',
]);
export type OpeningStatus = z.infer<typeof OpeningStatusSchema>;

export const FactTypeSchema = z.enum([
  'ride_availability',
  'transit_schedule',
  'road_closure',
  'weather',
  'facility_hours',
  'traffic',
]);
export type FactType = z.infer<typeof FactTypeSchema>;

// ── Coordinates ───────────────────────────────────────────────────

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

// ── Evidence ──────────────────────────────────────────────────────

export const EvidenceSchema = z.object({
  fact_type: FactTypeSchema,
  subject: z.string(),
  label: EvidenceLabelSchema,
  confidence: z.number().min(0).max(1),
  age_s: z.number().nonnegative(),
  source: z.string(),
  source_class: SourceClassSchema,
  simulated: z.boolean(),
  reasons: z.array(z.string()),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

// ── ETA / Slack ───────────────────────────────────────────────────

export const EtaSchema = z.object({
  optimistic_min: z.number().nonnegative(),
  expected_min: z.number().nonnegative(),
  pessimistic_min: z.number().nonnegative(),
});
export type Eta = z.infer<typeof EtaSchema>;

export const SlackSchema = z.object({
  optimistic: z.number(),
  expected: z.number(),
  pessimistic: z.number(),
});
export type Slack = z.infer<typeof SlackSchema>;

// ── Risk ──────────────────────────────────────────────────────────

export const RiskSchema = z.object({
  score: z.number().min(0).max(1),
  max_gap_m: z.number().nonnegative(),
  basis: z.literal('environmental_proxy'),
});
export type Risk = z.infer<typeof RiskSchema>;

// ── Plan B ────────────────────────────────────────────────────────

export const PlanBSchema = z.object({
  mode: TransportModeSchema,
  kind: RouteKindSchema,
  eta: EtaSchema,
  description: z.string(),
  trigger: z.string(),
});
export type PlanB = z.infer<typeof PlanBSchema>;

// ── GeoJSON LineString ────────────────────────────────────────────

export const GeoJSONLineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(z.tuple([z.number(), z.number()])),
});
export type GeoJSONLineString = z.infer<typeof GeoJSONLineStringSchema>;

// ── Services (Module 2) ────────────────────────────────────────────

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: ServiceKindSchema,
  lat: z.number(),
  lon: z.number(),
  distance_m: z.number().nonnegative(),
  hours_raw: z.string().nullable(),
  hours_label: z.string(),
  label: EvidenceLabelSchema,
  source: z.string(),
  source_class: SourceClassSchema,
  osm_timestamp: z.string().nullable(),
  opening_status: OpeningStatusSchema.optional(),
  open_until: z.string().nullable().optional(),
  opens_at: z.string().nullable().optional(),
  opening_note: z.string().optional(),
  verified_hours: z.boolean().optional(),
  listing_evidence: EvidenceSchema.optional(),
  opening_evidence: EvidenceSchema.optional(),
  detour_min: z.number().optional(),
  slack_impact_min: z.number().optional(),
  deadline_feasible: z.boolean().optional(),
  why_ranked: z.string().optional(),
  uncertainties: z.array(z.string()).optional(),
});
export type Service = z.infer<typeof ServiceSchema>;

export const ServicesRequestSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  kinds: z.array(ServiceKindSchema).optional(),
  radius_m: z.number().positive().optional(),
  need: NeedTypeSchema.optional(),
  arrival_time_iso: z.string().optional(),
  origin_lat: z.number().optional(),
  origin_lon: z.number().optional(),
  dest_lat: z.number().optional(),
  dest_lon: z.number().optional(),
  deadline_iso: z.string().optional(),
});
export type ServicesRequest = z.infer<typeof ServicesRequestSchema>;

export const ServicesResponseSchema = z.object({
  generated_at: z.string(),
  arrival_time_iso: z.string(),
  services: z.array(ServiceSchema),
  total_found: z.number(),
  fallback_notice: z.string().nullable().optional(),
  closest_fallback: ServiceSchema.nullable().optional(),
});
export type ServicesResponse = z.infer<typeof ServicesResponseSchema>;

// ── Module 3: Multi-Leg Itinerary, Stranding, Recovery & Safe Haven ────

export const OperatingStatusModeSchema = z.enum([
  'RUNNING',
  'ENDED',
  'NOT_STARTED',
  'UNKNOWN_AVAILABILITY',
]);
export type OperatingStatusMode = z.infer<typeof OperatingStatusModeSchema>;

export const JourneyLegSchema = z.object({
  leg_index: z.number().int().nonnegative(),
  mode: TransportModeSchema,
  service_id: z.string().optional(),
  service_name: z.string(),
  origin_name: z.string(),
  destination_name: z.string(),
  origin_coords: CoordinatesSchema,
  destination_coords: CoordinatesSchema,
  geometry: GeoJSONLineStringSchema.optional(),
  distance_m: z.number().nonnegative(),
  wait_min: z.number().nonnegative(),
  transit_duration_min: EtaSchema,
  depart_time_hm: z.string(),
  arrive_time_hm: z.string(),
  depart_iso: z.string(),
  arrive_iso: z.string(),
  evidence: z.array(EvidenceSchema),
  is_critical: z.boolean(),
  operating_status: OperatingStatusModeSchema.optional(),
  lighting_quality: z.string().optional(),
  refuge_nearby: z.string().optional(),
});
export type JourneyLeg = z.infer<typeof JourneyLegSchema>;

export const StrandingPointSchema = z.object({
  node_id: z.string(),
  node_name: z.string(),
  node_coords: CoordinatesSchema,
  trigger_condition: z.string(),
  risk_level: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  stranded_arrival_hm: z.string().nullable(),
  missed_deadline_min: z.number(),
  description: z.string(),
  recovery_option_id: z.string().optional(),
});
export type StrandingPoint = z.infer<typeof StrandingPointSchema>;

export const RecoveryOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  mode: TransportModeSchema,
  description: z.string(),
  trigger_time_hm: z.string(),
  eta_expected_min: z.number().nonnegative(),
  arrival_time_hm: z.string(),
  extra_time_min: z.number(),
  extra_cost_inr: z.number(),
  meets_deadline: z.boolean(),
  slack_remaining_min: z.number(),
  evidence_label: EvidenceLabelSchema,
});
export type RecoveryOption = z.infer<typeof RecoveryOptionSchema>;

export const SafeHavenHandoffSchema = z.object({
  primary: ServiceSchema,
  secondary: ServiceSchema.nullable().optional(),
  trigger_reason: z.string(),
  walk_time_min: z.number().nonnegative(),
  arrival_hm: z.string(),
  verified_staffed: z.boolean(),
  phone_or_contact: z.string().optional(),
});
export type SafeHavenHandoff = z.infer<typeof SafeHavenHandoffSchema>;

export const ScenarioResultSchema = z.object({
  scenario_id: z.string(),
  scenario_name: z.string(),
  verdict: CandidateStatusSchema,
  slack_min: z.number(),
  decide_by_hm: z.string().nullable(),
  feasible: z.boolean(),
  impact_description: z.string(),
});
export type ScenarioResult = z.infer<typeof ScenarioResultSchema>;

export const ReplanDiffSchema = z.object({
  previous_status: CandidateStatusSchema.optional(),
  status_changed: z.boolean(),
  slack_delta_min: z.number().optional(),
  decide_by_delta_min: z.number().optional(),
  explanation: z.string(),
});
export type ReplanDiff = z.infer<typeof ReplanDiffSchema>;

export const PlanVerdictSchema = z.object({
  status: CandidateStatusSchema,
  meets_deadline_supported: z.boolean(),
  summary: z.string(),
  best_candidate_id: z.string().nullable(),
  critical_dependency_count: z.number(),
  stranding_risk_detected: z.boolean(),
  earliest_decide_by_iso: z.string().nullable(),
  safe_haven_available: z.boolean(),
  replan_diff: ReplanDiffSchema.optional(),
});
export type PlanVerdict = z.infer<typeof PlanVerdictSchema>;

// ── Candidate ─────────────────────────────────────────────────────

export const CandidateSchema = z.object({
  id: z.string(),
  mode: TransportModeSchema,
  kind: RouteKindSchema,
  geometry: GeoJSONLineStringSchema,
  distance_m: z.number().nonnegative(),
  eta: EtaSchema,
  slack_min: SlackSchema,
  status: CandidateStatusSchema,
  risk: RiskSchema,
  evidence: z.array(EvidenceSchema),
  plan_b: PlanBSchema.nullable(),
  decision_by_iso: z.string().nullable(),
  rejected: z.boolean(),
  reject_reasons: z.array(z.string()),
  operating_note: z.string().optional(),
  last_service_time: z.string().optional(),
  latest_feasible_departure_iso: z.string().nullable().optional(),
  fare_estimate_text: z.string().optional(),
  legs: z.array(JourneyLegSchema).optional(),
  stranding_points: z.array(StrandingPointSchema).optional(),
  recovery_options: z.array(RecoveryOptionSchema).optional(),
  safe_haven: SafeHavenHandoffSchema.nullable().optional(),
  scenario_matrix: z.array(ScenarioResultSchema).optional(),
  decide_by_rationale: z.string().optional(),
});
export type Candidate = z.infer<typeof CandidateSchema>;

// ── Explanation ───────────────────────────────────────────────────

export const ExplanationSchema = z.object({
  why_chosen: z.string(),
  why_rejected: z.array(
    z.object({
      id: z.string(),
      reason: z.string(),
    })
  ),
  uncertainties: z.array(z.string()),
});
export type Explanation = z.infer<typeof ExplanationSchema>;

// ── Plan Request / Response ───────────────────────────────────────

export const PlanRequestSchema = z.object({
  origin: CoordinatesSchema,
  destination: CoordinatesSchema,
  shift_end_iso: z.string(),
  deadline_iso: z.string(),
  modes: z.array(TransportModeSchema).min(1),
  now_iso: z.string().optional(),
});
export type PlanRequest = z.infer<typeof PlanRequestSchema>;

export const PlanResponseSchema = z.object({
  generated_at: z.string(),
  tier: TierSchema,
  candidates: z.array(CandidateSchema),
  recommended_id: z.string().nullable(),
  missing_information: z.array(z.string()),
  explanation: ExplanationSchema,
  verdict: PlanVerdictSchema.optional(),
  safe_haven_handoff: SafeHavenHandoffSchema.nullable().optional(),
});
export type PlanResponse = z.infer<typeof PlanResponseSchema>;

// ── Status ────────────────────────────────────────────────────────

export const FeedStatusSchema = z.object({
  name: z.string(),
  healthy: z.boolean(),
  last_ok_iso: z.string().nullable(),
  label: EvidenceLabelSchema,
});
export type FeedStatus = z.infer<typeof FeedStatusSchema>;

export const StatusResponseSchema = z.object({
  tier: TierSchema,
  feeds: z.array(FeedStatusSchema),
  data_manifest: z.record(z.string(), z.unknown()).nullable(),
});
export type StatusResponse = z.infer<typeof StatusResponseSchema>;

// ── Replan ─────────────────────────────────────────────────────────

export const ReplanRequestSchema = PlanRequestSchema.extend({
  previous_plan_id: z.string().optional(),
  reason: z.string().optional(),
  scenario_type: z.string().optional(),
  delay_min: z.number().optional(),
  cancelled_mode: z.string().optional(),
  previous_plan: PlanResponseSchema.optional(),
});
export type ReplanRequest = z.infer<typeof ReplanRequestSchema>;

// ── Sim Event (demo only) ─────────────────────────────────────────

export const SimEventSchema = z.object({
  type: z.enum([
    'closure',
    'clear_closure',
    'ride_available',
    'ride_unavailable',
    'feed_outage',
    'feed_restore',
    'clock_advance',
    'network_kill',
    'network_restore',
  ]),
  payload: z.record(z.string(), z.unknown()).optional(),
});
export type SimEvent = z.infer<typeof SimEventSchema>;
