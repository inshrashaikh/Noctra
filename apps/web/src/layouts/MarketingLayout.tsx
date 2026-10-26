import { Outlet } from '@tanstack/react-router';

/**
 * Marketing layout for landing page and public token previews.
 */
export function MarketingLayout() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#0B0E14] text-[#14181D] dark:text-[#F8FAFC] flex flex-col transition-colors">
      <Outlet />
    </div>
  );
}

