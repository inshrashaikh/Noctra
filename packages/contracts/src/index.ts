/**
 * @noctra/contracts — Single source of truth for API schemas and types.
 * Imported by both apps/web (runtime validation + types) and apps/api (contract compliance).
 */

export {
  // Plan
  PlanRequestSchema,
  PlanResponseSchema,
  CandidateSchema,
  EtaSchema,
  SlackSchema,
  RiskSchema,
  EvidenceSchema,
  PlanBSchema,
  ExplanationSchema,
  CoordinatesSchema,
  GeoJSONLineStringSchema,
  // Services
  ServicesRequestSchema,
  ServiceSchema,
  ServicesResponseSchema,
  // Status
  StatusResponseSchema,
  FeedStatusSchema,
  // Replan
  ReplanRequestSchema,
  ReplanDiffSchema,
  // Sim
  SimEventSchema,
  // Module 3
  JourneyLegSchema,
  StrandingPointSchema,
  RecoveryOptionSchema,
  SafeHavenHandoffSchema,
  ScenarioResultSchema,
  PlanVerdictSchema,
  OperatingStatusModeSchema,
  // Enums / literals
  TransportModeSchema,
  RouteKindSchema,
  CandidateStatusSchema,
  EvidenceLabelSchema,
  SourceClassSchema,
  TierSchema,
  ServiceKindSchema,
  NeedTypeSchema,
  OpeningStatusSchema,
  FactTypeSchema,
} from './schemas.js';

export type {
  PlanRequest,
  PlanResponse,
  Candidate,
  Eta,
  Slack,
  Risk,
  Evidence,
  PlanB,
  Explanation,
  Coordinates,
  GeoJSONLineString,
  ServicesRequest,
  Service,
  ServicesResponse,
  StatusResponse,
  FeedStatus,
  ReplanRequest,
  ReplanDiff,
  SimEvent,
  JourneyLeg,
  StrandingPoint,
  RecoveryOption,
  SafeHavenHandoff,
  ScenarioResult,
  PlanVerdict,
  OperatingStatusMode,
  TransportMode,
  RouteKind,
  CandidateStatus,
  EvidenceLabel,
  SourceClass,
  Tier,
  ServiceKind,
  NeedType,
  OpeningStatus,
  FactType,
} from './schemas.js';

export { FACT_TTL, computeLabel } from './decay.js';
export type { DecayConfig } from './decay.js';
