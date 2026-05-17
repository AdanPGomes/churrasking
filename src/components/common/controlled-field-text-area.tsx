import { Controller, Control, FieldValues, Path } from 'react-hook-form'

import { Textarea } from '@/components/ui/textarea'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

type ControllerFieldTextAreaProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: string
  required?: boolean
  placeholder?: string
  className?: string
  textAreaProps?: React.InputHTMLAttributes<HTMLTextAreaElement>
}

export function ControlledFieldTextArea<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  placeholder,
  className,
  textAreaProps,
}: ControllerFieldTextAreaProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={field.name}>
            {label}
            {!required && (
              <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
            )}
          </FieldLabel>
          <Textarea
            {...field}
            {...textAreaProps}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder={placeholder}
          />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
