import type { Locale } from './locales';
import { en } from './translations/en';
import { myMM } from './translations/my-MM';
import { jaJP } from './translations/ja-JP';
import { viVN } from './translations/vi-VN';
import { kmKH } from './translations/km-KH';

export type Dictionary = Record<string, string>;

const catalogs: Record<Locale, Dictionary> = {
  en,
  'my-MM': myMM,
  'ja-JP': jaJP,
  'vi-VN': viVN,
  'km-KH': kmKH,
};

export function getTranslation(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const value = catalogs[locale][key] ?? catalogs.en[key] ?? key;
  if (!params) return value;
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    value,
  );
}
