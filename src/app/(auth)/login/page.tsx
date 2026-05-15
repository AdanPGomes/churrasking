import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Login',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return <LoginForm />
}
