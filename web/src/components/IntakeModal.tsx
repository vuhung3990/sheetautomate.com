import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ArrowRight, Lock, Copy, Check } from 'lucide-react';

interface IntakeModalProps {
  isOpen: boolean;
  initialPlan?: string;
  onClose: () => void;
}

export const IntakeModal: React.FC<IntakeModalProps> = ({ 
  isOpen, 
  initialPlan = 'Self-Deploy Template ($5 one-time)', 
  onClose 
}) => {
  const [selectedPackage, setSelectedPackage] = useState(initialPlan);
  const [docType, setDocType] = useState('B2B Invoices & Billing');
  const [dataSource, setDataSource] = useState('Google Sheets Rows');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSelectedPackage(initialPlan);
  }, [initialPlan]);

  // Reset state and lock body scroll on modal open/close
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setCopied(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const buildInquiryText = () => {
    return `Workflow Request - SheetAutomate.com:
------------------------------------------
Package Selected: ${selectedPackage}
Document Type: ${docType}
Data Source: ${dataSource}
Name: ${name || 'Not provided'}
Work Email: ${email}
Notes / Custom Specs: ${notes || 'None provided'}
------------------------------------------
Payment: Fixed one-time (Zero subscriptions)
Direct inquiry generated via sheetautomate.com`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const subject = encodeURIComponent(`SheetAutomate Order / Delivery: ${selectedPackage} - ${docType}`);
    const body = encodeURIComponent(buildInquiryText());
    const mailtoUrl = `mailto:contact@sheetautomate.com?subject=${subject}&body=${body}`;

    try {
      window.location.href = mailtoUrl;
    } catch {
      // Handled via copy button on next screen
    }

    setSubmitted(true);
  };

  const handleCopyInquiry = async () => {
    try {
      await navigator.clipboard.writeText(buildInquiryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // If clipboard access is restricted
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  const isTemplatePlan = selectedPackage.includes('$5');

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="intake-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-700/80 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 glass-panel">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {!submitted ? (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-slate-800 text-xs font-mono text-emerald-900 dark:text-brand-300 mb-2 border border-emerald-300 dark:border-slate-700">
                <span>Fixed One-Time Workflow Request</span>
              </div>
              <h3 id="intake-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Get Your Workspace Workflow
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
                Zero subscriptions. {isTemplatePlan ? 'We dispatch your copy link and guide immediately.' : 'We contact you for branded configuration within 24 hours.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Package Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                  1. Selected workflow package
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPackage('Self-Deploy Template ($5 one-time)')}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer min-h-[44px] ${
                      selectedPackage.includes('$5')
                        ? 'border-brand-500 bg-emerald-50 dark:bg-brand-500/15 text-emerald-950 dark:text-brand-300 font-bold'
                        : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-dark-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] opacity-80">Self-Deploy</div>
                    <div className="text-sm font-bold">$5 one-time</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPackage('Configured Workflow ($35 one-time)')}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer min-h-[44px] ${
                      selectedPackage.includes('$35')
                        ? 'border-brand-500 bg-emerald-50 dark:bg-brand-500/15 text-emerald-950 dark:text-brand-300 font-bold'
                        : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-dark-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] opacity-80">Configured</div>
                    <div className="text-sm font-bold">$35 one-time</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPackage('Turnkey Custom Workflow ($95 one-time)')}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer min-h-[44px] ${
                      selectedPackage.includes('$95')
                        ? 'border-brand-500 bg-emerald-50 dark:bg-brand-500/15 text-emerald-950 dark:text-brand-300 font-bold'
                        : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-dark-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] opacity-80">Turnkey</div>
                    <div className="text-sm font-bold">$95 one-time</div>
                  </button>
                </div>
              </div>

              {/* Document Type & Source */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="doc-type-select" className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                    2. Document type
                  </label>
                  <select
                    id="doc-type-select"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 cursor-pointer min-h-[44px]"
                  >
                    <option value="B2B Invoices & Billing">B2B Invoices & Billing</option>
                    <option value="Sales Quotes & Estimates">Sales Quotes & Estimates</option>
                    <option value="Work Orders & Inspection Reports">Work Orders & Inspection Reports</option>
                    <option value="Certificates of Completion / Diplomas">Certificates of Completion / Diplomas</option>
                    <option value="Packing Slips & Warehouse Receipts">Packing Slips & Warehouse Receipts</option>
                    <option value="Custom Document Workflow">Custom Document Workflow</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="data-source-select" className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                    3. Data source
                  </label>
                  <select
                    id="data-source-select"
                    value={dataSource}
                    onChange={(e) => setDataSource(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 cursor-pointer min-h-[44px]"
                  >
                    <option value="Google Sheets Rows">Google Sheets Rows</option>
                    <option value="Google Forms Submission">Google Forms Submission</option>
                    <option value="Other / Multiple Sources">Other / Multiple Sources</option>
                  </select>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="user-name-input" className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="user-name-input"
                    type="text"
                    placeholder="e.g. Alex Henderson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label htmlFor="user-email-input" className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                    Work Email <span className="text-emerald-700 dark:text-brand-400">*</span>
                  </label>
                  <input
                    id="user-email-input"
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="user-notes-input" className="block text-xs font-bold text-slate-800 dark:text-slate-300 mb-1.5">
                  {isTemplatePlan ? 'Preferred layout preferences (optional)' : 'Workflow specs or custom columns (optional)'}
                </label>
                <textarea
                  id="user-notes-input"
                  rows={2}
                  placeholder={isTemplatePlan ? "e.g. Prefer invoice template with net 30 terms..." : "e.g. Need invoice with custom logo and PDF saved into 2026 Drive folder..."}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700 dark:text-brand-400 shrink-0" aria-hidden="true" />
                <span>Zero recurring fees. Deployed directly into your Google Workspace account.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm tracking-wide shadow-md shadow-brand-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2 cursor-pointer min-h-[48px]"
              >
                <span>{isTemplatePlan ? 'Get $5 Template Package' : `Order Workflow (${selectedPackage.split(' ')[0]})`}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="py-6 space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-brand-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>

            <div className="text-center">
              <h3 id="intake-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Order Details Prepared
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                Your email client should have opened to confirm your order. You can also copy the details below and email directly to:
              </p>
              <div className="mt-2 font-mono text-emerald-800 dark:text-emerald-400 text-xs font-bold">
                contact@sheetautomate.com
              </div>
            </div>

            {/* Copy Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-300 relative">
              <pre className="whitespace-pre-wrap text-[11px]">
                {buildInquiryText()}
              </pre>
              <button
                type="button"
                onClick={handleCopyInquiry}
                className="mt-3 w-full py-2.5 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    <span className="text-emerald-800 dark:text-emerald-300 font-bold">Order Details Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy Order Details</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs cursor-pointer min-h-[44px]"
              >
                Close Dialog
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
