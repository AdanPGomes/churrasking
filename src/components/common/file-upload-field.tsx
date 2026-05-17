import { ImageUp } from 'lucide-react'
import { Field, FieldLabel } from '../ui/field'
import { useState } from 'react'

type FileUploadFieldProps = {
  id: string
  label: string
  accept?: string
  maxSizeMB?: number
  required?: boolean
  onChange: (file: File | null) => void
}

export function FileUploadField({
  id,
  label,
  accept = 'image/png,image/jpeg,image/webp',
  maxSizeMB = 5,
  required = false,
  onChange,
}: FileUploadFieldProps) {
  const [file, setFile] = useState<File | null>(null)
  const [sizeError, setSizeError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setSizeError(null)

    if (selected && selected.size > maxSizeMB * 1024 * 1024) {
      setSizeError(`File must be less than ${maxSizeMB}MB`)
      setFile(null)
      onChange(null)
      return
    }

    setFile(selected)
    onChange(selected)
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {!required && (
          <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
        )}
      </FieldLabel>
      <label
        htmlFor={id}
        className="flex items-center gap-3 w-full cursor-pointer rounded-xl border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
      >
        <ImageUp className="h-5 w-5 shrink-0" />
        <span className="truncate">{file ? file.name : 'Clique para enviar uma imagem'}</span>
        <input id={id} type="file" accept={accept} className="sr-only" onChange={handleChange} />
      </label>
      {file && (
        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
      )}
      {sizeError && (
        <p role="alert" className="text-xs text-destructive">
          {sizeError}
        </p>
      )}
    </Field>
  )
}
