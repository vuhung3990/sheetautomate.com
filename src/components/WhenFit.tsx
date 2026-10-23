import React from 'react';
import { CheckCircle2, XCircle, Zap, DollarSign, Shield, Infinity } from 'lucide-react';

export const WhenFit: React.FC = () => {
  return (
    <section id="when-fit" className="py-20 relative bg-slate-100/60 dark:bg-dark-900/50 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-emerald-800 dark:text-brand-300 mb-3">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Architectural Comparison</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Why Buy One-Time Instead of Monthly SaaS?
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg">
            Multi-app automation platforms charge $30–$80 every single month forever. SheetAutomate gives you verified Google Workspace automation starting at $5 one-time.
          </p>
        </div>

        {/* Head-to-Head Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch mb-12">
          {/* Column 1: SheetAutomate Advantage */}
          <div className="p-7 rounded-2xl bg-white dark:bg-dark-950 border-2 border-emerald-500/80 dark:border-brand-500/70 shadow-lg relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-6 px-3.5 py-0.5 rounded-full bg-brand-500 text-slate-950 font-bold text-xs uppercase tracking-wider">
              SheetAutomate Architecture
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4 mt-2">
                <DollarSign className="w-6 h-6 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Fixed One-Time (From $5)</h3>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">Zero Monthly Software Fees:</strong>
                    <span>Purchase your workflow once starting from $5. You own the code for your internal use with $0/month ongoing tool cost.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Infinity className="w-5 h-5 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">Zero Per-Export Fees:</strong>
                    <span>No artificial document caps or per-merge credit meters. Run hundreds or thousands of documents under standard Google Workspace limits.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">100% In-Tenant Google Execution:</strong>
                    <span>Your customer records and financial numbers are never routed through our servers. All scripts execute in your Google account.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">Editable Code Ownership:</strong>
                    <span>The Apps Script code lives directly inside your Google Sheet. It will never suddenly deactivate because a billing card expired.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-emerald-800 dark:text-brand-300 font-medium">
              ✓ Includes pre-tested Apps Script code, Google Doc template, and quickstart documentation.
            </div>
          </div>

          {/* Column 2: Recurring Multi-App Cloud SaaS */}
          <div className="p-7 rounded-2xl bg-slate-50 dark:bg-dark-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 mt-2">
                <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recurring SaaS Tools</h3>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">$360 – $960 Every Single Year:</strong>
                    <span>Multi-app cloud automation platforms charge $30–$80/mo recurring indefinitely, compounding year after year.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">Artificial Document Caps:</strong>
                    <span>Entry tiers limit monthly tasks (e.g. 100 or 500 documents/mo), forcing expensive plan upgrades as your operations scale.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">External Cloud Routing:</strong>
                    <span>Third-party integration services ingest, queue, and log your confidential customer records across external servers.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">Platform Vendor Lock-In:</strong>
                    <span>If you cancel your subscription, your document merge pipelines immediately stop functioning.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              Note: Generic free add-ons like Autocrat exist for casual one-off merges, but lack custom formatting, duplicate locks, and dynamic line-item tables.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
