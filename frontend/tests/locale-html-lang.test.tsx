import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { LocaleProvider } from '@/context/LocaleContext'
import { LocaleHtmlLang } from '@/components/locale/LocaleHtmlLang'

describe('LocaleHtmlLang', () => {
  afterEach(() => {
    document.documentElement.lang = 'en'
  })

  it('sets html lang to en by default', () => {
    render(
      <LocaleProvider>
        <LocaleHtmlLang />
      </LocaleProvider>
    )
    expect(document.documentElement.lang).toBe('en')
  })
})
