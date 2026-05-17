import type { Locale } from './locales';

export type LocaleOption = {
  value: Locale;
  label: string;
};

export const LOCALE_OPTIONS: LocaleOption[] = [
  { value: 'en', label: 'English' },
  { value: 'my-MM', label: 'မြန်မာ' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'vi-VN', label: 'Tiếng Việt' },
  { value: 'km-KH', label: 'ខ្មែរ' },
  { value: 'ko-KR', label: '한국어' },
];
