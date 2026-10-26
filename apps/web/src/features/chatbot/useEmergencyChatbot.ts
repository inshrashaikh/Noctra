import { create } from 'zustand';
import {
  EMERGENCY_SCENARIOS,
  findMatchingScenario,
  type EmergencyScenario,
} from './emergencyKnowledgeBase';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  scenario?: EmergencyScenario;
  timestamp: string;
}

interface EmergencyChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  openChat: (initialPrompt?: string) => void;
  closeChat: () => void;
  sendMessage: (text: string) => void;
  selectScenario: (scenarioId: string) => void;
  clearChat: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  sender: 'bot',
  text: 'Hello. I am Noctra Offline SOS Guide — your 100% offline crisis assistant for night-shift workers in Nagpur. No internet needed. Select an emergency below or type your situation.',
  timestamp: 'Just now',
};

export const useEmergencyChatbot = create<EmergencyChatbotState>((set, get) => ({
  isOpen: false,
  messages: [WELCOME_MESSAGE],

  openChat: (initialPrompt) => {
    set({ isOpen: true });
    if (initialPrompt) {
      get().sendMessage(initialPrompt);
    }
  },

  closeChat: () => set({ isOpen: false }),

  clearChat: () => set({ messages: [WELCOME_MESSAGE] }),

  selectScenario: (scenarioId: string) => {
    const scenario = EMERGENCY_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: scenario.chipLabel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: scenario.primaryAction,
      scenario,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      messages: [...state.messages, userMsg, botMsg],
    }));
  },

  sendMessage: (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const matched = findMatchingScenario(trimmed);

    let botMsg: ChatMessage;
    if (matched) {
      botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: matched.primaryAction,
        scenario: matched,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } else {
      // General safety protocol fallback
      botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'I could not match your exact words, but your safety is first priority: 1) Move to lit arterial roads (Wardha Rd, Central Ave). 2) Dial 112 for Police or 1091 for Women Helpline. 3) Seek refuge at 24/7 AIIMS/GMC Hospital or nearest police booth.',
        scenario: EMERGENCY_SCENARIOS.find((s) => s.id === 'helpline_numbers'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    set((state) => ({
      messages: [...state.messages, userMsg, botMsg],
    }));
  },
}));
