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
  // Services
  ServicesRequestSchema,
  ServiceSchema,
  // Status
  StatusResponseSchema,
  FeedStatusSchema,
  // Replan
  ReplanRequestSchema,
  // Sim
  SimEventSchema,
  // Enums / literals
  TransportModeSchema,
  RouteKindSchema,
  CandidateStatusSchema,
  EvidenceLabelSchema,
  SourceClassSchema,
  TierSchema,
  ServiceKindSchema,
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
  ServicesRequest,
  Service,
  StatusResponse,
  FeedStatus,
  ReplanRequest,
  SimEvent,
  TransportMode,
  RouteKind,
  CandidateStatus,
  EvidenceLabel,
  SourceClass,
  Tier,
  ServiceKind,
  FactType,
} from './schemas.js';

export { FACT_TTL, computeLabel } from './decay.js';
export type { DecayConfig } from './decay.js';
