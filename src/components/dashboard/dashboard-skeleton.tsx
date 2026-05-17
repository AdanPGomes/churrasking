import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

function StatCardSkeleton() {
  return (
    <Card className="flex-1 gap-1 py-4 px-6 text-center">
      <Skeleton className="h-4 w-16 mx-auto" />
      <Skeleton className="h-8 w-12 mx-auto mt-1" />
      <Skeleton className="h-3 w-20 mx-auto mt-1" />
    </Card>
  )
}

function EventCardSkeleton() {
  return (
    <Card className="w-full md:w-1/3 p-0 gap-0">
      <CardHeader className="p-4 bg-primary-foreground rounded-t-xl">
        <Skeleton className="h-5 w-16" />
      </CardHeader>

      <CardContent className="flex flex-col gap-2 my-2 px-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex flex-col gap-1 mt-1">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-1 w-full" />
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-between p-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="flex flex-wrap gap-4">
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
      </div>
    </div>
  )
}
