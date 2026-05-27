'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'

import { addItem } from '@/actions/items'
import { Button } from '@/components/ui/button'
import { addItemSchema } from '@/lib/validations/items'
import { FormErrorAlert } from '@/components/common/form-error-alert'
import { ControlledFieldInput } from '@/components/common/controlled-field-input'
import { ControlledCurrencyInput } from '@/components/common/controlled-currency-input'

type AddItemForm = {
  eventId: string
  eventSlug: string
}

export function AddItemForm({ eventId, eventSlug }: AddItemForm) {
  const t = useTranslations('Events')
  const tToast = useTranslations('Toast')
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<z.input<typeof addItemSchema>, unknown, z.output<typeof addItemSchema>>({
    resolver: zodResolver(addItemSchema),
    defaultValues: { name: '', estimated_cost: undefined },
  })

  async function onSubmit(data: z.output<typeof addItemSchema>) {
    setServerError(null)
    const result = await addItem(eventId, eventSlug, data)
    if (result?.error) {
      toast.error(tToast('item.addError'))
      setServerError(result.error)
    } else {
      toast.success(tToast('item.addSuccess'))
    }
    form.reset()
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border"
    >
      <ControlledFieldInput
        control={form.control}
        name="name"
        label=""
        hideLabel
        placeholder={t('items.namePlaceholder')}
        className="flex-1"
        inputProps={{ 'aria-label': t('items.boardTitle') }}
      />

      <ControlledCurrencyInput
        control={form.control}
        name="estimated_cost"
        label=""
        className="w-full sm:w-32"
        hideLabel
      />

      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        aria-busy={form.formState.isSubmitting}
        className="shrink-0"
      >
        <Plus className="h-4 w-4 mr-1" />
        {t('items.addItem')}
      </Button>

      <FormErrorAlert message={serverError} />
    </form>
  )
}
