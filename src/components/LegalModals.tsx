import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalProps> = ({ type, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && type !== null) {
        onClose();
      }
    };
    if (type !== null) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 glass-panel max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {type === 'privacy' ? (
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
              <h3 id="legal-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">Privacy Policy & Data Handling</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs">Last updated: October 2026</p>

            <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Website Inquiries</h4>
              <p>
                When you submit an order or workflow inquiry via our website, your submitted name, work email, package selection, and workflow description are transmitted via email directly to our team. We use this information solely to deliver your template or prepare your custom setup.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Google Workspace In-Tenant Processing</h4>
              <p>
                The document automation systems we provide execute exclusively within your own Google Workspace environment via Google Apps Script. SheetAutomate does not operate a centralized database for your spreadsheet rows, client names, or generated documents.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. OAuth Permissions & Access</h4>
              <p>
                Workflows request only the explicit Google Drive and Spreadsheet scopes necessary to create PDFs in your designated folders. We never request access to your corporate Gmail mailbox or general domain administrative accounts.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">4. Permanent Ownership</h4>
              <p>
                Once you purchase and copy the workflow, all code and templates reside permanently in your Google Drive. We do not maintain any ongoing administrative backdoors.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
              <h3 id="legal-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">Terms of Licensing & Implementation</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs">Last updated: October 2026</p>

            <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. One-Time Workflow License</h4>
              <p>
                All templates ($5) and configured setups ($35/$95) are sold on a perpetual, fixed one-time licensing basis. You may use the workflow indefinitely across your organization with zero recurring platform or subscription charges.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Warranty & Support</h4>
              <p>
                Configured setups include 14 days of bug-fix support. Turnkey custom setups include 30 days of bug-fix support for any repeatable issue deviating from the approved specification.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Unlimited Generation</h4>
              <p>
                SheetAutomate does not limit document export counts. Generations are governed solely by Google's native Workspace quotas.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs cursor-pointer border border-slate-300 dark:border-slate-700 min-h-[44px]"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
