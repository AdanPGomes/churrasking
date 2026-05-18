type HeroLayoutProps = {
  hero: React.ReactNode
  children: React.ReactNode
}

export function HeroLayout({ hero, children }: HeroLayoutProps) {
  return (
    <main className="flex flex-col">
      <div className="bg-primary-foreground w-full">
        <div className="container mx-auto px-6 py-8">{hero}</div>
      </div>
      <div className="container mx-auto px-4 py-8 flex flex-col gap-6">{children}</div>
    </main>
  )
}
