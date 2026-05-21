'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const t = useTranslations('Common')

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <DropdownMenuItem onClick={toggleTheme} className="gap-2 cursor-pointer">
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {theme === 'dark' ? t('lightMode') : t('darkMode')}
    </DropdownMenuItem>
  )
}
