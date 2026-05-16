'use client';

import { useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';

const titles: Record<string, string> = {
  en: 'SyncMind',
  'my-MM': 'SyncMind',
  'ja-JP': 'SyncMind',
  'vi-VN': 'SyncMind',
  'km-KH': 'SyncMind',
  'ko-KR': 'SyncMind',
};

export function LocaleHtmlLang() {
  const { locale } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = titles[locale] ?? titles.en;
  }, [locale]);

  return null;
}
