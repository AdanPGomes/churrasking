'use client'

import { toast } from 'sonner'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function ToastHandler() {
  const t = useTranslations('Toast')
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  useEffect(() => {
    const isSuccess = searchParams.get('status') === 'success'
    const isDeleted = searchParams.get('action') === 'deleted'
    console.log(isDeleted, isSuccess, searchParams)

    if (isSuccess && isDeleted) {
      setTimeout(() => {
        toast.success(t('event.deleteSuccess'))
      }, 200)

      const params = new URLSearchParams(searchParams)
      params.delete('status')
      params.delete('action')

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      replace(newUrl, { scroll: false })
    }
  }, [searchParams, pathname, replace])

  return null
}
