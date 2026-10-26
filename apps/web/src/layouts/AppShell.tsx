import { Outlet, useLocation } from '@tanstack/react-router';
import { Navbar } from '@/components/common/Navbar';
import { BottomNav } from '@/components/common/BottomNav';
import { AlertsDrawer } from '@/features/alerts/AlertsDrawer';
import { EmergencyChatbotModal } from '@/features/chatbot/EmergencyChatbotModal';
import { FloatingSOSButton } from '@/features/chatbot/FloatingSOSButton';
import { cn } from '@/lib/cn';

/**
 * App shell for the planner, dashboard, and services.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const isPlanner = pathname === '/planner';

  return (
    <div
      className={cn(
        'flex flex-col bg-[#F7F6F2] dark:bg-[#0B0E14] text-[#14181D] dark:text-[#F8FAFC] transition-colors',
        isPlanner ? 'h-screen md:h-dvh overflow-hidden' : 'min-h-screen'
      )}
    >
      <Navbar mode="app" currentPath={pathname} />
      <main
        className={cn(
          'flex-1 flex flex-col',
          isPlanner ? 'h-full min-h-0 overflow-hidden pb-14 md:pb-0' : 'pb-14 md:pb-0'
        )}
      >
        <Outlet />
      </main>

      <BottomNav currentPath={pathname} />
      <AlertsDrawer />
      <FloatingSOSButton />
      <EmergencyChatbotModal />
    </div>
  );
}
