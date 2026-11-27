import React from 'react';
import { CheckCircle2, XCircle, Zap, Shield, Infinity, Github, Sparkles } from 'lucide-react';
import { AUDIT_STATUS } from '../lib/flowRegistry';

export const WhenFit: React.FC = () => {
  return (
    <section
      id="when-fit"
      className="py-16 sm:py-20 relative bg-white dark:bg-dark-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-800 dark:text-brand-300 mb-3">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Open Source vs. Recurring SaaS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Why Free &amp; Open Source Instead of Monthly SaaS?
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg">
            Stop paying $30–$80/month for basic merges and alerts that Google Workspace handles natively.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* SheetAutomate */}
          <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 dark:bg-dark-900 border-2 border-emerald-500/80 dark:border-brand-500/70 shadow-md relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-6 px-3.5 py-0.5 rounded-full bg-brand-500 text-slate-950 font-bold text-xs uppercase tracking-wider">
              SheetAutomate (MIT Open Source)
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4 mt-1">
                <Github className="w-5 h-5 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  $0 Forever &amp; Full Code Ownership
                </h3>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>$0 Subscriptions:</strong> Unlimited commercial and personal use under the MIT License.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Triple-Audited Code:</strong> Readable <code className="font-mono text-xs">Code.gs</code>, AI static safety audit, and VirusTotal {AUDIT_STATUS.virustotal.label} verified.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>100% In-Tenant Execution:</strong> Spreadsheet rows never leave your Google Drive sandbox.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Infinity className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>No Artificial Quotas:</strong> Run up to native Google Workspace daily limits (1,500+ docs/day).</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-emerald-800 dark:text-brand-300 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Includes interactive demo, TSV starter table, and Chrome Extension support.</span>
            </div>
          </div>

          {/* Recurring SaaS */}
          <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 dark:bg-dark-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 mt-1">
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recurring Cloud SaaS Middlemen
                </h3>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>$360–$960/Year Rent:</strong> Ongoing per-seat or per-task billing for simple merges.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Closed Black-Box Servers:</strong> Zero visibility into how your client records are queued or logged.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Broad OAuth Permissions:</strong> Often require full Drive or mailbox access to operate externally.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Vendor Lock-In:</strong> Cancel the subscription and your document workflows stop immediately.</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              Own your automation scripts inside your own Google Drive forever.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
