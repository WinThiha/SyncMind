import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { LocaleProvider, useLocale } from '@/context/LocaleContext'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'

function LocaleProbe() {
  const { locale, setLocale } = useLocale()

  return (
    <button type="button" onClick={() => setLocale('ja-JP')}>
      {locale}
    </button>
  )
}

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  )
}

describe('Preference persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()

    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
  })

  it('persists locale changes across remounts', () => {
    window.localStorage.setItem('syncmind-locale', 'vi-VN')

    const { unmount } = render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>
    )

    expect(screen.getByRole('button', { name: 'vi-VN' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'vi-VN' }))

    expect(window.localStorage.getItem('syncmind-locale')).toBe('ja-JP')

    unmount()

    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>
    )

    expect(screen.getByRole('button', { name: 'ja-JP' })).toBeInTheDocument()
  })

  it('persists theme changes across remounts', () => {
    const { unmount } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'light' }))

    expect(window.localStorage.getItem('syncmind-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    unmount()

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument()
  })
})
