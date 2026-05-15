'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/lib/validations/auth'
import type { LoginInput, RegisterInput } from '@/lib/validations/auth'
import { ActionResult } from 'next/dist/shared/lib/app-router-types'

export async function login(data: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) return { error: 'Invalid input' }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) return { error: 'Invalid email or password' }

  redirect('/dashboard')
}

export async function register(data: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'An account with this email already exists' }
    }
    return { error: 'Could not create account. Please try again' }
  }

  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
