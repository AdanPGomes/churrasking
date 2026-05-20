'use client'

import { z } from 'zod'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { updateEvent } from '@/actions/events'
import { Button } from '@/components/ui/button'
import { ItemFieldRow } from './item-field-row'
import { Separator } from '@/components/ui/separator'
import { createEventSchema, updateEventSchema } from '@/lib/validations/events'
import { FormErrorAlert } from '@/components/common/form-error-alert'
import { FileUploadField } from '@/components/common/file-upload-field'
import { ControlledFieldInput } from '@/components/common/controlled-field-input'
import { ControlledFieldTextArea } from '@/components/common/controlled-field-text-area'
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'

type EditEventFormProps = {
  event: {
    id: string
    slug: string
    title: string
    description?: string | null
    date: string
    location?: string | null
    cover_url?: string | null
  }
}

function toDateInput(isoDate: string): string {
  return new Date(isoDate).toISOString().split('T')[0]
}

function toTimeInput(isoDate: string): string {
  return new Date(isoDate).toTimeString().slice(0, 5)
}

export function EditEventForm({ event }: EditEventFormProps) {
  const t = useTranslations('Events')
  const tCommon = useTranslations('Common')
  const router = useRouter()
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<
    z.input<typeof updateEventSchema>,
    unknown,
    z.output<typeof updateEventSchema>
  >({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      title: event.title,
      description: event.description ?? '',
      date: toDateInput(event.date),
      time: toTimeInput(event.date),
      location: event.location ?? '',
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  async function onSubmit(data: z.output<typeof createEventSchema>) {
    setServerError(null)

    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description ?? '')
    formData.append('date', data.date)
    formData.append('time', data.time)
    formData.append('location', data.location ?? '')
    formData.append('items', JSON.stringify(data.items ?? []))
    if (coverFile) formData.append('cover', coverFile)

    const result = await updateEvent(event.id, event.slug, formData)
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FieldSet>
          <ControlledFieldInput
            control={form.control}
            name="title"
            label={t('fields.title')}
            placeholder={t('fields.titlePlaceholder')}
            required
          />

          <ControlledFieldTextArea
            control={form.control}
            name="description"
            label={t('fields.description')}
            placeholder={t('fields.descriptionPlaceholder')}
          />

          <FieldGroup className="grid grid-cols-2 gap-4">
            <ControlledFieldInput
              control={form.control}
              name="date"
              label={t('fields.date')}
              type="date"
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              required
            />

            <ControlledFieldInput
              control={form.control}
              name="time"
              label={t('fields.time')}
              type="time"
              required
            />
          </FieldGroup>

          <ControlledFieldInput
            control={form.control}
            name="location"
            label={t('fields.location')}
            placeholder={t('fields.locationPlaceholder')}
          />
        </FieldSet>

        <div className="flex flex-col gap-4">
          <FileUploadField id="cover" label={t('fields.cover')} onChange={setCoverFile} />

          <Separator />

          <FieldSet className="flex flex-col">
            <FieldLegend>{t('items.sectionTitle')}</FieldLegend>
            <FieldDescription>{t('items.sectionDescription')}</FieldDescription>

            {fields.map((field, index) => (
              <ItemFieldRow
                key={field.id}
                index={index}
                control={form.control}
                onRemove={() => remove(index)}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: '', estimated_cost: undefined })}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('items.addItem')}
            </Button>
          </FieldSet>

          <FormErrorAlert message={serverError} />

          <Separator />

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              aria-busy={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? t('actions.saving') : t('actions.save')}
            </Button>

            <Button type="button" variant="outline" onClick={() => router.back()}>
              {tCommon('cancel')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
