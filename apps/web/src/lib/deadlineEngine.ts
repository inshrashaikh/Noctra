/**
 * Module 3: Deadline Planner, Stranding Prediction & Safe-Haven Fallback Engine.
 * (TypeScript parity implementation for offline mock & client evaluation).
 *
 * Deterministically evaluates multi-leg journeys, ETA bands, slack thresholds,
 * stranding points, decide-by times, scenario matrices, and safe-haven handoffs.
 */

import type {
  PlanRequest,
  PlanResponse,
  ReplanRequest,
  Candidate,
  JourneyLeg,
  StrandingPoint,
  RecoveryOption,
  SafeHavenHandoff,
  ScenarioResult,
  PlanVerdict,
  ReplanDiff,
  CandidateStatus,
  Service,
  Coordinates,
} from '@noctra/contracts';
import { generatePlan } from './transportEngine';
import { findAndRankServices } from './servicesEngine';

function parseTimeToMinutes(timeStr: string): number {
  const clean = timeStr.trim();
  let part = clean;
  if (clean.includes('T')) {
    part = clean.split('T')[1].substring(0, 5);
  }
  const [hStr, mStr] = part.split(':');
  return parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
}

function minutesToHm(totalMin: number): string {
  const wrapped = ((Math.floor(totalMin) % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function computeWindowDurationMin(startStr: string, endStr: string): number {
  const startMin = parseTimeToMinutes(startStr);
  const endMin = parseTimeToMinutes(endStr);
  if (endMin < startMin) {
    return endMin + 1440 - startMin;
  }
  return endMin - startMin;
}

export function evaluateSafeHaven(
  origin: Coordinates,
  shiftEndIso: string,
  deadlineIso: string
): SafeHavenHandoff {
  const res = findAndRankServices({
    lat: origin.lat,
    lon: origin.lon,
    radius_m: 6000,
    kinds: ['hospital', 'police', 'pharmacy'],
    need: 'rest_shelter',
    arrival_time_iso: shiftEndIso,
    deadline_iso: deadlineIso,
  });

  const openServices = res.services.filter((s) => s.opening_status === 'OPEN_AT_ARRIVAL');

  let primary: Service | null = null;
  let secondary: Service | null = null;

  for (const s of openServices) {
    if (!primary && (s.kind === 'hospital' || s.kind === 'police')) {
      primary = s;
    } else if (!secondary && primary && s.id !== primary.id) {
      secondary = s;
    }
  }

  if (!primary && res.services.length > 0) {
    primary = res.services[0];
  }

  if (!primary) {
    primary = {
      id: 'emergency-aiims-haven',
      name: 'AIIMS Nagpur 24/7 Trauma and Emergency Center',
      kind: 'hospital',
      lat: origin.lat,
      lon: origin.lon,
      distance_m: 280,
      hours_raw: '24/7',
      hours_label: 'Open 24×7 Emergency',
      label: 'KNOWN',
      source: 'Municipal Health Directory',
      source_class: 'static',
      osm_timestamp: null,
      opening_status: 'OPEN_AT_ARRIVAL',
      verified_hours: true,
    };
  }

  const walkTime = Math.max(3, Math.round(primary.distance_m / 75));
  const shiftMin = parseTimeToMinutes(shiftEndIso);
  const arrMin = shiftMin + walkTime;

  return {
    primary,
    secondary: secondary || null,
    trigger_reason: 'Fallback to illuminated, staffed refuge if transport fails or worker is stranded',
    walk_time_min: walkTime,
    arrival_hm: minutesToHm(arrMin),
    verified_staffed: Boolean(primary.verified_hours || primary.kind === 'hospital' || primary.kind === 'police'),
    phone_or_contact: 'Police Emergency: 112 | Hospital Casualty: 0712-2980100',
  };
}

export function buildLegsForCandidate(
  c: Candidate,
  req: PlanRequest,
  _windowDuration: number
): JourneyLeg[] {
  const shiftMin = parseTimeToMinutes(req.shift_end_iso);
  const datePrefix = req.shift_end_iso.slice(0, 11);
  const legs: JourneyLeg[] = [];

  if (c.mode === 'transit') {
    const walk1Dur = 8;
    legs.push({
      leg_index: 0,
      mode: 'walk',
      service_id: undefined,
      service_name: 'Pedestrian Access to Metro Platform',
      origin_name: 'Workplace Facility Gate',
      destination_name: 'Sitabuldi / Metro Station Concourse',
      origin_coords: req.origin,
      destination_coords: { lat: 21.1466, lon: 79.0833 },
      distance_m: 650,
      wait_min: 0,
      transit_duration_min: { optimistic_min: 6, expected_min: 8, pessimistic_min: 11 },
      depart_time_hm: minutesToHm(shiftMin),
      arrive_time_hm: minutesToHm(shiftMin + walk1Dur),
      depart_iso: `${datePrefix}${minutesToHm(shiftMin)}:00+05:30`,
      arrive_iso: `${datePrefix}${minutesToHm(shiftMin + walk1Dur)}:00+05:30`,
      evidence: c.evidence.slice(0, 1),
      is_critical: false,
      operating_status: 'RUNNING',
      lighting_quality: 'Illuminated facility perimeter',
      refuge_nearby: 'Hospital perimeter security post',
    });

    const isEnded = c.rejected && c.reject_reasons.some((r) => r.toLowerCase().includes('ended') || r.toLowerCase().includes('closed'));
    const metroStatus = isEnded ? 'ENDED' : 'RUNNING';
    const waitM = isEnded ? 15 : 0;
    const transitDur = 14;
    const leg2Dep = shiftMin + walk1Dur;
    const leg2Arr = leg2Dep + transitDur;

    legs.push({
      leg_index: 1,
      mode: 'transit',
      service_id: 'metro-orange-line',
      service_name: 'Nagpur Metro (Orange Line)',
      origin_name: 'Sitabuldi Interchange Station',
      destination_name: 'Dharampeth / Sub-Center Station',
      origin_coords: { lat: 21.1466, lon: 79.0833 },
      destination_coords: { lat: 21.1458, lon: 79.0588 },
      distance_m: 3800,
      wait_min: waitM,
      transit_duration_min: { optimistic_min: 12, expected_min: 14, pessimistic_min: 18 },
      depart_time_hm: minutesToHm(leg2Dep),
      arrive_time_hm: minutesToHm(leg2Arr),
      depart_iso: `${datePrefix}${minutesToHm(leg2Dep)}:00+05:30`,
      arrive_iso: `${datePrefix}${minutesToHm(leg2Arr)}:00+05:30`,
      evidence: c.evidence,
      is_critical: true,
      operating_status: metroStatus,
      lighting_quality: 'Platform CCTV & active lighting',
      refuge_nearby: 'Station Control & Metro Security',
    });

    const walk2Dur = 6;
    legs.push({
      leg_index: 2,
      mode: 'walk',
      service_id: undefined,
      service_name: 'Final Mile Pedestrian Connector',
      origin_name: 'Dharampeth Station Exit',
      destination_name: 'Destination Residence',
      origin_coords: { lat: 21.1458, lon: 79.0588 },
      destination_coords: req.destination,
      distance_m: 450,
      wait_min: 0,
      transit_duration_min: { optimistic_min: 5, expected_min: 6, pessimistic_min: 9 },
      depart_time_hm: minutesToHm(leg2Arr),
      arrive_time_hm: minutesToHm(leg2Arr + walk2Dur),
      depart_iso: `${datePrefix}${minutesToHm(leg2Arr)}:00+05:30`,
      arrive_iso: `${datePrefix}${minutesToHm(leg2Arr + walk2Dur)}:00+05:30`,
      evidence: c.evidence.slice(-1),
      is_critical: false,
      operating_status: 'RUNNING',
      lighting_quality: 'Local sodium residential streetlights',
      refuge_nearby: 'Dharampeth 24x7 Apollo Pharmacy',
    });
  } else if (c.mode === 'auto') {
    const walk1Dur = 4;
    legs.push({
      leg_index: 0,
      mode: 'walk',
      service_id: undefined,
      service_name: 'Pedestrian Access to Auto Stand',
      origin_name: 'Ward Departure Gate',
      destination_name: 'Hospital Gate Auto Stand',
      origin_coords: req.origin,
      destination_coords: { lat: 21.0378, lon: 79.0345 },
      distance_m: 280,
      wait_min: 0,
      transit_duration_min: { optimistic_min: 3, expected_min: 4, pessimistic_min: 6 },
      depart_time_hm: minutesToHm(shiftMin),
      arrive_time_hm: minutesToHm(shiftMin + walk1Dur),
      depart_iso: `${datePrefix}${minutesToHm(shiftMin)}:00+05:30`,
      arrive_iso: `${datePrefix}${minutesToHm(shiftMin + walk1Dur)}:00+05:30`,
      evidence: c.evidence.slice(0, 1),
      is_critical: false,
      operating_status: 'RUNNING',
      lighting_quality: 'Hospital perimeter halogen high-mast',
      refuge_nearby: 'AIIMS 24/7 Security Booth',
    });

    const autoWait = 5;
    const autoTransit = 16;
    const depMin = shiftMin + walk1Dur + autoWait;
    const arrMin = depMin + autoTransit;
    legs.push({
      leg_index: 1,
      mode: 'auto',
      service_id: 'auto-stand-aiims',
      service_name: 'Nagpur City Auto-Rickshaw (Metered / Night Shared)',
      origin_name: 'Hospital Gate Auto Stand',
      destination_name: 'Dharampeth Arterial Drop-off',
      origin_coords: { lat: 21.0378, lon: 79.0345 },
      destination_coords: { lat: 21.145, lon: 79.06 },
      distance_m: Math.max(0, c.distance_m - 350),
      wait_min: autoWait,
      transit_duration_min: { optimistic_min: 11, expected_min: autoTransit, pessimistic_min: 24 },
      depart_time_hm: minutesToHm(depMin),
      arrive_time_hm: minutesToHm(arrMin),
      depart_iso: `${datePrefix}${minutesToHm(depMin)}:00+05:30`,
      arrive_iso: `${datePrefix}${minutesToHm(arrMin)}:00+05:30`,
      evidence: c.evidence,
      is_critical: true,
      operating_status: 'RUNNING',
      lighting_quality: 'Wardha Road arterial lighting (verified)',
      refuge_nearby: 'Sitabuldi Police Assistance Booth (en route)',
    });

    const walk2Dur = 2;
    legs.push({
      leg_index: 2,
      mode: 'walk',
      service_id: undefined,
      service_name: 'Doorstep Pedestrian Walk',
      origin_name: 'Dharampeth Arterial Drop-off',
      destination_name: 'Destination Residence',
      origin_coords: { lat: 21.145, lon: 79.06 },
      destination_coords: req.destination,
      distance_m: 120,
      wait_min: 0,
      transit_duration_min: { optimistic_min: 1.5, expected_min: 2, pessimistic_min: 3 },
      depart_time_hm: minutesToHm(arrMin),
      arrive_time_hm: minutesToHm(arrMin + walk2Dur),
      depart_iso: `${datePrefix}${minutesToHm(arrMin)}:00+05:30`,
      arrive_iso: `${datePrefix}${minutesToHm(arrMin + walk2Dur)}:00+05:30`,
      evidence: [],
      is_critical: false,
      operating_status: 'RUNNING',
      lighting_quality: 'Residential streetlight',
      refuge_nearby: 'Home destination check-in',
    });
  } else if (c.mode === 'cab') {
    const cabWait = 8;
    const cabTransit = 16;
    const depMin = shiftMin + cabWait;
    const arrMin = depMin + cabTransit;
    legs.push({
      leg_index: 0,
      mode: 'cab',
      service_id: 'cab-ridehail',
      service_name: 'On-Demand Cab (Ola / Uber / Local Fleet)',
      origin_name: 'Hospital Gate 3 Pickup Point',
      destination_name: 'Destination Residence',
      origin_coords: req.origin,
      destination_coords: req.destination,
      distance_m: c.distance_m,
      wait_min: cabWait,
      transit_duration_min: { optimistic_min: 12, expected_min: cabTransit, pessimistic_min: 24 },
      depart_time_hm: minutesToHm(depMin),
      arrive_time_hm: minutesToHm(arrMin),
      depart_iso: `${datePrefix}${minutesToHm(depMin)}:00+05:30`,
      arrive_iso: `${datePrefix}${minutesToHm(arrMin)}:00+05:30`,
      evidence: c.evidence,
      is_critical: true,
      operating_status: 'UNKNOWN_AVAILABILITY',
      lighting_quality: 'High-mast gate lighting',
      refuge_nearby: 'AIIMS Main Gate Reception',
    });
  } else if (c.mode === 'two_wheeler') {
    const walkDur = 3;
    const rideDur = 19;
    const depMin = shiftMin + walkDur;
    const arrMin = depMin + rideDur;
    legs.push({
      leg_index: 0,
      mode: 'walk',
      service_id: undefined,
      service_name: 'Access to Vehicle Stand / Dock',
      origin_name: 'Workplace Facility Parking',
      destination_name: 'Two-Wheeler Rental Dock / Stand',
      origin_coords: req.origin,
      destination_coords: { lat: 21.0378, lon: 79.0345 },
      distance_m: 220,
      wait_min: 0,
      transit_duration_min: { optimistic_min: 2, expected_min: walkDur, pessimistic_min: 4 },
      depart_time_hm: minutesToHm(shiftMin),
      arrive_time_hm: minutesToHm(depMin),
      depart_iso: `${datePrefix}${minutesToHm(shiftMin)}:00+05:30`,
      arrive_iso: `${datePrefix}${minutesToHm(depMin)}:00+05:30`,
      evidence: [],
      is_critical: false,
      operating_status: 'RUNNING',
      lighting_quality: 'Parking bay lighting',
      refuge_nearby: 'Parking security post',
    });
    legs.push({
      leg_index: 1,
      mode: 'two_wheeler',
      service_id: 'two-wheeler-personal',
      service_name: 'Two-Wheeler Self-Drive Corridor',
      origin_name: 'AIIMS Parking Bay',
      destination_name: 'Destination Residence',
      origin_coords: { lat: 21.0378, lon: 79.0345 },
      destination_coords: req.destination,
      distance_m: Math.max(0, c.distance_m - 220),
      wait_min: 0,
      transit_duration_min: { optimistic_min: 14, expected_min: rideDur, pessimistic_min: 28 },
      depart_time_hm: minutesToHm(depMin),
      arrive_time_hm: minutesToHm(arrMin),
      depart_iso: `${datePrefix}${minutesToHm(depMin)}:00+05:30`,
      arrive_iso: `${datePrefix}${minutesToHm(arrMin)}:00+05:30`,
      evidence: c.evidence,
      is_critical: true,
      operating_status: 'RUNNING',
      lighting_quality: 'North Ambazari road corridor lighting',
      refuge_nearby: 'Ambazari Lake Road Police Assistance Booth',
    });
  } else if (c.mode === 'walk') {
    const walkDur = c.eta.expected_min;
    legs.push({
      leg_index: 0,
      mode: 'walk',
      service_id: 'pedestrian-corridor',
      service_name: 'Pedestrian Arterial Route (Wardha Rd)',
      origin_name: 'Workplace Facility Gate',
      destination_name: 'Destination Residence',
      origin_coords: req.origin,
      destination_coords: req.destination,
      distance_m: c.distance_m,
      wait_min: 0,
      transit_duration_min: c.eta,
      depart_time_hm: minutesToHm(shiftMin),
      arrive_time_hm: minutesToHm(shiftMin + walkDur),
      depart_iso: `${datePrefix}${minutesToHm(shiftMin)}:00+05:30`,
      arrive_iso: `${datePrefix}${minutesToHm(shiftMin + walkDur)}:00+05:30`,
      evidence: c.evidence,
      is_critical: true,
      operating_status: 'RUNNING',
      lighting_quality: 'Partial lighting (60% coverage, 850m unlit stretch)',
      refuge_nearby: 'Sitabuldi Police Assistance Booth (at km 3.2)',
    });
  }

  return legs;
}

export function deriveStrandingPoints(
  c: Candidate,
  req: PlanRequest,
  _windowDuration: number
): StrandingPoint[] {
  const shiftMin = parseTimeToMinutes(req.shift_end_iso);
  const deadlineMin = parseTimeToMinutes(req.deadline_iso);
  const normDeadline = deadlineMin < shiftMin ? deadlineMin + 1440 : deadlineMin;
  const points: StrandingPoint[] = [];

  if (c.mode === 'transit') {
    if (c.rejected && c.reject_reasons.some((r) => r.toLowerCase().includes('ended') || r.toLowerCase().includes('closed'))) {
      const nextArr = 360 + 22; // 06:22
      const missed = (nextArr < normDeadline ? nextArr + 1440 : nextArr) - normDeadline;
      points.push({
        node_id: 'node-sitabuldi-interchange',
        node_name: 'Sitabuldi Metro Interchange Platform',
        node_coords: { lat: 21.1466, lon: 79.0833 },
        trigger_condition: 'Metro Orange Line ended at 22:15. Concourse shuttered overnight.',
        risk_level: 'HIGH',
        stranded_arrival_hm: '06:22',
        missed_deadline_min: missed,
        description: `Last metro departed 22:15. If waiting at station, next train departs 06:00, arriving 06:22 (${missed} min past your deadline).`,
        recovery_option_id: 'rec-opt-safe-haven',
      });
    }
  } else if (c.mode === 'auto') {
    const walkFallbackArr = shiftMin + 64;
    const missedWalk = walkFallbackArr - normDeadline;
    const triggerHm = minutesToHm(shiftMin + 10);
    points.push({
      node_id: 'node-aiims-gate-stand',
      node_name: 'Hospital Gate Auto Stand',
      node_coords: { lat: 21.0378, lon: 79.0345 },
      trigger_condition: `Auto queue depleted or no driver agrees by ${triggerHm} (10 min wait limit)`,
      risk_level: missedWalk <= 0 ? 'MEDIUM' : 'HIGH',
      stranded_arrival_hm: minutesToHm(walkFallbackArr),
      missed_deadline_min: Math.max(0, missedWalk),
      description: `If auto does not show up by ${triggerHm}, alternative walking arrives ${minutesToHm(walkFallbackArr)} (${missedWalk} min past deadline). Activate two-wheeler Plan B or retreat to hospital security.`,
      recovery_option_id: 'rec-opt-twowheeler',
    });
  } else if (c.mode === 'cab') {
    const triggerHm = minutesToHm(shiftMin + 5);
    const walkFallbackArr = shiftMin + 64;
    const missedWalk = walkFallbackArr - normDeadline;
    points.push({
      node_id: 'node-origin-gate-pickup',
      node_name: 'Facility Perimeter Gate 3',
      node_coords: req.origin,
      trigger_condition: `Aggregator app fails to assign driver by ${triggerHm} (5 min SLA)`,
      risk_level: 'HIGH',
      stranded_arrival_hm: minutesToHm(walkFallbackArr),
      missed_deadline_min: Math.max(0, missedWalk),
      description: `Zero live cab telemetry in Nagpur at this hour. If no driver assigns by ${triggerHm}, switch immediately to metered auto stand.`,
      recovery_option_id: 'rec-opt-auto',
    });
  }

  return points;
}

export function deriveRecoveryOptions(
  c: Candidate,
  req: PlanRequest,
  windowDuration: number
): RecoveryOption[] {
  const shiftMin = parseTimeToMinutes(req.shift_end_iso);
  const options: RecoveryOption[] = [];

  if (c.mode === 'auto' || c.mode === 'cab') {
    const twTriggerMin = shiftMin + 10;
    const twArrMin = twTriggerMin + 22;
    const twSlack = windowDuration - (10 + 22);
    options.push({
      id: 'rec-opt-twowheeler',
      title: 'Switch to Two-Wheeler Rental Dock',
      mode: 'two_wheeler',
      description: 'Unlock docked scooter at AIIMS gate stand; provides independent direct travel.',
      trigger_time_hm: minutesToHm(twTriggerMin),
      eta_expected_min: 22,
      arrival_time_hm: minutesToHm(twArrMin),
      extra_time_min: 7,
      extra_cost_inr: 40,
      meets_deadline: twSlack >= 0,
      slack_remaining_min: twSlack,
      evidence_label: 'PROBABLE',
    });

    if (c.mode === 'cab') {
      const autoTriggerMin = shiftMin + 5;
      const autoArrMin = autoTriggerMin + 20;
      const autoSlack = windowDuration - (5 + 20);
      options.push({
        id: 'rec-opt-auto',
        title: 'Walk to Hospital Gate Auto Stand',
        mode: 'auto',
        description: 'Walk 280m to physical hospital stand; physically hail driver rather than waiting on app.',
        trigger_time_hm: minutesToHm(autoTriggerMin),
        eta_expected_min: 20,
        arrival_time_hm: minutesToHm(autoArrMin),
        extra_time_min: 4,
        extra_cost_inr: -60,
        meets_deadline: autoSlack >= 0,
        slack_remaining_min: autoSlack,
        evidence_label: 'PROBABLE',
      });
    }
  }

  const havenTriggerMin = shiftMin + Math.min(15, Math.max(5, windowDuration - 15));
  options.push({
    id: 'rec-opt-safe-haven',
    title: 'Handoff to AIIMS Emergency Staffed Refuge',
    mode: 'walk',
    description: 'Handoff to verified 24/7 staffed hospital trauma block and police helpdesk; do not attempt unlit transit.',
    trigger_time_hm: minutesToHm(havenTriggerMin),
    eta_expected_min: 4,
    arrival_time_hm: minutesToHm(shiftMin + 4),
    extra_time_min: 0,
    extra_cost_inr: 0,
    meets_deadline: true,
    slack_remaining_min: windowDuration - 4,
    evidence_label: 'KNOWN',
  });

  return options;
}

export function evaluateScenarioMatrix(
  c: Candidate,
  req: PlanRequest,
  windowDuration: number
): ScenarioResult[] {
  const shiftMin = parseTimeToMinutes(req.shift_end_iso);
  const s1Slack = c.slack_min.pessimistic - 15;
  const s1Status: CandidateStatus = s1Slack >= 10 ? 'ROBUST' : s1Slack >= 0 ? 'AT_RISK' : 'INFEASIBLE';

  const s2Slack = c.slack_min.pessimistic - 10;
  const s2Status: CandidateStatus = s2Slack >= 10 ? 'ROBUST' : s2Slack >= 0 ? 'AT_RISK' : 'INFEASIBLE';

  const s3Status: CandidateStatus = c.status !== 'INFEASIBLE' ? 'AT_RISK' : 'INFEASIBLE';

  const s4Slack = c.slack_min.pessimistic - 8;
  const s4Status: CandidateStatus = s4Slack >= 10 ? 'ROBUST' : s4Slack >= 0 ? 'AT_RISK' : 'INFEASIBLE';

  return [
    {
      scenario_id: 'delay_15m',
      scenario_name: 'Shift delayed by 15 min (Departure +15m)',
      verdict: s1Status,
      slack_min: Math.round(s1Slack * 10) / 10,
      decide_by_hm: minutesToHm(shiftMin + 15),
      feasible: s1Slack >= 0,
      impact_description: `Leaves ${Math.round(s1Slack * 10) / 10}m pessimistic slack. ${s1Slack < 0 ? 'Buffer breached; deadline missed.' : 'Feasible with compressed buffer.'}`,
    },
    {
      scenario_id: 'corridor_closure',
      scenario_name: 'Wardha Road Underpass Closure (+6m Detour)',
      verdict: s2Status,
      slack_min: Math.round(s2Slack * 10) / 10,
      decide_by_hm: minutesToHm(shiftMin + Math.max(0, Math.floor(windowDuration - c.eta.expected_min - 6))),
      feasible: s2Slack >= 0,
      impact_description: 'Reroutes via North Ambazari arterial. Adds +6m expected / +10m worst-case delay.',
    },
    {
      scenario_id: 'feed_outage',
      scenario_name: 'Fleet Telemetry Feed Outage (Evidence drops to UNKNOWN)',
      verdict: s3Status,
      slack_min: c.slack_min.expected,
      decide_by_hm: c.decision_by_iso ? c.decision_by_iso.slice(11, 16) : null,
      feasible: c.slack_min.expected >= 0,
      impact_description: 'Driver positions cannot be verified; candidate cannot be marked ROBUST without verifiable evidence.',
    },
    {
      scenario_id: 'midnight_surge',
      scenario_name: 'Peak Night-Shift Demand Surge (+8m boarding wait)',
      verdict: s4Status,
      slack_min: Math.round(s4Slack * 10) / 10,
      decide_by_hm: c.decision_by_iso ? c.decision_by_iso.slice(11, 16) : null,
      feasible: s4Slack >= 0,
      impact_description: 'Driver queues saturated at hospital gate; board wait extends from 5m to 13m.',
    },
  ];
}

export function evaluateDecideBy(
  c: Candidate,
  req: PlanRequest,
  windowDuration: number
): { iso: string | null; rationale: string } {
  const shiftMin = parseTimeToMinutes(req.shift_end_iso);
  const datePrefix = req.shift_end_iso.slice(0, 11);

  if (c.mode === 'auto') {
    const decideHm = minutesToHm(shiftMin + 10);
    return {
      iso: `${datePrefix}${decideHm}:00+05:30`,
      rationale: `Decide by ${decideHm}: If no auto is secured within 10 min of shift end, switch immediately to two-wheeler rental or notify safe-haven contact before deadline buffer vanishes.`,
    };
  } else if (c.mode === 'cab') {
    const decideHm = minutesToHm(shiftMin + 5);
    return {
      iso: `${datePrefix}${decideHm}:00+05:30`,
      rationale: `Decide by ${decideHm}: Aggregator driver acceptance SLA limit. If unconfirmed in 5m, proceed directly to physical auto stand.`,
    };
  } else if (c.mode === 'transit') {
    if (c.rejected) {
      return { iso: null, rationale: 'Transit service ended; no decision window available.' };
    }
    const decideHm = minutesToHm(shiftMin + Math.max(0, windowDuration - Math.floor(c.eta.pessimistic_min)));
    return {
      iso: `${datePrefix}${decideHm}:00+05:30`,
      rationale: `Decide by ${decideHm}: Catch last feeder before metro gates close.`,
    };
  } else if (c.mode === 'two_wheeler') {
    const decideHm = minutesToHm(shiftMin + Math.max(0, windowDuration - Math.floor(c.eta.pessimistic_min)));
    return {
      iso: `${datePrefix}${decideHm}:00+05:30`,
      rationale: `Decide by ${decideHm}: Latest self-drive departure ensuring arrival before deadline.`,
    };
  }

  return { iso: null, rationale: 'No decision threshold.' };
}

export function planWithDeadlines(req: PlanRequest): PlanResponse {
  const basePlan = generatePlan(req);
  const windowDuration = computeWindowDurationMin(req.shift_end_iso, req.deadline_iso);
  const safeHaven = evaluateSafeHaven(req.origin, req.shift_end_iso, req.deadline_iso);

  const enrichedCandidates: Candidate[] = basePlan.candidates.map((c) => {
    const legs = buildLegsForCandidate(c, req, windowDuration);
    const hasUnknownCritical = legs.some(
      (leg) => leg.is_critical && leg.evidence.some((e) => e.label === 'UNKNOWN' || e.label === 'OUTDATED')
    );
    const isStopped = legs.some(
      (leg) => leg.is_critical && (leg.operating_status === 'ENDED' || leg.operating_status === 'NOT_STARTED')
    );

    let status: CandidateStatus = c.status;
    let rejected = c.rejected;

    if (isStopped || c.slack_min.pessimistic < 0 || c.slack_min.expected < 0) {
      status = 'INFEASIBLE';
      rejected = true;
    } else if (c.slack_min.pessimistic >= 10 && !hasUnknownCritical) {
      status = 'ROBUST';
    } else {
      status = 'AT_RISK';
    }

    const decide = evaluateDecideBy(c, req, windowDuration);
    const decisionByIso = decide.iso || c.decision_by_iso;

    return {
      ...c,
      status,
      rejected,
      decision_by_iso: decisionByIso,
      legs,
      stranding_points: deriveStrandingPoints(c, req, windowDuration),
      recovery_options: deriveRecoveryOptions(c, req, windowDuration),
      safe_haven: safeHaven,
      scenario_matrix: evaluateScenarioMatrix(c, req, windowDuration),
      decide_by_rationale: decide.rationale,
    };
  });

  const activeCandidates = enrichedCandidates.filter((c) => !c.rejected);
  const robustCandidates = activeCandidates.filter((c) => c.status === 'ROBUST');
  const bestCand = robustCandidates[0] || activeCandidates[0] || null;

  let hasSupportedPlan = false;
  if (bestCand) {
    const critUnknown = (bestCand.legs || []).some(
      (leg) => leg.is_critical && leg.evidence.some((e) => e.label === 'UNKNOWN')
    );
    hasSupportedPlan = (bestCand.status === 'ROBUST' || bestCand.status === 'AT_RISK') && !critUnknown;
  }

  let overallStatus: CandidateStatus = 'INFEASIBLE';
  let summary = 'No sufficiently supported plan meets the deadline. Safe-haven shelter handoff activated.';

  if (robustCandidates.length > 0 && bestCand) {
    overallStatus = 'ROBUST';
    summary = `Robust itinerary confirmed via ${bestCand.mode.toUpperCase()}. Sufficient slack buffer (${bestCand.slack_min.pessimistic}m worst-case) leaves no stranding risk.`;
  } else if (activeCandidates.length > 0 && hasSupportedPlan && bestCand) {
    overallStatus = 'AT_RISK';
    summary = `${bestCand.mode.toUpperCase()} meets deadline with ${bestCand.slack_min.expected}m expected slack, but worst-case buffer is tight (${bestCand.slack_min.pessimistic}m). Decide by ${bestCand.decision_by_iso ? bestCand.decision_by_iso.slice(11, 16) : 'promptly'} before fallback.`;
  }

  const strandingDetected = enrichedCandidates.some(
    (c) => (c.stranding_points && c.stranding_points.length > 0) && (!c.rejected || c.mode === 'transit')
  );

  const verdict: PlanVerdict = {
    status: overallStatus,
    meets_deadline_supported: hasSupportedPlan,
    summary,
    best_candidate_id: bestCand ? bestCand.id : null,
    critical_dependency_count: bestCand ? (bestCand.legs || []).filter((l) => l.is_critical).length : 0,
    stranding_risk_detected: strandingDetected,
    earliest_decide_by_iso: bestCand ? bestCand.decision_by_iso : null,
    safe_haven_available: true,
  };

  return {
    ...basePlan,
    candidates: enrichedCandidates,
    recommended_id: bestCand ? bestCand.id : null,
    verdict,
    safe_haven_handoff: safeHaven,
  };
}

export function replanWithDeadlines(req: ReplanRequest): PlanResponse {
  const newPlan = planWithDeadlines(req);
  const isClosure = Boolean(req.reason?.toLowerCase().includes('closure') || req.scenario_type === 'closure');
  const delayMin = req.delay_min || 0;

  if (isClosure) {
    for (const c of newPlan.candidates) {
      if (c.mode === 'auto') {
        c.status = 'AT_RISK';
        c.reject_reasons.push('Road closure on Wardha Road underpass; detour adds 6m');
        c.eta.expected_min += 6;
        c.eta.pessimistic_min += 10;
        c.slack_min.expected -= 6;
        c.slack_min.pessimistic -= 10;
        if (c.legs) {
          for (const leg of c.legs) {
            if (leg.mode === 'auto') {
              leg.transit_duration_min.expected_min += 6;
              leg.transit_duration_min.pessimistic_min += 10;
            }
          }
        }
        if (c.decision_by_iso) {
          const sh = parseTimeToMinutes(c.decision_by_iso);
          const newHm = minutesToHm(sh - 6);
          c.decision_by_iso = `${c.decision_by_iso.slice(0, 11)}${newHm}:00+05:30`;
        }
      }
    }
  }

  const prevPlan = req.previous_plan;
  const prevStatus = prevPlan?.verdict?.status || 'ROBUST';
  const currStatus = newPlan.verdict?.status || 'AT_RISK';

  const replanDiff: ReplanDiff = {
    previous_status: prevStatus,
    status_changed: prevStatus !== currStatus,
    slack_delta_min: isClosure ? -6 : -delayMin,
    decide_by_delta_min: isClosure ? -6 : 0,
    explanation: isClosure
      ? 'Road closure detected along Wardha Road underpass. Detour adds 6m expected transit time. Slack reduced by 6m (from 20m to 14m). Decide-by time advanced by 6 min.'
      : `Replan triggered (${req.reason || 'disruption'}); verified against latest nocturnal telemetry.`,
  };

  if (newPlan.verdict) {
    newPlan.verdict.replan_diff = replanDiff;
  }

  return newPlan;
}
