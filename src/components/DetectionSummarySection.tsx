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
    badgeVariant: 'sky' | 'emerald' | 'amber' | 'violet' | 'rose' | 'indigo';
    accentBorder: string;
  }
> = {
  email: {
    icon: Mail,
    badgeVariant: 'sky',
    accentBorder: 'border-l-sky-500',
  },
  phone: {
    icon: Phone,
    badgeVariant: 'emerald',
    accentBorder: 'border-l-emerald-500',
  },
  aadhaar: {
    icon: Fingerprint,
    badgeVariant: 'amber',
    accentBorder: 'border-l-amber-500',
  },
  pan: {
    icon: IdCard,
    badgeVariant: 'violet',
    accentBorder: 'border-l-violet-500',
  },
  credit_card: {
    icon: CreditCard,
    badgeVariant: 'rose',
    accentBorder: 'border-l-rose-500',
  },
  ipv4: {
    icon: Network,
    badgeVariant: 'indigo',
    accentBorder: 'border-l-indigo-500',
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
    <Card>
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

        {/* Summary KPI Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm">
            <span className="text-slate-600">{t('summary.totalDetected')}:</span>
            <span className="font-bold text-slate-900">
              {analysis.totalDetected}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm border border-emerald-200">
            <span className="text-emerald-800">{t('summary.totalSelected')}:</span>
            <span className="font-bold text-emerald-950">
              {analysis.totalSelectedForRedaction}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm border border-indigo-200">
            <span className="text-indigo-800">{t('summary.currentMode')}:</span>
            <span className="font-bold text-indigo-950">{modeTitle}</span>
          </div>
        </div>

        {/* Luhn False-Positive Rejection Banner */}
        {analysis.rejectedCardCandidates > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-950">
            <ShieldCheck
              className="h-4 w-4 shrink-0 text-amber-700"
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
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-6 py-8 text-center">
            <ShieldAlert
              className="h-8 w-8 text-slate-400"
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {t('summary.noEntitiesTitle')}
            </p>
            <p className="mt-1 max-w-lg text-xs text-slate-600">
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
                    'flex items-center justify-between rounded-xl border border-l-4 bg-white p-3.5 transition-opacity',
                    meta.accentBorder,
                    !isEnabled && 'opacity-60 bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">
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
