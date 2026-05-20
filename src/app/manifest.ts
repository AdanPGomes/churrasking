import type { MetadataRoute } from 'next'
import { getLocale } from 'next-intl/server'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await getLocale()

  const manifestBase: Partial<MetadataRoute.Manifest> = {
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#1A1A1A',
    theme_color: '#F5A623',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }

  const content = {
    'pt-BR': {
      name: 'ChurrasKing',
      short_name: 'ChurrasKing',
      description: 'Organize seu churrasco e convide os amigos',
    },
    en: {
      name: 'BBQKing',
      short_name: 'BBQKing',
      description: 'Organize your barbecue and invite your friends',
    },
  }

  const t = content[locale as keyof typeof content] ?? content['pt-BR']

  return {
    name: t.name,
    short_name: t.short_name,
    description: t.description,
    ...manifestBase,
  }
}
