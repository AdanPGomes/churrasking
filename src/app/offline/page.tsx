import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

export default async function OfflinePage() {
  const t = await getTranslations('Offline')
  const tCommon = await getTranslations('Common')

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="relative w-32 h-32">
        <Image
          src="/mascot.png"
          alt={tCommon('mascotAlt')}
          fill
          sizes="128px"
          className="object-contain opacity-60"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">{t('error')}</h1>
        <p className="text-muted-foreground text-sm max-w-xs">{t('message')}</p>
      </div>
    </main>
  )
}
