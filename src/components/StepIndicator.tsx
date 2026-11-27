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
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isComplete =
            step.num < currentStep || (step.num === 4 && hasDownloaded);
          const isActive = step.num === currentStep && !isComplete;

          return (
            <li
              key={step.num}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3.5 transition-colors',
                isActive && 'border-emerald-600 bg-emerald-50/60 shadow-xs',
                isComplete && 'border-emerald-200 bg-white',
                !isActive && !isComplete && 'border-slate-200 bg-white/70 opacity-75'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                  isComplete && 'bg-emerald-700 text-white',
                  isActive && 'bg-emerald-600 text-white',
                  !isActive && !isComplete && 'bg-slate-100 text-slate-600'
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                  {t('steps.stepPrefix', { number: step.num })}
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">{step.desc}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
