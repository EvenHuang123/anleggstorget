import { formatPrice, formatRelativeDate } from '@/lib/utils/format'
import { CheckCircle, Clock } from 'lucide-react'

const TICKER_ITEMS = [
  { type: 'sold', title: 'Caterpillar 336 GC', price: 2800000, time: '2026-04-17T10:00:00Z' },
  { type: 'new', title: 'Volvo L60H Hjullaster', price: 890000, time: '2026-04-17T11:30:00Z' },
  { type: 'sold', title: 'Komatsu PC360LC-11', price: 3100000, time: '2026-04-17T09:00:00Z' },
  { type: 'new', title: 'John Deere 6175R Traktor', price: 1250000, time: '2026-04-18T08:00:00Z' },
  { type: 'sold', title: 'Liebherr LTM 1060', price: 4500000, time: '2026-04-16T14:00:00Z' },
  { type: 'new', title: 'Hitachi ZX350LC-7', price: 2400000, time: '2026-04-18T07:30:00Z' },
  { type: 'sold', title: 'JCB 3CX Gravemaskin', price: 680000, time: '2026-04-17T16:00:00Z' },
  { type: 'new', title: 'Doosan DX300LC-7', price: 2950000, time: '2026-04-18T09:15:00Z' },
]

export default function TickerStripe() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div style={{
      background: 'var(--bg4)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden',
      height: 40,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="animate-ticker" style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
        {doubled.map((item, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0 32px',
            borderRight: '1px solid var(--border)',
          }}>
            {item.type === 'sold' ? (
              <CheckCircle size={11} style={{ color: '#4ade80', flexShrink: 0 }} />
            ) : (
              <Clock size={11} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            )}
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--t2)' }}>
              {item.type === 'sold' ? 'SOLGT' : 'NY'}{' · '}
              <span style={{ color: 'var(--t1)' }}>{item.title}</span>
              {' · '}
              <span style={{ color: 'var(--gold)' }}>{formatPrice(item.price)}</span>
              {' · '}
              <span style={{ color: 'var(--t3)' }}>{formatRelativeDate(item.time)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
