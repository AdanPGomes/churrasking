'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

export function AuthTabs() {
  const t = useTranslations('Auth')
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  return (
    <div className="flex border border-border rounded-lg overflow-hidden mb-6">
      <Link
        href="/login"
        aria-current={isLogin ? 'page' : undefined}
        className={cn('flex-1 py-2 text-sm font-medium text-center transition-colors', {
          'bg-primary text-primary-foreground': isLogin,
          'text-muted-foreground hover:text-foreground': !isLogin,
        })}
      >
        {t('login')}
      </Link>

      <Link
        href="/register"
        aria-current={isLogin ? undefined : 'page'}
        className={cn('flex-1 py-2 text-sm font-medium text-center transition-colors', {
          'bg-primary text-primary-foreground': !isLogin,
          'text-muted-foreground hover:text-foreground': isLogin,
        })}
      >
        {t('register')}
      </Link>
    </div>
  )
}
