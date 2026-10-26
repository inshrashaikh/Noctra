import { Link, useLocation } from '@tanstack/react-router';
import { Navigation, LayoutDashboard, Cross, Bell, ShieldAlert } from 'lucide-react';
import { useAlerts } from '@/features/alerts/useAlerts';
import { useEmergencyChatbot } from '@/features/chatbot/useEmergencyChatbot';
import { cn } from '@/lib/cn';

interface BottomNavProps {
  currentPath?: string;
}

export function BottomNav({ currentPath: propPath }: BottomNavProps) {
  const location = useLocation();
  const currentPath = propPath || location.pathname;
  const { alerts, setIsDrawerOpen } = useAlerts();

  const navItems = [
    { label: 'Plan', href: '/planner', icon: Navigation },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Services', href: '/services', icon: Cross },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E2DED3] dark:border-[#232C3E] bg-[#FFFFFF] dark:bg-[#131822] md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-colors"
      aria-label="Mobile Navigation Bar"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.href ||
            (item.href !== '/' && currentPath.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-all select-none cursor-pointer active:scale-95',
                isActive
                  ? 'text-[#12233A] dark:text-[#38BDF8]'
                  : 'text-[#5B6672] dark:text-[#94A3B8] hover:text-[#14181D] dark:hover:text-[#F8FAFC]'
              )}
            >
              <div
                className={cn(
                  'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                  isActive
                    ? 'bg-[#12233A]/10 dark:bg-[#38BDF8]/15 text-[#12233A] dark:text-[#38BDF8]'
                    : 'text-[#5B6672] dark:text-[#94A3B8]'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive && 'stroke-[2.5]')} />
              </div>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* SOS Guide Emergency Button */}
        <button
          type="button"
          onClick={() => useEmergencyChatbot.getState().openChat()}
          className="flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold text-rose-500 hover:text-rose-400 transition-all select-none cursor-pointer active:scale-95"
          aria-label="Open SOS Crisis Assistant"
        >
          <div className="flex h-7 w-12 items-center justify-center rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="leading-none font-bold">SOS</span>
        </button>

        {/* Alerts button */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold text-[#5B6672] dark:text-[#94A3B8] hover:text-[#14181D] dark:hover:text-[#F8FAFC] transition-all select-none cursor-pointer active:scale-95 relative"
        >
          <div className="flex h-7 w-12 items-center justify-center rounded-full relative">
            <Bell className="h-4 w-4" />
            {alerts.length > 0 && (
              <span className="absolute top-0.5 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#12233A] dark:bg-[#38BDF8] px-1 font-mono text-[9px] font-bold text-white dark:text-[#0B0E14]">
                {alerts.length}
              </span>
            )}
          </div>
          <span className="leading-none">Alerts</span>
        </button>
      </div>
    </nav>
  );
}
