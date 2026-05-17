'use client'

import { z } from 'zod'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { createEvent } from '@/actions/events'
import { Button } from '@/components/ui/button'
import { ItemFieldRow } from './_item-field-row'
import { Separator } from '@/components/ui/separator'
import { createEventSchema } from '@/lib/validations/events'
import { FormErrorAlert } from '@/components/common/form-error-alert'
import { FileUploadField } from '@/components/common/file-upload-field'
import { ControlledFieldInput } from '@/components/common/controlled-field-input'
import { ControlledFieldTextArea } from '@/components/common/controlled-field-text-area'
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'

function getDefaultDate(): string {
  return new Date().toISOString().split('T')[0]
}

function getDefaultTime(): string {
  const date = new Date()
  date.setHours(date.getHours() + 1, 0, 0, 0)
  return date.toTimeString().slice(0, 5)
}

export function CreateEventForm() {
  const router = useRouter()

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<
    z.input<typeof createEventSchema>,
    unknown,
    z.output<typeof createEventSchema>
  >({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: getDefaultDate(),
      time: getDefaultTime(),
      location: '',
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

    if (coverFile) {
      formData.append('cover', coverFile)
    }

    const result = await createEvent(formData)
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <FieldSet>
        <ControlledFieldInput
          control={form.control}
          name="title"
          label="Título do evento"
          placeholder="Ex: Churrasco do Aniversário"
          required
        />

        <ControlledFieldTextArea
          control={form.control}
          name="description"
          label="Descrição"
          placeholder="Conta um pouco sobre o evento..."
        />

        <FieldGroup className="grid grid-cols-2">
          <ControlledFieldInput
            control={form.control}
            name="date"
            label="Data"
            type="date"
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
            required
          />

          <ControlledFieldInput
            control={form.control}
            name="time"
            label="Horário"
            type="time"
            required
          />
        </FieldGroup>

        <ControlledFieldInput
          control={form.control}
          name="location"
          label="Local"
          placeholder="Ex: Quintal do Adan"
        />
      </FieldSet>

      <FileUploadField id="cover" label="Cover image" onChange={setCoverFile} />

      <FieldSet className="flex flex-col">
        <FieldLegend>Itens necessários</FieldLegend>
        <FieldDescription>Os convidados podem se voluntariar para trazer.</FieldDescription>

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
          Adicionar item
        </Button>
      </FieldSet>

      {serverError && <FormErrorAlert message={serverError} />}

      <Separator />

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          aria-busy={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? 'Criando...' : 'Criar churrasco'}
        </Button>

        <Button type="button" variant="outline" onClick={() => router.back()} className="w-full">
          Cancelar
        </Button>
      </div>
    </form>
  )
}
