import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

type SummaryCardProps = {
  label: string
  value: string | number
  sub: string
  valueClassName?: string
}

export default async function SummaryCard({ label, value, sub, valueClassName }: SummaryCardProps) {
  return (
    <Card className={cn('flex-1 text-center gap-1', valueClassName)}>
      <CardHeader className="p-0 text-muted-foreground">{label}</CardHeader>
      <CardContent className="p-0 font-bold text-2xl">{value}</CardContent>
      <CardFooter className="justify-center p-0 whitespace-nowrap text-muted-foreground">
        {sub}
      </CardFooter>
    </Card>
  )
}
