import React from 'react';
import { FileSpreadsheet, Zap, Mail, Clock } from 'lucide-react';

interface FooterProps {
  onOpenIntake: () => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenIntake, onOpenLegal }) => {
  return (
    <footer className="bg-slate-100 dark:bg-dark-950 border-t border-slate-200 dark:border-slate-800/80 pt-16 pb-12 relative overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-200 dark:border-slate-800/80">
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
              One-time Google Workspace document generation workflows starting from $5. Pay once, unlimited generations, zero monthly subscriptions.
            </p>

            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Mail className="w-3.5 h-3.5 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
                <span>contact@sheetautomate.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Turnaround: Instant template copy or 24-48h custom setup</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-900 dark:text-slate-200 font-bold">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-400">
              <li>
                <a href="#how-it-works" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#examples" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Live Demo
                </a>
              </li>
              <li>
                <a href="#when-fit" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Why One-Time?
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Security & Ownership
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Pricing (From $5)
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Engagement */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-900 dark:text-slate-200 font-bold">
              Workflow Request
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Have a custom spreadsheet or Form that needs automating? Get started with our $5 self-deploy template or request a $35 done-for-you configuration.
            </p>

            <button
              onClick={onOpenIntake}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-brand-500/20 transition-all cursor-pointer min-h-[44px]"
            >
              <span>Get Workflow (From $5)</span>
            </button>
          </div>
        </div>

        {/* Copyright & Legal Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <p>© {new Date().getFullYear()} SheetAutomate.com. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer min-h-[36px] flex items-center"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer min-h-[36px] flex items-center"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
