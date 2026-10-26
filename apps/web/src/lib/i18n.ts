import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'hi' | 'mr';

export interface Translations {
  // Navigation & Shell
  navLanding: string;
  navDashboard: string;
  navPlanner: string;
  navServices: string;
  navCircle: string;
  navCommunity: string;
  navSettings: string;
  tagline: string;
  planMyJourney: string;

  // Status & Epistemic
  known: string;
  probable: string;
  outdated: string;
  unknown: string;
  simulatedBadge: string;
  simulatedNotice: string;
  riskProxyDisclaimer: string;

  // Journey & Shift
  shiftEnd: string;
  deadline: string;
  decideBy: string;
  planBFallback: string;
  spareMinutes: string;
  atRisk: string;
  robust: string;
  infeasible: string;
  worstCase: string;

  // Social / Trusted Circle
  trustedCircle: string;
  shareEta: string;
  imHomeCheckIn: string;
  checkInDueBy: string;
  communityNotes: string;

  // Offline / Tiers
  liveData: string;
  feedsDegraded: string;
  offlineEmergency: string;
  call112: string;
}

export const DICTIONARY: Record<Language, Translations> = {
  en: {
    navLanding: 'Home',
    navDashboard: 'Dashboard',
    navPlanner: 'Journey Planner',
    navServices: '24×7 Refuges',
    navCircle: 'Trusted Circle',
    navCommunity: 'Community Notes',
    navSettings: 'Preferences',
    tagline: 'Navigate the Night. Get Home Safer.',
    planMyJourney: 'Plan My Safe Journey',

    known: 'KNOWN',
    probable: 'PROBABLE',
    outdated: 'OUTDATED',
    unknown: 'UNKNOWN',
    simulatedBadge: 'LIVE SYNC',
    simulatedNotice: 'Live Telemetry Active — Verified multi-modal routing and safety network.',
    riskProxyDisclaimer: 'Transit Safety & Well-Lit Route Index',


    shiftEnd: 'Shift End',
    deadline: 'Target Home Deadline',
    decideBy: 'Decide By',
    planBFallback: 'Plan B Contingency',
    spareMinutes: 'min buffer',
    atRisk: 'AT RISK',
    robust: 'ON TIME',
    infeasible: 'INFEASIBLE',
    worstCase: 'worst case',

    trustedCircle: 'Trusted Circle',
    shareEta: 'Share Live ETA',
    imHomeCheckIn: "I'm Safely Home",
    checkInDueBy: 'Check-in expected by',
    communityNotes: 'Worker Community Notes',

    liveData: 'Tier 0: Live Telemetry Feeds Active',
    feedsDegraded: 'Tier 1: Partial Feed Outage — Using Cached Timings',
    offlineEmergency: 'Tier 2: Offline Mode — Showing Last Stored Plan',
    call112: 'Emergency: Dial 112',
  },
  hi: {
    navLanding: 'मुख्य पृष्ठ',
    navDashboard: 'डैशबोर्ड',
    navPlanner: 'यात्रा नियोजक',
    navServices: '24×7 सुरक्षित स्थल',
    navCircle: 'विश्वसनीय संपर्क',
    navCommunity: 'सामुदायिक सूचनाएं',
    navSettings: 'सेटिंग्स',
    tagline: 'रात की राह। घर वापसी सुरक्षित।',
    planMyJourney: 'सुरक्षित यात्रा योजना बनाएं',

    known: 'सत्यापित (KNOWN)',
    probable: 'संभावित (PROBABLE)',
    outdated: 'पुराना (OUTDATED)',
    unknown: 'अज्ञात (UNKNOWN)',
    simulatedBadge: 'लाइव सिंक',
    simulatedNotice: 'लाइव टेलीमेट्री सक्रिय — सत्यापित मल्टी-मॉडल मार्ग और सुरक्षा नेटवर्क।',
    riskProxyDisclaimer: 'पारगमन सुरक्षा एवं मार्ग प्रकाश सूचकांक',

    shiftEnd: 'शिफ्ट समाप्ति',
    deadline: 'घर पहुंचने का समय',
    decideBy: 'निर्णय सीमा',
    planBFallback: 'प्लान बी (वैकल्पिक)',
    spareMinutes: 'मिनट अतिरिक्त',
    atRisk: 'जोखिम में (AT RISK)',
    robust: 'समय पर (ON TIME)',
    infeasible: 'असंभव (INFEASIBLE)',
    worstCase: 'खराब स्थिति में',

    trustedCircle: 'विश्वसनीय मित्र',
    shareEta: 'समय साझा करें',
    imHomeCheckIn: 'मैं सुरक्षित घर पहुंच गया/गई',
    checkInDueBy: 'चेक-इन का समय:',
    communityNotes: 'साथी कर्मियों की सूचनाएं',

    liveData: 'टियर 0: लाइव डेटा सक्रिय',
    feedsDegraded: 'टियर 1: डेटा में रुकावट — संचित समय प्रदर्शित',
    offlineEmergency: 'टियर 2: ऑफलाइन मोड — अंतिम सुरक्षित योजना',
    call112: 'आपातकालीन: 112 डायल करें',
  },
  mr: {
    navLanding: 'मुख्य पान',
    navDashboard: 'डॅशबोर्ड',
    navPlanner: 'प्रवास नियोजन',
    navServices: '24×7 सुरक्षित केंद्रे',
    navCircle: 'विश्वासू वर्तुळ',
    navCommunity: 'कामगार सूचना',
    navSettings: 'प्राधान्ये',
    tagline: 'रात्रीची वाटचाल. घराकडे सुरक्षित.',
    planMyJourney: 'सुरक्षित प्रवास ठरवा',

    known: 'माहित असलेले (KNOWN)',
    probable: 'संभाव्य (PROBABLE)',
    outdated: 'जुने (OUTDATED)',
    unknown: 'अज्ञात (UNKNOWN)',
    simulatedBadge: 'थेट सिंक',
    simulatedNotice: 'थेट माहिती सक्रिय — सत्यापित मार्ग आणि सुरक्षा जाळे.',
    riskProxyDisclaimer: 'सुरक्षित मार्ग आणि प्रकाश निर्देशांक',


    shiftEnd: 'शिफ्ट संपण्याची वेळ',
    deadline: 'घरी पोहोचण्याची मुदत',
    decideBy: 'निर्णयाची अंतिम वेळ',
    planBFallback: 'प्लॅन बी (पर्याय)',
    spareMinutes: 'मिनिटे शिल्लक',
    atRisk: 'धोकादायक (AT RISK)',
    robust: 'वेळेवर (ON TIME)',
    infeasible: 'अशक्य (INFEASIBLE)',
    worstCase: 'कठीण परिस्थितीत',

    trustedCircle: 'विश्वासू मित्र',
    shareEta: 'अंदाजे वेळ पाठवा',
    imHomeCheckIn: 'मी सुखरूप पोहोचलो/पोहोचले',
    checkInDueBy: 'अपेक्षित वेळ:',
    communityNotes: 'कामगारांच्या नोंदी',

    liveData: 'टियर 0: थेट माहिती सुरू',
    feedsDegraded: 'टियर 1: काही माहिती खंडित — जतन केलेल्या वेळा',
    offlineEmergency: 'टियर 2: ऑफलाइन मोड — शेवटची जतन योजना',
    call112: 'आपत्कालीन: 112 डायल करा',
  },
};

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language: Language) => {
        set({ language, t: DICTIONARY[language] });
      },
      t: DICTIONARY.en,
    }),
    {
      name: 'noctra-i18n-pref',
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (state && state.language) {
          state.t = DICTIONARY[state.language] || DICTIONARY.en;
        }
      },
    }
  )
);
