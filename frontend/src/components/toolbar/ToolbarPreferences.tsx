'use client';

import { useState } from 'react';
import { ChevronDown, Globe, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import { updateUserSettings } from '@/lib/api/settings';
import { LOCALE_OPTIONS } from '@/lib/i18n/localeOptions';

type ToolbarPreferencesProps = {
  className?: string;
};

export function ToolbarPreferences({ className }: ToolbarPreferencesProps) {
  const { user } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const { isDarkMode, toggleTheme } = useTheme();
  const [savingLocale, setSavingLocale] = useState(false);

  const themeLabel = t(isDarkMode ? 'nav.topbar.themeLight' : 'nav.topbar.themeDark');

  const handleLocaleChange = async (nextLocale: string) => {
    const previousLocale = locale;
    setLocale(nextLocale);

    if (!user) {
      return;
    }

    setSavingLocale(true);
    try {
      await updateUserSettings({
        preferences: { locale: nextLocale as typeof locale },
      });
    } catch (error) {
      console.error('Failed to update locale preference', error);
      setLocale(previousLocale);
    } finally {
      setSavingLocale(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 shrink-0 ${className ?? ''}`}>
      <div className="relative">
        <label htmlFor="toolbar-locale-select" className="sr-only">
          {t('nav.toolbar.locale')}
        </label>
        <Globe size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
        <select
          id="toolbar-locale-select"
          aria-label={t('nav.toolbar.locale')}
          value={locale}
          disabled={savingLocale}
          onChange={(e) => {
            void handleLocaleChange(e.target.value);
          }}
          className="h-10 min-w-[10.5rem] appearance-none rounded-xl border border-border-glow bg-foreground/5 pl-9 pr-8 text-sm font-medium text-foreground outline-none transition-all focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30"
        >
          {LOCALE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-background text-foreground">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/35" />
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={themeLabel}
        title={themeLabel}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-glow bg-foreground/5 text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
      >
        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}
