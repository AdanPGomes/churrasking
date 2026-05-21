'use client'

import { useLocale, useTranslations } from 'next-intl'

const locales = [
  { code: 'pt-BR', label: 'Português' },
  { code: 'en', label: 'English' },
]

export function LocaleSelect() {
  const locale = useLocale()
  const t = useTranslations('Common')

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: e.target.value }),
    })
    window.location.reload()
  }

  return (
    <select
      defaultValue={locale}
      onChange={handleChange}
      aria-label={t('language')}
      className="text-sm border border-border rounded-md px-3 py-1.5 bg-background text-foreground cursor-pointer"
    >
      {locales.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  )
}
