import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { createClient } from '@/lib/supabase/server'
import { AuthTabs } from '@/components/auth/auth-tabs'
import { LoginForm } from '@/components/auth/login-form'
import { PageHeader } from '@/components/layout/page-header'

export const metadata: Metadata = {
  title: 'Login',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const t = await getTranslations('Auth')

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <AuthTabs />

      <div>
        <PageHeader title={t('loginTitle')} description={t('loginDescription')} />
        <LoginForm />
      </div>
    </div>
  )
}
