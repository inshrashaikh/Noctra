import { Outlet, useLocation } from '@tanstack/react-router';
import { Navbar } from '@/components/common/Navbar';
import { BottomNav } from '@/components/common/BottomNav';
import { AlertsDrawer } from '@/features/alerts/AlertsDrawer';
import { EmergencyChatbotModal } from '@/features/chatbot/EmergencyChatbotModal';

/**
 * App shell for the planner, dashboard, and services.
 */
export function AppShell() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F6F2] dark:bg-[#0B0E14] text-[#14181D] dark:text-[#F8FAFC] transition-colors">
      <Navbar mode="app" currentPath={pathname} />
      <main className="flex-1 flex flex-col pb-20 md:pb-12">
        <Outlet />
      </main>

      <BottomNav currentPath={pathname} />
      <AlertsDrawer />
      <EmergencyChatbotModal />
    </div>
  );
}
