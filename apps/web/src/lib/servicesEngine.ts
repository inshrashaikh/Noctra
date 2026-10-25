/**
 * Essential Services Finder & Opening Hours Engine (TypeScript parity implementation for offline mock & client evaluation).
 * Evaluates spatial proximity, arrival-time opening status, detour cost,
 * deadline feasibility impact, and separate listing vs opening evidence.
 */
import type {
  Service,
  ServicesRequest,
  ServicesResponse,
  OpeningStatus,
  ServiceKind,
  Evidence,
  EvidenceLabel,
} from '@noctra/contracts';
import { NAGPUR_SERVICES_SEED } from '@/mocks/fixtures/nagpurServicesSeed';

export const NEED_KIND_MAP: Record<string, ServiceKind[]> = {
  medicine: ['pharmacy', 'hospital'],
  food: ['restaurant', 'dhaba', 'chai_stall', 'canteen_24h'],
  fuel: ['fuel'],
  emergency: ['hospital', 'police'],
  cash: ['atm'],
  rest_shelter: ['shelter', 'canteen_24h', 'fuel', 'water'],
  water: ['water', 'canteen_24h', 'fuel', 'dhaba'],
};

const STATUS_RANK: Record<OpeningStatus, number> = {
  OPEN_AT_ARRIVAL: 0,
  CLOSING_SOON: 1,
  OPENS_LATER: 2,
  UNKNOWN: 3,
  CLOSED_AT_ARRIVAL: 4,
};

const EVIDENCE_RANK: Record<EvidenceLabel, number> = {
  KNOWN: 0,
  PROBABLE: 1,
  OUTDATED: 2,
  UNKNOWN: 3,
};

export function haversineDistanceM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000.0;
  const phi1 = (lat1 * Math.PI) / 180.0;
  const phi2 = (lat2 * Math.PI) / 180.0;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180.0;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180.0;

  const a =
    Math.sin(deltaPhi / 2.0) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2.0) ** 2;
  const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
  return R * c;
}

function parseTimeToMinutes(tStr: string): number | null {
  const clean = tStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h >= 0 && h <= 24 && m >= 0 && m < 60) {
    if (h === 24 && m === 0) return 1440;
    return h * 60 + m;
  }
  return null;
}

