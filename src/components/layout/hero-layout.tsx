import Image from 'next/image'

type HeroLayoutProps = {
  hero: React.ReactNode
  children: React.ReactNode
  coverUrl?: string | null
}

export function HeroLayout({ hero, children, coverUrl }: HeroLayoutProps) {
  return (
    <main className="flex flex-col">
      <div className="relative bg-primary-foreground w-full">
        {coverUrl && (
          <Image src={coverUrl} alt="" fill sizes="100vw" className="object-cover" priority />
        )}
        {coverUrl && <div className="absolute inset-0 bg-black/90" />}
        <div className="relative container mx-auto px-6 py-8">{hero}</div>
      </div>
      <div className="container mx-auto px-4 py-8 flex flex-col gap-6">{children}</div>
    </main>
  )
}
