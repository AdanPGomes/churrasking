import { Controller, Control, FieldValues, Path } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

type ControllerFieldInputProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  type?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  required?: boolean
  hideLabel?: boolean
  className?: string
  autoComplete?: string
}

export function ControlledFieldInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  inputProps,
  required = false,
  hideLabel = false,
  className,
  autoComplete = 'off',
}: ControllerFieldInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={field.name} className={hideLabel ? 'sr-only' : undefined}>
            {label}
            {!required && (
              <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
            )}
          </FieldLabel>
          <Input
            {...field}
            {...inputProps}
            id={field.name}
            type={type}
            aria-invalid={fieldState.invalid}
            autoComplete={autoComplete}
            placeholder={placeholder}
          />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
