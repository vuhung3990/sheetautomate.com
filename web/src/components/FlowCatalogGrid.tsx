import React from 'react';
import {
  RotateCcw,
  SearchX,
  GitPullRequest,
  ArrowUpRight,
  FolderGit2,
  Sparkles,
} from 'lucide-react';
import type { FlowItem } from '../types/flow';
import { FLOWS, GITHUB_REPO_URL } from '../lib/flowRegistry';
import { FlowCard } from './FlowCard';

interface FlowCatalogGridProps {
  flows: FlowItem[];
  onOpenWorkbench: (flow: FlowItem, initialTab?: 'demo' | 'code' | 'setup') => void;
  onResetFilters: () => void;
}

export const FlowCatalogGrid: React.FC<FlowCatalogGridProps> = ({
  flows,
  onOpenWorkbench,
  onResetFilters,
}) => {
  return (
    <section
      id="catalog"
      className="py-10 sm:py-12 relative bg-slate-50 dark:bg-dark-950 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {flows.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 p-10 text-center max-w-xl mx-auto my-6 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-600 dark:text-slate-300">
              <SearchX className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {FLOWS.length === 0
                ? 'No Automation Flows Discovered Yet'
                : 'No Matching Automation Flows'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
              {FLOWS.length === 0
                ? 'Flows dropped into flows/<slug>/ are auto-discovered at build time. Add a valid flow folder to populate the catalog.'
                : 'Try clearing your search keyword, switching category to All, or resetting the trigger filter.'}
            </p>
            {FLOWS.length > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs sm:text-sm cursor-pointer min-h-[44px] transition-colors"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map((flow, index) => (
              <FlowCard
                key={flow.id}
                flow={flow}
                index={index}
                onOpenWorkbench={onOpenWorkbench}
              />
            ))}
          </div>
        )}

        {/* Bottom Bento Contributor Card */}
        <div className="mt-10 rounded-2xl bg-gradient-to-br from-slate-900 via-dark-900 to-slate-900 text-white border border-slate-800 p-6 sm:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute -right-12 -top-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-mono font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Auto-Discovered via GitHub Actions</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2">
                Add a Flow Folder in <code className="font-mono text-brand-300 text-lg sm:text-xl">flows/&lt;slug&gt;/</code> &amp; Open a PR
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Zero React edits required. When your PR passes schema validation, AI static security checks, and VirusTotal scanning, GitHub Actions automatically rebuilds this catalog, updates the Chrome Extension bundle, and refreshes all security badges.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href={`${GITHUB_REPO_URL}/blob/main/flows/README.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-colors min-h-[44px]"
              >
                <FolderGit2 className="w-4 h-4 text-accent-400" aria-hidden="true" />
                <span>Read Flow Spec</span>
              </a>

              <a
                href={`${GITHUB_REPO_URL}/pulls`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors min-h-[44px]"
              >
                <GitPullRequest className="w-4 h-4" aria-hidden="true" />
                <span>Submit a Flow PR</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
