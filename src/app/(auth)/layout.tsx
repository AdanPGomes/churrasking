import Image from 'next/image'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="flex flex-col lg:flex-row min-h-screen">
      <div
        className="flex w-full lg:w-1/2 bg-primary-foreground relative overflow-hidden
                flex-col items-center justify-center gap-4
                py-8 px-6
                lg:justify-between lg:p-12"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#F5A623_0%,transparent_60%)] opacity-10" />

        <div className="hidden lg:flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-lg">
            🍖
          </div>

          <span className="text-white font-medium text-lg">
            Churras<span className="text-primary">King</span>
          </span>
        </div>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative w-32 h-32 lg:w-72 lg:h-72">
            <Image
              src="/mascot.png"
              alt="ChurrasKing mascote"
              fill
              sizes="(max-width: 1024px) 128px, 288px"
              priority
              className="object-contain drop-shadow-2xl"
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 lg:px-6 lg:py-4 max-w-xs text-center">
            <p className="text-white/85 text-sm leading-relaxed">
              Bem-vindo, <span className="text-primary font-semibold">rei do churrasco!</span>
              <br />
              Organize o evento perfeito e convide a galera.
            </p>
          </div>
        </div>

        <p className="hidden lg:block text-white/35 text-xs text-center relative z-10">
          Crie eventos · Convide amigos · Divida os custos
        </p>
      </div>

      <div className="flex flex-1 items-start justify-center bg-background p-6 pt-10 lg:items-center lg:p-12">
        {children}
      </div>
    </main>
  )
}
