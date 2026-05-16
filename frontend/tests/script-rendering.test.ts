import { describe, it, expect } from 'vitest'
import { getTranslation } from '@/lib/i18n/catalog'
import { isSupportedLocale } from '@/lib/i18n/locales'

describe('script rendering support', () => {
  it('Burmese locale is supported', () => {
    expect(isSupportedLocale('my-MM')).toBe(true)
  })

  it('Khmer locale is supported', () => {
    expect(isSupportedLocale('km-KH')).toBe(true)
  })

  it('Japanese locale is supported', () => {
    expect(isSupportedLocale('ja-JP')).toBe(true)
  })

  it('Vietnamese locale is supported', () => {
    expect(isSupportedLocale('vi-VN')).toBe(true)
  })

  it('Korean locale is supported', () => {
    expect(isSupportedLocale('ko-KR')).toBe(true)
  })

  it('Burmese catalog returns Burmese script for landing descriptions', () => {
    const text = getTranslation('my-MM', 'landing.hero.description')
    expect(text).toMatch(/[က-အ]/)
  })

  it('Japanese catalog returns Japanese script for landing descriptions', () => {
    const text = getTranslation('ja-JP', 'landing.hero.description')
    expect(text).toMatch(/[ぁ-んァ-ン一-龯]/)
  })

  it('Korean catalog returns Korean script for landing descriptions', () => {
    const text = getTranslation('ko-KR', 'landing.hero.description')
    expect(text).toMatch(/[가-힣]/)
  })
})
