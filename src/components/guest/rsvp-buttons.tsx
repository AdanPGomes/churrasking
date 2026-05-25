'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { updateRsvp } from '@/actions/guests'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type RsvpButtonsProps = {
  guestId: string
  currentStatus: 'confirmed' | 'declined' | 'pending'
}

export function RsvpButtons({ guestId, currentStatus }: RsvpButtonsProps) {
  const t = useTranslations('Public')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRsvp(status: 'confirmed' | 'declined') {
    if (currentStatus === status) return
    setIsLoading(true)

    const result = await updateRsvp(guestId, status)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.refresh()
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{t('rsvp.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleRsvp('confirmed')}
            disabled={isLoading || currentStatus === 'confirmed'}
            aria-pressed={currentStatus === 'confirmed'}
            className={
              currentStatus === 'confirmed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-primary/10'
            }
          >
            <Check className="h-4 w-4 mr-2" />
            {t('rsvp.confirm')}
          </Button>

          <Button
            onClick={() => handleRsvp('declined')}
            disabled={isLoading || currentStatus === 'declined'}
            aria-pressed={currentStatus === 'declined'}
            variant="outline"
            className={currentStatus === 'declined' ? 'border-destructive text-destructive' : ''}
          >
            <X className="h-4 w-4 mr-2" />
            {t('rsvp.decline')}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
