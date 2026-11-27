import { Check, Download, FileUp, ScanSearch, Shield } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
  hasDownloaded: boolean;
}

export function StepIndicator({ currentStep, hasDownloaded }: StepIndicatorProps) {
  const { t } = useTranslation();
  const [selectedStep, setSelectedStep] = React.useState<1 | 2 | 3 | 4 | null>(null);
  const activeStep = selectedStep ?? currentStep;

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

  const scrollToStep = (num: 1 | 2 | 3 | 4) => {
    setSelectedStep(num);
    const targets: Record<number, string> = {
      1: 'upload-section',
      2: 'summary-section',
      3: 'comparison-section',
      4: 'download-section',
    };
    const el = document.getElementById(targets[num]);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav aria-label="Workflow steps" className="w-full">
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isComplete =
            step.num < currentStep || (step.num === 4 && hasDownloaded);
          const isActive = step.num === activeStep;

          return (
            <li key={step.num}>
              <button
                type="button"
                onClick={() => scrollToStep(step.num)}
                className={cn(
                  'w-full text-left flex items-start gap-3 rounded-2xl border p-3.5 transition-all shadow-2xs cursor-pointer select-none active:scale-[0.98] hover:border-neutral-400',
                  isActive && 'border-neutral-900 bg-white ring-2 ring-neutral-900 shadow-xs',
                  isComplete && !isActive && 'border-emerald-200 bg-white',
                  !isActive && !isComplete && 'border-neutral-200 bg-neutral-50/60'
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors',
                    isActive && 'bg-neutral-900 text-white shadow-xs',
                    isComplete && !isActive && 'bg-emerald-600 text-white shadow-2xs',
                    !isActive && !isComplete && 'bg-white text-neutral-400 border border-neutral-200'
                  )}
                >
                  {isComplete && !isActive ? (
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
                        isActive
                          ? 'text-neutral-900 font-extrabold'
                          : isComplete
                          ? 'text-emerald-700'
                          : 'text-neutral-400'
                      )}
                    >
                      {t('steps.stepPrefix', { number: step.num })}
                    </span>
                    {isComplete && !isActive && (
                      <span className="text-[10px] text-emerald-600 font-semibold">· Completed</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-tight text-neutral-500 truncate">
                    {step.desc}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
