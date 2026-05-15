import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
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

  return <RegisterForm />
}
