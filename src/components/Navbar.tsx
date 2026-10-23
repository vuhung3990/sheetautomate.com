import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, ArrowRight, Menu, X, Zap, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenIntake: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme, onOpenIntake }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-dark-950/95 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/80 py-3 shadow-md dark:shadow-black/30'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 text-slate-950 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5 text-white stroke-[2.2]" aria-hidden="true" />
              <div className="absolute -bottom-1 -right-1 bg-accent-500 text-white rounded-full p-0.5 border border-white dark:border-dark-950">
                <Zap className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Sheet<span className="text-emerald-700 dark:text-brand-400">Automate</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-600 dark:text-slate-400 tracking-wider font-mono uppercase -mt-0.5">
                One-Time Workspace Workflows
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav 
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-dark-900/80 border border-slate-200/90 dark:border-slate-800 rounded-full px-3.5 py-1.5 backdrop-blur-md"
          >
            <a
              href="#how-it-works"
              className="text-xs xl:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-800/60 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#examples"
              className="text-xs xl:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-800/60 transition-colors"
            >
              Live Demo
            </a>
            <a
              href="#when-fit"
              className="text-xs xl:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-800/60 transition-colors"
            >
              Why One-Time?
            </a>
            <a
              href="#security"
              className="text-xs xl:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-800/60 transition-colors"
            >
              Security
            </a>
            <a
              href="#pricing"
              className="text-xs xl:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-800/60 transition-colors"
            >
              Pricing ($5+)
            </a>
          </nav>

          {/* Right Action CTA & Theme Toggle */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-dark-900 dark:hover:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" />
              )}
            </button>

            <button
              onClick={onOpenIntake}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-brand-500/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer min-h-[44px]"
            >
              <span>Get Workflow (From $5)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex items-center sm:hidden gap-1.5">
            <button
              onClick={onToggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" />
              )}
            </button>

            <button
              onClick={onOpenIntake}
              className="px-3 py-2 rounded-lg bg-brand-500 text-slate-950 font-bold text-xs cursor-pointer min-h-[40px] flex items-center"
            >
              $5 Workflows
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 cursor-pointer"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
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
          <div className="lg:hidden mt-3 p-4 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-4">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-sm font-semibold min-h-[44px] flex items-center"
            >
              How It Works
            </a>
            <a
              href="#examples"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-sm font-semibold min-h-[44px] flex items-center"
            >
              Live Demo
            </a>
            <a
              href="#when-fit"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-sm font-semibold min-h-[44px] flex items-center"
            >
              Why One-Time?
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-sm font-semibold min-h-[44px] flex items-center"
            >
              Security & Ownership
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-sm font-semibold min-h-[44px] flex items-center"
            >
              Pricing (From $5)
            </a>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenIntake();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 text-slate-950 font-bold text-sm shadow-md shadow-brand-500/20 cursor-pointer min-h-[44px]"
              >
                <span>Order Workflow (From $5)</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
