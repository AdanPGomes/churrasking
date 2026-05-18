'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteEvent } from '@/actions/events'

type EventHeroActionsProps = {
  eventId: string
  slug: string
}

export function EventHeroActions({ eventId, slug }: EventHeroActionsProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleCopy() {
    await navigator.clipboard.writeText(`${window.location.origin}/c/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    setIsDeleting(true)
    setDeleteError(null)
    const result = await deleteEvent(eventId)
    if (result?.error) {
      setDeleteError(result.error)
      setIsDeleting(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          aria-label="Copiar link do evento"
          className="flex-1 sm:flex-0 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 border-none"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copiar link
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/events/${slug}/edit`)}
          aria-label="Editar evento"
          className="gap-1.5 bg-white/10 text-white border-white/20 hover:bg-white/20"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          aria-label="Excluir evento"
          className="gap-1.5 bg-destructive/20 text-red-400 border-destructive/30 hover:bg-destructive/30 shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Excluir</span>
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O evento e todos os dados associados — convidados e
              itens — serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              aria-busy={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