function formatHhmm(totalMinutes: number): string {
  const wrapped = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

interface TimeInterval {
  startMin: number;
  endMin: number;
  isOvernight: boolean;
}

interface OpeningSchedule {
  is24x7: boolean;
  dayIntervals: Record<number, TimeInterval[]>;
  isValid: boolean;
}

export function parseOpeningHours(hoursRaw: string | null): OpeningSchedule {
  const empty: OpeningSchedule = {
    is24x7: false,
    dayIntervals: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
    isValid: false,
  };
  if (!hoursRaw || !hoursRaw.trim()) return empty;

  const cleaned = hoursRaw.trim().toLowerCase();
  if (
    cleaned === '24/7' ||
    cleaned === '00:00-24:00' ||
    cleaned === '24 hours' ||
    cleaned === 'open 24x7' ||
    cleaned === 'open 24×7' ||
    cleaned === 'mo-su 24/7'
  ) {
    return { ...empty, is24x7: true, isValid: true };
  }

  const schedule: OpeningSchedule = {
    is24x7: false,
    dayIntervals: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
    isValid: false,
  };

  const ranges = hoursRaw.split(',').map((r) => r.trim()).filter(Boolean);
  const intervals: TimeInterval[] = [];

  for (const rStr of ranges) {
    const match = rStr.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    if (!match) continue;
    const start = parseTimeToMinutes(match[1]);
    const end = parseTimeToMinutes(match[2]);
    if (start === null || end === null) continue;

    if (end <= start) {
      intervals.push({ startMin: start, endMin: end, isOvernight: true });
    } else {
      intervals.push({ startMin: start, endMin: end, isOvernight: false });
    }
  }

  if (intervals.length > 0) {
    for (let day = 0; day < 7; day++) {
      schedule.dayIntervals[day].push(...intervals);
    }
    schedule.isValid = true;
  }

  return schedule;
}

export function evaluateOpeningStatus(
  hoursRaw: string | null,
  arrivalTimeMin: number,
  dayOfWeek = 0,
  closingSoonMarginMin = 30,
  verifiedHours = false,
  verificationSource: string | null = null,
  sourceClass: 'static' | 'simulated' = 'static'
): {
  openingStatus: OpeningStatus;
  openUntil: string | null;
  opensAt: string | null;
  openingNote: string;
  openingEvidence: Evidence;
} {
  const schedule = parseOpeningHours(hoursRaw);

  // 1. Missing / Unparseable
  if (!schedule.isValid && !schedule.is24x7) {
    return {
      openingStatus: 'UNKNOWN',
      openUntil: null,
      opensAt: null,
      openingNote: 'Hours unverified / variable (never assumed open)',
      openingEvidence: {
        fact_type: 'facility_hours',
        subject: 'opening_status',
        label: 'UNKNOWN',
        confidence: 0.0,
        age_s: 0,
        source: 'Unverified vendor record',
        source_class: sourceClass,
        simulated: sourceClass === 'simulated',
        reasons: ['Opening hours missing, unparseable, or informal street vendor'],
      },
    };
  }

  // 2. 24/7
  if (schedule.is24x7) {
    const label: EvidenceLabel = verifiedHours && verificationSource ? 'KNOWN' : 'PROBABLE';
    return {
      openingStatus: 'OPEN_AT_ARRIVAL',
      openUntil: '24/7',
      opensAt: null,
      openingNote: 'Open 24×7 throughout the night',
      openingEvidence: {
        fact_type: 'facility_hours',
        subject: 'opening_status',
        label,
        confidence: label === 'KNOWN' ? 0.95 : 0.7,
        age_s: label === 'KNOWN' ? 3600 : 86400,
        source: verificationSource || 'Published Directory Extract',
        source_class: sourceClass,
        simulated: sourceClass === 'simulated',
        reasons: [
          label === 'KNOWN'
            ? `Verified 24/7 service by ${verificationSource}`
            : 'Published 24/7 schedule from static directory (unconfirmed live)',
        ],
      },
    };
  }

  // 3. Interval check
  const yesterday = (dayOfWeek - 1 + 7) % 7;
  let isOpen = false;
  let closingMin: number | null = null;
  let opensAtMin: number | null = null;

  // Yesterday's overnight spillover
  for (const interval of schedule.dayIntervals[yesterday] || []) {
    if (interval.isOvernight && arrivalTimeMin < interval.endMin) {
      isOpen = true;
      closingMin = interval.endMin;
      break;
    }
  }

  if (!isOpen) {
    for (const interval of schedule.dayIntervals[dayOfWeek] || []) {
      if (interval.isOvernight) {
        if (arrivalTimeMin >= interval.startMin) {
          isOpen = true;
          closingMin = interval.endMin + 1440;
          break;
        }
      } else {
        if (arrivalTimeMin >= interval.startMin && arrivalTimeMin < interval.endMin) {
          isOpen = true;
          closingMin = interval.endMin;
          break;
        } else if (arrivalTimeMin < interval.startMin) {
          if (opensAtMin === null || interval.startMin < opensAtMin) {
            opensAtMin = interval.startMin;
          }
        }
      }
    }
  }

  if (!isOpen && opensAtMin === null) {
    const tomorrow = (dayOfWeek + 1) % 7;
    for (const interval of schedule.dayIntervals[tomorrow] || []) {
      const candOpen = interval.startMin + 1440;
      if (opensAtMin === null || candOpen < opensAtMin) {
        opensAtMin = candOpen;
      }
    }
  }

  const label: EvidenceLabel = verifiedHours && verificationSource ? 'KNOWN' : 'PROBABLE';
  const confidence = label === 'KNOWN' ? 0.9 : 0.65;
  const reason =
    label === 'KNOWN'
      ? `Verified opening schedule by ${verificationSource}`
      : 'Static published schedule (not live telemetry; PROBABLE at best)';

  if (isOpen) {
    const minsLeft = closingMin !== null ? closingMin - arrivalTimeMin : 999;
    const closingTimeStr = formatHhmm(closingMin !== null ? closingMin % 1440 : 0);
    const status: OpeningStatus = minsLeft <= closingSoonMarginMin ? 'CLOSING_SOON' : 'OPEN_AT_ARRIVAL';
    const note =
      status === 'CLOSING_SOON'
        ? `Closing soon in ${minsLeft} min (at ${closingTimeStr})`
        : `Open until ${closingTimeStr}`;

    return {
      openingStatus: status,
      openUntil: closingTimeStr,
      opensAt: null,
      openingNote: note,
      openingEvidence: {
        fact_type: 'facility_hours',
        subject: 'opening_status',
        label,
        confidence,
        age_s: 7200,
        source: verificationSource || 'Static Directory',
        source_class: sourceClass,
        simulated: sourceClass === 'simulated',
        reasons: [reason],
      },
    };
  } else {
    const opensInMin = opensAtMin !== null ? opensAtMin - arrivalTimeMin : 999;
    const opensAtStr = opensAtMin !== null ? formatHhmm(opensAtMin % 1440) : null;
    const status: OpeningStatus =
      opensAtMin !== null && (opensInMin <= 150 || (arrivalTimeMin >= 240 && opensAtMin <= 360))
        ? 'OPENS_LATER'
        : 'CLOSED_AT_ARRIVAL';
    const note =
      status === 'OPENS_LATER'
        ? `Opens later at ${opensAtStr} (in ${opensInMin} min)`
        : `Closed at arrival time` + (opensAtStr ? ` (opens at ${opensAtStr})` : '');

    return {
      openingStatus: status,
      openUntil: null,
      opensAt: opensAtStr,
      openingNote: note,
      openingEvidence: {
        fact_type: 'facility_hours',
        subject: 'opening_status',
        label,
        confidence,
        age_s: 7200,
        source: verificationSource || 'Static Directory',
        source_class: sourceClass,
        simulated: sourceClass === 'simulated',
        reasons: [reason],
      },
    };
  }
}

export function findAndRankServices(req: ServicesRequest): ServicesResponse {
  const radiusM = req.radius_m || 5000.0;
  let refMin = 2 * 60 + 15; // default 02:15
  let dayOfWeek = 0;

  if (req.arrival_time_iso) {
    const dt = new Date(req.arrival_time_iso);
    if (!isNaN(dt.getTime())) {
      refMin = dt.getHours() * 60 + dt.getMinutes();
      dayOfWeek = (dt.getDay() + 6) % 7; // Convert JS 0=Sun to 0=Mon
    }
  }

  let deadlineMin: number | null = null;
  if (req.deadline_iso) {
    const dt = new Date(req.deadline_iso);
    if (!isNaN(dt.getTime())) {
      let dVal = dt.getHours() * 60 + dt.getMinutes();
      if (dVal < refMin) dVal += 1440;
      deadlineMin = dVal;
    }
  }

  const targetKinds = new Set<ServiceKind>();
  if (req.need && NEED_KIND_MAP[req.need]) {
    for (const k of NEED_KIND_MAP[req.need]) targetKinds.add(k);
  }
  if (req.kinds && req.kinds.length > 0) {
    if (targetKinds.size > 0) {
      const intersect = new Set<ServiceKind>();
      for (const k of req.kinds) {
        if (targetKinds.has(k)) intersect.add(k);
      }
      targetKinds.clear();
      for (const k of intersect) targetKinds.add(k);
    } else {
      for (const k of req.kinds) targetKinds.add(k);
    }
  }

  let directCorridorM = 0;
  if (
    req.origin_lat !== undefined &&
    req.origin_lon !== undefined &&
    req.dest_lat !== undefined &&
    req.dest_lon !== undefined
  ) {
    directCorridorM = haversineDistanceM(
      req.origin_lat,
      req.origin_lon,
      req.dest_lat,
      req.dest_lon
    );
  }

  const processed: Service[] = [];

  for (const item of NAGPUR_SERVICES_SEED) {
    const sKind = item.kind as ServiceKind;
    if (targetKinds.size > 0 && !targetKinds.has(sKind)) continue;

    const distM = haversineDistanceM(req.lat, req.lon, item.lat, item.lon);
    if (distM > radiusM) continue;

    const walkMin = Math.max(1, Math.round(distM / 75.0));
    const effectiveArrivalMin = (refMin + walkMin) % 1440;

    let detourMin = Math.round((distM * 2) / 75.0);
    if (
      directCorridorM > 0 &&
      req.origin_lat !== undefined &&
      req.origin_lon !== undefined &&
      req.dest_lat !== undefined &&
      req.dest_lon !== undefined
    ) {
      const leg1 = haversineDistanceM(req.origin_lat, req.origin_lon, item.lat, item.lon);
      const leg2 = haversineDistanceM(item.lat, item.lon, req.dest_lat, req.dest_lon);
      detourMin = Math.max(0, Math.round(((leg1 + leg2) - directCorridorM) / 75.0));
    }

    const evalResult = evaluateOpeningStatus(
      item.hours_raw,
      effectiveArrivalMin,
      dayOfWeek,
      30,
      item.verified_hours,
      item.verification_source,
      item.source_class
    );

    const dwellMin = 10;
    let slackImpactMin: number | undefined = undefined;
    let deadlineFeasible = true;

    if (deadlineMin !== null) {
      const totalSlack = deadlineMin - refMin;
      slackImpactMin = totalSlack - (detourMin + dwellMin);
      deadlineFeasible = slackImpactMin >= 0;
    }

    const listingLabel: EvidenceLabel = item.verified_hours ? 'KNOWN' : 'PROBABLE';
    const listingEvidence: Evidence = {
      fact_type: 'facility_hours',
      subject: `listing:${item.id}`,
      label: listingLabel,
      confidence: listingLabel === 'KNOWN' ? 0.9 : 0.7,
      age_s: 86400 * 14,
      source: item.source,
      source_class: item.source_class,
      simulated: item.source_class === 'simulated',
      reasons: [
        `Facility existence listed in ${item.source}`,
        'Decay window: 30 days facility TTL',
      ],
    };

    const whyRanked = `${evalResult.openingStatus.replace(/_/g, ' ')} at expected arrival (${walkMin}m walk). Adds ${detourMin}m detour.${
      slackImpactMin !== undefined ? ` Slack remaining: ${slackImpactMin}m.` : ''
    }`;

    const uncertainties: string[] = [];
    if (evalResult.openingEvidence.label !== 'KNOWN') {
      uncertainties.push(
        `Opening status is ${evalResult.openingEvidence.label}: unconfirmed by live telemetry.`
      );
    }
    if (!item.verified_hours) {
      uncertainties.push('Operating hours derived from published schedule; night availability may vary.');
    }
    if (!deadlineFeasible) {
      uncertainties.push(`Visiting this service will cause you to miss your deadline by ${Math.abs(slackImpactMin!)}m.`);
    }

    processed.push({
      id: item.id,
      name: item.name,
      kind: sKind,
      lat: item.lat,
      lon: item.lon,
      distance_m: Math.round(distM * 10) / 10,
      hours_raw: item.hours_raw,
      hours_label: item.hours_label,
      label: listingLabel,
      source: item.source,
      source_class: item.source_class,
      osm_timestamp: item.osm_timestamp,
      opening_status: evalResult.openingStatus,
      open_until: evalResult.openUntil,
      opens_at: evalResult.opensAt,
      opening_note: evalResult.openingNote,
      verified_hours: item.verified_hours,
      listing_evidence: listingEvidence,
      opening_evidence: evalResult.openingEvidence,
      detour_min: detourMin,
      slack_impact_min: slackImpactMin,
      deadline_feasible: deadlineFeasible,
      why_ranked: whyRanked,
      uncertainties,
    });
  }

  // Sort
  processed.sort((a, b) => {
    const aFeas = a.deadline_feasible ? 0 : 1;
    const bFeas = b.deadline_feasible ? 0 : 1;
    if (aFeas !== bFeas) return aFeas - bFeas;

    const aStatus = STATUS_RANK[a.opening_status || 'UNKNOWN'] ?? 3;
    const bStatus = STATUS_RANK[b.opening_status || 'UNKNOWN'] ?? 3;
    if (aStatus !== bStatus) return aStatus - bStatus;

    const aEv = EVIDENCE_RANK[a.opening_evidence?.label || 'UNKNOWN'] ?? 2;
    const bEv = EVIDENCE_RANK[b.opening_evidence?.label || 'UNKNOWN'] ?? 2;
    if (aEv !== bEv) return aEv - bEv;

    const aVerif = a.verified_hours ? 0 : 1;
    const bVerif = b.verified_hours ? 0 : 1;
    if (aVerif !== bVerif) return aVerif - bVerif;

    if ((a.detour_min ?? 0) !== (b.detour_min ?? 0)) {
      return (a.detour_min ?? 0) - (b.detour_min ?? 0);
    }
    return a.distance_m - b.distance_m;
  });

  const hasSupported = processed.some(
    (s) => s.deadline_feasible && (s.opening_status === 'OPEN_AT_ARRIVAL' || s.opening_status === 'CLOSING_SOON')
  );

  return {
    generated_at: new Date().toISOString(),
    arrival_time_iso: req.arrival_time_iso || new Date().toISOString(),
    services: processed,
    total_found: processed.length,
    fallback_notice: hasSupported ? null : 'no sufficiently supported option',
    closest_fallback: hasSupported ? null : processed[0] || null,
  };
}
