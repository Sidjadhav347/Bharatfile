import { Check, Download, FileUp, ScanSearch, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
  hasDownloaded: boolean;
}

export function StepIndicator({ currentStep, hasDownloaded }: StepIndicatorProps) {
  const { t } = useTranslation();

  const steps = [
    {
      num: 1 as const,
      title: t('steps.step1Title'),
      desc: t('steps.step1Desc'),
      icon: FileUp,
    },
    {
      num: 2 as const,
      title: t('steps.step2Title'),
      desc: t('steps.step2Desc'),
      icon: ScanSearch,
    },
    {
      num: 3 as const,
      title: t('steps.step3Title'),
      desc: t('steps.step3Desc'),
      icon: Shield,
    },
    {
      num: 4 as const,
      title: t('steps.step4Title'),
      desc: t('steps.step4Desc'),
      icon: Download,
    },
  ];

  return (
    <nav aria-label="Workflow steps" className="w-full">
      <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isComplete =
            step.num < currentStep || (step.num === 4 && hasDownloaded);
          const isActive = step.num === currentStep && !isComplete;

          return (
            <li
              key={step.num}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3 transition-all',
                isActive && 'border-blue-500/50 bg-white shadow-sm ring-1 ring-blue-500/20',
                isComplete && 'border-emerald-200 bg-white/90 shadow-2xs',
                !isActive && !isComplete && 'border-slate-200/70 bg-white/60'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors',
                  isComplete && 'bg-emerald-600 text-white',
                  isActive && 'bg-[#1965e0] text-white',
                  !isActive && !isComplete && 'bg-slate-100 text-slate-500 border border-slate-200/60'
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-[10px] font-bold tracking-wider uppercase',
                      isComplete
                        ? 'text-emerald-700'
                        : isActive
                        ? 'text-[#1965e0]'
                        : 'text-slate-400'
                    )}
                  >
                    {t('steps.stepPrefix', { number: step.num })}
                  </span>
                  {isComplete && (
                    <span className="text-[10px] text-emerald-600 font-medium">· Done</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                  {step.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-500 truncate">
                  {step.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
