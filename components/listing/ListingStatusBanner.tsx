import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import type { ListingStatus } from '@/lib/supabase/types'

/**
 * Statusbanner øverst på annonsesiden. Solgte og avpubliserte annonser beholdes
 * som permanente 200-sider — banneret forklarer hvorfor maskinen ikke er tilgjengelig.
 * Nøytral formulering for 'delisted' (vi vet ikke at den er solgt).
 */
export default function ListingStatusBanner({ status }: { status: ListingStatus }) {
  const variant =
    status === 'sold'
      ? {
          icon: CheckCircle2,
          label: 'Solgt',
          text: 'Denne maskinen er solgt og er ikke lenger tilgjengelig. Se lignende maskiner til salgs nedenfor.',
          bg: 'rgba(200,149,58,0.10)',
          border: 'rgba(200,149,58,0.4)',
          color: 'var(--gold)',
        }
      : status === 'delisted'
      ? {
          icon: AlertCircle,
          label: 'Ikke lenger tilgjengelig',
          text: 'Denne annonsen er ikke lenger tilgjengelig hos selgeren. Se lignende maskiner til salgs nedenfor.',
          bg: 'var(--bg3)',
          border: 'var(--border2)',
          color: 'var(--t2)',
        }
      : status === 'reserved'
      ? {
          icon: Clock,
          label: 'Reservert',
          text: 'Denne maskinen er reservert. Ta kontakt med selger for å høre om den blir tilgjengelig igjen.',
          bg: 'rgba(200,149,58,0.10)',
          border: 'rgba(200,149,58,0.4)',
          color: 'var(--gold)',
        }
      : null

  if (!variant) return null
  const { icon: Icon, label, text, bg, border, color } = variant

  return (
    <div
      role="status"
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        background: bg, border: `1px solid ${border}`,
        borderRadius: 6, padding: '14px 18px', marginBottom: 20,
      }}
    >
      <Icon size={20} style={{ color, flexShrink: 0 }} />
      <div>
        <p style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 16,
          letterSpacing: '0.06em', textTransform: 'uppercase', color, marginBottom: 2,
        }}>
          {label}
        </p>
        <p style={{ color: 'var(--t3)', fontSize: 13, lineHeight: 1.5 }}>{text}</p>
      </div>
    </div>
  )
}
