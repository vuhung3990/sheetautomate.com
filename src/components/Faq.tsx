import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-what-included',
    question: "What do I receive when I purchase the $5 template?",
    answer: "You receive an instant copy link to a ready-to-run Google Sheet, a matching Google Doc layout template (invoice, work order, or certificate), and the complete, unminified Google Apps Script automation code. A step-by-step video and visual markdown guide show you how to copy it to your Google Drive in under 3 minutes."
  },
  {
    id: 'faq-really-one-time',
    question: "Is it really a one-time payment with zero monthly subscriptions?",
    answer: "Yes, 100%. Once you copy the sheet and template into your Google Drive, the automation runs entirely via Google Apps Script inside your own Google account. There are no monthly platform fees, no recurring credit cards, and no per-document merge charges."
  },
  {
    id: 'faq-35-setup',
    question: "How does the $35 Configured Setup work?",
    answer: "If you don't want to spend time matching column headers or inserting your company logo, our engineer does it for you. You share a copy of your spreadsheet columns and logo; within 48 hours, we deliver a fully configured, tested workflow tailored to your brand, backed by 14 days of bug-fix support."
  },
  {
    id: 'faq-data-privacy',
    question: "Does any of our customer or financial data touch your servers?",
    answer: "Zero. None. SheetAutomate does not host a centralized database or proxy server for your document contents. All automations execute natively within your own Google Workspace account. Your data flows directly from your Google Sheet or Form into Google Docs/Drive without ever exiting Google Cloud infrastructure."
  },
  {
    id: 'faq-limits',
    question: "Are there any limits on how many PDFs I can generate?",
    answer: "SheetAutomate imposes zero document quotas. The only limits are Google's standard native Apps Script daily quotas (e.g. 1,500 documents created per day for Google Workspace accounts, with script execution time limits of 6 minutes per batch run). We provide automated batching patterns to stay safely within Google platform thresholds."
  },
  {
    id: 'faq-line-items',
    question: "What if I need invoices with multiple dynamic line items?",
    answer: "Our $95 Turnkey Custom package is designed specifically for dynamic multi-row tables (e.g. 1 to 10 itemized services with subtotal, tax, and discount calculations). It also includes Google Form instant triggers and conditional template routing."
  }
];

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 relative bg-white dark:bg-dark-900/40 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-800 dark:text-brand-300 mb-3">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg">
            Practical details on workflow templates, setup assistance, and one-time licensing.
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950/80 overflow-hidden glass-panel transition-colors shadow-xs"
              >
                <button
                  type="button"
                  id={`btn-${item.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${item.id}`}
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 text-slate-900 dark:text-white hover:text-emerald-800 dark:hover:text-brand-300 transition-colors cursor-pointer min-h-[48px]"
                >
                  <span className="font-bold text-sm sm:text-base leading-snug">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-emerald-100 dark:bg-brand-500/20 text-emerald-800 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`panel-${item.id}`}
                    role="region"
                    aria-labelledby={`btn-${item.id}`}
                    className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800/60 pt-4 animate-in fade-in"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
