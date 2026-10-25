import { Outlet, useLocation } from '@tanstack/react-router';
import { Navbar } from '@/components/common/Navbar';
import { AlertsDrawer } from '@/features/alerts/AlertsDrawer';

/**
 * App shell for the planner, dashboard, and services.
 */
export function AppShell() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F6F2] text-[#14181D]">
      <Navbar mode="app" currentPath={pathname} />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <AlertsDrawer />
    </div>
  );
}
