import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, X, Settings as SettingsIcon, PhoneCall, Sparkles } from 'lucide-react';
import { useSettings } from '@/features/settings/useSettings';
import { useOnboarding } from '@/features/onboarding/useOnboarding';
import { cn } from '@/lib/cn';

export interface NavbarProps {
  currentPath?: string;
  mode?: 'marketing' | 'app';
}

export function Navbar({ currentPath = '/', mode = 'marketing' }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setIsSettingsOpen } = useSettings();
  const { openOnboarding } = useOnboarding();

  const marketingLinks = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Offline', href: '#offline' },
    { label: 'Night Grid', href: '#night-grid' },
  ];

  const appLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Plan journey', href: '/planner' },
    { label: 'Services', href: '/services' },
  ];

  const links = mode === 'app' ? appLinks : marketingLinks;

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-[#E2DED3] dark:border-[#232C3E] bg-[#FFFFFF] dark:bg-[#131822] transition-colors">
      <div className="mx-auto flex h-14 sm:h-16 max-w-[1280px] items-center justify-between px-3 sm:px-6">
        {/* Left Zone: Logo */}
        <div className="flex shrink-0 items-center">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            {/* SVG Crescent-and-Lamp Mark */}
            <svg
              className="h-6 w-6 text-[#12233A] dark:text-[#38BDF8]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 12.5A8.5 8.5 0 1 1 11.5 4 6.5 6.5 0 0 0 20 12.5Z" fill="currentColor" fillOpacity="0.15" />
              <circle cx="17.5" cy="8.5" r="2.5" fill="#F2B54A" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#14181D] dark:text-[#F8FAFC] leading-none">
                Noctra
              </span>
              <span className="text-[9px] font-mono font-medium tracking-widest uppercase text-[#5B6672] dark:text-[#94A3B8]">
                Night Grid
              </span>
            </div>
          </Link>
        </div>

        {/* Center Zone: Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {links.map((link) => {
            const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
            const isAnchor = link.href.startsWith('#');

            if (isAnchor) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative flex h-10 items-center px-3 text-sm font-semibold transition-colors',
                    isActive
                      ? 'text-[#12233A] dark:text-[#38BDF8] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#12233A] dark:after:bg-[#38BDF8]'
                      : 'text-[#5B6672] dark:text-[#94A3B8] hover:text-[#14181D] dark:hover:text-[#F8FAFC]'
                  )}
                >
                  {link.label}
                </a>
              );
            }

            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'relative flex h-10 items-center px-3 text-sm font-semibold transition-colors',
                  isActive
                    ? 'text-[#12233A] dark:text-[#38BDF8] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#12233A] dark:after:bg-[#38BDF8]'
                    : 'text-[#5B6672] dark:text-[#94A3B8] hover:text-[#14181D] dark:hover:text-[#F8FAFC]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Zone: Controls & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick SOS Emergency Call Button */}
          <a
            href="tel:112"
            className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-bold rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
            title="Emergency SOS 112"
          >
            <PhoneCall className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse text-rose-600 dark:text-rose-400" />
            <span className="font-mono tracking-wider">112</span>
          </a>

          {/* Get Started Guide Tour Button */}
          <button
            type="button"
            onClick={openOnboarding}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-lg border border-noctra-border bg-noctra-surface text-noctra-text hover:bg-noctra-raised transition-colors"
            title="Open Night Shift Safety Guide"
          >
            <Sparkles className="h-3.5 w-3.5 text-noctra-accent" />
            <span>Get Started</span>
          </button>

          {/* Settings Button (Desktop) */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-noctra-border bg-noctra-surface text-noctra-muted hover:text-noctra-text hover:bg-noctra-raised transition-colors"
            aria-label="Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>

          {/* Primary CTA (Desktop) */}
          <Link
            to="/planner"
            className="hidden md:inline-flex items-center justify-center h-9 px-4 text-xs font-semibold rounded-lg bg-[#12233A] dark:bg-[#38BDF8] text-white dark:text-[#0B0E14] hover:bg-[#1B3252] dark:hover:bg-[#0EA5E9] transition-colors"
          >
            Plan Journey
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-noctra-border bg-noctra-surface text-noctra-muted md:hidden hover:text-noctra-text hover:bg-noctra-raised transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Full-width Mobile Dropdown Menu (< 768px) */}
      {isMobileMenuOpen && (
        <div className="border-t border-noctra-border bg-noctra-surface px-4 py-3 md:hidden space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {links.map((link) => {
              const isAnchor = link.href.startsWith('#');
              if (isAnchor) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-noctra-muted hover:bg-noctra-raised hover:text-noctra-text"
                  >
                    {link.label}
                  </a>
                );
              }

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-noctra-muted hover:bg-noctra-raised hover:text-noctra-text"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-noctra-border flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                openOnboarding();
              }}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-noctra-border bg-noctra-surface text-xs font-semibold text-noctra-text hover:bg-noctra-raised transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-noctra-accent" />
              <span>Get Started Briefing</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSettingsOpen(true);
              }}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-noctra-border bg-noctra-surface text-xs font-semibold text-noctra-text hover:bg-noctra-raised transition-colors"
            >
              <SettingsIcon className="h-4 w-4 text-noctra-muted" />
              <span>Settings &amp; Safe Mode</span>
            </button>
            <Link
              to="/planner"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex h-9 w-full items-center justify-center rounded-lg bg-[#12233A] dark:bg-[#38BDF8] text-white dark:text-[#0B0E14] text-xs font-semibold hover:bg-[#1B3252] dark:hover:bg-[#0EA5E9] transition-colors"
            >
              Plan My Journey
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
