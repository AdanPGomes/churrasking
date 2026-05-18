import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const statCardVariants = cva('flex flex-col gap-1 text-center rounded-xl px-5 py-4', {
  variants: {
    variant: {
      light: 'bg-card border border-border',
      dark: 'bg-white/8',
    },
  },
  defaultVariants: { variant: 'light' },
})

const statValueVariants = cva('font-semibold', {
  variants: {
    variant: {
      light: 'text-foreground text-2xl',
      dark: 'text-white text-3xl',
    },
  },
  defaultVariants: { variant: 'light' },
})

const statLabelVariants = cva('text-sm', {
  variants: {
    variant: {
      light: 'text-muted-foreground',
      dark: 'text-white/50',
    },
  },
  defaultVariants: { variant: 'light' },
})

const statSubVariants = cva('text-sm whitespace-nowrap', {
  variants: {
    variant: {
      light: 'text-muted-foreground',
      dark: 'text-white/40',
    },
  },
  defaultVariants: { variant: 'light' },
})

type StatCardProps = {
  label: string
  value: string | number
  sub: string
  valueClassName?: string
  className?: string
} & VariantProps<typeof statCardVariants>

export function StatCard({ label, value, sub, variant, valueClassName, className }: StatCardProps) {
  return (
    <div className={cn(statCardVariants({ variant }), className)}>
      <p className={cn(statLabelVariants({ variant }))}>{label}</p>
      <p className={cn(statValueVariants({ variant }), valueClassName)}>{value}</p>
      <p className={cn(statSubVariants({ variant }))}>{sub}</p>
    </div>
  )
}
