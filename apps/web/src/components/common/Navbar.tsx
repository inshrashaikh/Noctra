import { useState } from 'react';
import { Menu, X, Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from '@/features/settings/useSettings';
import { cn } from '@/lib/cn';

export interface NavbarProps {
  currentPath?: string;
  mode?: 'marketing' | 'app';
}

export function Navbar({ currentPath = '/', mode = 'marketing' }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setIsSettingsOpen } = useSettings();

  const marketingLinks = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Offline', href: '#offline' },
    { label: 'Real vs Simulated', href: '#real-vs-simulated' },
  ];

  const appLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Plan journey', href: '/planner' },
    { label: 'Services', href: '/services' },
  ];

  const links = mode === 'app' ? appLinks : marketingLinks;

  return (
    <header className="sticky top-0 z-40 h-[64px] w-full border-b border-[#E2DED3] bg-[#FFFFFF]">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
        {/* Left Zone: Logo */}
        <div className="flex shrink-0 items-center">
          <a href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            {/* SVG Crescent-and-Lamp Mark (No icon circle) */}
            <svg
              className="h-6 w-6 text-[#12233A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 12.5A8.5 8.5 0 1 1 11.5 4 6.5 6.5 0 0 0 20 12.5Z" fill="#12233A" fillOpacity="0.12" />
              <circle cx="17.5" cy="8.5" r="2.5" fill="#F2B54A" stroke="#12233A" strokeWidth="1.5" />
            </svg>
            <span className="text-lg font-semibold tracking-tight text-[#14181D]">
              Noctra
            </span>
          </a>
        </div>

        {/* Center Zone: Nav Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {links.map((link) => {
            const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
            return (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex h-10 items-center px-3 text-sm font-semibold transition-colors',
                  isActive
                    ? 'text-[#12233A] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#12233A]'
                    : 'text-[#5B6672] hover:text-[#14181D]'
                )}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right Zone: Actions (max 2 items) */}
        <div className="hidden md:flex items-center gap-3">
          {mode === 'app' && (
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#E2DED3] bg-[#FFFFFF] text-[#5B6672] hover:text-[#14181D] hover:bg-[#F7F6F2] transition-colors"
              aria-label="Settings"
            >
              <SettingsIcon className="h-4 w-4" />
            </button>
          )}

          <a
            href="/planner"
            className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[#12233A] px-5 text-sm font-semibold text-[#FFFFFF] hover:bg-[#1B3252] transition-colors"
          >
            Plan My Journey
          </a>
        </div>

        {/* Mobile Hamburger Zone (< 768px) */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#E2DED3] bg-[#FFFFFF] text-[#5B6672] hover:text-[#14181D] transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Full-width Mobile Sheet (< 768px) */}
      {isMobileMenuOpen && (
        <div className="border-b border-[#E2DED3] bg-[#FFFFFF] px-4 py-4 md:hidden space-y-3">
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex h-10 items-center rounded-md px-3 text-sm font-semibold text-[#5B6672] hover:bg-[#F1EFE8] hover:text-[#14181D]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-2 border-t border-[#E2DED3] flex flex-col gap-2">
            {mode === 'app' && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#E2DED3] bg-[#FFFFFF] text-sm font-semibold text-[#5B6672]"
              >
                <SettingsIcon className="h-4 w-4" />
                <span>Settings</span>
              </button>
            )}
            <a
              href="/planner"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex h-10 w-full items-center justify-center rounded-[10px] bg-[#12233A] text-sm font-semibold text-[#FFFFFF] hover:bg-[#1B3252]"
            >
              Plan My Journey
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
