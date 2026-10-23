import React, { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck } from 'lucide-react';

interface RoiCalculatorProps {
  onOpenIntake: () => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onOpenIntake }) => {
  const [docCount, setDocCount] = useState<number>(100);
  const [minutesPerDoc, setMinutesPerDoc] = useState<number>(10);
  const [hourlyRate, setHourlyRate] = useState<number>(25);

  // Realistic estimation: automated workflow still requires ~1 min review per document
  const minutesSavedPerDoc = Math.max(1, minutesPerDoc - 1);
  const hoursSavedPerMonth = (docCount * minutesSavedPerDoc) / 60;
  const annualCapacityValue = hoursSavedPerMonth * hourlyRate * 12;

  // Payback estimation against $35 one-time setup
  const workflowCost = 35;
  const monthlyCapacityValue = hoursSavedPerMonth * hourlyRate;
  const daysToBreakEven = monthlyCapacityValue > 0 ? Math.max(1, Math.round((workflowCost / monthlyCapacityValue) * 30)) : 1;

  return (
    <section className="py-16 relative bg-slate-50 dark:bg-dark-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800/70 text-xs font-mono text-slate-800 dark:text-slate-300 mb-2 border border-slate-300 dark:border-slate-700">
            <Calculator className="w-3.5 h-3.5 text-emerald-700 dark:text-brand-400" aria-hidden="true" />
            <span>Workflow Economics Estimator</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Estimate Your Team's Time Reclaimed
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A conservative estimate factoring in ~1 minute of routine human verification per document.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-6 items-center bg-white dark:bg-dark-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 glass-panel shadow-xs">
          {/* Sliders Input */}
          <div className="md:col-span-6 space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <label htmlFor="slider-doc-count" className="font-semibold text-slate-800 dark:text-slate-300">
                  Documents per month:
                </label>
                <span className="font-mono font-bold text-emerald-800 dark:text-brand-300">{docCount} docs</span>
              </div>
              <input
                id="slider-doc-count"
                type="range"
                min="20"
                max="500"
                step="10"
                value={docCount}
                aria-label="Documents generated per month"
                onChange={(e) => setDocCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <label htmlFor="slider-minutes" className="font-semibold text-slate-800 dark:text-slate-300">
                  Current manual minutes per doc:
                </label>
                <span className="font-mono font-bold text-emerald-800 dark:text-brand-300">{minutesPerDoc} mins</span>
              </div>
              <input
                id="slider-minutes"
                type="range"
                min="5"
                max="25"
                step="1"
                value={minutesPerDoc}
                aria-label="Current manual minutes spent per document"
                onChange={(e) => setMinutesPerDoc(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <label htmlFor="slider-rate" className="font-semibold text-slate-800 dark:text-slate-300">
                  Estimated internal hourly rate:
                </label>
                <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">${hourlyRate}/hr</span>
              </div>
              <input
                id="slider-rate"
                type="range"
                min="15"
                max="65"
                step="5"
                value={hourlyRate}
                aria-label="Estimated internal staff hourly rate in USD"
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-brand-400 shrink-0" aria-hidden="true" />
              Calculations represent staff capacity freed from repetitive manual copy-pasting.
            </p>
          </div>

          {/* Results Summary */}
          <div className="md:col-span-6 bg-slate-50 dark:bg-dark-950/80 rounded-xl border border-slate-200 dark:border-slate-800/80 p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-600 dark:text-slate-400 block text-[11px] font-medium">Time Reclaimed:</span>
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                  ~{Math.round(hoursSavedPerMonth)} hrs/mo
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">{(hoursSavedPerMonth * 12).toFixed(0)} hrs/yr</span>
              </div>

              <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-600 dark:text-slate-400 block text-[11px] font-medium">Staff Capacity Value:</span>
                <span className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-400 mt-0.5 block">
                  ~${Math.round(annualCapacityValue).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">annualized value</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/40 text-xs flex justify-between items-center">
              <span className="text-slate-800 dark:text-slate-300 font-medium">Break-Even on $35 One-Time Setup:</span>
              <span className="font-mono font-bold text-emerald-800 dark:text-brand-300 text-sm">~{daysToBreakEven} Days (Immediate)</span>
            </div>

            <button
              onClick={onOpenIntake}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <span>Automate Workflow from $5</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
