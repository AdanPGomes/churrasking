import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { getProfile } from '@/lib/queries/profile'
import { createClient } from '@/lib/supabase/server'
import { getInitials } from '@/lib/utils/presentation'
import { PageHeader } from '@/components/layout/page-header'
import { ThemeSelect } from '@/components/common/theme-select'
import { LocaleSelect } from '@/components/common/locale-select'
import { PageContainer } from '@/components/layout/page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, t, tCommon] = await Promise.all([
    getProfile(supabase),
    getTranslations('Profile'),
    getTranslations('Common'),
  ])

  const fullName = profile?.name ?? ''
  const initials = fullName ? getInitials(fullName) : 'CK'

  return (
    <PageContainer>
      <PageHeader
        title={t('title')}
        breadcrumbs={[{ label: tCommon('dashboard'), href: '/dashboard' }, { label: t('title') }]}
      />

      <div className="flex flex-col gap-4 max-w-xl">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-lg font-medium text-primary-foreground shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-base font-medium text-foreground">{fullName || '—'}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('preferences')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium">{t('language')}</p>
                <p className="text-xs text-muted-foreground">{t('languageDescription')}</p>
              </div>
              <LocaleSelect />
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium">{t('theme')}</p>
                <p className="text-xs text-muted-foreground">{t('themeDescription')}</p>
              </div>
              <ThemeSelect />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('account')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-muted-foreground">{t('name')}</span>
              <span className="text-sm font-medium">{fullName || '—'}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-muted-foreground">{t('email')}</span>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
