import { formatNumber } from '@/lib/utils/format'

const STATS = [
  { value: 1247, label: 'Aktive annonser', suffix: '' },
  { value: 384, label: 'Verifiserte bedrifter', suffix: '' },
  { value: 2900, label: 'Maskiner solgt', suffix: '+' },
  { value: 14, label: 'Milliarder NOK omsatt', suffix: 'mrd' },
]

export default function StatsBar() {
  return (
    <div style={{
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container-main">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
        }} className="stats-grid">
          {STATS.map((stat, i) => (
            <div key={stat.label} style={{
              padding: '28px 24px',
              borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
              textAlign: 'center',
            }}>
              <p className="stat-value">
                {stat.suffix === 'mrd'
                  ? `${stat.value} mrd`
                  : `${formatNumber(stat.value)}${stat.suffix}`
                }
              </p>
              <p style={{ color: 'var(--t3)', fontSize: 12, fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .stats-grid { grid-template-columns: repeat(4,1fr) !important; }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  )
}
