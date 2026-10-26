import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  PhoneCall,
  ShieldAlert,
  RotateCcw,
  WifiOff,
  BatteryLow,
  Copy,
  Check,
  ChevronRight,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { useEmergencyChatbot } from './useEmergencyChatbot';
import { EMERGENCY_SCENARIOS, type EmergencyScenario } from './emergencyKnowledgeBase';
import { cn } from '@/lib/cn';

export function EmergencyChatbotModal() {
  const { isOpen, closeChat, messages, sendMessage, selectScenario, clearChat } =
    useEmergencyChatbot();
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const handleCopySms = (scenario: EmergencyScenario) => {
    const text = `EMERGENCY SOS (Noctra): I am stranded in Nagpur. Situation: ${scenario.title}. Need immediate check-in or assistance. If cannot reach me, please dial 112.`;
    navigator.clipboard.writeText(text);
    setCopiedId(scenario.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-chatbot-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative flex flex-col w-full max-w-xl h-[92vh] sm:h-[680px] rounded-2xl border border-noctra-border bg-noctra-surface text-noctra-text shadow-2xl overflow-hidden">
        {/* Top Accent Strip matching Noctra design */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-rose-500 to-sky-400 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-noctra-border bg-noctra-surface px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="emergency-chatbot-title" className="text-sm font-bold tracking-tight text-white">
                  Noctra SOS Crisis Guide
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <WifiOff className="h-2.5 w-2.5" />
                  Offline
                </span>
              </div>
              <p className="text-[11px] text-noctra-muted">
                Immediate deterministic night-worker protocols in Nagpur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={clearChat}
              className="p-2 text-noctra-muted hover:text-white rounded-lg hover:bg-noctra-raised transition-colors"
              title="Reset Conversation"
              aria-label="Reset chat history"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={closeChat}
              className="p-2 text-noctra-muted hover:text-white rounded-lg hover:bg-noctra-raised transition-colors"
              aria-label="Close crisis assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Instant Lifeline Speed-Dial Bar */}
        <div className="grid grid-cols-3 gap-1.5 p-2 bg-noctra-bg border-b border-noctra-border shrink-0">
          <a
            href="tel:112"
            className="flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Call 112 (Police)</span>
          </a>
          <a
            href="tel:1091"
            className="flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Call 1091 (Women)</span>
          </a>
          <a
            href="tel:108"
            className="flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Call 108 (Medical)</span>
          </a>
        </div>

        {/* Quick Situation Grid (Visible when conversation is short or at top) */}
        {messages.length <= 1 && (
          <div className="p-3 bg-noctra-surface border-b border-noctra-border shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-noctra-muted mb-2 px-1">
              Select Your Situation For Immediate Action:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {EMERGENCY_SCENARIOS.slice(0, 8).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectScenario(s.id)}
                  className="flex items-center justify-between p-2 rounded-lg border border-noctra-border bg-noctra-raised hover:border-noctra-accent/60 hover:bg-noctra-raised/80 text-left transition-all group"
                >
                  <span className="text-xs font-semibold text-noctra-text group-hover:text-noctra-accent truncate">
                    {s.chipLabel}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-noctra-muted group-hover:text-noctra-accent shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const s = m.scenario;

            return (
              <div
                key={m.id}
                className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
              >
                {/* Bubble */}
                <div
                  className={cn(
                    'max-w-[94%] sm:max-w-[88%] rounded-2xl p-3.5 text-xs space-y-3 leading-relaxed shadow-sm',
                    isUser
                      ? 'bg-noctra-raised border border-noctra-accent/40 text-white rounded-tr-none'
                      : 'bg-noctra-raised border border-noctra-border text-noctra-text rounded-tl-none'
                  )}
                >
                  <p className="font-sans text-xs">{m.text}</p>

                  {/* Rich Crisis Guidance Block */}
                  {s && (
                    <div className="space-y-3 pt-2 border-t border-noctra-border/60">
                      {/* Scenario Title & Primary Action */}
                      <div className="flex items-start gap-2 rounded-xl bg-black/40 border border-white/5 p-3">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="font-bold text-white text-xs">{s.title}</div>
                          <div className="text-[11px] text-noctra-accent font-medium">
                            {s.primaryAction}
                          </div>
                        </div>
                      </div>

                      {/* Numbered Steps */}
                      {s.stepByStep.length > 0 && (
                        <div className="space-y-2 rounded-xl bg-noctra-surface border border-noctra-border p-3">
                          <span className="font-bold text-noctra-text uppercase tracking-wider text-[10px] block">
                            Action Protocol (Step-by-Step):
                          </span>
                          <ol className="space-y-2 text-[11px] text-noctra-muted list-decimal list-inside">
                            {s.stepByStep.map((step, idx) => (
                              <li key={idx} className="leading-snug">
                                <span className="text-white/90">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Battery Alert Tip */}
                      {s.batteryTip && (
                        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-300">
                          <BatteryLow className="h-4 w-4 text-amber-400 shrink-0" />
                          <span>{s.batteryTip}</span>
                        </div>
                      )}

                      {/* Safe Havens In Nagpur */}
                      {s.safeHavens && s.safeHavens.length > 0 && (
                        <div className="rounded-xl bg-noctra-surface border border-noctra-border p-3 space-y-1.5 text-[11px]">
                          <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            Verified Safe Havens in Nagpur:
                          </span>
                          <div className="space-y-1 pt-1">
                            {s.safeHavens.map((sh, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-white/90">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <span>{sh}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* One-Tap Direct Helplines */}
                      {s.helplines && s.helplines.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="font-bold text-noctra-muted uppercase tracking-wider text-[10px] block">
                            Direct Emergency Dials:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {s.helplines.map((hl, idx) => (
                              <a
                                key={idx}
                                href={`tel:${hl.number}`}
                                className="flex items-center justify-between p-2 rounded-lg bg-noctra-surface hover:bg-noctra-bg border border-noctra-border text-xs transition-colors group"
                              >
                                <div>
                                  <div className="font-bold text-white group-hover:text-noctra-accent transition-colors">
                                    {hl.name}
                                  </div>
                                  <div className="text-[10px] text-noctra-muted font-mono">
                                    {hl.description}
                                  </div>
                                </div>
                                <span className="flex items-center gap-1 font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                                  <PhoneCall className="h-3 w-3" />
                                  {hl.number}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 1-Tap Copy Emergency SOS SMS */}
                      <button
                        type="button"
                        onClick={() => handleCopySms(s)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-noctra-border bg-noctra-surface hover:bg-noctra-bg text-xs font-semibold text-noctra-text transition-colors"
                      >
                        {copiedId === s.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied SOS SMS to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-noctra-accent" />
                            <span>Copy 1-Tap Emergency SMS to Family</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[9px] font-mono text-noctra-muted mt-1 px-1">
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
          className="border-t border-noctra-border bg-noctra-surface p-3 shrink-0 space-y-2"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an emergency question (e.g. 'stranger following me', 'puncture')..."
              className="flex-1 rounded-xl border border-noctra-border bg-noctra-bg px-3.5 py-2.5 text-xs text-white placeholder-noctra-muted focus:border-noctra-accent focus:outline-none focus:ring-1 focus:ring-noctra-accent transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-noctra-accent hover:bg-noctra-accent-hover disabled:opacity-40 text-noctra-bg font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
              aria-label="Send emergency question"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-noctra-muted px-1 font-mono">
            <span>Deterministic • Instant Local Resolution</span>
            <span>Nagpur Night-Worker Safety Grid</span>
          </div>
        </form>
      </div>
    </div>
  );
}
