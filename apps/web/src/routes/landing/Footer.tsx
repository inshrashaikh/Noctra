export function Footer() {
  return (
    <footer className="border-t border-[#E2DED3] bg-[#FFFFFF] py-14 sm:py-16 text-left">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Logo & Tagline (4 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <svg
                className="h-6 w-6 text-[#12233A]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 12.5A8.5 8.5 0 1 1 11.5 4 6.5 6.5 0 0 0 20 12.5Z" fill="#12233A" fillOpacity="0.12" />
                <circle cx="17.5" cy="8.5" r="2.5" fill="#F2B54A" stroke="#12233A" strokeWidth="1.5" />
              </svg>
              <span className="text-lg font-semibold tracking-tight text-[#14181D]">
                Noctra
              </span>
            </div>
            <p className="text-xs text-[#5B6672] max-w-sm leading-relaxed">
              Navigate the Night. Get Home Safer. A calm, decay-aware decision engine for night-shift workers in Indian cities.
            </p>
          </div>

          {/* Three Link Groups (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-3">
              <span className="font-semibold text-[#14181D]">Product</span>
              <ul className="space-y-2 text-[#5B6672]">
                <li><a href="/dashboard" className="hover:text-[#14181D]">Dashboard</a></li>
                <li><a href="/planner" className="hover:text-[#14181D]">Plan Journey</a></li>
                <li><a href="/services" className="hover:text-[#14181D]">Essential Services</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="font-semibold text-[#14181D]">Methodology</span>
              <ul className="space-y-2 text-[#5B6672]">
                <li><a href="#how-it-works" className="hover:text-[#14181D]">Age Axis</a></li>
                <li><a href="#offline" className="hover:text-[#14181D]">Offline Tiers</a></li>
                <li><a href="#real-vs-simulated" className="hover:text-[#14181D]">Real vs Simulated</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="font-semibold text-[#14181D]">Provenance</span>
              <ul className="space-y-2 text-[#5B6672]">
                <li><a href="/tokens" className="hover:text-[#14181D]">Design Tokens</a></li>
                <li><span>OpenStreetMap</span></li>
                <li><span>CASCADE &apos;26</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-[#E2DED3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#5B6672] font-mono">
          <div>
            CASCADE &apos;26, IIIT Nagpur • © OpenStreetMap contributors
          </div>
          <div>
            Prototype. Data shown is simulated.
          </div>
        </div>
      </div>
    </footer>
  );
}
