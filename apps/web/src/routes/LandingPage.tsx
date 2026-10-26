import { Navbar } from '@/components/common/Navbar';
import { BottomNav } from '@/components/common/BottomNav';
import { AlertsDrawer } from '@/features/alerts/AlertsDrawer';
import { EmergencyChatbotModal } from '@/features/chatbot/EmergencyChatbotModal';
import { FloatingSOSButton } from '@/features/chatbot/FloatingSOSButton';
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
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#0B0E14] text-[#14181D] dark:text-[#F8FAFC] pb-14 md:pb-0 transition-colors">
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
      <BottomNav currentPath="/" />
      <AlertsDrawer />
      <FloatingSOSButton />
      <EmergencyChatbotModal />
    </div>
  );
}
