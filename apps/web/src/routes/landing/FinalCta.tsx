import { Link } from '@tanstack/react-router';

export function FinalCta() {
  return (
    <section className="border-b border-[#E2DED3] dark:border-[#232C3E] bg-[#F1EFE8] dark:bg-[#1A212E] py-16 sm:py-20 transition-colors">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 text-left max-w-[65ch]">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14181D] dark:text-[#F8FAFC]">
              Know your way home before you leave.
            </h2>
            <p className="text-sm text-[#5B6672] dark:text-[#94A3B8]">
              Set your shift departure window, check route certainty, and lock your decide-by moment.
            </p>
          </div>

          <Link
            to="/planner"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-[10px] bg-[#12233A] dark:bg-[#38BDF8] px-6 text-sm font-semibold text-[#FFFFFF] dark:text-[#0B0E14] hover:bg-[#1B3252] dark:hover:bg-[#0EA5E9] transition-colors"
          >
            Plan My Journey
          </Link>
        </div>
      </div>
    </section>
  );
}
