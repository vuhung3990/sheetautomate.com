import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Code2,
  Table2,
  ShieldCheck,
  ExternalLink,
  Github,
  FileText,
  Mail,
  FileSpreadsheet,
  Webhook,
  KeyRound,
  Bot,
  Share2,
  RefreshCw,
  ListChecks,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { FlowItem } from '../types/flow';
import {
  AUDIT_STATUS,
  buildSheetTsv,
  describeOAuthScope,
} from '../lib/flowRegistry';

export type WorkbenchTab = 'demo' | 'code' | 'setup';

interface FlowWorkbenchModalProps {
  flow: FlowItem | null;
  initialTab?: WorkbenchTab;
  onClose: () => void;
}

type TestScenario = 'valid' | 'missing' | 'duplicate';

interface SimulationResult {
  status: 'COMPLETED' | 'NEEDS_CORRECTION' | 'SKIPPED';
  message: string;
  updatedCell: string;
  timestamp: string;
}

function buildInitialFieldState(flow: FlowItem): Record<string, string> {
  const initial: Record<string, string> = {};
  for (const field of flow.demo.fields) {
    initial[field.key] = field.defaultValue;
  }
  return initial;
}

export const FlowWorkbenchModal: React.FC<FlowWorkbenchModalProps> = ({
  flow,
  initialTab = 'demo',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>(initialTab);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [scenario, setScenario] = useState<TestScenario>('valid');
  const [running, setRunning] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedTsv, setCopiedTsv] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showRawManifest, setShowRawManifest] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Reset local workbench state whenever flow or initialTab changes
  useEffect(() => {
    if (!flow) return;
    setActiveTab(initialTab);
    setFieldValues(buildInitialFieldState(flow));
    setScenario('valid');
    setRunning(false);
    setSimResult(null);
    setCopiedCode(false);
    setCopiedTsv(false);
    setCopiedLink(false);
    setShowRawManifest(false);
  }, [flow, initialTab]);

  // Body scroll lock, focus management & Escape handler
  useEffect(() => {
    if (!flow) {
      document.body.style.overflow = 'unset';
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      const prev = previousFocusRef.current;
      if (prev && prev.isConnected) {
        if (!prev.closest('[inert]')) {
          prev.focus();
        } else {
          window.requestAnimationFrame(() => prev.focus());
        }
      }
    };
  }, [flow, onClose]);

  if (!flow) return null;

  const primaryField = flow.demo.fields.find((f) => f.required) ?? flow.demo.fields[0];

  const handleScenarioSelect = (nextScenario: TestScenario) => {
    if (running) return;
    setScenario(nextScenario);
    setSimResult(null);
    const defaults = buildInitialFieldState(flow);
    if (nextScenario === 'missing' && primaryField) {
      defaults[primaryField.key] = '';
    }
    setFieldValues(defaults);
  };

  const handleResetDemo = () => {
    if (running) return;
    setScenario('valid');
    setFieldValues(buildInitialFieldState(flow));
    setSimResult(null);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    setSimResult(null);
  };

  const runSimulation = () => {
    if (running) return;
    setRunning(true);
    setSimResult(null);

    window.setTimeout(() => {
      setRunning(false);
      const timeStr = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const primaryValue = primaryField ? (fieldValues[primaryField.key] ?? '').trim() : '';

      if (!primaryValue) {
        setSimResult({
          status: 'NEEDS_CORRECTION',
          message: `Validation halted: Required field "${primaryField?.label ?? 'Primary field'}" is empty. LockService released safely.`,
          updatedCell: `${flow.demo.auditColumn} -> NEEDS_CORRECTION`,
          timestamp: timeStr,
        });
        return;
      }

      if (scenario === 'duplicate') {
        setSimResult({
          status: 'SKIPPED',
          message: `Idempotency guard triggered: ${flow.demo.recordId} is already marked COMPLETED. Skipped duplicate run.`,
          updatedCell: `${flow.demo.auditColumn} -> SKIPPED (Already Processed)`,
          timestamp: timeStr,
        });
        return;
      }

      setSimResult({
        status: 'COMPLETED',
        message: `${flow.title} executed successfully inside your Google Workspace sandbox. Audit row updated.`,
        updatedCell: `${flow.demo.auditColumn} -> COMPLETED (${flow.demo.recordId})`,
        timestamp: timeStr,
      });

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        try {
          confetti({
            particleCount: 32,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#10b981', '#0ea5e9'],
          });
        } catch {
          // Ignore if canvas-confetti is blocked
        }
      }
    }, 550);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(flow.codeGs);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  const handleCopyTsv = async () => {
    try {
      await navigator.clipboard.writeText(buildSheetTsv(flow));
      setCopiedTsv(true);
      window.setTimeout(() => setCopiedTsv(false), 2200);
    } catch {
      // Clipboard blocked
    }
  };

  const handleCopyShareLink = async () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?flow=${encodeURIComponent(flow.id)}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  const tabs: Array<{ id: WorkbenchTab; label: string; icon: React.ReactNode }> = [
    { id: 'demo', label: 'Interactive Demo', icon: <Play className="w-4 h-4" aria-hidden="true" /> },
    { id: 'code', label: 'Code & Starter Sheet', icon: <Code2 className="w-4 h-4" aria-hidden="true" /> },
    { id: 'setup', label: '60s Setup & Audit', icon: <ListChecks className="w-4 h-4" aria-hidden="true" /> },
  ];

  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextId = tabs[(idx + 1) % tabs.length].id;
      setActiveTab(nextId);
      document.getElementById(`wb-tab-${nextId}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevId = tabs[(idx - 1 + tabs.length) % tabs.length].id;
      setActiveTab(prevId);
      document.getElementById(`wb-tab-${prevId}`)?.focus();
    }
  };

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="workbench-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 dark:bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full shadow-2xl relative my-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-dark-900/90 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-brand-500/20 text-emerald-800 dark:text-brand-300 text-[11px] font-semibold">
                {flow.category}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-mono text-[11px] font-semibold">
                {flow.difficulty}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 dark:text-brand-300 font-semibold">
                <Clock className="w-3 h-3" aria-hidden="true" />
                Saves {flow.timeSavedPerWeek}
              </span>
            </div>
            <h2
              id="workbench-modal-title"
              className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate"
            >
              {flow.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-dark-950 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer min-h-[40px]"
              title="Copy direct link to this flow"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-brand-400" aria-hidden="true" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close flow workbench"
              className="w-11 h-11 rounded-xl bg-white dark:bg-dark-950 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div
          role="tablist"
          aria-label="Flow Workbench Views"
          className="px-5 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 flex flex-wrap gap-2 shrink-0"
        >
          {tabs.map((tab, idx) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`wb-tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`wb-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer min-h-[40px] ${
                  selected
                    ? 'bg-emerald-50 dark:bg-brand-500/15 border-emerald-500 dark:border-brand-500/60 text-emerald-900 dark:text-brand-300'
                    : 'bg-slate-50 dark:bg-dark-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: INTERACTIVE DEMO */}
          {activeTab === 'demo' && (
            <div
              id="wb-panel-demo"
              role="tabpanel"
              aria-labelledby="wb-tab-demo"
              className="grid lg:grid-cols-12 gap-6 items-start"
            >
              {/* Left: Input Form & Scenarios */}
              <div className="lg:col-span-5 rounded-2xl bg-slate-50 dark:bg-dark-900/70 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Simulated Sheet Input ({flow.sheetSchema.tabName})
                    </h3>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      Record: {flow.demo.recordId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    disabled={running}
                    aria-label="Reset demo fields"
                    title="Reset demo fields"
                    className="w-9 h-9 rounded-lg bg-white dark:bg-dark-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {/* 3 Test Scenario Buttons */}
                <div>
                  <span className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                    Test Scenario:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      disabled={running}
                      onClick={() => handleScenarioSelect('valid')}
                      className={`py-2 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer min-h-[40px] transition-colors ${
                        scenario === 'valid'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-500 text-emerald-950 dark:text-brand-300'
                          : 'bg-white dark:bg-dark-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Standard Valid
                    </button>
                    <button
                      type="button"
                      disabled={running}
                      onClick={() => handleScenarioSelect('missing')}
                      className={`py-2 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer min-h-[40px] transition-colors ${
                        scenario === 'missing'
                          ? 'bg-rose-100 dark:bg-rose-950/70 border-rose-500 text-rose-950 dark:text-rose-300'
                          : 'bg-white dark:bg-dark-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Missing Required Field
                    </button>
                    <button
                      type="button"
                      disabled={running}
                      onClick={() => handleScenarioSelect('duplicate')}
                      className={`py-2 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer min-h-[40px] transition-colors ${
                        scenario === 'duplicate'
                          ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-500 text-amber-950 dark:text-amber-300'
                          : 'bg-white dark:bg-dark-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Duplicate Lock
                    </button>
                  </div>
                </div>

                {/* Dynamic Fields */}
                <div className="space-y-3">
                  {flow.demo.fields.map((field) => {
                    const value = fieldValues[field.key] ?? '';
                    const isEmptyRequired = field.required && !value.trim();
                    const inputId = `wb-input-${flow.id}-${field.key}`;

                    return (
                      <div key={field.key}>
                        <label
                          htmlFor={inputId}
                          className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
                        >
                          {field.label}{' '}
                          {field.required && (
                            <span className={isEmptyRequired ? 'text-rose-700 dark:text-rose-400 font-bold' : 'text-emerald-700 dark:text-brand-400'}>
                              {isEmptyRequired ? '(Required — Empty)' : '*'}
                            </span>
                          )}
                        </label>
                        {field.multiline ? (
                          <textarea
                            id={inputId}
                            rows={2}
                            value={value}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-950 border text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none ${
                              isEmptyRequired
                                ? 'border-rose-500'
                                : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-brand-500'
                            }`}
                          />
                        ) : (
                          <input
                            id={inputId}
                            type="text"
                            value={value}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-950 border text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none min-h-[40px] ${
                              isEmptyRequired
                                ? 'border-rose-500'
                                : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-brand-500'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Simulate Button */}
                <button
                  type="button"
                  onClick={runSimulation}
                  disabled={running}
                  className="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer min-h-[44px] shadow-md shadow-brand-500/20 transition-all"
                >
                  {running ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Running LockService &amp; Validation...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                      <span>Simulate Automation Run</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right: Spreadsheet Audit Log & Output Preview */}
              <div className="lg:col-span-7 space-y-5">
                {/* Spreadsheet Audit Log Table */}
                <div className="rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                  <div className="px-4 py-3 bg-slate-100 dark:bg-dark-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
                      Spreadsheet Audit Log ({flow.sheetSchema.tabName})
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      {flow.demo.auditColumn}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-dark-950 text-slate-600 dark:text-slate-400 font-mono border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-2.5 px-4">Record ID</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4">Audit Output</th>
                          <th className="py-2.5 px-4">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                            {flow.demo.recordId}
                          </td>
                          <td className="py-3 px-4">
                            {!simResult ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold">
                                READY
                              </span>
                            ) : simResult.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-brand-300 font-mono text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                                COMPLETED
                              </span>
                            ) : simResult.status === 'NEEDS_CORRECTION' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-300 font-mono text-[11px] font-bold">
                                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                                NEEDS_CORRECTION
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-mono text-[11px] font-bold">
                                SKIPPED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {simResult ? simResult.updatedCell : 'Awaiting simulation run...'}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {simResult ? simResult.timestamp : '—'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {simResult && (
                    <div
                      className={`px-4 py-2.5 text-xs border-t ${
                        simResult.status === 'COMPLETED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-brand-300'
                          : simResult.status === 'NEEDS_CORRECTION'
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-300'
                          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300'
                      }`}
                    >
                      {simResult.message}
                    </div>
                  )}
                </div>

                {/* Tailored Output Preview Card */}
                <OutputPreviewCard
                  flow={flow}
                  fieldValues={fieldValues}
                  simResult={simResult}
                />
              </div>
            </div>
          )}

          {/* TAB 2: CODE & STARTER SHEET */}
          {activeTab === 'code' && (
            <div
              id="wb-panel-code"
              role="tabpanel"
              aria-labelledby="wb-tab-code"
              className="space-y-6"
            >
              {/* Code.gs Viewer */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-900 text-slate-100">
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-brand-400" aria-hidden="true" />
                    <span className="font-mono text-xs font-bold text-white">
                      flows/{flow.id}/Code.gs
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      Apps Script V8 • Unminified
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer min-h-[36px] transition-colors ${
                      copiedCode
                        ? 'bg-brand-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Copied Code.gs!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Copy Code.gs</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 overflow-x-auto max-h-72 text-xs font-mono leading-relaxed text-slate-200">
                  <code>{flow.codeGs}</code>
                </pre>
              </div>

              {/* OAuth Scopes Breakdown */}
              <div className="rounded-2xl bg-slate-50 dark:bg-dark-900/70 border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Least-Privilege OAuth Scopes (<code className="font-mono text-xs">appsscript.json</code>)
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowRawManifest(!showRawManifest)}
                    className="text-xs font-mono font-semibold text-emerald-800 dark:text-brand-300 hover:underline cursor-pointer"
                  >
                    {showRawManifest ? 'Hide Raw JSON' : 'View appsscript.json'}
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {flow.oauthScopes.map((scope) => {
                    const info = describeOAuthScope(scope);
                    return (
                      <div
                        key={scope}
                        className="p-3.5 rounded-xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {info.shortName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-brand-500/15 text-emerald-800 dark:text-brand-300 font-mono text-[10px] font-bold">
                            {info.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-1.5">
                          {info.rationale}
                        </p>
                        <code className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 break-all">
                          {info.scope}
                        </code>
                      </div>
                    );
                  })}
                </div>

                {showRawManifest && (
                  <pre className="mt-3 p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                    <code>{flow.appsScriptJson}</code>
                  </pre>
                )}
              </div>

              {/* Starter Google Sheet Schema & TSV Helper */}
              <div className="rounded-2xl bg-slate-50 dark:bg-dark-900/70 border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Table2 className="w-4 h-4 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
                      <span>Starter Google Sheet ({flow.sheetSchema.tabName})</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Copy the tab-separated starter table and paste directly into cell <code className="font-mono">A1</code> on a fresh sheet.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyTsv}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer min-h-[40px] transition-colors ${
                        copiedTsv
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-brand-300'
                          : 'bg-white dark:bg-dark-950 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white'
                      }`}
                    >
                      {copiedTsv ? (
                        <>
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Copied TSV!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Copy Sample Table (TSV)</span>
                        </>
                      )}
                    </button>

                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs min-h-[40px] transition-colors"
                    >
                      <span>Open sheets.new &amp; Paste</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>

                    {flow.copySheetUrl && (
                      <a
                        href={flow.copySheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs min-h-[40px] transition-colors"
                      >
                        <span>Copy Template Sheet</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-dark-850 font-mono text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        {flow.sheetSchema.headers.map((header) => (
                          <th key={header} className="py-2.5 px-3 whitespace-nowrap font-bold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {flow.sheetSchema.sampleRows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 whitespace-nowrap font-mono text-[11px]">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 60S SETUP & AUDIT */}
          {activeTab === 'setup' && (
            <div
              id="wb-panel-setup"
              role="tabpanel"
              aria-labelledby="wb-tab-setup"
              className="grid md:grid-cols-12 gap-6"
            >
              {/* 3-Step Setup Guide */}
              <div className="md:col-span-7 rounded-2xl bg-slate-50 dark:bg-dark-900/70 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  60-Second Workspace Deployment
                </h3>

                <ol className="space-y-3">
                  {flow.setupSteps.map((step, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-800"
                    >
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-brand-500/20 border border-emerald-300 dark:border-brand-500/30 text-emerald-800 dark:text-brand-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        0{index + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('code')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs cursor-pointer min-h-[40px]"
                  >
                    <Code2 className="w-4 h-4" aria-hidden="true" />
                    <span>Go to Code &amp; Starter Table</span>
                  </button>

                  <a
                    href={flow.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-dark-950 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs min-h-[40px]"
                  >
                    <Github className="w-4 h-4" aria-hidden="true" />
                    <span>Inspect Source Folder</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Security & Integrity Audit Card */}
              <div className="md:col-span-5 rounded-2xl bg-slate-900 text-white border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-300">
                    Triple-Audit Integrity
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-brand-300 font-mono text-[11px] font-bold">
                    {flow.audit.aiStatus}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-400" aria-hidden="true" />
                      <span>VirusTotal Status</span>
                    </div>
                    <div className="font-mono font-bold text-white">
                      {flow.audit.vtClean ? AUDIT_STATUS.virustotal.label : 'Pending Scan'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] mb-1">
                      <Bot className="w-3.5 h-3.5 text-accent-400" aria-hidden="true" />
                      <span>AI Security Audit Score</span>
                    </div>
                    <div className="font-mono font-bold text-brand-300 mb-1">
                      {flow.audit.aiScore}% ({AUDIT_STATUS.aiSecurity.provider})
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {flow.audit.notes}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-slate-400 font-mono text-[11px] mb-1">
                      Code.gs SHA-256 Checksum
                    </div>
                    <code className="block font-mono text-[11px] text-slate-200 break-all">
                      {flow.audit.sha256}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface OutputPreviewCardProps {
  flow: FlowItem;
  fieldValues: Record<string, string>;
  simResult: SimulationResult | null;
}

const OutputPreviewCard: React.FC<OutputPreviewCardProps> = ({
  flow,
  fieldValues,
  simResult,
}) => {
  const { outputType, outputTitle, outputSubtitle, recordId, fields } = flow.demo;

  const badgeIcon =
    outputType === 'pdf-document' ? (
      <FileText className="w-4 h-4 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
    ) : outputType === 'email-dispatch' ? (
      <Mail className="w-4 h-4 text-sky-700 dark:text-accent-400" aria-hidden="true" />
    ) : outputType === 'alert-webhook' ? (
      <Webhook className="w-4 h-4 text-amber-700 dark:text-amber-400" aria-hidden="true" />
    ) : (
      <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
    );

  const outputTypeLabel =
    outputType === 'pdf-document'
      ? 'Google Doc -> Drive PDF Output'
      : outputType === 'email-dispatch'
      ? 'Gmail Automated Dispatch Preview'
      : outputType === 'alert-webhook'
      ? 'Alert & Optional Webhook Payload'
      : 'Sheet Row Transformation & Lock Output';

  const halted = simResult?.status === 'NEEDS_CORRECTION';

  return (
    <div className="rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      <div className="px-4 py-3 bg-slate-100 dark:bg-dark-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          {badgeIcon}
          <span>{outputTypeLabel}</span>
        </span>
        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-mono text-[10px] font-semibold">
          {recordId}
        </span>
      </div>

      <div className={`p-5 ${halted ? 'opacity-60' : ''}`}>
        <div className="flex flex-wrap items-start justify-between gap-2 pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              {outputTitle}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {outputSubtitle}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-brand-500/15 border border-emerald-200 dark:border-brand-500/30 text-emerald-800 dark:text-brand-300 font-mono text-[11px] font-bold">
            {halted ? 'HALTED (INVALID INPUT)' : simResult ? 'DISPATCHED' : 'LIVE PREVIEW'}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {fields.map((field) => {
            const val = fieldValues[field.key] ?? '';
            return (
              <div
                key={field.key}
                className={`p-3 rounded-xl border ${
                  field.highlight
                    ? 'bg-emerald-50/70 dark:bg-brand-500/10 border-emerald-200 dark:border-brand-500/30'
                    : 'bg-slate-50 dark:bg-dark-950 border-slate-200 dark:border-slate-800'
                } ${field.multiline ? 'sm:col-span-2' : ''}`}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  {field.label}
                </div>
                <div
                  className={`text-xs sm:text-sm font-semibold break-words ${
                    !val.trim()
                      ? 'text-rose-700 dark:text-rose-400 italic'
                      : field.highlight
                      ? 'text-emerald-900 dark:text-brand-300'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {val.trim() ? val : '[Missing required value]'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
