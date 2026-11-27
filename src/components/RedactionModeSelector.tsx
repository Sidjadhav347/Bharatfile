import { EyeOff, KeyRound, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RedactionMode } from '../engine';
import { cn } from '../lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t('modes.heading')}</CardTitle>
        <CardDescription>{t('modes.subheading')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="grid grid-cols-1 gap-3 md:grid-cols-3"
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
                  'flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
                  selected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        selected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {t(`modes.${item.id}.title`)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'h-4 w-4 rounded-full border-2 flex items-center justify-center',
                      selected ? 'border-emerald-700' : 'border-slate-300'
                    )}
                  >
                    {selected && (
                      <span className="h-2 w-2 rounded-full bg-emerald-700" />
                    )}
                  </span>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                  {t(`modes.${item.id}.description`)}
                </p>
                <p className="mt-2 rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-800">
                  {t(`modes.${item.id}.example`)}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
