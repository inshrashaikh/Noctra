import { describe, it, expect, beforeEach } from 'vitest';
import {
  EMERGENCY_SCENARIOS,
  findMatchingScenario,
} from '@/features/chatbot/emergencyKnowledgeBase';
import { useEmergencyChatbot } from '@/features/chatbot/useEmergencyChatbot';

describe('Offline Emergency Chatbot Knowledge Base & Logic', () => {
  beforeEach(() => {
    useEmergencyChatbot.getState().clearChat();
    useEmergencyChatbot.getState().closeChat();
  });

  it('matches crisis scenarios by keywords accurately and deterministically', () => {
    // Stranded
    const stranded1 = findMatchingScenario('I am stranded alone at 2am');
    expect(stranded1?.id).toBe('stranded_alone');
    const stranded2 = findMatchingScenario('gadi nahi mil rahi road pe');
    expect(stranded2?.id).toBe('stranded_alone');

    // Being followed / safety
    const followed1 = findMatchingScenario('someone is following me');
    expect(followed1?.id).toBe('being_followed');
    const followed2 = findMatchingScenario('feeling unsafe on dark street');
    expect(followed2?.id).toBe('being_followed');

    // Breakdown
    const breakdown1 = findMatchingScenario('scooter puncture ho gaya');
    expect(breakdown1?.id).toBe('vehicle_breakdown');
    const breakdown2 = findMatchingScenario('two wheeler flat tyre');
    expect(breakdown2?.id).toBe('vehicle_breakdown');

    // Battery dying
    const battery1 = findMatchingScenario('phone battery dying low battery');
    expect(battery1?.id).toBe('battery_dying');

    // Medical
    const medical1 = findMatchingScenario('bleeding accident need doctor');
    expect(medical1?.id).toBe('medical_emergency');

    // Helplines
    const helplines1 = findMatchingScenario('what is the police helpline number');
    expect(helplines1?.id).toBe('helpline_numbers');
  });

  it('includes verified Nagpur emergency numbers (112, 1091, 108)', () => {
    const helplines = EMERGENCY_SCENARIOS.find((s) => s.id === 'helpline_numbers');
    expect(helplines).toBeDefined();

    const numbers = helplines?.helplines?.map((h) => h.number) || [];
    expect(numbers).toContain('112'); // National Police
    expect(numbers).toContain('1091'); // Women's Helpline
    expect(numbers).toContain('108'); // Ambulance
  });

  it('manages chatbot UI state, scenario selection, and conversation messages', () => {
    const store = useEmergencyChatbot.getState();
    expect(store.isOpen).toBe(false);
    expect(store.messages.length).toBe(1); // Welcome message

    // Open chat
    store.openChat();
    expect(useEmergencyChatbot.getState().isOpen).toBe(true);

    // Select scenario chip
    store.selectScenario('stranded_alone');
    let state = useEmergencyChatbot.getState();
    expect(state.messages.length).toBe(3); // welcome + user + bot
    expect(state.messages[1].sender).toBe('user');
    expect(state.messages[2].sender).toBe('bot');
    expect(state.messages[2].scenario?.id).toBe('stranded_alone');
    expect(state.messages[2].scenario?.stepByStep.length).toBeGreaterThanOrEqual(3);

    // Send custom question
    store.sendMessage('scooter puncture');
    state = useEmergencyChatbot.getState();
    expect(state.messages.length).toBe(5);
    expect(state.messages[4].scenario?.id).toBe('vehicle_breakdown');

    // Close chat
    store.closeChat();
    expect(useEmergencyChatbot.getState().isOpen).toBe(false);

    // Clear chat
    store.clearChat();
    expect(useEmergencyChatbot.getState().messages.length).toBe(1);
  });
});
