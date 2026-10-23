import React from 'react';
import { ArrowRight, Play, Database, DollarSign, Shield, Lock } from 'lucide-react';

interface HeroProps {
  onOpenIntake: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenIntake }) => {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-brand-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-slate-900/90 border border-emerald-300 dark:border-slate-700/80 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-brand-300 shadow-xs mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" aria-hidden="true" />
            <span>Zero Subscriptions</span>
            <span className="text-slate-400 dark:text-slate-600" aria-hidden="true">•</span>
            <span>Fixed Workflows Starting at $5 One-Time</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6">
            Turn Google Sheets & Forms Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-800 to-sky-800 dark:from-brand-300 dark:via-brand-400 dark:to-accent-400">
              Consistent, Branded PDFs.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto font-normal">
            Stop paying $30–$80/month for document merge SaaS subscriptions. Buy your automated workflow once starting from $5, and run it directly inside your Google Drive with zero per-document fees and complete script ownership.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <button
              onClick={onOpenIntake}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-base tracking-wide shadow-lg shadow-brand-500/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer min-h-[48px]"
            >
              <span>Get Your Workflow (From $5)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </button>

            <a
              href="#examples"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-dark-900/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-base transition-all duration-200 shadow-xs backdrop-blur-sm min-h-[48px]"
            >
              <Play className="w-4 h-4 text-emerald-700 dark:text-brand-400 fill-brand-400/20" aria-hidden="true" />
              <span>See Live Interactive Demo</span>
            </a>
          </div>

          {/* Positioning note */}
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-12">
            One-time purchase • $0/month forever • In-tenant Drive storage • Standard Google Workspace limits apply
          </p>

          {/* Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-3xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 shadow-xs">
              <DollarSign className="w-5 h-5 text-emerald-700 dark:text-brand-400 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Pay Once ($5+)</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">Zero recurring software fees</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 shadow-xs">
              <Lock className="w-5 h-5 text-sky-700 dark:text-accent-400 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">In-Tenant Privacy</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">Runs 100% inside your Drive</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 shadow-xs">
              <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Zero Per-Doc Fees</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">No SheetAutomate export quotas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Workflow Diagram */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-dark-900/90 shadow-xl overflow-hidden glass-panel">
            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-400 ml-2">Workflow Architecture Overview</span>
              </div>
              <span className="font-mono text-emerald-800 dark:text-emerald-400 text-[11px] font-bold">
                Google Apps Script Native
              </span>
            </div>

            {/* Workflow Diagram Grid */}
            <div className="p-6 md:p-8 grid md:grid-cols-12 gap-6 items-center">
              {/* Step 1: Source */}
              <div className="md:col-span-5 bg-slate-50 dark:bg-dark-950/70 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    1. Input: Google Sheet Row
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-mono text-[10px] font-semibold">
                    Row #142 (Approved)
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-400">Client:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-semibold">Acme Industrial Ltd</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-400">Total Due:</span>
                    <span className="text-emerald-800 dark:text-emerald-400 font-bold">$3,850.00</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">Trigger:</span>
                    <span className="text-sky-700 dark:text-accent-400 font-medium">Custom Menu Click</span>
                  </div>
                </div>
              </div>

              {/* Connecting Flow Arrow */}
              <div className="md:col-span-2 flex flex-col items-center justify-center py-2 md:py-0">
                <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-brand-500/10 border border-emerald-300 dark:border-brand-500/30 text-emerald-800 dark:text-brand-400">
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400 mt-2 text-center">
                  Apps Script Merge
                </span>
              </div>

              {/* Step 2: Output */}
              <div className="md:col-span-5 bg-slate-50 dark:bg-dark-950/70 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    2. Output: Drive PDF & Log
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                    Generated in 2.1s
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-400">PDF File:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-semibold truncate max-w-[150px]">
                      INV-142_Acme.pdf
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-400">Google Drive:</span>
                    <span className="text-slate-900 dark:text-slate-200">/Finance/Invoices/</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">Sheet Audit:</span>
                    <span className="text-emerald-800 dark:text-emerald-400 font-semibold">Col G: Link Written ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
