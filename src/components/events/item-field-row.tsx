'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Control, FieldValues, Path } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { ControlledFieldInput } from '@/components/common/controlled-field-input'
import { ControlledCurrencyInput } from '@/components/common/controlled-currency-input'

type ItemFieldRowProps<T extends FieldValues> = {
  index: number
  control: Control<T>
  onRemove: () => void
}

export function ItemFieldRow<T extends FieldValues>({
  index,
  control,
  onRemove,
}: ItemFieldRowProps<T>) {
  const t = useTranslations('Events')

  return (
    <FieldGroup className="flex flex-row items-center">
      <ControlledFieldInput
        control={control}
        name={`items.${index}.name` as Path<T>}
        label={`items.${index}.name`}
        placeholder={t('items.namePlaceholder')}
        hideLabel
        required
      />

      <ControlledCurrencyInput
        control={control}
        name={`items.${index}.estimated_cost` as Path<T>}
        label={`items.${index}.estimated_cost`}
        hideLabel
        className="w-36"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label={t('items.removeItem')}
      >
        <X className="h-4 w-4" />
      </Button>
    </FieldGroup>
  )
}
