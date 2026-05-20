'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'

import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { LoginInput, loginSchema } from '@/lib/validations/auth'
import { FormErrorAlert } from '@/components/common/form-error-alert'
import { ControlledFieldInput } from '@/components/common/controlled-field-input'

export function LoginForm() {
  const t = useTranslations('Auth')
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginInput) {
    setServerError(null)
    const result = await login(data)
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="w-full flex flex-col gap-4">
      <ControlledFieldInput
        control={form.control}
        name="email"
        label={t('email')}
        type="email"
        required
        autoComplete="email"
      />
      <ControlledFieldInput
        control={form.control}
        name="password"
        label={t('password')}
        type="password"
        required
        autoComplete="current-password"
      />

      <FormErrorAlert message={serverError} />

      <Button
        className="w-full rounded-lg"
        type="submit"
        disabled={form.formState.isSubmitting}
        aria-busy={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? t('submitting') : t('login')}
      </Button>
    </form>
  )
}
