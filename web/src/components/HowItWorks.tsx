import React from 'react';
import { Database, Filter, FolderCheck, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 relative bg-white dark:bg-dark-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-800 dark:text-brand-300 mb-4">
            <span>Operational Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            How The Automation Runs In Your Workspace
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg">
            A clean 3-step pipeline configured directly inside your Google account. Your team operates it without leaving Google Sheets.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="bg-slate-50 dark:bg-dark-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel relative flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-brand-500/15 border border-emerald-300 dark:border-brand-500/30 text-emerald-800 dark:text-brand-400 font-bold flex items-center justify-center font-mono text-sm">
                  01
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Data Inputs
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                Input & Triggers
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Data originates from your existing workflow:
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/80 pt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Google Sheet:</strong> Click a custom menu button or set status to "Approved".</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Google Form:</strong> Trigger automatically whenever a respondent submits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Scheduled:</strong> Runs periodically to process newly added records.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 p-2.5 rounded-lg bg-white dark:bg-dark-950/60 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              Trigger identity: Assigned to your designated Google account.
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 dark:bg-dark-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel relative flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-accent-500/15 border border-sky-300 dark:border-accent-500/30 text-sky-800 dark:text-accent-400 font-bold flex items-center justify-center font-mono text-sm">
                  02
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Validation & Merge
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4 text-sky-700 dark:text-accent-400 shrink-0" aria-hidden="true" />
                Rules & Template Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Every record is validated before any document is generated:
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/80 pt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-700 dark:text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Required Fields:</strong> Verifies vital cells (client, amount, dates) aren't empty.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-700 dark:text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Duplicate Prevention:</strong> Skips records already marked with an existing PDF link.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-700 dark:text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Template Formatting:</strong> Injects text into placeholders in your Google Docs template.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 p-2.5 rounded-lg bg-white dark:bg-dark-950/60 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              Layout: Pre-tested against long text and locale formatting.
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 dark:bg-dark-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel relative flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 font-bold flex items-center justify-center font-mono text-sm">
                  03
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Output & Audit
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <FolderCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                Drive Storage & Sheet Log
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Files and execution records are organized automatically:
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/80 pt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Drive Filing:</strong> PDF saved into your specified folder with standard naming.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Sheet URL Link:</strong> Direct link written back to Column G for 1-click access.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Audit Trail:</strong> Timestamp and status (Completed, Missing Info, Skipped) recorded.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 p-2.5 rounded-lg bg-white dark:bg-dark-950/60 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              Access: Team members access files per your Google Drive rules.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
