import { Globe, ShieldCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <img
            src={bharatFileLogo}
            alt="BharatFile logo"
            className="h-9 w-auto object-contain sm:h-10"
          />
          <div className="hidden sm:flex sm:items-center sm:gap-2 border-l border-slate-200 pl-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/60">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              {t('app.privacyBadge')}
            </span>
            <span className="text-xs text-slate-500 hidden md:inline">
              {t('app.tagline')}
            </span>
          </div>
        </div>

        {/* Center privacy indicator (desktop) */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-3.5 py-1 text-xs text-slate-600">
          <ShieldCheck className="h-3.5 w-3.5 text-[#1965e0]" />
          <span>Device-Only Engine · Zero Cloud Uploads</span>
        </div>

        {/* Language Switcher */}
        <div
          className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100/80 p-0.5"
          role="group"
          aria-label={t('app.languageLabel')}
        >
          <Globe className="ml-2 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <button
            type="button"
            onClick={() => switchLanguage('en')}
            aria-pressed={currentLang === 'en'}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1965e0]',
              currentLang === 'en'
                ? 'bg-white text-slate-900 shadow-2xs'
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
              'rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1965e0]',
              currentLang === 'hi'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            {t('app.hindi')}
          </button>
        </div>
      </div>
    </header>
  );
}
