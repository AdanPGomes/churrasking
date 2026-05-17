import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { CopyLinkButton } from '@/components/events/copy-link-button'
import { EventCardActions } from '@/components/events/event-card-actions'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'

type EventCardProps = {
  id: string
  title: string
  slug: string
  date: Date
  location?: string | null
  coverUrl?: string | null
  totalGuests: number
  confirmedGuests: number
}

export async function EventCard({
  id,
  title,
  slug,
  date,
  location,
  totalGuests,
  confirmedGuests,
}: EventCardProps) {
  const isPast = date < new Date()

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
  }).format(date)

  const progressValue = totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0

  return (
    <Card className={cn('w-full md:w-1/3 p-0 gap-0', isPast && 'opacity-60')}>
      <CardHeader className="p-4 bg-primary-foreground rounded-t-xl flex flex-row items-center justify-between">
        <Badge variant={isPast ? 'secondary' : 'default'}>{formattedDate}</Badge>
        <EventCardActions eventId={id} slug={slug} />
      </CardHeader>

      <CardContent className="flex flex-col gap-1 my-4">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">
          {location ?? 'Sem local definido'} · {totalGuests} convidados
        </p>
        <div className="flex flex-col gap-1 mt-1">
          <p className="text-xs text-muted-foreground">
            {confirmedGuests} de {totalGuests} confirmados
          </p>
          <Progress className="h-1" value={progressValue} />
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-between p-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/events/${slug}`}>Ver detalhes</Link>
        </Button>

        <CopyLinkButton slug={slug} />
      </CardFooter>
    </Card>
  )
}
