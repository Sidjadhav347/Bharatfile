import {
  CreditCard,
  Fingerprint,
  IdCard,
  Mail,
  Network,
  Phone,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  ALL_PII_CATEGORIES,
  type DocumentAnalysis,
  type EnabledCategories,
  type PiiCategory,
  type RedactionMode,
} from '../engine';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Switch } from './ui/switch';

interface DetectionSummarySectionProps {
  analysis: DocumentAnalysis;
  enabledCategories: EnabledCategories;
  redactionMode: RedactionMode;
  onToggleCategory: (category: PiiCategory, enabled: boolean) => void;
  onSetAllCategories: (enabled: boolean) => void;
}

const CATEGORY_META: Record<
  PiiCategory,
  {
    icon: typeof Mail;
    badgeVariant: 'default' | 'sky' | 'emerald' | 'amber' | 'violet' | 'rose' | 'indigo';
    iconBg: string;
    iconColor: string;
  }
> = {
  email: {
    icon: Mail,
    badgeVariant: 'sky',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  phone: {
    icon: Phone,
    badgeVariant: 'emerald',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  aadhaar: {
    icon: Fingerprint,
    badgeVariant: 'indigo',
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#1965e0]',
  },
  pan: {
    icon: IdCard,
    badgeVariant: 'violet',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  credit_card: {
    icon: CreditCard,
    badgeVariant: 'rose',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  ipv4: {
    icon: Network,
    badgeVariant: 'default',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
  },
};

export function DetectionSummarySection({
  analysis,
  enabledCategories,
  redactionMode,
  onToggleCategory,
  onSetAllCategories,
}: DetectionSummarySectionProps) {
  const { t } = useTranslation();

  const modeTitle = t(`modes.${redactionMode}.title`);

  return (
    <Card className="border-slate-200/80 bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)]">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t('summary.heading')}</CardTitle>
            <CardDescription className="mt-1">
              {t('summary.subheading')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetAllCategories(true)}
            >
              {t('summary.enableAll')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSetAllCategories(false)}
            >
              {t('summary.disableAll')}
            </Button>
          </div>
        </div>

        {/* Summary KPI Pills styled like Sentra metrics */}
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">{t('summary.totalDetected')}:</span>
            <span className="font-bold text-slate-900 text-sm">
              {analysis.totalDetected}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-blue-200/80 bg-blue-50/70 px-3.5 py-1.5 text-xs">
            <span className="text-blue-700 font-medium">{t('summary.totalSelected')}:</span>
            <span className="font-bold text-[#1965e0] text-sm">
              {analysis.totalSelectedForRedaction}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">{t('summary.currentMode')}:</span>
            <span className="font-semibold text-slate-900">{modeTitle}</span>
          </div>
        </div>

        {/* Luhn False-Positive Rejection Banner */}
        {analysis.rejectedCardCandidates > 0 && (
          <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-2 text-xs font-medium text-emerald-900">
            <ShieldCheck
              className="h-4 w-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span>
              {t('summary.rejectedCardsBadge', {
                count: analysis.rejectedCardCandidates,
              })}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        {analysis.totalDetected === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 px-6 py-8 text-center">
            <ShieldAlert
              className="h-8 w-8 text-slate-400"
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {t('summary.noEntitiesTitle')}
            </p>
            <p className="mt-1 max-w-lg text-xs text-slate-500">
              {t('summary.noEntitiesDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_PII_CATEGORIES.map((category) => {
              const count = analysis.countsByCategory[category];
              const isEnabled = enabledCategories[category];
              const meta = CATEGORY_META[category];
              const Icon = meta.icon;
              const label =
                count === 1
                  ? t(`categories.${category}Singular`)
                  : t(`categories.${category}`);

              return (
                <div
                  key={category}
                  className={cn(
                    'group relative flex items-center justify-between rounded-xl border p-3.5 transition-all',
                    isEnabled
                      ? 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                      : 'border-slate-200/60 bg-slate-50/60 opacity-60'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                        meta.iconBg,
                        meta.iconColor
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">
                          {count}
                        </span>
                        <Badge variant={meta.badgeVariant}>{label}</Badge>
                      </div>
                    </div>
                  </div>

                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) =>
                      onToggleCategory(category, checked)
                    }
                    ariaLabel={t('summary.toggleCategoryAria', {
                      category: t(`categories.${category}`),
                    })}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
