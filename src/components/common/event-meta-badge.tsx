import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const metaBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
  {
    variants: {
      variant: {
        light: 'bg-muted text-muted-foreground border border-border',
        dark: 'bg-white/10 border border-white/15 text-white/85',
      },
    },
    defaultVariants: { variant: 'light' },
  }
)

type EventMetaBadgeProps = {
  children: React.ReactNode
  className?: string
} & VariantProps<typeof metaBadgeVariants>

export function EventMetaBadge({ children, variant, className }: EventMetaBadgeProps) {
  return <span className={cn(metaBadgeVariants({ variant }), className)}>{children}</span>
}
