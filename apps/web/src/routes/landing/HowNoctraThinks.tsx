import { AgeAxis } from '@/features/evidence/AgeAxis';

export function HowNoctraThinks() {
  return (
    <section id="how-it-works" className="border-b border-[#E2DED3] bg-[#F7F6F2] py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="max-w-[65ch] space-y-3 text-left mb-12">
          <h2 className="text-3xl sm:text-[40px] font-bold tracking-[-0.01em] leading-[1.15] text-[#14181D]">
            Every fact carries its age.
          </h2>
          <p className="text-base text-[#5B6672] leading-relaxed">
            Rather than showing arbitrary safety scores or pretending all information is equally reliable, every claim in Noctra carries an explicit epistemic label and decay window.
          </p>
        </div>

        {/* Age Axis Centrepiece */}
        <AgeAxis />
      </div>
    </section>
  );
}
