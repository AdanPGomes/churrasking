type FormErrorAlertProps = {
  message: string | null
}

export function FormErrorAlert({ message }: FormErrorAlertProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </div>
  )
}
