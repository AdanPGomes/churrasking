'use client'

import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'

export function ThemeSelect() {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations('Profile')

  return (
    <select
      value={resolvedTheme ?? 'light'}
      onChange={(e) => setTheme(e.target.value)}
      className="text-sm border border-border rounded-md px-3 py-1.5 bg-background text-foreground cursor-pointer"
    >
      <option value="light">{t('themeLight')}</option>
      <option value="dark">{t('themeDark')}</option>
      <option value="system">{t('themeSystem')}</option>
    </select>
  )
}
