import { Link } from '@tanstack/react-router';

export function Footer() {
  return (
    <footer className="border-t border-[#E2DED3] dark:border-[#232C3E] bg-[#FFFFFF] dark:bg-[#131822] py-14 sm:py-16 text-left transition-colors">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Logo & Tagline (4 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <svg
                className="h-6 w-6 text-[#12233A] dark:text-[#38BDF8]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 12.5A8.5 8.5 0 1 1 11.5 4 6.5 6.5 0 0 0 20 12.5Z" fill="currentColor" fillOpacity="0.15" />
                <circle cx="17.5" cy="8.5" r="2.5" fill="#F2B54A" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="text-lg font-semibold tracking-tight text-[#14181D] dark:text-[#F8FAFC]">
                Noctra
              </span>
            </div>
            <p className="text-xs text-[#5B6672] dark:text-[#94A3B8] max-w-sm leading-relaxed">
              Navigate the Night. Get Home Safer. A calm, decay-aware decision engine for night-shift workers in Indian cities.
            </p>
          </div>

          {/* Three Link Groups (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-3">
              <span className="font-semibold text-[#14181D] dark:text-[#F8FAFC]">Product</span>
              <ul className="space-y-2 text-[#5B6672] dark:text-[#94A3B8]">
                <li><Link to="/dashboard" className="hover:text-[#14181D] dark:hover:text-[#F8FAFC]">Dashboard</Link></li>
                <li><Link to="/planner" className="hover:text-[#14181D] dark:hover:text-[#F8FAFC]">Plan Journey</Link></li>
                <li><Link to="/services" className="hover:text-[#14181D] dark:hover:text-[#F8FAFC]">Essential Services</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="font-semibold text-[#14181D] dark:text-[#F8FAFC]">Methodology</span>
              <ul className="space-y-2 text-[#5B6672] dark:text-[#94A3B8]">
                <li><a href="#how-it-works" className="hover:text-[#14181D] dark:hover:text-[#F8FAFC]">Age Axis</a></li>
                <li><a href="#offline" className="hover:text-[#14181D] dark:hover:text-[#F8FAFC]">Offline Tiers</a></li>
                <li><a href="#night-grid" className="hover:text-[#14181D] dark:hover:text-[#F8FAFC]">Night Grid</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="font-semibold text-[#14181D] dark:text-[#F8FAFC]">Provenance</span>
              <ul className="space-y-2 text-[#5B6672] dark:text-[#94A3B8]">
                <li><Link to="/tokens" className="hover:text-[#14181D] dark:hover:text-[#F8FAFC]">Design Tokens</Link></li>
                <li><span>OpenStreetMap</span></li>
                <li><span>Nagpur Smart Mobility</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-[#E2DED3] dark:border-[#232C3E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#5B6672] dark:text-[#94A3B8] font-mono">
          <div>
            Nagpur Metro &amp; City Grid • © OpenStreetMap contributors
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Noctra Night Mobility Intelligence Active
          </div>
        </div>
      </div>
    </footer>
  );
}

