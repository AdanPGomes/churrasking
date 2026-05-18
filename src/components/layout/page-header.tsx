import { Fragment } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const pageHeaderVariants = cva('flex flex-col gap-1 mb-8', {
  variants: {
    variant: {
      light: '',
      dark: '',
    },
  },
  defaultVariants: { variant: 'light' },
})

const titleVariants = cva('text-2xl font-semibold', {
  variants: {
    variant: {
      light: 'text-foreground',
      dark: 'text-white',
    },
  },
  defaultVariants: { variant: 'light' },
})

const descriptionVariants = cva('text-sm mt-1', {
  variants: {
    variant: {
      light: 'text-muted-foreground',
      dark: 'text-white/60',
    },
  },
  defaultVariants: { variant: 'light' },
})

const breadcrumbVariants = cva('', {
  variants: {
    variant: {
      light: '[&_a]:text-muted-foreground [&_span]:text-foreground',
      dark: '[&_a]:text-white/40 [&_span]:text-white/70 [&_svg]:text-white/30',
    },
  },
  defaultVariants: { variant: 'light' },
})

type Crumb = {
  label: string
  href?: string
}

type PageHeaderProps = {
  title: string
  description?: string
  breadcrumbs?: Crumb[]
  action?: React.ReactNode
  className?: string
} & VariantProps<typeof pageHeaderVariants>

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  variant,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn(pageHeaderVariants({ variant }), className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className={cn(breadcrumbVariants({ variant }), 'hidden lg:block')}>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={crumb.label}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(titleVariants({ variant }))}>{title}</h1>
          {description && <p className={cn(descriptionVariants({ variant }))}>{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
