import React from 'react';
import {
  Search,
  X,
  ShieldCheck,
  Bot,
  Code2,
  SlidersHorizontal,
  ArrowUpDown,
  Chrome,
} from 'lucide-react';
import type { FlowCategory, FlowSortOption } from '../types/flow';
import { AUDIT_STATUS, CATEGORIES, FLOWS } from '../lib/flowRegistry';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: FlowCategory | 'All';
  onCategoryChange: (category: FlowCategory | 'All') => void;
  selectedTrigger: string;
  onTriggerChange: (trigger: string) => void;
  triggers: string[];
  sortBy: FlowSortOption;
  onSortChange: (sort: FlowSortOption) => void;
  categoryCounts: Record<string, number>;
  filteredCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTrigger,
  onTriggerChange,
  triggers,
  sortBy,
  onSortChange,
  categoryCounts,
  filteredCount,
}) => {
  return (
    <section className="relative pt-24 pb-6 md:pt-28 md:pb-8 overflow-hidden border-b border-slate-200/80 dark:border-slate-800/70">
      {/* Subtle ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[560px] h-[220px] bg-brand-500/10 rounded-full blur-[110px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Compact Conversion Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
          <div className="max-w-3xl">
            {/* Live Triple-Audit Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <a
                href="#security"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-[11px] font-mono font-bold text-emerald-800 dark:text-brand-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>VirusTotal {AUDIT_STATUS.virustotal.label}</span>
              </a>

              <a
                href="#security"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700/60 text-[11px] font-mono font-bold text-sky-800 dark:text-accent-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors"
              >
                <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{AUDIT_STATUS.aiSecurity.label}</span>
              </a>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200">
                <Code2 className="w-3.5 h-3.5 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
                <span>MIT Open Source • $0 Forever</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12] mb-2.5">
              Open-Source Google Sheets{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-700 dark:from-brand-300 dark:via-brand-400 dark:to-accent-400">
                Automation Catalog.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
              Test live interactive demos, copy clean least-privilege <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-emerald-800 dark:text-brand-300">Code.gs</code> scripts, and paste starter tables into <strong className="font-semibold text-slate-900 dark:text-white">your own Google Drive</strong> in 60 seconds.
            </p>
          </div>

          {/* Quick Chrome Extension CTA Pill */}
          <div className="shrink-0">
            <a
              href="#extension"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-brand-500 shadow-xs text-xs sm:text-sm font-semibold text-slate-900 dark:text-white transition-all min-h-[44px]"
            >
              <Chrome className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0" aria-hidden="true" />
              <span>Chrome Extension (MV3)</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-brand-500/20 text-emerald-800 dark:text-brand-300 font-mono text-[10px] font-bold">
                FREE
              </span>
            </a>
          </div>
        </div>

        {/* Search, Trigger & Sort Control Bar */}
        <search
          aria-label="Filter automation flows"
          className="block bg-white dark:bg-dark-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm glass-panel space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <label htmlFor="flow-search-input" className="sr-only">
                Search automation flows by title, tag, or service
              </label>
              <Search
                className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="flow-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search flows (e.g. invoice, Gmail, PDF, onboarding, Slack)..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-emerald-600 dark:focus:border-brand-500 focus:outline-none min-h-[44px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Trigger Filter */}
            <div className="md:col-span-3 relative">
              <label htmlFor="flow-trigger-select" className="sr-only">
                Filter by trigger type
              </label>
              <SlidersHorizontal
                className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <select
                id="flow-trigger-select"
                value={selectedTrigger}
                onChange={(e) => onTriggerChange(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:border-emerald-600 dark:focus:border-brand-500 focus:outline-none min-h-[44px] cursor-pointer"
              >
                <option value="All">All Triggers</option>
                {triggers.map((trigger) => (
                  <option key={trigger} value={trigger}>
                    {trigger}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-3 relative">
              <label htmlFor="flow-sort-select" className="sr-only">
                Sort flows
              </label>
              <ArrowUpDown
                className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <select
                id="flow-sort-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as FlowSortOption)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:border-emerald-600 dark:focus:border-brand-500 focus:outline-none min-h-[44px] cursor-pointer"
              >
                <option value="featured">Sort: Featured First</option>
                <option value="alphabetical">Sort: Title (A–Z)</option>
                <option value="least-scopes">Sort: Least OAuth Scopes</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills with Live Counts */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div
              role="group"
              aria-label="Filter flows by category"
              className="flex flex-wrap items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => onCategoryChange('All')}
                aria-pressed={selectedCategory === 'All'}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer min-h-[36px] flex items-center gap-1.5 ${
                  selectedCategory === 'All'
                    ? 'bg-brand-500 border-brand-600 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-dark-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span>All</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    selectedCategory === 'All'
                      ? 'bg-slate-950/15 text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {FLOWS.length}
                </span>
              </button>

              {CATEGORIES.map((category) => {
                const count = categoryCounts[category] ?? 0;
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onCategoryChange(category)}
                    aria-pressed={active}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer min-h-[36px] flex items-center gap-1.5 ${
                      active
                        ? 'bg-brand-500 border-brand-600 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-dark-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{category}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                        active
                          ? 'bg-slate-950/15 text-slate-950'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <output
              htmlFor="flow-search-input flow-trigger-select flow-sort-select"
              aria-live="polite"
              className="text-xs font-mono text-slate-600 dark:text-slate-400"
            >
              Showing <strong className="text-slate-900 dark:text-white">{filteredCount}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white">{FLOWS.length}</strong> flows
            </output>
          </div>
        </search>
      </div>
    </section>
  );
};
