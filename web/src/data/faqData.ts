export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-really-free',
    question: 'Is SheetAutomate really 100% free with zero catch?',
    answer:
      'Yes. Every workflow in the catalog and the companion Chrome Extension are 100% free and open source under the MIT License. There are no subscriptions, credit cards, trial expirations, or per-document fees.',
  },
  {
    id: 'faq-auto-sync-pr',
    question: 'How does adding a folder in flows/ auto-update the website and extension?',
    answer:
      'Each flow lives in its own self-contained folder under flows/<slug>/ containing flow.json, Code.gs, appsscript.json, thumbnail.svg, and README.md. When a Pull Request is merged on GitHub, Vite auto-discovers the folder at build time and GitHub Actions regenerates flows-manifest.json, the Chrome Extension bundle, and the security audit badges automatically.',
  },
  {
    id: 'faq-chrome-extension',
    question: 'How does the Chrome Extension (Manifest V3) work inside Google Sheets?',
    answer:
      'The Chrome Extension renders a lightweight floating assistant drawer when you visit Google Sheets so you can search flows, copy Code.gs, and paste starter table headers in one click. It uses zero tracking, never reads or transmits your spreadsheet cell data, and ships with an offline-ready flows-bundle.json synced via GitHub Actions.',
  },
  {
    id: 'faq-triple-audit',
    question: 'How is every flow audited by the Community, AI, and VirusTotal?',
    answer:
      'First, all Code.gs scripts are published unminified on GitHub for public review. Second, our CI pipeline runs static AST security checks and AI multi-model auditing to enforce least-privilege OAuth scopes and LockService idempotency. Third, release artifacts are scanned across 70+ security engines on VirusTotal with 0 detections.',
  },
  {
    id: 'faq-data-privacy',
    question: 'Does any spreadsheet or customer data leave my Google Workspace?',
    answer:
      'Never. SheetAutomate does not run any backend proxy or database. All scripts execute natively inside Google Apps Script under your own Google Account, moving data directly between your Google Sheets, Docs, Drive, and Gmail.',
  },
  {
    id: 'faq-limits',
    question: 'Are there any limits on how many documents or emails I can automate?',
    answer:
      'SheetAutomate imposes zero artificial caps. You are only governed by Google Workspace’s standard daily Apps Script quotas (such as 1,500 document creations/day and 6-minute batch execution windows).',
  },
  {
    id: 'faq-customize',
    question: 'Can I customize or use SheetAutomate for commercial client projects?',
    answer:
      'Yes! Under the permissive MIT License, you can freely modify the Code.gs scripts, swap Google Doc templates, add custom webhooks in Script Properties, and deploy them for internal teams or commercial client engagements.',
  },
];
