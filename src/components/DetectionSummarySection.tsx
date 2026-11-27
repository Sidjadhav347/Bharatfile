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

// Adobe-style distinct card backgrounds and color accents
const CATEGORY_META: Record<
  PiiCategory,
  {
    icon: typeof Mail;
    badgeVariant: 'default' | 'sky' | 'emerald' | 'amber' | 'violet' | 'rose' | 'indigo';
    bgCard: string;
    textTitle: string;
    badgeText: string;
    iconColor: string;
  }
> = {
  email: {
    icon: Mail,
    badgeVariant: 'sky',
    bgCard: 'bg-gradient-to-br from-sky-50 to-blue-50/60 border-sky-200',
    textTitle: 'text-sky-950',
    badgeText: 'bg-sky-100 text-sky-800',
    iconColor: 'text-sky-600',
  },
  phone: {
    icon: Phone,
    badgeVariant: 'emerald',
    bgCard: 'bg-gradient-to-br from-emerald-50 to-teal-50/60 border-emerald-200',
    textTitle: 'text-emerald-950',
    badgeText: 'bg-emerald-100 text-emerald-800',
    iconColor: 'text-emerald-600',
  },
  aadhaar: {
    icon: Fingerprint,
    badgeVariant: 'amber',
    bgCard: 'bg-gradient-to-br from-amber-50 to-yellow-50/60 border-amber-200',
    textTitle: 'text-amber-950',
    badgeText: 'bg-amber-100 text-amber-800',
    iconColor: 'text-amber-600',
  },
  pan: {
    icon: IdCard,
    badgeVariant: 'violet',
    bgCard: 'bg-gradient-to-br from-violet-50 to-purple-50/60 border-violet-200',
    textTitle: 'text-violet-950',
    badgeText: 'bg-violet-100 text-violet-800',
    iconColor: 'text-violet-600',
  },
  credit_card: {
    icon: CreditCard,
    badgeVariant: 'rose',
    bgCard: 'bg-gradient-to-br from-rose-50 to-orange-50/60 border-rose-200',
    textTitle: 'text-rose-950',
    badgeText: 'bg-rose-100 text-rose-800',
    iconColor: 'text-rose-600',
  },
  ipv4: {
    icon: Network,
    badgeVariant: 'default',
    bgCard: 'bg-gradient-to-br from-neutral-50 to-slate-100 border-neutral-200',
    textTitle: 'text-neutral-900',
    badgeText: 'bg-neutral-200 text-neutral-800',
    iconColor: 'text-neutral-600',
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
    <Card className="border-neutral-200 bg-white shadow-sm">
      <CardHeader className="border-b border-neutral-100 pb-4">
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
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3.5 py-1 text-xs">
            <span className="text-neutral-500 font-medium">{t('summary.totalDetected')}:</span>
            <span className="font-bold text-neutral-900 text-sm">
              {analysis.totalDetected}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-900 bg-neutral-900 text-white px-3.5 py-1 text-xs">
            <span className="text-neutral-300 font-medium">{t('summary.totalSelected')}:</span>
            <span className="font-bold text-white text-sm">
              {analysis.totalSelectedForRedaction}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3.5 py-1 text-xs">
            <span className="text-neutral-500 font-medium">{t('summary.currentMode')}:</span>
            <span className="font-semibold text-neutral-900">{modeTitle}</span>
          </div>
        </div>

        {/* Luhn False-Positive Rejection Banner */}
        {analysis.rejectedCardCandidates > 0 && (
          <div className="mt-3 flex items-center gap-2.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-900">
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

      <CardContent className="pt-5">
        {analysis.totalDetected === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-10 text-center">
            <ShieldAlert
              className="h-9 w-9 text-neutral-400"
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {t('summary.noEntitiesTitle')}
            </p>
            <p className="mt-1 max-w-lg text-xs text-neutral-500">
              {t('summary.noEntitiesDesc')}
            </p>
          </div>
        ) : (
          /* Adobe-style rich, colorful cards */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  role="button"
                  tabIndex={0}
                  onClick={() => onToggleCategory(category, !isEnabled)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onToggleCategory(category, !isEnabled);
                    }
                  }}
                  className={cn(
                    'group relative flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-2xs hover:shadow-xs cursor-pointer select-none active:scale-[0.99]',
                    meta.bgCard,
                    !isEnabled && 'opacity-60 grayscale-[30%]'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-2xs">
                        <Icon className={cn('h-5 w-5', meta.iconColor)} aria-hidden="true" />
                      </div>
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', meta.badgeText)}>
                        {label}
                      </span>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
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
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className={cn('font-mono text-3xl sm:text-4xl font-extrabold tracking-tight', meta.textTitle)}>
                        {count}
                      </span>
                      <span className="ml-2 text-xs font-semibold text-neutral-600">
                        {count === 1 ? 'instance found' : 'instances found'}
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                      {isEnabled ? 'Protected' : 'Ignored'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
