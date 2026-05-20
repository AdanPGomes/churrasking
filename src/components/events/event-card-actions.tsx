'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteEvent } from '@/actions/events'
import { Button } from '@/components/ui/button'

type EventCardActionsProps = {
  eventId: string
  slug: string
}

export function EventCardActions({ eventId, slug }: EventCardActionsProps) {
  const t = useTranslations('Events')
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)
    const result = await deleteEvent(eventId)
    if (result?.error) {
      setError(result.error)
      setIsDeleting(false)
      return
    }
    setShowDeleteDialog(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
            aria-label={t('actions.eventActionsLabel')}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/events/${slug}/edit`)} className="gap-2">
            <Pencil className="h-4 w-4" />
            {t('actions.edit')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            {t('actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('actions.confirmDeleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              aria-busy={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('actions.deleting') : t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
