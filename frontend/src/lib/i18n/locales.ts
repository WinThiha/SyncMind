export const SUPPORTED_LOCALES = ['en', 'my-MM', 'ja-JP', 'vi-VN', 'km-KH', 'ko-KR'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const isSupportedLocale = (value: string): value is Locale =>
  SUPPORTED_LOCALES.includes(value as Locale);
