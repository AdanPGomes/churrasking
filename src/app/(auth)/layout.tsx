import Image from 'next/image'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A1A1A] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#F5A623_0%,_transparent_60%) opacity-10]" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 bg-[#F5A623] rounded-lg flex items-center justify-center text-lg">
            🍖
          </div>
          <span className="text-white font-medium text-lg">
            Churras<span className="text-[#F5A623]">King</span>
          </span>
        </div>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative w-36 h-36">
            <Image
              className="object-contain drop-shadow-2xl"
              src="/mascot.png"
              alt="ChurrasKing mascote"
              fill
              priority
            />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 max-w-xs text-center">
            <p className="text-white/85 text-sm leading-relaxed">
              Bem-vindo, <span className="text-[#F5A623]">rei do churrasco!</span>
              <br />
              Organize o evento perfeito e convide a galera.
            </p>
          </div>
        </div>

        <p className="text-white/35 text-xs text-center relative z-10">
          Crie eventos · Convide amigos · Divida os custos
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#FFF8F0] p-6">{children}</div>
    </main>
  )
}
