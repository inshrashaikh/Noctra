import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  PhoneCall,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  WifiOff,
  BatteryLow,
} from 'lucide-react';
import { useEmergencyChatbot } from './useEmergencyChatbot';
import { EMERGENCY_SCENARIOS } from './emergencyKnowledgeBase';
import { cn } from '@/lib/cn';

export function EmergencyChatbotModal() {
  const { isOpen, closeChat, messages, sendMessage, selectScenario, clearChat } =
    useEmergencyChatbot();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-chatbot-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative flex flex-col w-full sm:max-w-xl h-[88vh] sm:h-[650px] rounded-t-2xl sm:rounded-2xl border border-noctra-border bg-[#0B0E14] text-[#F8FAFC] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232C3E] bg-[#131822] px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-noctra-infeasible/20 border border-noctra-infeasible/40 text-noctra-infeasible">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="emergency-chatbot-title" className="text-xs font-bold uppercase tracking-wider text-white">
                  Offline SOS Assistant
                </h3>
                <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#232C3E] text-[#38BDF8] border border-[#38BDF8]/30">
                  <WifiOff className="h-2.5 w-2.5" />
                  0% Internet Needed
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8]">
                Instant crisis guidance for night workers in Nagpur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={clearChat}
              className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#1E293B] transition-colors"
              title="Reset Chat"
              aria-label="Reset chat history"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={closeChat}
              className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#1E293B] transition-colors"
              aria-label="Close crisis assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Rapid SOS Quick Dial Bar */}
        <div className="flex items-center justify-between bg-noctra-infeasible/15 border-b border-noctra-infeasible/30 px-4 py-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-white">
            <span className="h-2 w-2 rounded-full bg-noctra-infeasible animate-ping" />
            <span className="font-bold text-noctra-infeasible">Direct SOS Dial:</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="tel:112"
              className="flex items-center gap-1 rounded bg-noctra-infeasible hover:bg-noctra-infeasible/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
            >
              <PhoneCall className="h-3 w-3" />
              <span>Call 112 (Police)</span>
            </a>
            <a
              href="tel:1091"
              className="flex items-center gap-1 rounded bg-[#232C3E] hover:bg-[#334155] border border-[#475569] px-2.5 py-1 text-xs font-bold text-[#38BDF8] shadow-sm transition-transform active:scale-95"
            >
              <PhoneCall className="h-3 w-3" />
              <span>Call 1091 (Women)</span>
            </a>
          </div>
        </div>

        {/* Quick Suggestion Chips Bar */}
        <div className="border-b border-[#232C3E] bg-[#0E131F] px-3 py-2 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {EMERGENCY_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => selectScenario(s.id)}
              className="shrink-0 rounded-full border border-[#232C3E] hover:border-[#38BDF8]/60 bg-[#171E2E] hover:bg-[#1E293B] px-3 py-1 text-[11px] font-medium text-[#E2E8F0] transition-colors whitespace-nowrap active:scale-95"
            >
              {s.chipLabel}
            </button>
          ))}
        </div>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const s = m.scenario;

            return (
              <div
                key={m.id}
                className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
              >
                {/* Chat Bubble */}
                <div
                  className={cn(
                    'max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 text-xs space-y-2.5 leading-relaxed shadow-sm',
                    isUser
                      ? 'bg-[#1E293B] border border-[#334155] text-white rounded-tr-none'
                      : 'bg-[#131822] border border-[#232C3E] text-[#E2E8F0] rounded-tl-none'
                  )}
                >
                  <p className="font-sans text-xs">{m.text}</p>

                  {/* If Bot message has a Scenario breakdown */}
                  {s && (
                    <div className="space-y-3 pt-1 border-t border-[#232C3E]/80">
                      {/* Scenario Title */}
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <Sparkles className="h-3.5 w-3.5 text-[#38BDF8]" />
                        <span>Action Plan: {s.title}</span>
                      </div>

                      {/* Step by Step numbered guide */}
                      {s.stepByStep.length > 0 && (
                        <div className="space-y-1.5 rounded-lg bg-[#0B0E14] border border-[#232C3E] p-3 text-[11px]">
                          <span className="font-bold text-[#38BDF8] uppercase tracking-wider text-[10px] block mb-1">
                            Recommended Immediate Protocol:
                          </span>
                          <ol className="space-y-1.5 list-decimal list-inside text-[#CBD5E1]">
                            {s.stepByStep.map((step, idx) => (
                              <li key={idx} className="leading-normal">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Battery Saver Tip if present */}
                      {s.batteryTip && (
                        <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-200">
                          <BatteryLow className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{s.batteryTip}</span>
                        </div>
                      )}

                      {/* Safe Havens List if present */}
                      {s.safeHavens && s.safeHavens.length > 0 && (
                        <div className="rounded-lg bg-[#0B0E14] border border-[#232C3E] p-2.5 space-y-1 text-[11px]">
                          <span className="font-bold text-[#22C55E] uppercase tracking-wider text-[10px] block">
                            Nearest Verified Safe Havens:
                          </span>
                          <ul className="space-y-1 text-[#94A3B8]">
                            {s.safeHavens.map((sh, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                                <span>{sh}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Direct Dial Helpline Buttons */}
                      {s.helplines && s.helplines.length > 0 && (
                        <div className="pt-1 space-y-1.5">
                          <span className="font-bold text-[#94A3B8] uppercase tracking-wider text-[10px] block">
                            Direct Emergency Dials (Tap to Call):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {s.helplines.map((hl, idx) => (
                              <a
                                key={idx}
                                href={`tel:${hl.number}`}
                                className="flex items-center justify-between rounded-lg border border-[#38BDF8]/40 bg-[#0B0E14] hover:bg-[#1E293B] p-2 text-xs transition-colors group"
                              >
                                <div>
                                  <div className="font-bold text-white group-hover:text-[#38BDF8]">
                                    {hl.name}
                                  </div>
                                  <div className="text-[10px] text-[#94A3B8] font-mono">
                                    {hl.description}
                                  </div>
                                </div>
                                <span className="flex items-center gap-1 font-mono font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded">
                                  <PhoneCall className="h-3 w-3" />
                                  {hl.number}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[9px] font-mono text-[#64748B] mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-[#232C3E] bg-[#131822] p-3 shrink-0 space-y-2"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an emergency question (e.g. 'stranger following me', 'puncture')..."
              className="flex-1 rounded-xl border border-[#232C3E] bg-[#0B0E14] px-3.5 py-2.5 text-xs text-white placeholder-[#64748B] focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8] transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#38BDF8] hover:bg-[#38BDF8]/90 disabled:opacity-40 text-[#0B0E14] font-bold transition-all active:scale-95 shrink-0"
              aria-label="Send emergency question"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#64748B] px-1 font-mono">
            <span>Deterministic • Instant 0ms Local Evaluation</span>
            <span>Nagpur Night-Shift Worker Network</span>
          </div>
        </form>
      </div>
    </div>
  );
}
