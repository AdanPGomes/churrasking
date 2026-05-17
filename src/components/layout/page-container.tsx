import { cn } from '@/lib/utils'

type PageContainerProps = React.PropsWithChildren<{
  className?: string
}>

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn('container mx-auto px-4 py-8 flex flex-col gap-8', className)}>
      {children}
    </main>
  )
}
