import { Globe, LayoutGrid, ShieldCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      {/* Top tier navigation matching Adobe's layout */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        {/* Left: Brand logo & Navigation categories */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img
              src={bharatFileLogo}
              alt="BharatFile logo"
              className="h-8 w-auto object-contain sm:h-9"
            />
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-neutral-800">
            <span className="relative py-3.5 font-bold text-neutral-900 border-b-2 border-neutral-950 cursor-pointer">
              {t('app.name')}
            </span>
            <span className="text-neutral-600 hover:text-neutral-900 cursor-pointer transition-colors">
              Features
            </span>
            <span className="text-neutral-600 hover:text-neutral-900 cursor-pointer transition-colors">
              Privacy Standard
            </span>
            <span className="text-neutral-600 hover:text-neutral-900 cursor-pointer transition-colors">
              Security & Luhn
            </span>
            <span className="text-neutral-600 hover:text-neutral-900 cursor-pointer transition-colors">
              Verification
            </span>
          </nav>
        </div>

        {/* Right: Adobe-style pill CTA & Language Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>100% Client-Side</span>
          </div>

          <LayoutGrid className="hidden sm:block h-4 w-4 text-neutral-400" />

          {/* Language Switcher Styled like Adobe's Sign in / Locale button */}
          <div
            className="flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-50 p-0.5"
            role="group"
            aria-label={t('app.languageLabel')}
          >
            <Globe className="ml-2 h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
            <button
              type="button"
              onClick={() => switchLanguage('en')}
              aria-pressed={currentLang === 'en'}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900',
                currentLang === 'en'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {t('app.english')}
            </button>
            <button
              type="button"
              onClick={() => switchLanguage('hi')}
              aria-pressed={currentLang === 'hi'}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900',
                currentLang === 'hi'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {t('app.hindi')}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar breadcrumbs matching Adobe's "Home | Adobe Creative Cloud" */}
      <div className="border-t border-neutral-100 bg-neutral-50/70 px-4 py-1.5 text-[11px] text-neutral-500 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <span className="hover:text-neutral-900 cursor-pointer">Home</span>
          <span className="text-neutral-300">|</span>
          <span className="font-semibold text-neutral-800">
            {t('app.name')} — Client-Side PII Redactor
          </span>
        </div>
      </div>
    </header>
  );
}
