import { Control, Controller, FieldValues, Path } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

function parseCurrency(value: string): number {
  const digits = value.replace(/\D/g, '')
  return parseInt(digits || '0', 10) / 100
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

type ControlledCurrencyInputProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: string
  hideLabel?: boolean
  className?: string
}

export function ControlledCurrencyInput<T extends FieldValues>({
  control,
  name,
  label,
  hideLabel,
  className,
}: ControlledCurrencyInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={cn(className)}>
          <FieldLabel htmlFor={field.name} className={cn(hideLabel ? 'sr-only' : undefined)}>
            {label}
          </FieldLabel>
          <Input
            id={field.name}
            type="text"
            inputMode="numeric"
            value={field.value ? formatCurrency(field.value as number) : ''}
            aria-invalid={fieldState.invalid}
            ref={field.ref}
            onChange={(e) => {
              const numeric = parseCurrency(e.target.value)
              field.onChange(numeric)
            }}
            onBlur={field.onBlur}
            placeholder="R$ 0.00"
          />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
