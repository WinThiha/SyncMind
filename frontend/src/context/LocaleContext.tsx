'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from '@/lib/i18n/locales';
import { getTranslation } from '@/lib/i18n/catalog';

const LOCALE_STORAGE_KEY = 'syncmind-locale';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return storedLocale && isSupportedLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale: (next: string) => {
      const resolved = isSupportedLocale(next) ? next : DEFAULT_LOCALE;
      setLocaleState(resolved);
      window.localStorage.setItem(LOCALE_STORAGE_KEY, resolved);
    },
    t: (key: string, params?: Record<string, string | number>) => getTranslation(locale, key, params),
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
