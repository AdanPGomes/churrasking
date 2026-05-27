import { getFormatter, getTranslations } from 'next-intl/server'

import { ItemWithGuest } from '@/types'
import { resolveGuest } from '@/lib/utils/guest'
import { AddItemForm } from '@/components/items/add-item-form'
import { DeleteItemButton } from '@/components/items/delete-item-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ItemsBoardProps = {
  eventId: string
  eventSlug: string
  items: ItemWithGuest[]
}

type HostItemRowProps = {
  item: ItemWithGuest
  eventSlug: string
  t: Awaited<ReturnType<typeof getTranslations>>
  format: Awaited<ReturnType<typeof getFormatter>>
}

async function HostItemRow({ item, eventSlug, t, format }: HostItemRowProps) {
  const guestName = resolveGuest(item.guests)?.name ?? null
  const isClaimed = !!item.assigned_guest_id

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-none">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        {item.estimated_cost && (
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="mr-1">~</span>
            {format.number(item.estimated_cost, { style: 'currency', currency: 'BRL' })}
          </p>
        )}
      </div>

      {isClaimed ? (
        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full shrink-0">
          {guestName}
        </span>
      ) : (
        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full shrink-0">
          {t('items.free')}
        </span>
      )}

      <DeleteItemButton
        itemId={item.id}
        eventSlug={eventSlug}
        disabled={isClaimed}
        ariaLabel={t('items.removeItem')}
      />
    </div>
  )
}

export async function ItemsBoard({ eventId, eventSlug, items }: ItemsBoardProps) {
  const t = await getTranslations('Events')
  const format = await getFormatter()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t('items.boardTitle')}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t('items.noItems')}</p>
        ) : (
          items.map((item) => (
            <HostItemRow key={item.id} item={item} eventSlug={eventSlug} t={t} format={format} />
          ))
        )}

        <AddItemForm eventId={eventId} eventSlug={eventSlug} />
      </CardContent>
    </Card>
  )
}
