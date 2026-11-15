import React from 'react';
import { FileSpreadsheet, Zap, Mail, Github, ShieldCheck } from 'lucide-react';
import { AUDIT_STATUS, FLOWS, GITHUB_REPO_URL } from '../lib/flowRegistry';

interface FooterProps {
  onExploreFlows: () => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onExploreFlows, onOpenLegal }) => {
  return (
    <footer className="bg-slate-100 dark:bg-dark-950 border-t border-slate-200 dark:border-slate-800/80 pt-14 pb-10 relative overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-slate-200 dark:border-slate-800/80">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-700 text-slate-950 shadow-md shadow-brand-500/20">
                <FileSpreadsheet className="w-4 h-4 text-white stroke-[2.2]" aria-hidden="true" />
                <div className="absolute -bottom-1 -right-1 bg-accent-500 text-white rounded-full p-0.5 border border-white dark:border-dark-950">
                  <Zap className="w-2 h-2 fill-current" aria-hidden="true" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Sheet<span className="text-emerald-700 dark:text-brand-400">Automate</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-sm leading-relaxed">
              100% Free &amp; Open-Source Google Sheets automation catalog ({FLOWS.length} flows) and Manifest V3 Chrome Extension. Zero subscriptions, in-tenant execution, and triple-audited security.
            </p>

            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Mail className="w-3.5 h-3.5 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
                <span>contact@sheetautomate.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
                <span>
                  Audited: Community + {AUDIT_STATUS.aiSecurity.label} + VT {AUDIT_STATUS.virustotal.label}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs uppercase font-mono tracking-wider text-slate-900 dark:text-slate-200 font-bold">
              Navigation
            </h3>
            <nav aria-label="Footer">
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-400">
                <li>
                  <a href="#catalog" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                    Flow Catalog ({FLOWS.length})
                  </a>
                </li>
                <li>
                  <a href="#extension" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                    Chrome Extension
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                    Security &amp; Audits
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Community CTA */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-xs uppercase font-mono tracking-wider text-slate-900 dark:text-slate-200 font-bold">
              Open Source Community
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              MIT Licensed and community maintained. Star the repo, add a new flow folder via PR, or deploy any workflow in 60 seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={onExploreFlows}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs tracking-wide shadow-sm shadow-brand-500/20 transition-all cursor-pointer min-h-[44px]"
              >
                <span>Explore Free Flows</span>
              </button>

              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition-colors min-h-[44px]"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright & Legal Links */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <p>© {new Date().getFullYear()} SheetAutomate. Open-source under the MIT License.</p>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer min-h-[36px] flex items-center"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer min-h-[36px] flex items-center"
            >
              MIT License &amp; Terms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
