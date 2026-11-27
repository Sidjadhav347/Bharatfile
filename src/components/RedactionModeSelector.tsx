import { EyeOff, KeyRound, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RedactionMode } from '../engine';
import { cn } from '../lib/utils';

interface RedactionModeSelectorProps {
  mode: RedactionMode;
  onChangeMode: (mode: RedactionMode) => void;
}

const MODES: Array<{
  id: RedactionMode;
  icon: typeof Shield;
}> = [
  { id: 'full', icon: EyeOff },
  { id: 'partial', icon: Shield },
  { id: 'pseudonym', icon: KeyRound },
];

export function RedactionModeSelector({
  mode,
  onChangeMode,
}: RedactionModeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="text-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
          {t('modes.heading')}
        </h3>
        <p className="mt-0.5 text-xs text-neutral-600">
          {t('modes.subheading')}
        </p>
      </div>

      {/* Adobe-style Centered Segmented Pill Control */}
      <div
        className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 p-1.5 shadow-2xs"
        role="radiogroup"
        aria-label={t('modes.heading')}
      >
        {MODES.map((item) => {
          const Icon = item.icon;
          const selected = mode === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChangeMode(item.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900',
                selected
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/60'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{t(`modes.${item.id}.title`)}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Example hint below active pill */}
      <div className="text-center">
        <span className="inline-block rounded-full bg-white px-3.5 py-1 text-xs font-mono text-neutral-700 border border-neutral-200/80 shadow-2xs">
          {t(`modes.${mode}.example`)}
        </span>
      </div>
    </div>
  );
}
