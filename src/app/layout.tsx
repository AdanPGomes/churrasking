import type { Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { Geist, Geist_Mono, Figtree } from 'next/font/google'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'

import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/common/theme-provider'

import './globals.css'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' })

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: '#F5A623',
}

export async function generateMetadata() {
  const t = await getTranslations('Meta')

  return {
    title: {
      template: `%s — ${t('appName')}`,
      default: t('appName'),
    },
    description: t('description'),
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: t('appName'),
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        figtree.variable
      )}
    >
      <body className="min-h-screen flex flex-col bg-background">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
