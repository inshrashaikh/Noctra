import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { Logo } from './Logo';
import { SimulatedBadge } from './SimulatedBadge';
import { IstClock } from './IstClock';
import { useSettings } from '@/features/settings/useSettings';
import { useI18n, type Language } from '@/lib/i18n';
import {
  Shield,
  Users,
  Settings as SettingsIcon,
  Sparkles,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export function MarketingNavbar() {
  const { pathname } = useLocation();
  const {
    setIsSettingsOpen,
    setIsTrustedCircleOpen,
    setIsCommunityNotesOpen,
    setIsOnboardingOpen,
  } = useSettings();
  const { language, setLanguage, t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t.navLanding, href: '/' },
    { label: t.navPlanner, href: '/planner' },
    { label: 'Provenance & Rules', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-noctra-border/60 bg-noctra-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Hackathon Tag */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <Logo />
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-md border border-noctra-border bg-noctra-surface px-2 py-0.5 font-mono text-[11px] text-noctra-muted">
              CASCADE &apos;26 • IIIT Nagpur
            </span>
            <SimulatedBadge size="sm" />
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                  isActive
                    ? 'bg-noctra-raised text-noctra-accent'
                    : 'text-noctra-muted hover:bg-noctra-surface hover:text-noctra-text'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Social & Quick Actions, Clock, Language, CTA */}
        <div className="hidden sm:flex items-center gap-2.5">
          <IstClock showSeconds={false} />

          {/* Social / Safe Arrival Trigger */}
          <button
            type="button"
            onClick={() => setIsTrustedCircleOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-noctra-border bg-noctra-surface px-2.5 py-1.5 text-xs font-semibold text-noctra-text transition-colors hover:border-noctra-accent/40 hover:bg-noctra-raised"
            title="Safe Arrival Check-in & Trusted Circle"
          >
            <Shield className="h-3.5 w-3.5 text-noctra-accent" />
            <span className="hidden xl:inline">{t.navCircle}</span>
          </button>

          {/* Community Route Intel */}
          <button
            type="button"
            onClick={() => setIsCommunityNotesOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-noctra-border bg-noctra-surface px-2.5 py-1.5 text-xs font-semibold text-noctra-text transition-colors hover:border-noctra-accent/40 hover:bg-noctra-raised"
            title="Worker Community Route Intel"
          >
            <Users className="h-3.5 w-3.5 text-noctra-accent" />
            <span className="hidden xl:inline">{t.navCommunity}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center rounded-lg border border-noctra-border bg-noctra-surface p-0.5 font-mono text-[11px]">
            {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={cn(
                  'rounded px-1.5 py-0.5 font-semibold transition-all',
                  language === lang
                    ? 'bg-noctra-accent text-noctra-bg'
                    : 'text-noctra-muted hover:text-noctra-text'
                )}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'मरा'}
              </button>
            ))}
          </div>

          {/* Settings / Preferences Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-lg border border-noctra-border bg-noctra-surface p-2 text-noctra-muted transition-colors hover:bg-noctra-raised hover:text-noctra-text"
            title="Preferences & Accessibility"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>

          {/* Open Planner CTA */}
          <Link
            to="/planner"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-noctra-accent px-4 py-1.5 text-xs font-bold text-noctra-bg shadow-sm transition-colors hover:bg-noctra-accent-hover lamp-glow"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Open Planner</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 sm:hidden">
          <IstClock showSeconds={false} showIcon={false} />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg border border-noctra-border bg-noctra-surface p-2 text-noctra-muted hover:text-noctra-text"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="border-b border-noctra-border bg-noctra-surface px-4 py-4 sm:hidden animate-in slide-in-from-top-2 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-noctra-border/60">
            <span className="font-mono text-xs text-noctra-muted">CASCADE &apos;26 • IIIT Nagpur</span>
            <SimulatedBadge size="sm" />
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-noctra-text hover:bg-noctra-raised"
              >
                <span>{link.label}</span>
                <ExternalLink className="h-4 w-4 text-noctra-muted" />
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-noctra-border/60 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsTrustedCircleOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-noctra-border bg-noctra-raised py-2 text-xs font-semibold text-noctra-text"
            >
              <Shield className="h-3.5 w-3.5 text-noctra-accent" />
              {t.navCircle}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsCommunityNotesOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-noctra-border bg-noctra-raised py-2 text-xs font-semibold text-noctra-text"
            >
              <Users className="h-3.5 w-3.5 text-noctra-accent" />
              {t.navCommunity}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-noctra-border/60">
            <div className="flex items-center gap-1">
              {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    'rounded px-2 py-1 font-mono text-xs font-semibold',
                    language === lang
                      ? 'bg-noctra-accent text-noctra-bg'
                      : 'text-noctra-muted hover:text-noctra-text'
                  )}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'मरा'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsOnboardingOpen(true);
                }}
                className="text-xs text-noctra-muted hover:underline"
              >
                Briefing
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="p-1.5 rounded-lg border border-noctra-border text-noctra-muted"
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
