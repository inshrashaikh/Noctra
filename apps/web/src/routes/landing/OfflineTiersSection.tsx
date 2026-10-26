export function OfflineTiersSection() {
  const steps = [
    {
      tier: 'Tier 0',
      title: 'Live data',
      detail: 'Continuous telemetry from municipal SCADA lighting and vehicle feeds. Real-time corridor recalculation.',
      banner: {
        bg: 'bg-[#E6F4F1]',
        border: 'border-[#0F766E]/30',
        text: 'text-[#0F766E]',
        msg: 'Tier 0: Live data active • All feeds current',
      },
    },
    {
      tier: 'Tier 1',
      title: 'Live feeds down: cached data, labels age visibly',
      detail: 'Network or API feeds interrupted. The engine operates autonomously from cached road graphs and facility logs.',
      banner: {
        bg: 'bg-[#FBF1DC]',
        border: 'border-[#8A5A00]/30',
        text: 'text-[#8A5A00]',
        msg: 'Tier 1: Operating from edge cache • Labels aging visibly',
      },
    },
    {
      tier: 'Tier 2',
      title: 'Server unreachable: last plan stays on the phone, emergency number 112 always shown',
      detail: 'Complete signal loss. The active travel plan remains rendered on screen with emergency shelter bearings.',
      banner: {
        bg: 'bg-[#EEECF5]',
        border: 'border-[#5E5780]/40 border-dashed',
        text: 'text-[#5E5780]',
        msg: 'Tier 2: Offline mode • Emergency helpline: 112',
      },
    },
  ];

  return (
    <section id="offline" className="border-b border-[#E2DED3] dark:border-[#232C3E] bg-[#FFFFFF] dark:bg-[#131822] py-16 sm:py-24 lg:py-28 transition-colors">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="max-w-[65ch] space-y-3 text-left mb-16">
          <h2 className="text-3xl sm:text-[40px] font-bold tracking-[-0.01em] leading-[1.15] text-[#14181D] dark:text-[#F8FAFC]">
            Three tiers of degraded.
          </h2>
          <p className="text-base text-[#5B6672] dark:text-[#94A3B8] leading-relaxed">
            Connectivity is volatile late at night. Noctra is engineered to gracefully degrade rather than crashing or showing a white screen.
          </p>
        </div>

        {/* Horizontal Three-Step Diagram Joined by a Thin Line with Nodes (No cards-with-icons) */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-3.5 left-[16%] right-[16%] h-[1px] bg-[#E2DED3] dark:bg-[#232C3E]" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-start">
            {steps.map((step, idx) => (
              <div key={step.tier} className="flex flex-col space-y-4 text-left">
                {/* Node & Step Indicator */}
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#12233A] dark:border-[#38BDF8] bg-[#FFFFFF] dark:bg-[#1A212E] font-mono text-xs font-bold text-[#12233A] dark:text-[#38BDF8] shrink-0 z-10">
                    {idx}
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#5B6672] dark:text-[#94A3B8]">
                    {step.tier}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-[#14181D] dark:text-[#F8FAFC] leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#5B6672] dark:text-[#94A3B8]">
                    {step.detail}
                  </p>
                </div>

                {/* Real UI Fragment Banner in That Tier's Tone */}
                <div
                  className={`mt-2 rounded-lg border p-3 font-mono text-xs ${step.banner.bg} ${step.banner.border} ${step.banner.text}`}
                >
                  {step.banner.msg}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
