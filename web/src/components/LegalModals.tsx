import React, { useEffect, useRef } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && type !== null) {
        onClose();
      }
    };
    if (type !== null) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialogRef.current?.focus();
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      if (type !== null) {
        const prev = previousFocusRef.current;
        if (prev && prev.isConnected) {
          if (!prev.closest('[inert]')) {
            prev.focus();
          } else {
            window.requestAnimationFrame(() => prev.focus());
          }
        }
      }
    };
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 glass-panel max-h-[85vh] overflow-y-auto">
        <button
          type="button"
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
              <h3 id="legal-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Privacy Policy &amp; Zero-Tracking Guarantee
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Last updated: November 2026 • 100% In-Tenant Privacy
            </p>

            <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                1. Zero External Data Collection
              </h4>
              <p>
                SheetAutomate does not collect, record, process, or sell your documents, spreadsheet cells, client identities, or financial figures. All Apps Script automations execute exclusively within your own Google Workspace container.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                2. Chrome Extension (Manifest V3) Privacy
              </h4>
              <p>
                The SheetAutomate Chrome Extension does not read your spreadsheet cell contents, capture cookies, or send browsing telemetry. It operates purely as a local catalog &amp; clipboard helper using bundled flow metadata.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                3. Least-Privilege OAuth Scopes
              </h4>
              <p>
                Every flow declares its exact minimal OAuth scopes in <code className="font-mono text-xs">appsscript.json</code> (such as <code className="font-mono text-xs">spreadsheets.currentonly</code> and <code className="font-mono text-xs">drive.file</code>).
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                4. Zero Telemetry &amp; Tracking Cookies
              </h4>
              <p>
                Neither the website nor the Apps Script templates include analytics telemetry, third-party ad trackers, or tracking pixels. Only your light/dark theme preference is stored locally in <code className="font-mono text-xs">localStorage</code>.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
              <h3 id="legal-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Open Source License (MIT) &amp; Terms
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              The MIT License (MIT) • Copyright © 2026 SheetAutomate
            </p>

            <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                1. Permission Notice
              </h4>
              <p>
                Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                2. 100% Free Forever
              </h4>
              <p>
                SheetAutomate is provided free of charge for both private personal projects and commercial enterprise deployments. There are no licensing royalties or recurring fees.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                3. Disclaimer of Warranty
              </h4>
              <p className="font-mono text-[11px] bg-slate-100 dark:bg-dark-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
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
