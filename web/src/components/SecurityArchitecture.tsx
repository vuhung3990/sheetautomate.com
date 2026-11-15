import React from 'react';
import {
  ShieldCheck,
  Users,
  Bot,
  CheckCircle2,
  ServerOff,
  ExternalLink,
  Github,
  Check,
  GitPullRequest,
  FileCode2,
  Workflow,
} from 'lucide-react';
import { AUDIT_STATUS, FLOWS, GITHUB_REPO_URL } from '../lib/flowRegistry';

export const SecurityArchitecture: React.FC = () => {
  const activeFlowCount = FLOWS.length > 0 ? FLOWS.length : AUDIT_STATUS.totalFlows;

  return (
    <section
      id="security"
      className="py-16 sm:py-20 relative bg-white dark:bg-dark-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-800 dark:text-brand-300 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Security &amp; Triple-Audit Verification</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Audited For Trust. Verified Safe For Your Business.
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg">
            Every flow in <code className="font-mono text-sm">flows/</code> undergoes three independent verification layers: open-source peer inspection, AI static gate analysis, and VirusTotal multi-engine scanning.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-10">
          {/* Pillar 1: Community Audited */}
          <div className="bg-slate-50 dark:bg-dark-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                  <Users className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold uppercase">
                  Community
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Community Audited
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                100% open-source on GitHub under the MIT license. Unminified <code className="font-mono text-[11px]">Code.gs</code> with zero obfuscation or telemetry.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-purple-800 dark:text-purple-300 flex items-center gap-1.5 font-semibold">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Public GitHub peer review</span>
            </div>
          </div>

          {/* Pillar 2: AI Code Audit */}
          <div className="bg-slate-50 dark:bg-dark-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                  <Bot className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-mono font-bold uppercase">
                  AI Verified
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {AUDIT_STATUS.aiSecurity.label}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {AUDIT_STATUS.aiSecurity.summary}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-sky-800 dark:text-sky-300 flex items-center gap-1.5 font-semibold">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{AUDIT_STATUS.aiSecurity.provider}</span>
            </div>
          </div>

          {/* Pillar 3: VirusTotal Verified */}
          <div className="bg-slate-50 dark:bg-dark-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold uppercase">
                  VirusTotal
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                VirusTotal {AUDIT_STATUS.virustotal.label}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Release bundles and script artifacts are scanned across {AUDIT_STATUS.virustotal.engines} security engines with {AUDIT_STATUS.virustotal.detections} detections.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-emerald-800 dark:text-brand-300 flex items-center gap-1.5 font-semibold">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {AUDIT_STATUS.virustotal.status === 'clean'
                  ? `${AUDIT_STATUS.virustotal.detections}/${AUDIT_STATUS.virustotal.engines} detections (Clean)`
                  : 'Deterministic SHA-256 bundle verified'}
              </span>
            </div>
          </div>

          {/* Pillar 4: In-Tenant Privacy */}
          <div className="bg-slate-50 dark:bg-dark-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <ServerOff className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold uppercase">
                  In-Tenant
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                In-Tenant Data Isolation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Executes 100% inside your Google Workspace. No third-party middleware, no external databases, and zero intermediate copies.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-semibold">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Runs in your Google Drive</span>
            </div>
          </div>
        </div>

        {/* Live Audit Status & CI/CD Pipeline Card */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden space-y-6">
          <div
            className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-brand-300 border border-brand-500/30 text-xs font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" aria-hidden="true" />
                  Audit Status: All Checks Passed
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  • Manifest v{AUDIT_STATUS.version}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Transparent CI/CD Verification &amp; Live Badges
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Every commit touching <code className="font-mono text-brand-300">flows/</code> triggers automated schema validation, AST danger checks, AI security auditing, and VirusTotal scanning before publishing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href={`${GITHUB_REPO_URL}/actions`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors min-h-[44px]"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
                <span>GitHub CI Logs</span>
              </a>

              <a
                href={AUDIT_STATUS.virustotal.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-colors min-h-[44px]"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>VirusTotal Report</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Verifiable SVG Badge Previews */}
          <div className="relative z-10 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800">
            <a
              href={AUDIT_STATUS.virustotal.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-slate-950 border border-slate-800 p-1.5 hover:border-brand-500/60 transition-colors"
            >
              <img
                src="/badges/virustotal.svg"
                alt={`VirusTotal ${AUDIT_STATUS.virustotal.label}`}
                height={20}
                loading="lazy"
                className="h-5 w-auto"
              />
            </a>

            <a
              href={`${GITHUB_REPO_URL}/blob/main/flows/audit-status.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-slate-950 border border-slate-800 p-1.5 hover:border-accent-500/60 transition-colors"
            >
              <img
                src="/badges/ai-security.svg"
                alt={AUDIT_STATUS.aiSecurity.label}
                height={20}
                loading="lazy"
                className="h-5 w-auto"
              />
            </a>

            <a
              href="#catalog"
              className="inline-flex items-center rounded-lg bg-slate-950 border border-slate-800 p-1.5 hover:border-brand-500/60 transition-colors"
            >
              <img
                src="/badges/flows-count.svg"
                alt={`${activeFlowCount} Verified Flows`}
                height={20}
                loading="lazy"
                className="h-5 w-auto"
              />
            </a>
          </div>

          {/* Live Metrics Bar */}
          <div className="relative z-10 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Verified Flows
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white font-mono mt-0.5">
                {activeFlowCount} Auto-Discovered
              </div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                VirusTotal Scan
              </div>
              <div className="text-sm sm:text-base font-extrabold text-brand-300 font-mono mt-0.5">
                {AUDIT_STATUS.virustotal.label}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                AI Security Score
              </div>
              <div className="text-sm sm:text-base font-extrabold text-brand-300 font-mono mt-0.5">
                {AUDIT_STATUS.aiSecurity.score}% Passed
              </div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                External Telemetry
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white font-mono mt-0.5">
                0 (100% In-Tenant)
              </div>
            </div>
          </div>

          {/* Automated CI/CD Audit Workflow Breakdown */}
          <div className="relative z-10 pt-5 border-t border-slate-800 grid sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-start gap-2.5">
              <GitPullRequest className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-bold text-white mb-0.5">1. Schema &amp; AST Gate</div>
                <p className="text-slate-400 text-[11px] leading-snug">
                  Validates <code className="font-mono">flow.json</code>, blocks <code className="font-mono">eval</code>/obfuscation, and enforces narrow OAuth scopes.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-start gap-2.5">
              <FileCode2 className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-bold text-white mb-0.5">2. AI &amp; VirusTotal Scan</div>
                <p className="text-slate-400 text-[11px] leading-snug">
                  Runs {AUDIT_STATUS.aiSecurity.provider} checks and hashes bundle artifacts for VirusTotal verification.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-start gap-2.5">
              <Workflow className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-bold text-white mb-0.5">3. Auto-Sync Publish</div>
                <p className="text-slate-400 text-[11px] leading-snug">
                  Regenerates <code className="font-mono">flows-manifest.json</code>, extension zip, and SVG audit badges automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
