'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { register } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { FormErrorAlert } from '@/components/common/form-error-alert'
import { RegisterInput, registerSchema } from '@/lib/validations/auth'
import { ControlledFieldInput } from '@/components/common/controlled-field-input'

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: RegisterInput) {
    setServerError(null)
    const result = await register(data)
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <ControlledFieldInput control={form.control} name="name" label="Nome" required />
      <ControlledFieldInput
        control={form.control}
        name="email"
        label="E-mail"
        type="email"
        required
        autoComplete="email"
      />
      <ControlledFieldInput
        control={form.control}
        name="password"
        label="Senha"
        type="password"
        required
        autoComplete="new-password"
      />
      <ControlledFieldInput
        control={form.control}
        name="confirmPassword"
        label="Confirme a senha"
        type="password"
        required
        autoComplete="new-password"
      />

      <FormErrorAlert message={serverError} />

      <Button
        className="w-full rounded-lg"
        type="submit"
        disabled={form.formState.isSubmitting}
        aria-busy={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? 'Criando conta...' : 'Criar conta'}
      </Button>
    </form>
  )
}
