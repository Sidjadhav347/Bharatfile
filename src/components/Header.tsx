import { Globe, Lock, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import bharatFileLogo from '../assets/bharatfile-logo.jpg';
import { cn } from '../lib/utils';

export function Header() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('hi') ? 'hi' : 'en';

  const switchLanguage = (lang: 'en' | 'hi') => {
    void i18n.changeLanguage(lang);
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex flex-wrap items-center gap-3.5">
            <img
              src={bharatFileLogo}
              alt="BharatFile logo"
              className="h-12 w-auto rounded-lg object-contain"
            />
            <div className="border-l border-slate-200 pl-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  {t('app.name')}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  {t('app.privacyBadge')}
                </span>
              </div>
              <p className="text-sm text-slate-600">{t('app.tagline')}</p>
            </div>
          </div>

          {/* Language Switcher */}
          <div
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1"
            role="group"
            aria-label={t('app.languageLabel')}
          >
            <Globe className="ml-2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <button
              type="button"
              onClick={() => switchLanguage('en')}
              aria-pressed={currentLang === 'en'}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                currentLang === 'en'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {t('app.english')}
            </button>
            <button
              type="button"
              onClick={() => switchLanguage('hi')}
              aria-pressed={currentLang === 'hi'}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                currentLang === 'hi'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {t('app.hindi')}
            </button>
          </div>
        </div>

        {/* Mandatory Privacy Guarantee Banner */}
        <div className="mt-4 flex flex-col gap-1 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5 sm:items-center">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 sm:mt-0"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-emerald-950">
              {t('app.privacyBanner')}
            </p>
          </div>
          <p className="pl-7 text-xs text-emerald-800 sm:pl-0">
            {t('app.privacySubnote')}
          </p>
        </div>
      </div>
    </header>
  );
}
