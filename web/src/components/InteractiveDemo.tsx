import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Building, 
  DollarSign, 
  Award, 
  RotateCcw,
  AlertCircle,
  Clock,
  Eye,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TemplateOption {
  id: 'invoice' | 'workorder' | 'certificate';
  name: string;
  icon: React.ReactNode;
  subtitle: string;
  defaultData: {
    recordId: string;
    field1: string;
    field2: string;
    field3: string;
    field4: string;
  };
  labels: {
    field1: string;
    field2: string;
    field3: string;
    field4: string;
  };
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'invoice',
    name: 'B2B Client Invoice',
    icon: <DollarSign className="w-4 h-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />,
    subtitle: 'Consulting & Agencies',
    labels: {
      field1: 'Client Company',
      field2: 'Due Date',
      field3: 'Amount Due',
      field4: 'Service Scope'
    },
    defaultData: {
      recordId: 'INV-2026-104',
      field1: 'Acme Cloud Technologies',
      field2: 'Oct 24, 2026',
      field3: '$4,250.00 USD',
      field4: 'Google Workspace Migration & Template Setup'
    }
  },
  {
    id: 'workorder',
    name: 'Field Service Order',
    icon: <Building className="w-4 h-4 text-sky-700 dark:text-accent-400" aria-hidden="true" />,
    subtitle: 'Facilities & Maintenance',
    labels: {
      field1: 'Facility / Site',
      field2: 'Inspection Date',
      field3: 'Technician Name',
      field4: 'Inspection Checklist'
    },
    defaultData: {
      recordId: 'WO-8842-IL',
      field1: 'Nexus Tower, Suite 400',
      field2: 'Nov 02, 2026',
      field3: 'Marcus Vance',
      field4: 'HVAC Sensor Calibration & Air Safety Audit'
    }
  },
  {
    id: 'certificate',
    name: 'Completion Certificate',
    icon: <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" aria-hidden="true" />,
    subtitle: 'HR & Training Programs',
    labels: {
      field1: 'Participant Name',
      field2: 'Completion Date',
      field3: 'Evaluation Score',
      field4: 'Program Title'
    },
    defaultData: {
      recordId: 'CERT-AGY-9920',
      field1: 'Sarah Jenkins',
      field2: 'Oct 23, 2026',
      field3: '98% (Pass with Distinction)',
      field4: 'Data Operations & Workspace Security Architecture'
    }
  }
];

