/**
 * Shift-Aware Transport Decision Engine (TypeScript implementation for offline mock & client evaluation).
 *
 * Deterministic rules deciding availability, boarding waits, last-service catchable/missed,
 * latest feasible departure, and epistemic evidence labels.
 */
import type {
  PlanRequest,
  PlanResponse,
  Candidate,
  TransportMode,
  CandidateStatus,
} from '@noctra/contracts';

export interface TransportAvailabilityItem {
  serviceId: string;
  mode: TransportMode;
  transitType: string;
  name: string;
  operatingStatus: 'RUNNING' | 'ENDED' | 'NOT_STARTED' | 'UNKNOWN_AVAILABILITY';
  statusDetail: string;
  firstDeparture?: string;
  lastDeparture?: string;
  nextDeparture?: string;
  boardingWaitMin?: number;
  lastServiceCatchable?: boolean;
  latestFeasibleDeparture?: string;
  evidenceLabel: 'KNOWN' | 'PROBABLE' | 'OUTDATED' | 'UNKNOWN';
  confidence: number;
  fareEstimate?: string;
  reasons: string[];
}

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

export function evaluateAvailability(
  shiftEndStr: string,
  deadlineStr: string
): Record<string, TransportAvailabilityItem> {
  const shiftMin = parseTimeToMinutes(shiftEndStr);
  const normShift = shiftMin >= 360 ? shiftMin : shiftMin + 1440;
  const windowDuration = computeWindowDurationMin(shiftEndStr, deadlineStr);

  const items: Record<string, TransportAvailabilityItem> = {};

  // 1. Nagpur Metro Orange / Aqua Line (06:00 - 22:30, last departure 22:15)
  const metroStart = 360; // 06:00
  const metroLast = 1335; // 22:15

  if (shiftMin >= metroStart && shiftMin <= metroLast) {
    const elapsed = shiftMin - metroStart;
    const wait = (15 - (elapsed % 15)) % 15;
    const nextDep = minutesToHm(shiftMin + wait);
    items['metro'] = {
      serviceId: 'metro-orange-line',
      mode: 'transit',
      transitType: 'metro',
      name: 'Nagpur Metro (Orange / Aqua Line)',
      operatingStatus: 'RUNNING',
      statusDetail: `Operational. Next departure ${nextDep} (~${wait} min wait). Last departure 22:15.`,
      firstDeparture: '06:00',
      lastDeparture: '22:15',
      nextDeparture: nextDep,
      boardingWaitMin: wait,
      lastServiceCatchable: true,
      latestFeasibleDeparture: minutesToHm(shiftMin + Math.max(0, windowDuration - 20)),
      evidenceLabel: 'PROBABLE',
      confidence: 0.88,
      fareEstimate: '₹25 - ₹45',
      reasons: [
        'Maha Metro Nagpur static schedule verified',
        `Shift time ${minutesToHm(shiftMin)} is inside operating window (06:00 - 22:30)`,
      ],
    };
  } else if (shiftMin > metroLast || shiftMin < 240) {
    // 22:16 to 03:59: deep night service closed
    const minsAgo = shiftMin > metroLast ? shiftMin - metroLast : shiftMin + 1440 - metroLast;
    items['metro'] = {
      serviceId: 'metro-orange-line',
      mode: 'transit',
      transitType: 'metro',
      name: 'Nagpur Metro (Orange / Aqua Line)',
      operatingStatus: 'ENDED',
      statusDetail: `Service closed for the night. Last train departed at 22:15 (${minsAgo} min ago). First morning train 06:00.`,
      firstDeparture: '06:00',
      lastDeparture: '22:15',
      nextDeparture: '06:00',
      boardingWaitMin: undefined,
      lastServiceCatchable: false,
      evidenceLabel: 'PROBABLE',
      confidence: 0.95,
      fareEstimate: '₹25 - ₹45',
      reasons: [
        'Metro does not run overnight in Nagpur',
        'Last service departed at 22:15; stations closed at 22:30',
      ],
    };
  } else {
    // 04:00 to 05:59 - early morning standby
    const wait = metroStart - shiftMin;
    items['metro'] = {
      serviceId: 'metro-orange-line',
      mode: 'transit',
      transitType: 'metro',
      name: 'Nagpur Metro (Orange / Aqua Line)',
      operatingStatus: 'NOT_STARTED',
      statusDetail: `Early morning standby. First train departs at 06:00 (in ${wait} min).`,
      firstDeparture: '06:00',
      lastDeparture: '22:15',
      nextDeparture: '06:00',
      boardingWaitMin: wait,
      lastServiceCatchable: true,
      latestFeasibleDeparture: '06:00',
      evidenceLabel: 'PROBABLE',
      confidence: 0.9,
      fareEstimate: '₹25 - ₹45',
      reasons: [
        'Revenue service commences at 06:00 AM',
        `Opening in ${wait} minutes`,
      ],
    };
  }

  // 2. City Bus / Night Feeder N1
  // Day bus: 06:00 to 21:30. Night Feeder N1: 22:30 to 01:30 [22:30, 23:15, 00:00, 00:45, 01:30]
  const nightFeederDeps = [1350, 1395, 1440, 1485, 1530];
  if (normShift >= 360 && normShift <= 1290) {
    items['bus'] = {
      serviceId: 'aapli-bus-day',
      mode: 'transit',
      transitType: 'city_bus',
      name: 'Aapli Bus Regular City Service',
      operatingStatus: 'RUNNING',
      statusDetail: 'Day routes active. Next bus in ~15 min. Regular service ends 21:30.',
      firstDeparture: '06:00',
      lastDeparture: '21:30',
      nextDeparture: minutesToHm(normShift + 15),
      boardingWaitMin: 15,
      lastServiceCatchable: true,
      latestFeasibleDeparture: minutesToHm(normShift + Math.max(0, windowDuration - 25)),
      evidenceLabel: 'PROBABLE',
      confidence: 0.82,
      fareEstimate: '₹15 - ₹25',
      reasons: ['Regular daytime NMC Aapli Bus schedule'],
    };
  } else if (normShift >= 1350 && normShift <= 1530) {
    const nextDep = nightFeederDeps.find((d) => d >= normShift);
    if (nextDep) {
      const wait = nextDep - normShift;
      items['bus'] = {
        serviceId: 'aapli-bus-night-n1',
        mode: 'transit',
        transitType: 'city_bus',
        name: 'Aapli Bus Night Feeder N1 (Hospital & Station)',
        operatingStatus: 'RUNNING',
        statusDetail: `Night feeder active. Next bus at ${minutesToHm(nextDep)} (~${wait} min wait). Last feeder 01:30.`,
        firstDeparture: '22:30',
        lastDeparture: '01:30',
        nextDeparture: minutesToHm(nextDep),
        boardingWaitMin: wait,
        lastServiceCatchable: true,
        latestFeasibleDeparture: '01:30',
        evidenceLabel: 'PROBABLE',
        confidence: 0.75,
        fareEstimate: '₹25',
        reasons: ['Simulated NMC late-shift feeder pilot'],
      };
    } else {
      items['bus'] = {
        serviceId: 'aapli-bus-night-n1',
        mode: 'transit',
        transitType: 'city_bus',
        name: 'Aapli Bus Night Feeder N1',
        operatingStatus: 'ENDED',
        statusDetail: 'Last night feeder departed at 01:30. Bus service ended.',
        firstDeparture: '22:30',
        lastDeparture: '01:30',
        nextDeparture: '06:00',
        lastServiceCatchable: false,
        evidenceLabel: 'PROBABLE',
        confidence: 0.85,
        fareEstimate: '₹25',
        reasons: ['Night feeder concluded at 01:30'],
      };
    }
  } else {
    items['bus'] = {
      serviceId: 'aapli-bus-night-n1',
      mode: 'transit',
      transitType: 'city_bus',
      name: 'Aapli Bus (Day & Night Feeders)',
      operatingStatus: 'ENDED',
      statusDetail: 'All municipal bus services ended. Regular service resumes 06:00 AM.',
      firstDeparture: '06:00',
      lastDeparture: '01:30',
      nextDeparture: '06:00',
      lastServiceCatchable: false,
      evidenceLabel: 'PROBABLE',
      confidence: 0.92,
      fareEstimate: '₹15 - ₹30',
      reasons: ['No buses operate in Nagpur between 01:30 and 06:00'],
    };
  }

  // 3. Auto-Rickshaw (Hospital Gate Stand)
  const autoWait = normShift > 1440 && normShift < 1740 ? 10 : 5;
  items['auto'] = {
    serviceId: 'private-auto-on-demand',
    mode: 'auto',
    transitType: 'private_auto',
    name: 'Auto-Rickshaw (Stand / Hospital Gate)',
    operatingStatus: 'RUNNING',
    statusDetail: `Available at hospital gate stand (~${autoWait}m wait). 24×7 presence.`,
    firstDeparture: '00:00',
    lastDeparture: '23:59',
    nextDeparture: minutesToHm(normShift + autoWait),
    boardingWaitMin: autoWait,
    lastServiceCatchable: true,
    latestFeasibleDeparture: minutesToHm(normShift + Math.max(0, windowDuration - 20)),
    evidenceLabel: 'PROBABLE',
    confidence: 0.72,
    fareEstimate: '₹90 - ₹140 (estimated night tariff)',
    reasons: [
      'Hospital stands maintain 2-4 autos overnight based on historical pattern',
      'No live GPS telemetry exists for Nagpur autos',
    ],
  };

  // 4. Cab / Ride-Hail: Strictly UNKNOWN
  items['cab'] = {
    serviceId: 'private-ride-hail-cab',
    mode: 'cab',
    transitType: 'ride_hail',
    name: 'App Ride-Hail (Ola / Uber)',
    operatingStatus: 'UNKNOWN_AVAILABILITY',
    statusDetail: 'Availability UNKNOWN. No live aggregator API telemetry or driver location feed.',
    evidenceLabel: 'UNKNOWN',
    confidence: 0.0,
    fareEstimate: '₹160 - ₹280',
    reasons: [
      'No live telemetry feed available in Nagpur',
      'Noctra never fabricates cab wait times or fake driver counts',
    ],
  };

  // 5. Walking
  items['walk'] = {
    serviceId: 'pedestrian-walk',
    mode: 'walk',
    transitType: 'walk',
    name: 'Pedestrian Walking',
    operatingStatus: 'RUNNING',
    statusDetail: 'Pedestrian corridor open 24×7. Feasibility depends on deadline window.',
    firstDeparture: '00:00',
    lastDeparture: '23:59',
    nextDeparture: minutesToHm(normShift),
    boardingWaitMin: 0,
    lastServiceCatchable: true,
    latestFeasibleDeparture: minutesToHm(normShift + Math.max(0, windowDuration - 45)),
    evidenceLabel: 'KNOWN',
    confidence: 1.0,
    fareEstimate: '₹0 (Free)',
    reasons: ['Sidewalk and road shoulder corridors open 24×7'],
  };

  return items;
}

