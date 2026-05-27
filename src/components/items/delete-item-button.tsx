'use client'

import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { deleteItem } from '@/actions/items'
import { Button } from '@/components/ui/button'

type DeleteItemButtonProps = {
  itemId: string
  eventSlug: string
  disabled: boolean
  ariaLabel: string
}

export function DeleteItemButton({
  itemId,
  eventSlug,
  disabled,
  ariaLabel,
}: DeleteItemButtonProps) {
  const tToast = useTranslations('Toast')

  async function handleDelete() {
    const result = await deleteItem(itemId, eventSlug)
    if (result.error) toast.error(tToast('item.deleteError'))

    toast.success(tToast('item.deleteSuccess'))
  }

  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={handleDelete}
      aria-label={ariaLabel}
      className={cn('h-7 w-7 shrink-0', disabled && 'opacity-30 cursor-not-allowed')}
    >
      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
    </Button>
  )
}
