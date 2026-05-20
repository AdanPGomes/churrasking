import { ImageResponse } from 'next/og'

import { createClient } from '@/lib/supabase/server'
import { getEventBySlug } from '@/lib/queries/events'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EventOGImage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const event = await getEventBySlug(supabase, slug)

  const title = event?.title ?? 'ChurrasKing'
  const date = event?.date
    ? new Intl.DateTimeFormat('pt-BR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      }).format(new Date(event.date))
    : ''
  const location = event?.location ?? ''
  const confirmed = Number(event?.confirmed_guests ?? 0)
  const total = Number(event?.total_guests ?? 0)

  return (
    new ImageResponse(
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1A1A1A',
          padding: '64px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)',
            opacity: 0.15,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#F5A623',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              🍖
            </div>
            <span style={{ color: '#ffffff', fontSize: '24px', fontWeight: 600 }}>
              Churras
              <span style={{ color: '#F5A623' }}>King</span>
            </span>
          </div>

          <div
            style={{
              color: '#ffffff',
              fontSize: title.length > 30 ? '48px' : '64px',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '24px',
              flex: 1,
            }}
          >
            {title}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {date && (
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '100px',
                  padding: '8px 20px',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '20px',
                }}
              >
                {date}
              </div>
            )}
            {location && (
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '100px',
                  padding: '8px 20px',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '20px',
                }}
              >
                {location}
              </div>
            )}

            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#F5A623', fontSize: '36px', fontWeight: 700 }}>
                  {confirmed}/{total}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>
                  confirmados
                </span>
              </div>

              <div
                style={{
                  width: '1px',
                  height: '40px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '16px',
                      marginBottom: '4px',
                    }}
                  >
                    Organize o seu churrasco
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
                    churrasking.vercel.app
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
