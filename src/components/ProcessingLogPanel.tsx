import { Activity, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProcessingLogEntry } from '../engine';
import { cn } from '../lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

interface ProcessingLogPanelProps {
  entries: ProcessingLogEntry[];
}

export function ProcessingLogPanel({ entries }: ProcessingLogPanelProps) {
  const { t } = useTranslation();

  const resolveParams = (entry: ProcessingLogEntry) => {
    if (!entry.params) return undefined;
    const resolved: Record<string, string | number> = { ...entry.params };

    // Resolve nested i18n tokens safely (such as category names, mode titles, or toggle states)
    if (typeof resolved.categoryKey === 'string') {
      resolved.category = t(resolved.categoryKey);
    }
    if (typeof resolved.modeKey === 'string') {
      resolved.mode = t(resolved.modeKey);
    }
    if (typeof resolved.stateKey === 'string') {
      resolved.state = t(resolved.stateKey);
    }
    return resolved;
  };

  return (
    <Card className="border-neutral-200 bg-white shadow-sm">
      <CardHeader className="border-b border-neutral-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-neutral-900" aria-hidden="true" />
            <CardTitle className="text-base">{t('log.heading')}</CardTitle>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-mono font-bold text-neutral-600">
            in-memory audit
          </span>
        </div>
        <CardDescription className="text-xs">{t('log.subheading')}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-6 text-xs text-neutral-400 text-center">
            {t('log.empty')}
          </p>
        ) : (
          <ul className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {entries.map((entry) => {
              const Icon =
                entry.level === 'success'
                  ? CheckCircle2
                  : entry.level === 'warning'
                  ? ShieldAlert
                  : Info;

              return (
                <li
                  key={entry.id}
                  className="flex items-start gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs transition-colors hover:bg-neutral-100/70"
                >
                  <Icon
                    className={cn(
                      'mt-0.5 h-3.5 w-3.5 shrink-0',
                      entry.level === 'success' && 'text-emerald-600',
                      entry.level === 'warning' && 'text-amber-600',
                      entry.level === 'info' && 'text-neutral-700'
                    )}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[10px] text-neutral-400 shrink-0 mt-0.5">
                    {entry.timestamp}
                  </span>
                  <span className="text-neutral-800 leading-relaxed font-medium">
                    {entry.params
                      ? t(entry.key, resolveParams(entry) ?? {})
                      : t(entry.key)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
