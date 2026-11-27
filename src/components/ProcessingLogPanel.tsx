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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          <CardTitle className="text-base">{t('log.heading')}</CardTitle>
        </div>
        <CardDescription className="text-xs">{t('log.subheading')}</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-4 text-xs text-slate-500">
            {t('log.empty')}
          </p>
        ) : (
          <ul className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
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
                  className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs"
                >
                  <Icon
                    className={cn(
                      'mt-0.5 h-3.5 w-3.5 shrink-0',
                      entry.level === 'success' && 'text-emerald-700',
                      entry.level === 'warning' && 'text-amber-600',
                      entry.level === 'info' && 'text-slate-500'
                    )}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">
                    {entry.timestamp}
                  </span>
                  <span className="text-slate-800">
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
