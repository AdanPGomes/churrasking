'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ItemFieldRow } from '@/components/events/item-field-row'
import { FormErrorAlert } from '@/components/common/form-error-alert'
import { FileUploadField } from '@/components/common/file-upload-field'
import { ControlledFieldInput } from '@/components/common/controlled-field-input'
import { ControlledFieldTextArea } from '@/components/common/controlled-field-text-area'
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { createEventSchema, eventBaseSchema, updateEventSchema } from '@/lib/validations/events'

type EventFormMode = 'create' | 'edit'

type EventFormProps = {
  mode: EventFormMode
  defaultValues: z.input<typeof eventBaseSchema>
  onSubmit: (formData: FormData) => Promise<{ error?: string }>
  submitLabel: string
  submittingLabel: string
  showItems?: boolean
}

export function EventForm(props: EventFormProps) {
  const tEvents = useTranslations('Events')
  const tCommon = useTranslations('Common')
  const tToast = useTranslations('Toast')
  const router = useRouter()

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const schema = props.mode === 'create' ? createEventSchema : updateEventSchema

  const form = useForm<z.input<typeof eventBaseSchema>, unknown, z.output<typeof eventBaseSchema>>({
    resolver: zodResolver(schema),
    defaultValues: props.defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  async function onSubmit(data: z.output<typeof eventBaseSchema>) {
    setServerError(null)

    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description ?? '')
    formData.append('date', data.date)
    formData.append('time', data.time)
    formData.append('location', data.location ?? '')
    formData.append('items', JSON.stringify(data.items ?? []))
    if (coverFile) formData.append('cover', coverFile)

    const result = await props.onSubmit(formData)
    if (result?.error) {
      toast.error(tToast(`event.${props.mode === 'create' ? 'createError' : 'updateError'}`))
      setServerError(result.error)
    } else {
      toast.success(tToast(`event.${props.mode === 'create' ? 'createSuccess' : 'updateSuccess'}`))
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FieldSet>
          <ControlledFieldInput
            control={form.control}
            name="title"
            label={tEvents('fields.title')}
            placeholder={tEvents('fields.titlePlaceholder')}
            required
          />

          <ControlledFieldTextArea
            control={form.control}
            name="description"
            label={tEvents('fields.description')}
            placeholder={tEvents('fields.descriptionPlaceholder')}
          />

          <FieldGroup className="grid grid-cols-2 gap-4">
            <ControlledFieldInput
              control={form.control}
              name="date"
              label={tEvents('fields.date')}
              type="date"
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              required
            />

            <ControlledFieldInput
              control={form.control}
              name="time"
              label={tEvents('fields.time')}
              type="time"
              required
            />
          </FieldGroup>

          <ControlledFieldInput
            control={form.control}
            name="location"
            label={tEvents('fields.location')}
            placeholder={tEvents('fields.locationPlaceholder')}
          />
        </FieldSet>

        <div className="flex flex-col gap-4">
          <FileUploadField id="cover" label={tEvents('fields.cover')} onChange={setCoverFile} />

          {props.showItems && (
            <>
              <Separator />

              <FieldSet className="flex flex-col">
                <FieldLegend>{tEvents('items.sectionTitle')}</FieldLegend>
                <FieldDescription>{tEvents('items.sectionDescription')}</FieldDescription>

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
                  {tEvents('items.addItem')}
                </Button>
              </FieldSet>
            </>
          )}

          <FormErrorAlert message={serverError} />

          <Separator />

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              aria-busy={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? props.submittingLabel : props.submitLabel}
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
