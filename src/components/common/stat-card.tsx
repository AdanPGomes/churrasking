import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

type StatCardProps = {
  label: string
  value: string | number
  sub: string
  valueClassName?: string
}

export function StatCard({ label, value, sub, valueClassName }: StatCardProps) {
  return (
    <Card className="flex-1 gap-1 py-4 px-6 text-center">
      <CardHeader className="p-0 text-muted-foreground text-sm">{label}</CardHeader>
      <CardContent className={cn('p-0 font-bold text-2xl', valueClassName)}>{value}</CardContent>
      <CardFooter className="justify-center p-0 whitespace-nowrap text-muted-foreground text-sm">
        {sub}
      </CardFooter>
    </Card>
  )
}
