/**
 * Offline Emergency Knowledge Base for Noctra Night Workers in Nagpur.
 * 100% hardcoded, deterministic crisis response engine requiring 0 network.
 */

export interface EmergencyScenario {
  id: string;
  title: string;
  chipLabel: string;
  iconName: string;
  keywords: string[];
  severity: 'critical' | 'high' | 'medium';
  primaryAction: string;
  stepByStep: string[];
  helplines?: { name: string; number: string; description: string }[];
  safeHavens?: string[];
  batteryTip?: string;
}

export const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  {
    id: 'stranded_alone',
    title: 'Stranded Alone at Night (No Transport / Service Ended)',
    chipLabel: '🚨 Stranded Alone',
    iconName: 'AlertTriangle',
    keywords: [
      'stranded',
      'stuck',
      'alone',
      'no auto',
      'no cab',
      'metro closed',
      'bus ended',
      'gadi nahi mil rahi',
      'fas gaya',
      'fas gayi',
      'middle of nowhere',
      'dark road',
      'night transport',
    ],
    severity: 'critical',
    primaryAction: 'Move immediately to an illuminated, staffed location. Do NOT wait in the dark.',
    stepByStep: [
      'Stay on primary lit arterial roads (e.g. Wardha Road, Central Avenue, Amravati Road). Never take unlit shortcuts or alleyways.',
      'Head towards the nearest verified 24/7 staffed refuge: a 24x7 hospital trauma gate (AIIMS / GMC / Mayo), a manned police booth, or a lit petrol pump forecourt.',
      'Send your live location now on WhatsApp/SMS to a trusted colleague or family member.',
      'Check the Noctra Services tab for verified 24x7 shelters within walking distance.',
      'If you feel unsafe or no shelter is visible within 10 minutes, dial 112 immediately and request police escort.',
    ],
    helplines: [
      { name: 'Police Emergency', number: '112', description: 'Immediate patrol dispatch' },
      { name: "Women's Helpline", number: '1091', description: '24/7 dedicated support' },
    ],
    safeHavens: [
      'AIIMS Nagpur 24/7 Trauma Block (MIHAN / Wardha Rd)',
      'GMC Nagpur Casualty (Medical Square)',
      'Sitabuldi Police Assistance Booth (Metro Interchange)',
      'HP / Indian Oil 24x7 Lit Forecourts on Wardha Rd',
    ],
  },
  {
    id: 'being_followed',
    title: 'Someone is Following Me / Feeling In Danger',
    chipLabel: '🚶‍♀️ Being Followed',
    iconName: 'ShieldAlert',
    keywords: [
      'following',
      'followed',
      'unsafe',
      'scared',
      'stalker',
      'creepy',
      'harassment',
      'danger',
      'threat',
      'peeche',
      'chhedkhani',
      'darr',
      'shady',
      'suspicious',
    ],
    severity: 'critical',
    primaryAction: 'Head to a lit public place immediately. Do NOT head to a secluded home or dark dead-end.',
    stepByStep: [
      'Cross the street toward any open, illuminated facility (hospital gate, 24x7 pharmacy, lit fuel station, security booth).',
      'Walk with confidence, head upright, and remove headphones so you remain fully alert.',
      'Enter the nearest open establishment and announce clearly to staff/security: "Someone is following me outside, please let me wait here."',
      'Call Police 112 or Women\'s Helpline 1091 right away. Keep the line active.',
      'If confronted in immediate danger: Make loud noise, shout "POLICE!", or trigger a loud phone siren. Criminals avoid drawing attention.',
    ],
    helplines: [
      { name: 'Police Emergency', number: '112', description: 'Priority emergency response' },
      { name: 'Nagpur Women Helpline', number: '1091', description: 'Trained female officers' },
      { name: 'Nagpur Police Control', number: '07122561103', description: 'City central desk' },
    ],
  },
  {
    id: 'vehicle_breakdown',
    title: 'Vehicle / Two-Wheeler Breakdown in Dark Area',
    chipLabel: '🛵 Vehicle Breakdown',
    iconName: 'Wrench',
    keywords: [
      'puncture',
      'breakdown',
      'scooter',
      'bike',
      'two wheeler',
      'flat tyre',
      'petrol khatam',
      'panchar',
      'engine stopped',
      'gadi kharab',
      'band ho gayi',
    ],
    severity: 'high',
    primaryAction: 'Move yourself and the vehicle directly under an active streetlight or to a lit fuel station.',
    stepByStep: [
      'Do not attempt roadside repairs on unlit dark stretches or highway curves.',
      'Push your vehicle to the nearest illuminated high-traffic point (petrol pump, hospital entrance, lit commercial stretch).',
      'Switch on your vehicle parking/hazard lights or keep phone flashlight pointing down so vehicles see you.',
      'Do not accept informal tow or ride offers from unverified solo riders.',
      'Contact a verified family member or workplace security to meet you at a designated well-lit landmark.',
    ],
    helplines: [
      { name: 'Nagpur Traffic Helpline', number: '112', description: 'Roadside assistance & patrol' },
      { name: 'Highway Assistance', number: '1033', description: 'NHAI 24/7 patrol' },
    ],
    safeHavens: [
      'HP Auto Fuel & Air Oasis (Sitabuldi / Wardha Rd) - 24/7 Lit Forecourt with tyre air & attendant',
      'Indian Oil 24h Petrol Pump (Wardha Road / Rahate Colony)',
    ],
  },
  {
    id: 'driver_refusal_extortion',
    title: 'Cab / Auto Driver Refusing, Threatening or Demanding Extortionate Cash',
    chipLabel: '🚕 Driver Issues / Threats',
    iconName: 'Car',
    keywords: [
      'auto driver',
      'cab driver',
      'refusing',
      'extra paise',
      'demand',
      'extortion',
      'loot',
      'surge',
      'drunk driver',
      'cancelled',
      'meter',
      'auto wala',
      'zagda',
      'fight',
    ],
    severity: 'medium',
    primaryAction: 'Do not escalate. Prioritise personal safety over fare disputes.',
    stepByStep: [
      'Never board an unmetered vehicle if the driver appears aggressive, erratic, or intoxicated.',
      'If already inside and feeling uncomfortable: Ask driver to stop at the next lit ATM, fuel pump, or hospital under the pretext of getting cash, then disembark immediately.',
      'Note down or take a discreet photo of the vehicle registration plate (e.g. MH-31-XX-XXXX) and send it to your contact.',
      'Walk to the designated hospital/station prepaid auto stand (AIIMS Main Gate or Medical Square) where registered union drivers operate.',
      'Report extortion or threats to Nagpur Traffic Police via 112.',
    ],
    helplines: [
      { name: 'Police Helpline', number: '112', description: 'Report driver extortion/misconduct' },
      { name: 'Nagpur Police Control', number: '07122561103', description: 'File complaints' },
    ],
  },
  {
    id: 'battery_dying',
    title: 'Phone Battery Critically Low (< 5%)',
    chipLabel: '🔋 Battery Dying (<5%)',
    iconName: 'BatteryLow',
    keywords: [
      'battery',
      'phone dying',
      'low battery',
      'switch off',
      'charge',
      'charger',
      'charging',
      'dead phone',
      'khatam hone wala hai',
    ],
    severity: 'high',
    primaryAction: 'Send ONE last emergency ping with your landmark NOW before your phone shuts down.',
    stepByStep: [
      'Send this exact WhatsApp/SMS message to family/colleague immediately:',
      '"Battery 3%. My location: [Landmark/Wardha Rd]. Heading to [AIIMS / Sitabuldi]. If no call by [Time], please call 112."',
      'Enable Extreme / Ultra Battery Saver mode immediately in your phone settings.',
      'Turn screen brightness to minimum. Turn OFF Bluetooth, Mobile Hotspot, Wi-Fi, and background apps.',
      'Memorize emergency numbers (112, 1091) and walk to any 24/7 petrol pump or hospital casualty reception — all have power points and landlines.',
    ],
    batteryTip: 'Keep screen brightness at 0% and do not play audio. This gives ~15 extra minutes on 3% battery.',
  },
  {
    id: 'medical_emergency',
    title: 'Medical Emergency / Acute Injury / Accident',
    chipLabel: '🏥 Medical / Accident',
    iconName: 'HeartPulse',
    keywords: [
      'medical',
      'doctor',
      'hospital',
      'injury',
      'bleeding',
      'accident',
      'chot',
      'heart',
      'pain',
      'ambulance',
      'casualty',
      'dawa',
      'medicine',
    ],
    severity: 'critical',
    primaryAction: 'Call 108 Ambulance immediately and head to the nearest 24x7 Government or Civil Emergency.',
    stepByStep: [
      'Dial 108 (Free Emergency Ambulance). State exact location, direction of traffic, and nature of injury.',
      'Apply firm, continuous direct pressure with clean cloth/gauze if there is active bleeding.',
      'If feeling faint, sit down with head between knees or lie flat with feet elevated.',
      'Nagpur 24/7 Casualty Centers:',
      '• AIIMS Nagpur Trauma Center (MIHAN / Wardha Rd) - Ph: 0712-2980100',
      '• GMC Nagpur Civil Hospital (Medical Square) - Major trauma care',
      '• Mayo Hospital / IGMC (Central Avenue / Station Road)',
    ],
    helplines: [
      { name: 'National Ambulance', number: '108', description: 'Free emergency ambulance' },
      { name: 'AIIMS Nagpur Casualty', number: '07122980100', description: 'Trauma & Emergency' },
      { name: 'Police Assistance', number: '112', description: 'Road traffic accidents' },
    ],
  },
  {
    id: 'helpline_numbers',
    title: 'Nagpur Night Emergency Helplines (Direct Dial)',
    chipLabel: '📞 Emergency Helplines',
    iconName: 'PhoneCall',
    keywords: [
      'phone number',
      'contact',
      'helpline',
      'police number',
      'ambulance number',
      'call',
      'toll free',
      'sos number',
      'nagpur police',
    ],
    severity: 'medium',
    primaryAction: 'Direct emergency numbers active 24/7 across Nagpur district.',
    stepByStep: [
      'All emergency numbers below are toll-free and operate 24 hours a day with priority routing.',
      'You can tap any number below to dial directly on your mobile device.',
    ],
    helplines: [
      { name: 'National Emergency / Police', number: '112', description: 'All-in-one emergency service' },
      { name: "Women's Safety Helpline", number: '1091', description: 'Dedicated 24/7 women assistance' },
      { name: 'Ambulance / Medical', number: '108', description: 'Free government medical service' },
      { name: 'Nagpur Police Control Room', number: '07122561103', description: 'Direct city desk' },
      { name: 'Nagpur Police Secondary Desk', number: '07122561222', description: 'Alternative control' },
      { name: 'Highway Patrol Helpline', number: '1033', description: 'National & state highway help' },
      { name: 'Fire Emergency', number: '101', description: 'Fire and rescue operations' },
    ],
  },
  {
    id: 'safe_havens_guide',
    title: 'Verified 24/7 Staffed Refuges in Nagpur',
    chipLabel: '🛡️ Safe Havens List',
    iconName: 'ShieldCheck',
    keywords: [
      'safe haven',
      'shelter',
      'where to wait',
      'safe place',
      'open place',
      'thana',
      'police booth',
      'petrol pump',
      'raat ko kahan ruke',
    ],
    severity: 'medium',
    primaryAction: 'Verified facilities with continuous staff, CCTV, and bright perimeter illumination.',
    stepByStep: [
      '1. AIIMS Nagpur 24/7 Trauma Block (MIHAN Area): Complete tertiary emergency with active security gate and continuous illumination.',
      '2. Sitabuldi Police Assistance Booth (Sitabuldi Metro Interchange): 24h manned police desk at the heart of the transit corridor.',
      '3. GMC Nagpur Emergency (Medical Square): Round-the-clock hospital casualty with high night activity.',
      '4. Apollo 24h Pharmacy (Dharampeth): Night dispensing window with lighted street forecourt.',
      '5. HP Auto Fuel Oasis (Near Sitabuldi / Wardha Rd): Brightly lit 24/7 petrol station with water and attendants.',
    ],
    safeHavens: [
      'AIIMS Nagpur 24/7 Trauma Center (MIHAN)',
      'Sitabuldi Police Assistance Booth (Interchange)',
      'Dhantoli Police Station (Central Bazaar Rd)',
      'Apollo 24/7 Pharmacy (Dharampeth)',
      'HP 24/7 Lit Forecourt (Wardha Rd)',
    ],
  },
];

export function findMatchingScenario(query: string): EmergencyScenario | null {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  // 1. Direct ID match
  const byId = EMERGENCY_SCENARIOS.find((s) => s.id === clean);
  if (byId) return byId;

  // 2. Keyword score matching
  let bestScenario: EmergencyScenario | null = null;
  let highestScore = 0;

  for (const s of EMERGENCY_SCENARIOS) {
    let score = 0;
    if (clean.includes(s.title.toLowerCase())) score += 10;

    for (const kw of s.keywords) {
      if (clean.includes(kw.toLowerCase())) {
        score += 5;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestScenario = s;
    }
  }

  return highestScore >= 5 ? bestScenario : null;
}
