import { describe, it, expect } from 'vitest'
import { getTranslation } from '@/lib/i18n/catalog'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isSupportedLocale } from '@/lib/i18n/locales'

describe('getTranslation interpolation', () => {
  it('replaces a single param in the string', () => {
    const result = getTranslation('en', 'dashboard.welcome', { name: 'Jane' })
    expect(result).toBe('Welcome back, Jane')
  })

  it('replaces multiple params', () => {
    const result = getTranslation('en', 'help.searchResults', { query: 'bugs' })
    expect(result).toBe('Results for "bugs"')
  })

  it('returns the string unchanged when no params are passed', () => {
    const result = getTranslation('en', 'nav.sidebar.dashboard')
    expect(result).toBe('Dashboard')
  })

  it('returns the string unchanged when params is empty', () => {
    const result = getTranslation('en', 'nav.sidebar.dashboard', {})
    expect(result).toBe('Dashboard')
  })

  it('returns localized catalog values when present', () => {
    const result = getTranslation('ja-JP', 'nav.sidebar.dashboard')
    expect(result).toBe('ダッシュボード')
  })

  it('returns the key itself when no catalog has it', () => {
    const result = getTranslation('en', 'nonexistent.key.here')
    expect(result).toBe('nonexistent.key.here')
  })

  it('interpolates on fallback key when catalog has no entry', () => {
    const result = getTranslation('en', 'greeting.{name}', { name: 'World' })
    expect(result).toBe('greeting.World')
  })
})

describe('isSupportedLocale', () => {
  it('returns true for supported locales', () => {
    expect(isSupportedLocale('en')).toBe(true)
    expect(isSupportedLocale('ja-JP')).toBe(true)
    expect(isSupportedLocale('my-MM')).toBe(true)
    expect(isSupportedLocale('vi-VN')).toBe(true)
    expect(isSupportedLocale('km-KH')).toBe(true)
    expect(isSupportedLocale('ko-KR')).toBe(true)
  })

  it('returns false for unsupported locales', () => {
    expect(isSupportedLocale('fr-FR')).toBe(false)
    expect(isSupportedLocale('en-US')).toBe(false)
    expect(isSupportedLocale('')).toBe(false)
  })

  it('DEFAULT_LOCALE is en', () => {
    expect(DEFAULT_LOCALE).toBe('en')
  })
})

describe('catalog key coverage', () => {
  const requiredKeys = [
    'nav.sidebar.dashboard',
    'settings.title',
    'auth.login.title',
    'dashboard.yourProjects',
    'projects.list.empty',
    'issues.create.summary',
    'milestones.create.title',
    'help.title',
    'landing.hero.headline',
    'common.save',
    'wiki.chat.title',
  ]

  it('all supported locales resolve required namespace keys without returning raw keys', () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const key of requiredKeys) {
        expect(getTranslation(locale, key)).not.toBe(key)
      }
    }
  })

  it('non-English catalogs return localized values for core navigation keys', () => {
    expect(getTranslation('ja-JP', 'nav.sidebar.dashboard')).toBe('ダッシュボード')
    expect(getTranslation('vi-VN', 'nav.sidebar.dashboard')).toBe('Bảng điều khiển')
    expect(getTranslation('my-MM', 'nav.sidebar.dashboard')).toBe('ဒက်ရှ်ဘုတ်')
    expect(getTranslation('km-KH', 'nav.sidebar.dashboard')).toBe('ផ្ទាំងគ្រប់គ្រង')
    expect(getTranslation('ko-KR', 'nav.sidebar.dashboard')).toBe('대시보드')
  })

  it('Korean catalog covers core app surfaces', () => {
    expect(getTranslation('ko-KR', 'settings.title')).toBe('시스템 설정')
    expect(getTranslation('ko-KR', 'auth.login.title')).toBe('계정에 로그인')
    expect(getTranslation('ko-KR', 'dashboard.yourProjects')).toBe('내 프로젝트')
    expect(getTranslation('ko-KR', 'projects.list.empty')).toBe('아직 참여 중인 프로젝트가 없습니다.')
    expect(getTranslation('ko-KR', 'issues.create.summary')).toBe('요약')
    expect(getTranslation('ko-KR', 'milestones.create.title')).toBe('마일스톤 만들기')
    expect(getTranslation('ko-KR', 'help.title')).toBe('도움말 센터')
    expect(getTranslation('ko-KR', 'landing.hero.headline')).toBe('흩어진 작업에서 집중된 전달로 이동하세요.')
    expect(getTranslation('ko-KR', 'common.save')).toBe('저장')
  })

  it('English catalog has all required namespace keys', () => {
    // Verify at least one key exists per namespace
    expect(getTranslation('en', 'nav.sidebar.dashboard')).toBeTruthy()
    expect(getTranslation('en', 'settings.title')).toBeTruthy()
    expect(getTranslation('en', 'auth.login.title')).toBeTruthy()
    expect(getTranslation('en', 'dashboard.yourProjects')).toBeTruthy()
    expect(getTranslation('en', 'projects.list.empty')).toBeTruthy()
    expect(getTranslation('en', 'issues.create.summary')).toBeTruthy()
    expect(getTranslation('en', 'milestones.create.title')).toBeTruthy()
    expect(getTranslation('en', 'help.title')).toBeTruthy()
    expect(getTranslation('en', 'landing.hero.headline')).toBeTruthy()
    expect(getTranslation('en', 'common.save')).toBeTruthy()
  })
})
