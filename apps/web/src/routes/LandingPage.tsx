import { Navbar } from '@/components/common/Navbar';
import { HeroSection } from './landing/HeroSection';
import { ProblemSection } from './landing/ProblemSection';
import { HowNoctraThinks } from './landing/HowNoctraThinks';
import { OfflineTiersSection } from './landing/OfflineTiersSection';
import { RealVsSimulated } from './landing/RealVsSimulated';
import { FinalCta } from './landing/FinalCta';
import { Footer } from './landing/Footer';

/**
 * Landing page — "daylight instrument panel" theme:
 * Calm, precise, engineering-grade landing page for Noctra.
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#14181D]">
      <Navbar currentPath="/" />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowNoctraThinks />
        <OfflineTiersSection />
        <RealVsSimulated />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
