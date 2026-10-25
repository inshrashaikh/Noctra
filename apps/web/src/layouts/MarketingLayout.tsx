import { Outlet } from '@tanstack/react-router';

/**
 * Marketing layout for landing page and public token previews.
 */
export function MarketingLayout() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#14181D] flex flex-col">
      <Outlet />
    </div>
  );
}