export function generatePlan(req: PlanRequest): PlanResponse {
  const shiftMin = parseTimeToMinutes(req.shift_end_iso);
  const normShift = shiftMin >= 360 ? shiftMin : shiftMin + 1440;
  const windowDuration = computeWindowDurationMin(req.shift_end_iso, req.deadline_iso);

  const avail = evaluateAvailability(req.shift_end_iso, req.deadline_iso);
  const candidates: Candidate[] = [];

  const baseGeometry = [
    [req.origin.lon, req.origin.lat] as [number, number],
    [79.0792, 21.1488] as [number, number],
    [79.0771, 21.1480] as [number, number],
    [79.0735, 21.1475] as [number, number],
    [79.0701, 21.1470] as [number, number],
    [79.0672, 21.1465] as [number, number],
    [79.0648, 21.1460] as [number, number],
    [79.0629, 21.1458] as [number, number],
    [79.0611, 21.1455] as [number, number],
    [req.destination.lon, req.destination.lat] as [number, number],
  ];

  const detourGeometry = [
    [req.origin.lon, req.origin.lat] as [number, number],
    [79.0795, 21.1492] as [number, number],
    [79.0778, 21.1502] as [number, number],
    [79.0752, 21.1510] as [number, number],
    [79.0720, 21.1505] as [number, number],
    [79.0693, 21.1492] as [number, number],
    [79.0668, 21.1478] as [number, number],
    [79.0645, 21.1468] as [number, number],
    [79.0620, 21.1460] as [number, number],
    [79.0600, 21.1455] as [number, number],
    [req.destination.lon, req.destination.lat] as [number, number],
  ];

  // 1. TRANSIT (Metro / Night Bus)
  if (req.modes.includes('transit')) {
    const metroAvail = avail['metro'];
    const busAvail = avail['bus'];

    if (metroAvail && metroAvail.operatingStatus === 'RUNNING') {
      const wait = metroAvail.boardingWaitMin ?? 12;
      const inTransit = 18;
      const expEta = wait + inTransit;
      const optEta = Math.max(10, expEta - 4);
      const pessEta = expEta + 8;
      const slackPess = windowDuration - pessEta;
      const status: CandidateStatus = slackPess >= 5 ? 'ROBUST' : slackPess >= 0 ? 'AT_RISK' : 'INFEASIBLE';

      candidates.push({
        id: 'metro-express',
        mode: 'transit',
        kind: 'fastest',
        geometry: { type: 'LineString', coordinates: baseGeometry },
        distance_m: 4800,
        eta: { optimistic_min: optEta, expected_min: expEta, pessimistic_min: pessEta },
        slack_min: {
          optimistic: windowDuration - optEta,
          expected: windowDuration - expEta,
          pessimistic: slackPess,
        },
        status,
        risk: { score: 0.15, max_gap_m: 280, basis: 'environmental_proxy' },
        evidence: [
          {
            fact_type: 'transit_schedule',
            subject: 'Nagpur Metro Orange Line Timetable',
            label: 'PROBABLE',
            confidence: 0.88,
            age_s: 240,
            source: 'Maha Metro static timetable',
            source_class: 'static',
            simulated: true,
            reasons: [
              `Active service. Next train ${metroAvail.nextDeparture}`,
              `Last departure at ${metroAvail.lastDeparture}`,
            ],
          },
          {
            fact_type: 'traffic',
            subject: 'Metro Elevated Track',
            label: 'KNOWN',
            confidence: 0.98,
            age_s: 120,
            source: 'Metro Ops Telemetry',
            source_class: 'simulated',
            simulated: true,
            reasons: ['Grade-separated viaduct with 0% road congestion risk'],
          },
        ],
        plan_b: {
          mode: 'auto',
          kind: 'balanced',
          eta: { optimistic_min: 16, expected_min: 20, pessimistic_min: 28 },
          description: 'Take stand auto from Medical Square if train wait exceeds 15 min',
          trigger: `If train not boarded by ${minutesToHm(normShift + 15)}`,
        },
        decision_by_iso: `${req.shift_end_iso.slice(0, 11)}${minutesToHm(normShift + 15)}:00+05:30`,
        rejected: false,
        reject_reasons: [],
        operating_note: `Runs until ${metroAvail.lastDeparture}`,
        last_service_time: metroAvail.lastDeparture,
        latest_feasible_departure_iso: metroAvail.latestFeasibleDeparture
          ? `${req.shift_end_iso.slice(0, 11)}${metroAvail.latestFeasibleDeparture}:00+05:30`
          : undefined,
        fare_estimate_text: metroAvail.fareEstimate,
      });
    } else if (busAvail && busAvail.operatingStatus === 'RUNNING') {
      const wait = busAvail.boardingWaitMin ?? 15;
      const inTransit = 22;
      const expEta = wait + inTransit;
      const optEta = Math.max(14, expEta - 5);
      const pessEta = expEta + 10;
      const slackPess = windowDuration - pessEta;
      const status: CandidateStatus = slackPess >= 5 ? 'ROBUST' : slackPess >= 0 ? 'AT_RISK' : 'INFEASIBLE';

      candidates.push({
        id: 'transit-night-bus',
        mode: 'transit',
        kind: 'balanced',
        geometry: { type: 'LineString', coordinates: baseGeometry },
        distance_m: 4800,
        eta: { optimistic_min: optEta, expected_min: expEta, pessimistic_min: pessEta },
        slack_min: {
          optimistic: windowDuration - optEta,
          expected: windowDuration - expEta,
          pessimistic: slackPess,
        },
        status,
        risk: { score: 0.28, max_gap_m: 420, basis: 'environmental_proxy' },
        evidence: [
          {
            fact_type: 'transit_schedule',
            subject: busAvail.name,
            label: 'PROBABLE',
            confidence: 0.75,
            age_s: 300,
            source: 'NMC Aapli Bus Night Feeder Pilot',
            source_class: 'simulated',
            simulated: true,
            reasons: [
              `Next departure at ${busAvail.nextDeparture}`,
              `Last departure at ${busAvail.lastDeparture}`,
            ],
          },
        ],
        plan_b: {
          mode: 'auto',
          kind: 'fastest',
          eta: { optimistic_min: 14, expected_min: 18, pessimistic_min: 27 },
          description: 'Take stand auto if bus delayed past 15 min',
          trigger: 'Bus not arrived by 15 min past shift',
        },
        decision_by_iso: `${req.shift_end_iso.slice(0, 11)}${minutesToHm(normShift + 15)}:00+05:30`,
        rejected: false,
        reject_reasons: [],
        operating_note: `Runs until ${busAvail.lastDeparture}`,
        last_service_time: busAvail.lastDeparture,
        latest_feasible_departure_iso: busAvail.latestFeasibleDeparture
          ? `${req.shift_end_iso.slice(0, 11)}${busAvail.latestFeasibleDeparture}:00+05:30`
          : undefined,
        fare_estimate_text: busAvail.fareEstimate,
      });
    } else {
      // Transit closed or not started
      const lastTime = metroAvail?.lastDeparture ?? '22:15';
      const isEarly = metroAvail?.operatingStatus === 'NOT_STARTED';
      const note = isEarly
        ? `Starts at ${metroAvail?.firstDeparture ?? '06:00'} (not started)`
        : `Last service was ${lastTime} (service ended)`;

      candidates.push({
        id: 'transit-ended',
        mode: 'transit',
        kind: 'fastest',
        geometry: { type: 'LineString', coordinates: baseGeometry },
        distance_m: 4800,
        eta: { optimistic_min: 99, expected_min: 99, pessimistic_min: 99 },
        slack_min: { optimistic: -99, expected: -99, pessimistic: -99 },
        status: 'INFEASIBLE',
        risk: { score: 0.85, max_gap_m: 1200, basis: 'environmental_proxy' },
        evidence: [
          {
            fact_type: 'transit_schedule',
            subject: 'Nagpur Transit Timetable (Metro & Bus)',
            label: 'PROBABLE',
            confidence: 0.95,
            age_s: 600,
            source: 'Maha Metro & NMC Aapli Bus',
            source_class: 'static',
            simulated: true,
            reasons: [
              `Public transit inactive at this hour (${note})`,
              'Stations closed overnight',
            ],
          },
        ],
        plan_b: null,
        decision_by_iso: null,
        rejected: true,
        reject_reasons: [
          `Public transit not operating at this hour (${note})`,
          'Last scheduled service has already passed',
        ],
        operating_note: note,
        last_service_time: lastTime,
        latest_feasible_departure_iso: null,
        fare_estimate_text: '₹20 - ₹45',
      });
    }
  }

  // 2. AUTO-RICKSHAW
  if (req.modes.includes('auto')) {
    const autoAvail = avail['auto'];
    const wait = autoAvail?.boardingWaitMin ?? 8;
    const inTransit = 14;
    const expEta = wait + inTransit;
    const optEta = Math.max(10, expEta - 4);
    const pessEta = expEta + 9;
    const slackPess = windowDuration - pessEta;
    const status: CandidateStatus = slackPess >= 8 ? 'ROBUST' : slackPess >= 0 ? 'AT_RISK' : 'INFEASIBLE';

    candidates.push({
      id: 'auto-fastest',
      mode: 'auto',
      kind: 'fastest',
      geometry: { type: 'LineString', coordinates: baseGeometry },
      distance_m: 4800,
      eta: { optimistic_min: optEta, expected_min: expEta, pessimistic_min: pessEta },
      slack_min: {
        optimistic: windowDuration - optEta,
        expected: windowDuration - expEta,
        pessimistic: slackPess,
      },
      status,
      risk: { score: 0.22, max_gap_m: 380, basis: 'environmental_proxy' },
      evidence: [
        {
          fact_type: 'ride_availability',
          subject: 'Auto-rickshaws at Medical Square / AIIMS Gate',
          label: 'PROBABLE',
          confidence: 0.72,
          age_s: 180,
          source: 'Hospital gate stand occupancy proxy',
          source_class: 'simulated',
          simulated: true,
          reasons: [
            'Hospital stands maintain 2-4 autos overnight',
            'No live GPS feed available for Nagpur private autos',
          ],
        },
        {
          fact_type: 'road_closure',
          subject: 'Wardha Road Corridor',
          label: 'KNOWN',
          confidence: 0.95,
          age_s: 45,
          source: 'Simulated municipal road feed',
          source_class: 'simulated',
          simulated: true,
          reasons: ['No active closures reported on Wardha Road'],
        },
        {
          fact_type: 'traffic',
          subject: 'Medical Sq to Dharampeth Corridor',
          label: 'KNOWN',
          confidence: 0.88,
          age_s: 120,
          source: 'Simulated traffic model',
          source_class: 'simulated',
          simulated: true,
          reasons: ['Minimal traffic at night; signals in flashing caution mode'],
        },
      ],
      plan_b: {
        mode: req.modes.includes('two_wheeler') ? 'two_wheeler' : 'walk',
        kind: 'balanced',
        eta: { optimistic_min: 17, expected_min: 22, pessimistic_min: 31 },
        description: 'Switch to two-wheeler rental if auto not secured within 10 min',
        trigger: `No auto boarded by ${minutesToHm(normShift + 10)}`,
      },
      decision_by_iso: `${req.shift_end_iso.slice(0, 11)}${minutesToHm(normShift + 15)}:00+05:30`,
      rejected: false,
      reject_reasons: [],
      operating_note: '24×7 Stand presence (Hospital gate)',
      last_service_time: '24×7',
      latest_feasible_departure_iso: `${req.shift_end_iso.slice(0, 11)}${minutesToHm(normShift + Math.max(0, windowDuration - 27))}:00+05:30`,
      fare_estimate_text: autoAvail?.fareEstimate ?? '₹90 - ₹140',
    });
  }

  // 3. TWO-WHEELER
  if (req.modes.includes('two_wheeler')) {
    const expEta = 22;
    const optEta = 17;
    const pessEta = 31;
    const slackPess = windowDuration - pessEta;
    const status: CandidateStatus = slackPess >= 5 ? 'ROBUST' : slackPess >= 0 ? 'AT_RISK' : 'INFEASIBLE';

    candidates.push({
      id: 'twowheeler-balanced',
      mode: 'two_wheeler',
      kind: 'balanced',
      geometry: { type: 'LineString', coordinates: detourGeometry },
      distance_m: 5100,
      eta: { optimistic_min: optEta, expected_min: expEta, pessimistic_min: pessEta },
      slack_min: {
        optimistic: windowDuration - optEta,
        expected: windowDuration - expEta,
        pessimistic: slackPess,
      },
      status,
      risk: { score: 0.35, max_gap_m: 520, basis: 'environmental_proxy' },
      evidence: [
        {
          fact_type: 'ride_availability',
          subject: 'Two-Wheeler Rental Dock / Personal Vehicle',
          label: 'OUTDATED',
          confidence: 0.55,
          age_s: 1800,
          source: 'Simulated rental aggregator',
          source_class: 'simulated',
          simulated: true,
          reasons: ['Rental vehicle dock telemetry 30m stale'],
        },
        {
          fact_type: 'road_closure',
          subject: 'Seminary Hills Secondary Road',
          label: 'KNOWN',
          confidence: 0.92,
          age_s: 90,
          source: 'Simulated road sensor feed',
          source_class: 'simulated',
          simulated: true,
          reasons: ['Working street illumination verified'],
        },
      ],
      plan_b: null,
      decision_by_iso: `${req.shift_end_iso.slice(0, 11)}${minutesToHm(normShift + 15)}:00+05:30`,
      rejected: false,
      reject_reasons: [],
      operating_note: '24×7 Self-drive / Personal',
      last_service_time: '24×7',
      latest_feasible_departure_iso: `${req.shift_end_iso.slice(0, 11)}${minutesToHm(normShift + Math.max(0, windowDuration - 31))}:00+05:30`,
      fare_estimate_text: '₹40 - ₹60 (fuel/rental)',
    });
  }

  // 4. CAB / RIDE-HAIL
  if (req.modes.includes('cab')) {
    candidates.push({
      id: 'cab-ridehail',
      mode: 'cab',
      kind: 'fastest',
      geometry: { type: 'LineString', coordinates: baseGeometry },
      distance_m: 4800,
      eta: { optimistic_min: 15, expected_min: 24, pessimistic_min: 40 },
      slack_min: {
        optimistic: windowDuration - 15,
        expected: windowDuration - 24,
        pessimistic: windowDuration - 40,
      },
      status: 'AT_RISK',
      risk: { score: 0.2, max_gap_m: 350, basis: 'environmental_proxy' },
      evidence: [
        {
          fact_type: 'ride_availability',
          subject: 'Ola/Uber Fleet Driver Telemetry',
          label: 'UNKNOWN',
          confidence: 0.0,
          age_s: 0,
          source: 'Aggregator API Proxy',
          source_class: 'simulated',
          simulated: true,
          reasons: [
            'Zero live driver telemetry available in Nagpur at this hour',
            'Noctra never fabricates cab wait times or fake driver counts',
          ],
        },
      ],
      plan_b: {
        mode: 'auto',
        kind: 'fastest',
        eta: { optimistic_min: 14, expected_min: 18, pessimistic_min: 27 },
        description: 'Walk to Medical Square auto stand if no cab accepts within 5 min',
        trigger: `No cab assigned by ${minutesToHm(normShift + 5)}`,
      },
      decision_by_iso: `${req.shift_end_iso.slice(0, 11)}${minutesToHm(normShift + 5)}:00+05:30`,
      rejected: false,
      reject_reasons: [],
      operating_note: 'UNKNOWN availability (no live feed)',
      last_service_time: '24×7 on-demand',
      latest_feasible_departure_iso: `${req.shift_end_iso.slice(0, 11)}${minutesToHm(normShift + Math.max(0, windowDuration - 40))}:00+05:30`,
      fare_estimate_text: '₹160 - ₹280',
    });
  }

  // 5. WALKING
  if (req.modes.includes('walk')) {
    const expWalk = 42;
    const optWalk = 38;
    const pessWalk = 52;
    const slackPess = windowDuration - pessWalk;
    const isInfeasible = slackPess < 0 || windowDuration - expWalk < 0;

    candidates.push({
      id: 'walk-safest',
      mode: 'walk',
      kind: 'safest',
      geometry: { type: 'LineString', coordinates: baseGeometry },
      distance_m: 4200,
      eta: { optimistic_min: optWalk, expected_min: expWalk, pessimistic_min: pessWalk },
      slack_min: {
        optimistic: windowDuration - optWalk,
        expected: windowDuration - expWalk,
        pessimistic: slackPess,
      },
      status: isInfeasible ? 'INFEASIBLE' : 'AT_RISK',
      risk: { score: 0.58, max_gap_m: 850, basis: 'environmental_proxy' },
      evidence: [
        {
          fact_type: 'traffic',
          subject: 'Pedestrian Corridor via Wardha Road',
          label: 'PROBABLE',
          confidence: 0.65,
          age_s: 300,
          source: 'Simulated pedestrian model',
          source_class: 'simulated',
          simulated: true,
          reasons: [
            'Footpath continuous on ~60% of corridor',
            'Shoulder walking required along railway overpass',
          ],
        },
      ],
      plan_b: null,
      decision_by_iso: null,
      rejected: isInfeasible,
      reject_reasons: isInfeasible
        ? [
            `Pessimistic ETA exceeds deadline by ${Math.abs(slackPess)} minutes`,
            'High environmental risk score (0.58) with 850m maximum unlit stretch',
            'Solo pedestrian travel discouraged at this hour',
          ]
        : [],
      operating_note: '24×7 Footpath Network',
      last_service_time: '24×7',
      latest_feasible_departure_iso: !isInfeasible
        ? `${req.shift_end_iso.slice(0, 11)}${minutesToHm(normShift + Math.max(0, windowDuration - pessWalk))}:00+05:30`
        : null,
      fare_estimate_text: '₹0',
    });
  }

  // Determine recommended ID
  const robustCandidates = candidates.filter((c) => !c.rejected && c.status === 'ROBUST');
  const validCandidates = candidates.filter((c) => !c.rejected);
  const recommendedId = robustCandidates.length > 0
    ? robustCandidates[0].id
    : validCandidates.length > 0
      ? validCandidates[0].id
      : candidates[0]?.id ?? null;

  const rec = candidates.find((c) => c.id === recommendedId);
  const whyChosen = rec
    ? rec.mode === 'transit'
      ? `Metro transit selected: active at ${minutesToHm(normShift)} before last service at ${rec.last_service_time}. Safe grade-separated transit with ${rec.slack_min.expected}m expected slack.`
      : rec.mode === 'auto'
        ? `Auto-rickshaw selected: fastest feasible motorized option at ${minutesToHm(normShift)}. Expected transit ${rec.eta.expected_min}m leaves ${rec.slack_min.expected}m buffer before deadline. Plan B is established with a decide-by trigger.`
        : `Candidate ${rec.id} selected with ${rec.slack_min.expected}m expected slack.`
    : 'No feasible candidate meets shift constraints.';

  const whyRejected = candidates
    .filter((c) => c.rejected)
    .map((c) => ({
      id: c.id,
      reason: c.reject_reasons.join('; ') || 'Option infeasible for deadline',
    }));

  const missingInfo = [
    'Real-time auto-rickshaw queue count at AIIMS gate (historical proxy only)',
    'Live cab driver GPS positions (strictly UNKNOWN; no aggregator feed)',
    'Active streetlighting status along secondary underpasses',
  ];

  return {
    generated_at: `${req.shift_end_iso.slice(0, 10)}T${minutesToHm(normShift)}:02+05:30`,
    tier: 0,
    candidates,
    recommended_id: recommendedId,
    missing_information: missingInfo,
    explanation: {
      why_chosen: whyChosen,
      why_rejected: whyRejected,
      uncertainties: missingInfo,
    },
  };
}
