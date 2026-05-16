import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getProfile } from '@/lib/queries/profile'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/server'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import SummaryCard from '@/components/common/summary-card'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const profile = await getProfile(supabase)

  const firstName = profile?.name.split(' ')[0] || 'Rei'

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="font-bold text-xl">
          {getGreeting()}, {firstName} 👋
        </p>
        <p className="text-muted-foreground text-sm">Você tem 1 evento próximo esta semana.</p>

        <div className="flex justify-between gap-4 mt-4">
          <SummaryCard label="eventos" value="3" sub="2 passados" />
          <SummaryCard label="convidados" value="24" sub="total histórico" />
          <SummaryCard label="confirmações" value="87%" sub="taxa média" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-bold">Meus churrascos</p>
          <Button asChild className="rounded-lg">
            <Link href="/event/new">
              + Novo<span className="hidden md:inline"> churrasco</span>
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Card className="w-full md:w-1/3 p-0 gap-0">
            <CardHeader className="p-6 bg-primary-foreground rounded-t-xl">
              <Badge>14 jun</Badge>
            </CardHeader>

            <CardContent className="flex flex-col gap-1 my-4">
              <p className="text-base font-semibold">Churrasco do Aniversário</p>
              <p className="text-sm text-muted-foreground">Quintal do Adan · 12 convidados</p>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-xs text-muted-foreground">8 de 12 confirmados</p>
                <Progress className="h-1" value={(8 / 12) * 100} />
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="flex justify-end p-2">
              <Button className="rounded-lg text-sm text-muted-foreground" variant="outline">
                Copiar link
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
}
