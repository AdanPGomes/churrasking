'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'

type CopyLinkButtonProps = {
  slug: string
}

export function CopyLinkButton({ slug }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(`${window.location.origin}/c/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-muted-foreground"
      onClick={handleCopy}
      aria-label="Copiar link do evento"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 mr-1" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 mr-1" />
          Copiar link
        </>
      )}
    </Button>
  )
}
