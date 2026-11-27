import React from 'react';
import { Database, ShieldCheck, FolderCheck, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-20 relative bg-slate-100/60 dark:bg-dark-900/40 border-t border-slate-200 dark:border-slate-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-800 dark:text-brand-300 mb-3">
            <span>Operational Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            60-Second Setup Inside Your Google Workspace
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg">
            Every flow runs inside your own Google Sheets using Google&rsquo;s built-in Apps Script. Copy the starter table, paste <code className="font-mono text-sm">Code.gs</code>, and run directly from Google Sheets — nothing runs until you click the menu or set a trigger.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="bg-white dark:bg-dark-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-brand-500/15 border border-emerald-300 dark:border-brand-500/30 text-emerald-800 dark:text-brand-400 font-bold flex items-center justify-center font-mono text-sm">
                  01
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Trigger &amp; Input
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                Sheet, Form, or Schedule
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Custom Menu:</strong> Trigger batches with 1 click from the SheetAutomate menu.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>On Form Submit / Edit:</strong> React instantly to approvals or submissions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Time-Driven:</strong> Hourly receipt scans, reminders, and weekly KPI digests.</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 p-2.5 rounded-lg bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              TSV starter table pastes cleanly into sheets.new.
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-dark-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-accent-500/15 border border-sky-300 dark:border-accent-500/30 text-sky-800 dark:text-accent-400 font-bold flex items-center justify-center font-mono text-sm">
                  02
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Safety &amp; Locks
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-700 dark:text-accent-400 shrink-0" aria-hidden="true" />
                Validation &amp; Idempotency
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-700 dark:text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Duplicate-Run Lock (LockService):</strong> Prevents double-clicks or concurrent edits from processing the same row twice.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-700 dark:text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Safe Re-Runs (Idempotency):</strong> Automatically skips rows already marked <code className="font-mono">COMPLETED</code>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-700 dark:text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Required Checks:</strong> Flags missing fields as <code className="font-mono">NEEDS_CORRECTION</code> before sending or creating files.</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 p-2.5 rounded-lg bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              Minimum Google permissions only — reviewable in appsscript.json before you run.
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-dark-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 font-bold flex items-center justify-center font-mono text-sm">
                  03
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Output &amp; Audit
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <FolderCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                In-Tenant Output &amp; Log
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Drive &amp; PDFs:</strong> Merges Docs templates and archives PDFs in Drive.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Gmail &amp; Alerts:</strong> Sends reminders, digests, or optional webhooks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Sheet Audit Trail:</strong> Writes timestamps, URLs, and statuses back to your sheet.</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 p-2.5 rounded-lg bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              100% inside your Google account — zero middleman servers.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
