import React from 'react';
import { Check, ArrowRight, Zap, Download } from 'lucide-react';

interface PricingProps {
  onOpenIntake: (planName: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onOpenIntake }) => {
  return (
    <section id="pricing" className="py-20 relative bg-white dark:bg-dark-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-800 dark:text-brand-300 mb-3">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Fixed One-Time Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Buy Once. Run Forever. Zero Subscriptions.
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg">
            Choose a ready-to-deploy workflow template or have us configure and brand an automation tailored to your exact spreadsheet.
          </p>
        </div>

        {/* 3 Fixed One-Time Packages */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch mb-12">
          {/* Plan 1: $5 Ready-to-Deploy Template */}
          <div className="bg-slate-50 dark:bg-dark-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-slate-700 dark:text-slate-400 font-bold tracking-wider">
                  Self-Deploy Template
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                  Instant Copy
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">$5</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">one-time total</span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-brand-300 font-mono mb-4 font-semibold">
                $0/month forever • Unlimited PDF generations
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mb-5 leading-relaxed">
                Complete, battle-tested Apps Script code + Google Sheet + Google Doc template. Up and running in 3 minutes.
              </p>

              <div className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Scope Includes:
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-3">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Choose 1 template: Invoice, Work Order, or Certificate</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Pre-configured Google Sheet with custom menu button</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Pre-formatted Google Doc template with 20 mapped fields</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Idempotency lock code (prevents duplicate PDF runs)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Step-by-step video & markdown setup guide</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onOpenIntake('Self-Deploy Template ($5 one-time)')}
                className="w-full py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Get $5 Template Package</span>
              </button>
            </div>
          </div>

          {/* Plan 2: $35 Configured & Branded Setup (POPULAR) */}
          <div className="bg-white dark:bg-dark-900 rounded-2xl border-2 border-emerald-500 dark:border-brand-500 p-6 glass-panel flex flex-col justify-between shadow-xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 mt-1">
                <span className="text-xs font-mono uppercase text-emerald-800 dark:text-brand-300 font-bold tracking-wider">
                  Configured Setup
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                  Done-For-You
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">$35</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">one-time total</span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-brand-300 font-mono mb-4 font-semibold">
                Turnkey setup in your Google account • Delivered in 48h
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mb-5 leading-relaxed">
                We take your existing Google Sheet and logo, customize the template layout, wire up the automation, and verify it for you.
              </p>

              <div className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Scope Includes (1 Workflow):
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200 border-t border-slate-200 dark:border-slate-800 pt-3">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Everything in $5 Template</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Custom branded template with company logo & fonts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Mapped to your existing spreadsheet columns or Form</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Configured Google Drive folder auto-sorting</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>14-day warranty & 1 test revision cycle</strong></span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onOpenIntake('Configured Workflow ($35 one-time)')}
                className="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-brand-500/20 transition-transform transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <span>Order Configured Setup ($35)</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Plan 3: $95 Turnkey Custom Workflow */}
          <div className="bg-slate-50 dark:bg-dark-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-slate-700 dark:text-slate-400 font-bold tracking-wider">
                  Turnkey Custom
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-mono text-[10px] font-bold">
                  Advanced
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">$95</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">one-time total</span>
              </div>
              <p className="text-xs text-sky-800 dark:text-accent-400 font-mono mb-4 font-semibold">
                Multi-row tables & conditional logic
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mb-5 leading-relaxed">
                For itemized invoices, quotes with dynamic rows, conditional routing, or automated staff notification dispatch.
              </p>

              <div className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Scope Includes:
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-3">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-700 dark:text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Everything in $35 Setup</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-700 dark:text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Dynamic line items table (1–10 repeatable rows)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-700 dark:text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Automatic Google Form submission instant trigger</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-700 dark:text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Optional webhook alert (Slack or Gmail notification)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-700 dark:text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>30-day warranty & staff video walkthrough</strong></span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onOpenIntake('Turnkey Custom Workflow ($95 one-time)')}
                className="w-full py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <span>Order Custom Workflow ($95)</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* 3-Year Cost Comparison Callout */}
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/50 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div>
            <div className="text-xs font-mono uppercase text-emerald-900 dark:text-emerald-300 font-bold mb-1">
              Illustrative 3-Year Cost Comparison
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Typical cloud automation tool ($45/mo recurring for 36 months): <strong className="text-rose-700 dark:text-rose-400 font-mono">$1,620</strong><br />
              SheetAutomate Configured Workflow: <strong className="text-emerald-800 dark:text-brand-300 font-mono">$35 one-time total</strong>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              No SheetAutomate monthly license or document fees. Standard Google Workspace Apps Script limits apply.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 uppercase block font-mono font-semibold">Difference You Retain:</span>
            <span className="text-2xl font-black text-emerald-800 dark:text-emerald-400 font-mono">
              Save $1,585+
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
