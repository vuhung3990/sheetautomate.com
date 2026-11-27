import React from 'react';
import {
  Chrome,
  Download,
  Copy,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet,
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Github,
} from 'lucide-react';
import { FLOWS, GITHUB_REPO_URL } from '../lib/flowRegistry';

export const ExtensionPromo: React.FC = () => {
  return (
    <section
      id="extension"
      className="py-16 sm:py-20 relative bg-slate-100/70 dark:bg-dark-900/50 border-t border-slate-200 dark:border-slate-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Copy & Install Steps */}
          <div className="lg:col-span-6 min-w-0 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-dark-950 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-emerald-800 dark:text-brand-300 mb-3">
                <Chrome className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Chrome Extension (Manifest V3)</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                Deploy Flows Directly Inside Google Sheets.
              </h2>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                Install the lightweight SheetAutomate assistant to browse all{' '}
                <strong className="font-semibold text-slate-900 dark:text-white">
                  {FLOWS.length > 0 ? FLOWS.length : '12+'} open-source flows
                </strong>
                , copy <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-emerald-800 dark:text-brand-300">Code.gs</code>, and paste starter table headers without switching tabs.
              </p>
            </div>

            {/* 3 Feature Highlights */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                <Copy className="w-4 h-4 text-emerald-700 dark:text-brand-400 mb-2" aria-hidden="true" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Instant Script Copy
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  1-click clipboard copy for Apps Script code and TSV starter tables.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-sky-700 dark:text-accent-400 mb-2" aria-hidden="true" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Zero Tracking
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Never reads spreadsheet cell data. Zero analytics, zero cookies.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                <RefreshCw className="w-4 h-4 text-emerald-700 dark:text-brand-400 mb-2" aria-hidden="true" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Auto-Synced Catalog
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Bundled with <code className="font-mono">flows-bundle.json</code> via GitHub CI.
                </p>
              </div>
            </div>

            {/* 3-Step Unpacked Install Instructions */}
            <div className="rounded-2xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                60-Second Unpacked Chrome Install
              </h3>
              <ol className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-brand-500/20 text-emerald-800 dark:text-brand-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Download and unzip <code className="font-mono text-xs break-all">sheetautomate-chrome-extension.zip</code>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-brand-500/20 text-emerald-800 dark:text-brand-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Open <code className="font-mono text-xs">chrome://extensions</code> and toggle <strong>Developer mode</strong> on.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-brand-500/20 text-emerald-800 dark:text-brand-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Click <strong>Load unpacked</strong>, select the unzipped folder, and open any Google Sheet.
                  </span>
                </li>
              </ol>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="/downloads/sheetautomate-chrome-extension.zip"
                  download
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs sm:text-sm shadow-sm shadow-brand-500/20 transition-colors min-h-[44px]"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download Extension (.zip)</span>
                </a>

                <a
                  href={`${GITHUB_REPO_URL}/tree/main/extension`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 transition-colors min-h-[44px]"
                >
                  <Github className="w-4 h-4" aria-hidden="true" />
                  <span>Inspect Extension Source</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Visual Mockup: Floating Assistant inside Google Sheets */}
          <div className="lg:col-span-6 min-w-0">
            <div className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-dark-950 shadow-xl overflow-hidden">
              {/* Simulated Browser + Sheets Header */}
              <div className="px-4 py-2.5 bg-slate-100 dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    docs.google.com/spreadsheets — Q4 Client Billing
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-brand-500/20 text-emerald-800 dark:text-brand-300 font-mono text-[10px] font-bold">
                  MV3 Active
                </span>
              </div>

              {/* Simulated Sheet Background + Floating Assistant */}
              <div className="p-5 bg-slate-50 dark:bg-dark-950 relative">
                {/* Faint spreadsheet grid underneath */}
                <div className="grid grid-cols-4 gap-px bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 opacity-55 mb-4 text-[10px] font-mono">
                  <div className="bg-slate-100 dark:bg-dark-900 p-2 font-bold text-slate-700 dark:text-slate-300">Invoice_ID</div>
                  <div className="bg-slate-100 dark:bg-dark-900 p-2 font-bold text-slate-700 dark:text-slate-300">Client</div>
                  <div className="bg-slate-100 dark:bg-dark-900 p-2 font-bold text-slate-700 dark:text-slate-300">Amount</div>
                  <div className="bg-slate-100 dark:bg-dark-900 p-2 font-bold text-slate-700 dark:text-slate-300">Status</div>
                  <div className="bg-white dark:bg-dark-950 p-2 text-slate-600 dark:text-slate-400">INV-104</div>
                  <div className="bg-white dark:bg-dark-950 p-2 text-slate-600 dark:text-slate-400">Acme Cloud</div>
                  <div className="bg-white dark:bg-dark-950 p-2 text-slate-600 dark:text-slate-400">$4,250</div>
                  <div className="bg-white dark:bg-dark-950 p-2 text-emerald-700 dark:text-brand-400 font-bold">COMPLETED</div>
                </div>

                {/* Floating Extension Drawer Mockup */}
                <div className="ml-auto max-w-sm rounded-2xl bg-white dark:bg-dark-900 border-2 border-emerald-500/70 dark:border-brand-500/60 shadow-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-brand-500 text-slate-950 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        SheetAutomate Assistant
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 dark:text-brand-300 font-bold">
                      VT 0/72 Clean
                    </span>
                  </div>

                  {/* Mock Search Bar */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                    <Search className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>invoice</span>
                  </div>

                  {/* Mock Flow Card inside Extension */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        B2B Client Invoice PDF
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-brand-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        3 Scopes
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Generates branded Drive PDFs with LockService duplicate protection.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <span className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-brand-500 text-slate-950 font-bold text-[11px]">
                        <Copy className="w-3 h-3" aria-hidden="true" />
                        Copy Code.gs
                      </span>
                      <span className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        Live Demo
                      </span>
                    </div>
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