export const InteractiveDemo: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<'invoice' | 'workorder' | 'certificate'>('invoice');
  const activeTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];

  const [formData, setFormData] = useState(activeTemplate.defaultData);
  const [testScenario, setTestScenario] = useState<'valid' | 'missing' | 'duplicate'>('valid');
  const [running, setRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    status: 'COMPLETED' | 'NEEDS_CORRECTION' | 'SKIPPED';
    message: string;
    updatedCell: string;
    timestamp: string;
  } | null>(null);

  const [previewModal, setPreviewModal] = useState<boolean>(false);

  // Close preview modal on Escape and prevent body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewModal) {
        setPreviewModal(false);
      }
    };
    if (previewModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [previewModal]);

  const handleTemplateChange = (id: 'invoice' | 'workorder' | 'certificate') => {
    if (running) return;
    setSelectedTemplateId(id);
    const tmpl = TEMPLATES.find(t => t.id === id);
    if (tmpl) {
      setFormData(tmpl.defaultData);
    }
    setTestScenario('valid');
    setExecutionResult(null);
  };

  const handleScenarioChange = (scenario: 'valid' | 'missing' | 'duplicate') => {
    if (running) return;
    setTestScenario(scenario);
    setExecutionResult(null);
    if (scenario === 'missing') {
      setFormData(prev => ({ ...prev, field1: '' }));
    } else {
      const tmpl = TEMPLATES.find(t => t.id === selectedTemplateId);
      if (tmpl) setFormData(tmpl.defaultData);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setExecutionResult(null);
  };

  const handleReset = () => {
    if (running) return;
    const tmpl = TEMPLATES.find(t => t.id === selectedTemplateId);
    if (tmpl) setFormData(tmpl.defaultData);
    setTestScenario('valid');
    setExecutionResult(null);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const nextIdx = (index + 1) % TEMPLATES.length;
      handleTemplateChange(TEMPLATES[nextIdx].id);
    } else if (e.key === 'ArrowLeft') {
      const prevIdx = (index - 1 + TEMPLATES.length) % TEMPLATES.length;
      handleTemplateChange(TEMPLATES[prevIdx].id);
    }
  };

  const runSimulation = () => {
    if (running) return;
    setRunning(true);
    setExecutionResult(null);

    setTimeout(() => {
      setRunning(false);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Determine validation based on live data and scenario intent
      if (!formData.field1.trim()) {
        setExecutionResult({
          status: 'NEEDS_CORRECTION',
          message: 'Validation failed: Required primary field is empty. PDF generation halted to preserve document standards.',
          updatedCell: 'Col G: [ERROR: Missing Required Field]',
          timestamp: timeStr
        });
      } else if (testScenario === 'duplicate') {
        setExecutionResult({
          status: 'SKIPPED',
          message: 'Duplicate lock detected: Record already has an active file link. Skipped to prevent duplicate generation.',
          updatedCell: 'Col G: [SKIPPED: Existing Link Maintained]',
          timestamp: timeStr
        });
      } else {
        setExecutionResult({
          status: 'COMPLETED',
          message: `PDF generated successfully from template into Drive folder. URL logged to Column G.`,
          updatedCell: `Col G: drive.google.com/open?id=demo_${formData.recordId}`,
          timestamp: timeStr
        });

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
          try {
            confetti({
              particleCount: 35,
              spread: 50,
              origin: { y: 0.6 },
              colors: ['#10b981', '#0ea5e9']
            });
          } catch {
            // Ignore if blocked
          }
        }
      }
    }, 700);
  };

  return (
    <section id="examples" className="py-20 relative bg-slate-100/60 dark:bg-dark-900/40 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-emerald-800 dark:text-brand-300 mb-3">
            <span>Workflow Simulation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Interactive Workflow Examples
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg">
            Test how different business documents and edge-case validations behave in an automated setup.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-mono">
            Sample simulation using fictional data. No connection required to your Google account.
          </p>
        </div>

        {/* Template Selector Tabs */}
        <div 
          role="tablist" 
          aria-label="Workflow Document Templates" 
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          {TEMPLATES.map((tmpl, index) => (
            <button
              key={tmpl.id}
              id={`tab-${tmpl.id}`}
              role="tab"
              aria-selected={selectedTemplateId === tmpl.id}
              aria-controls={`panel-${tmpl.id}`}
              tabIndex={selectedTemplateId === tmpl.id ? 0 : -1}
              disabled={running}
              onClick={() => handleTemplateChange(tmpl.id)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer min-h-[44px] ${
                selectedTemplateId === tmpl.id
                  ? 'bg-emerald-50 dark:bg-brand-500/15 border-emerald-500 dark:border-brand-500/60 text-emerald-950 dark:text-brand-300 shadow-xs'
                  : 'bg-white dark:bg-dark-900/60 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white shadow-xs'
              } ${running ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {tmpl.icon}
              <span>{tmpl.name}</span>
            </button>
          ))}
        </div>

        {/* Simulator Grid */}
        <div 
          id={`panel-${selectedTemplateId}`}
          role="tabpanel"
          aria-labelledby={`tab-${selectedTemplateId}`}
          className="grid lg:grid-cols-12 gap-6 items-start max-w-6xl mx-auto"
        >
          {/* Left Column: Sample Row Inputs */}
          <div className="lg:col-span-5 bg-white dark:bg-dark-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Google Sheet Row (Data Input)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">Record ID: {formData.recordId}</p>
              </div>
              <button
                onClick={handleReset}
                disabled={running}
                title="Reset values"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-slate-800 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Reset simulation to default"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Test Condition Selector */}
            <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">
                Simulate Scenario:
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  disabled={running}
                  onClick={() => handleScenarioChange('valid')}
                  className={`py-2 px-2 rounded-lg font-semibold border text-[11px] transition-colors cursor-pointer min-h-[40px] ${
                    testScenario === 'valid'
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-500 dark:border-emerald-600/60 text-emerald-950 dark:text-emerald-300'
                      : 'bg-white dark:bg-dark-950/60 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Standard Valid
                </button>
                <button
                  type="button"
                  disabled={running}
                  onClick={() => handleScenarioChange('missing')}
                  className={`py-2 px-2 rounded-lg font-semibold border text-[11px] transition-colors cursor-pointer min-h-[40px] ${
                    testScenario === 'missing'
                      ? 'bg-rose-100 dark:bg-rose-950/70 border-rose-500 dark:border-rose-600/60 text-rose-950 dark:text-rose-300'
                      : 'bg-white dark:bg-dark-950/60 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Missing Field
                </button>
                <button
                  type="button"
                  disabled={running}
                  onClick={() => handleScenarioChange('duplicate')}
                  className={`py-2 px-2 rounded-lg font-semibold border text-[11px] transition-colors cursor-pointer min-h-[40px] ${
                    testScenario === 'duplicate'
                      ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-500 dark:border-amber-600/60 text-amber-950 dark:text-amber-300'
                      : 'bg-white dark:bg-dark-950/60 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Duplicate Run
                </button>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-3">
              <div>
                <label htmlFor="sim-field1" className="block text-[11px] font-mono text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                  {activeTemplate.labels.field1} {!formData.field1.trim() && <span className="text-rose-700 dark:text-rose-400 font-bold">(Required — Empty)</span>}
                </label>
                <input
                  id="sim-field1"
                  type="text"
                  disabled={running}
                  value={formData.field1}
                  placeholder={!formData.field1.trim() ? "Empty required field (type here to fix)..." : ""}
                  onChange={(e) => handleInputChange('field1', e.target.value)}
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border transition-colors ${
                    !formData.field1.trim()
                      ? 'border-rose-400 bg-rose-50 dark:border-rose-500/80 dark:bg-rose-950/20 text-rose-950 dark:text-white' 
                      : 'border-slate-300 bg-slate-50 dark:border-slate-700/80 dark:bg-dark-900 text-slate-900 dark:text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sim-field2" className="block text-[11px] font-mono text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                    {activeTemplate.labels.field2}
                  </label>
                  <input
                    id="sim-field2"
                    type="text"
                    disabled={running}
                    value={formData.field2}
                    onChange={(e) => handleInputChange('field2', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="sim-field3" className="block text-[11px] font-mono text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                    {activeTemplate.labels.field3}
                  </label>
                  <input
                    id="sim-field3"
                    type="text"
                    disabled={running}
                    value={formData.field3}
                    onChange={(e) => handleInputChange('field3', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700/80 text-emerald-800 dark:text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sim-field4" className="block text-[11px] font-mono text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                  {activeTemplate.labels.field4}
                </label>
                <textarea
                  id="sim-field4"
                  rows={2}
                  disabled={running}
                  value={formData.field4}
                  onChange={(e) => handleInputChange('field4', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={runSimulation}
                disabled={running}
                className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer min-h-[48px] ${
                  running
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-brand-500/20 active:translate-y-0.5'
                }`}
              >
                {running ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950 dark:text-brand-400" aria-hidden="true" />
                    <span>Evaluating Record & Rules...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>Simulate Automation Run</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Execution Audit Table & Output */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-dark-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 glass-panel shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Spreadsheet Audit Status (Columns G & H)</span>
                <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                  {executionResult ? `Status: ${executionResult.status}` : 'Awaiting Run'}
                </span>
              </h3>

              {/* Status Outcome Card with aria-live */}
              <div aria-live="polite" aria-atomic="true">
                {executionResult ? (
                  <div className="space-y-4 animate-in fade-in">
                    <div
                      className={`p-4 rounded-xl border ${
                        executionResult.status === 'COMPLETED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600/40 text-emerald-950 dark:text-emerald-200'
                          : executionResult.status === 'NEEDS_CORRECTION'
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400 dark:border-rose-600/40 text-rose-950 dark:text-rose-200'
                          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600/40 text-amber-950 dark:text-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm mb-1">
                        {executionResult.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                        ) : executionResult.status === 'NEEDS_CORRECTION' ? (
                          <AlertCircle className="w-5 h-5 text-rose-700 dark:text-rose-400 shrink-0" aria-hidden="true" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" aria-hidden="true" />
                        )}
                        <span>
                          {executionResult.status === 'COMPLETED'
                            ? 'Execution Successful'
                            : executionResult.status === 'NEEDS_CORRECTION'
                            ? 'Validation Halted'
                            : 'Duplicate Run Prevented'}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 leading-relaxed mb-3">
                        {executionResult.message}
                      </p>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 font-mono text-[11px] flex justify-between">
                        <span className="opacity-75">Updated Cell:</span>
                        <span className="font-bold">{executionResult.updatedCell}</span>
                      </div>
                    </div>

                    {/* Audit History Log Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-900/70">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-2.5">Record</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">Time</th>
                            <th className="p-2.5">Audit Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-300">
                          <tr>
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white">{formData.recordId}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  executionResult.status === 'COMPLETED'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-800'
                                    : executionResult.status === 'NEEDS_CORRECTION'
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-300 border border-rose-400 dark:border-rose-800'
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-400 dark:border-amber-800'
                                }`}
                              >
                                {executionResult.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">{executionResult.timestamp}</td>
                            <td className="p-2.5 truncate max-w-[200px]">
                              {executionResult.status === 'COMPLETED'
                                ? 'Drive link recorded'
                                : executionResult.status === 'NEEDS_CORRECTION'
                                ? 'Row flagged in Sheet'
                                : 'Idempotency match found'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Preview Document Button */}
                    {executionResult.status === 'COMPLETED' && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setPreviewModal(true)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs transition-colors cursor-pointer border border-slate-300 dark:border-slate-700 min-h-[44px]"
                        >
                          <Eye className="w-4 h-4 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
                          <span>View Formatted Template Layout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-600 dark:text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                    <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2 opacity-80" aria-hidden="true" />
                    <p className="font-medium">Choose a scenario and click "Simulate Automation Run" to inspect the audit log.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tailored Document Modal */}
      {previewModal && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-preview-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
                <h4 id="modal-preview-title" className="text-sm font-bold text-slate-900 dark:text-white">
                  Sample Rendered PDF Layout
                </h4>
              </div>
              <button
                onClick={() => setPreviewModal(false)}
                className="text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white text-xs font-mono p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close preview"
              >
                ✕ Close
              </button>
            </div>

            {/* Document Content tailored per template type */}
            <div className="bg-slate-50 dark:bg-white text-slate-900 rounded-lg p-6 shadow-md text-xs font-sans space-y-4 border border-slate-200">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h5 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
                    {activeTemplate.name}
                  </h5>
                  <p className="text-[11px] text-slate-600">Google Docs Template Output</p>
                </div>
                <div className="text-right text-[11px]">
                  <p className="font-bold">{formData.recordId}</p>
                  <p className="text-slate-600">{formData.field2}</p>
                </div>
              </div>

              {selectedTemplateId === 'invoice' && (
                <>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Billed To</span>
                    <p className="font-bold text-slate-900 text-sm">{formData.field1}</p>
                  </div>
                  <div className="p-2.5 bg-white rounded border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Description of Services</span>
                    <p className="text-slate-800">{formData.field4}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-bold text-slate-700">Total Invoice Amount:</span>
                    <span className="font-black text-base text-emerald-800">{formData.field3}</span>
                  </div>
                </>
              )}

              {selectedTemplateId === 'workorder' && (
                <>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Facility Location</span>
                    <p className="font-bold text-slate-900 text-sm">{formData.field1}</p>
                  </div>
                  <div className="p-2.5 bg-white rounded border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Assigned Lead Technician</span>
                    <p className="text-slate-800 font-semibold">{formData.field3}</p>
                    <span className="text-[10px] uppercase font-bold text-slate-600 block mt-2">Work Scope</span>
                    <p className="text-slate-800">{formData.field4}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t text-[11px] text-slate-600 font-mono">
                    <span>Inspection Status: Scheduled</span>
                    <span>Sign-off: Pending Field Review</span>
                  </div>
                </>
              )}

              {selectedTemplateId === 'certificate' && (
                <>
                  <div className="text-center py-2">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block">Awarded To</span>
                    <p className="font-extrabold text-slate-900 text-base">{formData.field1}</p>
                    <p className="text-[11px] text-slate-600 mt-1">For successfully completing</p>
                    <p className="font-bold text-slate-800 text-xs mt-0.5">{formData.field4}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t text-[11px] text-slate-700">
                    <span>Evaluation: {formData.field3}</span>
                    <span>Issued: {formData.field2}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium text-xs cursor-pointer border border-slate-300 dark:border-slate-700 min-h-[40px]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
