import React from 'react';
import { Shield, KeyRound, ServerOff, UserCheck } from 'lucide-react';

export const SecurityArchitecture: React.FC = () => {
  return (
    <section id="security" className="py-20 relative bg-white dark:bg-dark-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-800 dark:text-brand-300 mb-3">
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Workspace Security & Ownership</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Built Directly Inside Your Google Workspace
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg">
            Your document data never traverses third-party servers. All scripts, templates, and storage folders operate within your organization's Google environment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Pillar 1: In-Tenant Data Flow */}
          <div className="bg-slate-50 dark:bg-dark-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel-hover shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ServerOff className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">In-Tenant Data Flow</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Business data is read from your Google Sheet, merged into Google Docs, and saved into your Google Drive via Apps Script. SheetAutomate does not operate an external database for your document data.
            </p>
          </div>

          {/* Pillar 2: Least-Privilege Scopes & Admin Review */}
          <div className="bg-slate-50 dark:bg-dark-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel-hover shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-accent-500/10 border border-sky-300 dark:border-accent-500/20 text-sky-800 dark:text-accent-400 flex items-center justify-center mb-4">
              <KeyRound className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Verified Scopes & IT Admin</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We define the exact OAuth scopes required for your specific spreadsheet and folder. If your organization enforces Workspace App Access Controls, deployment can be configured subject to administrator approval.
            </p>
          </div>

          {/* Pillar 3: Handover & Code Ownership */}
          <div className="bg-slate-50 dark:bg-dark-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel-hover shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-brand-500/10 border border-emerald-300 dark:border-brand-500/20 text-emerald-800 dark:text-brand-400 flex items-center justify-center mb-4">
              <UserCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Perpetual Internal License</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Automation triggers and files live directly under your team's designated Google account. You receive editable source code with perpetual internal-use rights and zero recurring vendor lock-in.
            </p>
          </div>
        </div>

        {/* Integration clarification note */}
        <div className="mt-8 max-w-4xl mx-auto p-4 rounded-xl bg-slate-50 dark:bg-dark-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 text-center">
          <span>
            Standard workflows process document data entirely inside your Google Workspace. Optional external notifications (such as Slack alerts) send only the specific payload fields you authorize.
          </span>
        </div>
      </div>
    </section>
  );
};
