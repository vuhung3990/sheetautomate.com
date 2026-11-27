import React, { useState } from 'react';
import {
  Play,
  Copy,
  Check,
  Github,
  Clock,
  ShieldCheck,
  Bot,
  KeyRound,
  Zap,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Mail,
  ClipboardList,
  Webhook,
} from 'lucide-react';
import type { FlowItem, FlowService } from '../types/flow';
import { AUDIT_STATUS } from '../lib/flowRegistry';

interface FlowCardProps {
  flow: FlowItem;
  index: number;
  onOpenWorkbench: (flow: FlowItem, initialTab?: 'demo' | 'code' | 'setup') => void;
}

function getServiceIcon(service: FlowService): React.ReactNode {
  switch (service) {
    case 'Sheets':
      return <FileSpreadsheet className="w-3 h-3 text-emerald-700 dark:text-brand-400" aria-hidden="true" />;
    case 'Docs':
      return <FileText className="w-3 h-3 text-sky-700 dark:text-accent-400" aria-hidden="true" />;
    case 'Drive':
      return <FolderOpen className="w-3 h-3 text-amber-700 dark:text-amber-400" aria-hidden="true" />;
    case 'Gmail':
      return <Mail className="w-3 h-3 text-rose-700 dark:text-rose-400" aria-hidden="true" />;
    case 'Forms':
      return <ClipboardList className="w-3 h-3 text-purple-700 dark:text-purple-400" aria-hidden="true" />;
    case 'Chat/Webhook':
      return <Webhook className="w-3 h-3 text-sky-700 dark:text-accent-400" aria-hidden="true" />;
  }
}

export const FlowCard: React.FC<FlowCardProps> = ({ flow, index, onOpenWorkbench }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(flow.codeGs);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: open workbench code tab if clipboard permission is blocked
      onOpenWorkbench(flow, 'code');
    }
  };

  const thumbnailSrc = `data:image/svg+xml;utf8,${encodeURIComponent(flow.thumbnailSvg)}`;
  const scopeCount = flow.oauthScopes.length;

  return (
    <article className="group rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/70 dark:hover:border-brand-500/60 hover:shadow-lg dark:hover:shadow-black/40 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Thumbnail Preview Frame */}
      <button
        type="button"
        onClick={() => onOpenWorkbench(flow, 'demo')}
        className="relative aspect-video w-full bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer text-left focus:outline-none"
        aria-label={`Open live demo for ${flow.title}`}
      >
        <img
          src={thumbnailSrc}
          alt={`${flow.title} workflow architecture diagram`}
          width={640}
          height={360}
          loading={index < 3 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : undefined}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />

        {/* Top-left featured / difficulty pill */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {flow.featured && (
            <span className="px-2 py-0.5 rounded-md bg-brand-500 text-slate-950 font-mono text-[10px] font-extrabold uppercase tracking-wide shadow-xs">
              Featured
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-slate-950/85 border border-slate-700 text-slate-200 font-mono text-[10px] font-semibold backdrop-blur-sm">
            {flow.difficulty}
          </span>
        </div>

        {/* Top-right time saved pill */}
        <div className="absolute top-2.5 right-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/85 border border-emerald-500/40 text-brand-300 font-mono text-[10px] font-bold backdrop-blur-sm">
            <Clock className="w-3 h-3" aria-hidden="true" />
            <span>Saves {flow.timeSavedPerWeek}</span>
          </span>
        </div>
      </button>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Category & Trigger Strip */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-brand-500/15 border border-emerald-200 dark:border-brand-500/30 text-emerald-800 dark:text-brand-300 text-[11px] font-semibold">
              {flow.category}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-accent-500/10 border border-sky-200 dark:border-accent-500/30 text-sky-800 dark:text-accent-300 text-[11px] font-medium">
              <Zap className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span className="truncate max-w-[165px]">{flow.trigger}</span>
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug mb-1.5 group-hover:text-emerald-700 dark:group-hover:text-brand-400 transition-colors">
            <button
              type="button"
              onClick={() => onOpenWorkbench(flow, 'demo')}
              className="text-left cursor-pointer hover:underline focus:outline-none"
            >
              {flow.title}
            </button>
          </h3>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2 mb-3">
            {flow.shortDescription}
          </p>

          {/* Service Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {flow.services.map((service) => (
              <span
                key={service}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-slate-700/80 text-[11px] font-medium text-slate-800 dark:text-slate-200"
              >
                {getServiceIcon(service)}
                <span>{service}</span>
              </span>
            ))}
          </div>

          {/* Security Micro-Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono">
            <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-brand-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{flow.audit.vtClean ? `VT ${AUDIT_STATUS.virustotal.label}` : 'SHA-256 Verified'}</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1 text-sky-800 dark:text-accent-300 font-semibold">
              <Bot className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>AI {flow.audit.aiScore}%</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
              <KeyRound className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{scopeCount} {scopeCount === 1 ? 'Scope' : 'Scopes'}</span>
            </span>
          </div>
        </div>

        {/* 3 Immediate Action Buttons */}
        <div className="grid grid-cols-12 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenWorkbench(flow, 'demo')}
            className="col-span-5 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer min-h-[40px] shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true" />
            <span>Live Demo</span>
          </button>

          <button
            type="button"
            onClick={handleCopyScript}
            className={`col-span-4 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl font-semibold text-xs border transition-colors cursor-pointer min-h-[40px] ${
              copied
                ? 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-brand-300'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-dark-850 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Copy Script</span>
              </>
            )}
          </button>

          <a
            href={flow.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${flow.title} source on GitHub`}
            className="col-span-3 inline-flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-dark-950 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors min-h-[40px]"
          >
            <Github className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </article>
  );
};
