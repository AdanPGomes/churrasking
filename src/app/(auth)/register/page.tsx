import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { AuthTabs } from '@/components/auth/auth-tabs'
import { PageHeader } from '@/components/layout/page-header'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Register',
}

export default async function RegisterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <AuthTabs />

      <div>
        <PageHeader
          title="Criar conta"
          description="Organize o seu próximo churrasco em minutos."
        />
        <RegisterForm />
      </div>
    </div>
  )
}
