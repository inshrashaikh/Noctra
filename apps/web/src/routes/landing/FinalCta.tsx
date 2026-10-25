export function FinalCta() {
  return (
    <section className="border-b border-[#E2DED3] bg-[#F1EFE8] py-16 sm:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 text-left max-w-[65ch]">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14181D]">
              Know your way home before you leave.
            </h2>
            <p className="text-sm text-[#5B6672]">
              Set your shift departure window, check route certainty, and lock your decide-by moment.
            </p>
          </div>

          <a
            href="/dashboard"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-[10px] bg-[#12233A] px-6 text-sm font-semibold text-[#FFFFFF] hover:bg-[#1B3252] transition-colors"
          >
            Plan My Journey
          </a>
        </div>
      </div>
    </section>
  );
}
