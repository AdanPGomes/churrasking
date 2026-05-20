/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /\.(?:js|css|woff2)$/i,
      handler: new CacheFirst({
        cacheName: 'static-assets',
        plugins: [
          {
            cachedResponseWillBeUsed: async ({ cachedResponse }) => cachedResponse,
            requestWillFetch: async ({ request }) => request,
          },
        ],
      }),
    },
    {
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: new CacheFirst({
        cacheName: 'images',
      }),
    },
    {
      matcher: /^https?:\/\/[^/]+\/events\/[^/]+$/,
      handler: new NetworkFirst({
        cacheName: 'event-pages',
        networkTimeoutSeconds: 5,
      }),
    },
    {
      matcher: /^https?:\/\/[^/]+\/c\/[^/]+$/,
      handler: new NetworkFirst({
        cacheName: 'public-event-pages',
        networkTimeoutSeconds: 5,
      }),
    },
    {
      matcher: /^https:\/\/fonts\.(gstatic|googleapis)\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: 'google-fonts',
      }),
    },
  ],
})

serwist.addEventListeners()
