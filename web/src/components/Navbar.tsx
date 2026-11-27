import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  ArrowDownRight,
  Menu,
  X,
  Zap,
  Sun,
  Moon,
  Github,
  Sparkles,
} from 'lucide-react';
import { FLOWS, GITHUB_REPO_URL } from '../lib/flowRegistry';

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onExploreFlows: () => void;
}

const NAV_LINKS = [
  { href: '#catalog', label: 'Flows' },
  { href: '#extension', label: 'Extension' },
  { href: '#security', label: 'Security' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#faq', label: 'FAQ' },
];

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onExploreFlows,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 dark:bg-dark-950/95 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/80 py-2.5 shadow-sm dark:shadow-black/30'
          : 'bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Dynamic Flow Counter */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href="#"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 text-slate-950 shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5 text-white stroke-[2.2]" aria-hidden="true" />
                <div className="absolute -bottom-1 -right-1 bg-accent-500 text-white rounded-full p-0.5 border border-white dark:border-dark-950">
                  <Zap className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                  Sheet<span className="text-emerald-700 dark:text-brand-400">Automate</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-600 dark:text-slate-400 tracking-wider font-mono uppercase mt-0.5">
                  MIT Open Source
                </span>
              </div>
            </a>

            <a
              href="#catalog"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-brand-500/15 border border-emerald-200 dark:border-brand-500/30 text-[11px] font-mono font-bold text-emerald-800 dark:text-brand-300 hover:bg-emerald-100 dark:hover:bg-brand-500/25 transition-colors"
            >
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              <span>{FLOWS.length} Free Flows</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-dark-900/80 border border-slate-200/90 dark:border-slate-800 rounded-full px-3 py-1 backdrop-blur-md"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs xl:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-800/60 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-dark-900 dark:hover:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Github className="w-4 h-4" aria-hidden="true" />
              <span>GitHub</span>
            </a>

            <button
              type="button"
              onClick={onToggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-dark-900 dark:hover:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={onExploreFlows}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-sm shadow-brand-500/20 transition-all duration-200 cursor-pointer min-h-[40px]"
            >
              <span>Explore Flows</span>
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center sm:hidden gap-1.5">
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={onExploreFlows}
              className="hidden min-[380px]:flex px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs cursor-pointer min-h-[40px] items-center gap-1"
            >
              <span>Explore Flows</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-4 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-3 py-1.5 mb-1 rounded-lg bg-emerald-50 dark:bg-brand-500/10 border border-emerald-200 dark:border-brand-500/20 text-xs font-mono font-bold text-emerald-800 dark:text-brand-300">
              <span>Auto-Synced Catalog</span>
              <span>{FLOWS.length} Free Flows</span>
            </div>

            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-sm font-semibold min-h-[44px] flex items-center"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm cursor-pointer min-h-[44px] border border-slate-200 dark:border-slate-700"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
                <span>GitHub Repository</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onExploreFlows();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 text-slate-950 font-bold text-sm shadow-md shadow-brand-500/20 cursor-pointer min-h-[44px]"
              >
                <span>Explore Flows ({FLOWS.length})</span>
                <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
