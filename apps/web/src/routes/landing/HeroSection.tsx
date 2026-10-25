import { EvidenceChip } from '@/components/common/EvidenceChip';
import { NightRibbon } from '@/features/routes/NightRibbon';

export function HeroSection() {
  return (
    <section className="border-b border-[#E2DED3] bg-[#F7F6F2] py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          {/* Left Column (5 cols, left-aligned) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-[-0.01em] leading-[1.15] text-[#14181D]">
              At 2:30 AM, the bus may or may not be running. Noctra tells you which.
            </h1>

            <p className="text-lg sm:text-xl leading-relaxed text-[#5B6672] max-w-[65ch]">
              Plan your way home with the worst case in view, a clear moment to switch plans, and an honest label on every fact.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="/planner"
                className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#12233A] px-6 text-sm font-semibold text-[#FFFFFF] hover:bg-[#1B3252] transition-colors"
              >
                Plan My Journey
              </a>
              <a
                href="#how-it-works"
                className="inline-flex h-11 items-center justify-center text-sm font-semibold text-[#14181D] hover:underline transition-colors"
              >
                See how it decides →
              </a>
            </div>

            <div className="pt-2 font-mono text-xs text-[#5B6672]">
              Built for CASCADE &apos;26, IIIT Nagpur. Prototype with simulated data.
            </div>
          </div>

          {/* Right Column (7 cols): Hero Product Preview Card */}
          <div className="lg:col-span-7">
            <div
              className="rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-6 space-y-4"
              style={{
                boxShadow: '0 1px 2px rgba(20,24,29,.06), 0 8px 24px rgba(20,24,29,.06)',
              }}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between border-b border-[#E2DED3] pb-3 text-xs">
                <div className="flex items-center gap-2 font-mono text-[#14181D]">
                  <span className="font-semibold">Shift:</span>
                  <span>Ends 2:15 AM</span>
                  <span className="text-[#5B6672]">→</span>
                  <span>Home by 3:00 AM</span>
                </div>
                <span className="rounded bg-[#FBF1DC] px-2 py-0.5 font-mono text-[10px] font-bold text-[#8A5A00] border border-[#8A5A00]/20">
                  SIMULATED
                </span>
              </div>

              {/* Hand-built SVG Map 320px high */}
              <div className="relative h-[320px] w-full rounded-lg border border-[#E2DED3] bg-[#F7F6F2] overflow-hidden">
                <svg
                  className="h-full w-full select-none"
                  viewBox="0 0 540 320"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Corridor map representation"
                >
                  {/* Background base */}
                  <rect width="540" height="320" fill="#F7F6F2" />

                  {/* Park polygon */}
                  <path
                    d="M 30,20 Q 80,10 130,40 T 170,110 T 120,170 T 40,130 Z"
                    fill="#ECE8DC"
                  />

                  {/* River curve */}
                  <path
                    d="M 200,0 C 230,80 210,180 270,320"
                    stroke="#DCE3EA"
                    strokeWidth="16"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Street grid - Secondary */}
                  <line x1="0" y1="90" x2="540" y2="90" stroke="#E5E0D4" strokeWidth="2" />
                  <line x1="0" y1="180" x2="540" y2="180" stroke="#E5E0D4" strokeWidth="2" />
                  <line x1="0" y1="260" x2="540" y2="260" stroke="#E5E0D4" strokeWidth="2" />
                  <line x1="120" y1="0" x2="120" y2="320" stroke="#E5E0D4" strokeWidth="2" />
                  <line x1="280" y1="0" x2="280" y2="320" stroke="#E5E0D4" strokeWidth="2" />
                  <line x1="420" y1="0" x2="420" y2="320" stroke="#E5E0D4" strokeWidth="2" />

                  {/* Street grid - Primary Arterials */}
                  <line x1="0" y1="140" x2="540" y2="140" stroke="#DDD6C7" strokeWidth="4" />
                  <line x1="200" y1="0" x2="380" y2="320" stroke="#DDD6C7" strokeWidth="4" />

                  {/* Single Navy Route Line (3px, navy #12233A) */}
                  <path
                    d="M 70,250 L 140,250 L 220,180 L 290,140 L 390,140 L 460,70"
                    stroke="#12233A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />

                  {/* Facility 1: 24h Medical Checkpoint */}
                  <g transform="translate(220, 180)">
                    <circle cx="0" cy="0" r="9" fill="#E6F4F1" stroke="#0F766E" strokeWidth="1.5" />
                    <text x="0" y="3.5" textAnchor="middle" fill="#0F766E" fontSize="9" fontWeight="bold">+</text>
                    <text x="12" y="3" fill="#5B6672" fontSize="9" fontFamily="monospace">Medical (Open 24h)</text>
                  </g>

                  {/* Facility 2: Sitabuldi Police Post */}
                  <g transform="translate(390, 140)">
                    <circle cx="0" cy="0" r="9" fill="#E8F0FA" stroke="#1D5FA8" strokeWidth="1.5" />
                    <text x="0" y="3.5" textAnchor="middle" fill="#1D5FA8" fontSize="8" fontWeight="bold">P</text>
                    <text x="12" y="3" fill="#5B6672" fontSize="9" fontFamily="monospace">Police Post</text>
                  </g>

                  {/* Origin Marker */}
                  <g transform="translate(70, 250)">
                    <circle cx="0" cy="0" r="7" fill="#FFFFFF" stroke="#12233A" strokeWidth="3" />
                    <text x="-10" y="18" fill="#14181D" fontSize="10" fontFamily="monospace" fontWeight="bold">AIIMS (2:15 AM)</text>
                  </g>

                  {/* Destination Marker */}
                  <g transform="translate(460, 70)">
                    <circle cx="0" cy="0" r="7" fill="#12233A" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="-25" y="-12" fill="#14181D" fontSize="10" fontFamily="monospace" fontWeight="bold">Home (3:00 AM)</text>
                  </g>
                </svg>

                <div className="absolute bottom-2 left-2 rounded bg-[#FFFFFF]/90 px-2 py-0.5 font-mono text-[10px] text-[#5B6672] border border-[#E2DED3]">
                  Wardha Road Corridor • 5.2 km
                </div>
              </div>

              {/* Night Ribbon Timeline */}
              <NightRibbon
                shiftEndTime="2:15"
                deadlineTime="3:00"
                decideByTime="2:32"
                spareMinutes={14}
              />

              {/* Two Evidence Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E2DED3]/60">
                <EvidenceChip
                  label="PROBABLE"
                  age="12 min ago"
                  subject="Road open"
                  source="Community report"
                />
                <EvidenceChip
                  label="UNKNOWN"
                  subject="Cab availability"
                  age="No driver ping"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
