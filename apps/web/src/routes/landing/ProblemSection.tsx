export function ProblemSection() {
  const workers = [
    {
      role: 'Security guard',
      need: 'Needs confirmed shelter and verified lighting along walking stretches between posts.',
    },
    {
      role: 'Nurse',
      need: 'Needs predictable feeder transit after emergency ward rotations when metro lines lock.',
    },
    {
      role: 'Delivery rider',
      need: 'Needs active 24/7 fuel bunks and clear detour advice when underpasses close.',
    },
    {
      role: 'Sanitation worker',
      need: 'Needs real-time awareness of street corridors and safe rest points before dawn.',
    },
    {
      role: 'Factory worker',
      need: 'Needs deterministic fallback travel options when industrial shift buses are delayed.',
    },
    {
      role: 'Call-centre agent',
      need: 'Needs verified cab availability or illuminated auto stands for door-to-door transit.',
    },
  ];

  return (
    <section id="problem" className="border-b border-[#E2DED3] dark:border-[#232C3E] bg-[#FFFFFF] dark:bg-[#131822] py-16 sm:py-24 lg:py-28 transition-colors">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {/* Top 2-Column Split: 5 cols / 6 cols offset 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 text-left">
            <h2 className="text-3xl sm:text-[40px] font-bold tracking-[-0.01em] leading-[1.15] text-[#14181D] dark:text-[#F8FAFC]">
              A city built for the daytime.
            </h2>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 space-y-4 text-left text-base leading-relaxed text-[#5B6672] dark:text-[#94A3B8]">
            <p>
              Cities are designed around people who work in the day, but millions of workers live and travel on a completely different schedule.
            </p>
            <p>
              In the middle of the night, a worker may need food, medicine, transport or a safe route home, while existing navigation apps treat night as just a different timestamp on daytime roads.
            </p>
          </div>
        </div>

        {/* Who It Is For Definition List */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-[#E2DED3] dark:border-[#232C3E]">
          <h3 className="text-sm font-semibold text-[#5B6672] dark:text-[#94A3B8] mb-6">
            Who it is for
          </h3>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 divide-y md:divide-y-0 divide-[#E2DED3] dark:divide-[#232C3E]">
            {workers.map((worker) => (
              <div
                key={worker.role}
                className="py-4 border-t border-[#E2DED3] dark:border-[#232C3E] flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4"
              >
                <dt className="font-semibold text-sm text-[#14181D] dark:text-[#F8FAFC] shrink-0 w-36">
                  {worker.role}
                </dt>
                <dd className="text-xs text-[#5B6672] dark:text-[#94A3B8] leading-relaxed">
                  {worker.need}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
