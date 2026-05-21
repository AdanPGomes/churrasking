import { getFormatter, getTranslations } from 'next-intl/server'

import { Separator } from '@/components/ui/separator'
import { calculateCostSummary } from '@/lib/utils/cost'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Item = {
  id: string
  name: string
  estimated_cost: number | null
  assigned_guest_id: string | null
  guests: { id: string; name: string } | { id: string; name: string }[] | null
}

type CostSummaryCardProps = {
  items: Item[]
  confirmedGuests: number
}

export async function CostSummaryCard({ items, confirmedGuests }: CostSummaryCardProps) {
  const t = await getTranslations('Events')
  const format = await getFormatter()

  const summary = calculateCostSummary(items, confirmedGuests)
  const hasItems = items.some((i) => i.estimated_cost !== null)

  if (!hasItems) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t('costs.sectionTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">{t('costs.noItems')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t('costs.sectionTitle')}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('costs.total')}</span>
            <span className="font-medium">
              {format.number(summary.totalEstimated, { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('costs.covered')}</span>
            <span className="font-medium text-green-600">
              {format.number(summary.totalCovered, { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('costs.uncovered')}</span>
            <span className="font-medium text-destructive">
              {format.number(summary.totalUncovered, { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('costs.confirmed')}</span>
            <span className="font-medium">
              {t('costs.confirmedGuests', { count: confirmedGuests })}
            </span>
          </div>
        </div>

        <div className="bg-primary/15 rounded-xl px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">{t('costs.perPerson')}</span>

          <span className="text-xl font-semibold text-primary">
            {format.number(summary.costPerPerson, { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        {summary.uncoveredItems.length > 0 && (
          <>
            <Separator />

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('costs.uncoveredItems')}
              </p>

              {summary.uncoveredItems.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate">{item.name}</span>
                  <span className="shrink-0 ml-2">
                    {format.number(item.cost, { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {summary.guestBreakdown.length > 0 && (
          <>
            <Separator />

            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('costs.byGuest')}
              </p>

              {summary.guestBreakdown.map((guest) => (
                <div key={guest.guestId} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{guest.guestName}</span>
                    <span className="font-medium">
                      {format.number(guest.subtotal, { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  {guest.items.map((item) => (
                    <div key={item.name} className="flex justify-between text-xs pl-3">
                      <span className="text-muted-foreground truncate">{item.name}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">
                        {format.number(item.cost, { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
