import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'

export const revalidate = 300 // 5 min cache

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function KpiCard({ label, value, sub, color = '#388bfd' }: {
  label: string; value: string; sub?: string; color?: string
}) {
  return (
    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '18px 22px' }}>
      <p style={{ margin: 0, color: '#8b949e', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
      <p style={{ margin: '6px 0 0', color, fontSize: 28, fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: 12 }}>{sub}</p>}
    </div>
  )
}

function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: '#e6edf3', textTransform: 'capitalize' }}>{label}</span>
        <span style={{ fontSize: 13, color: '#8b949e', fontFamily: 'Barlow Condensed, sans-serif' }}>{value}</span>
      </div>
      <div style={{ height: 8, background: '#21262d', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

const CAT_COLORS: Record<string, string> = {
  gravemaskiner: '#388bfd', hjullastere: '#3fb950', dumpers: '#f0883e',
  kompaktmaskiner: '#bc8cff', kraner: '#e3b341', traktorer: '#8b949e', annet: '#6e7681',
}

export default async function AdminAnalyticsPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  const now = new Date()
  const d7   = new Date(now.getTime() - 7  * 86_400_000).toISOString()
  const d30  = new Date(now.getTime() - 30 * 86_400_000).toISOString()
  const d90  = new Date(now.getTime() - 90 * 86_400_000).toISOString()

  const [
    { count: totalListings  },
    { count: newLast7d      },
    { count: totalProfiles  },
    { count: newProfiles30d },
    { count: totalInquiries },
    { data: catRows         },
    { data: weeklyRows      },
    { data: sourceRows      },
  ] = await Promise.all([
    (supabase as any).from('listings').select('*', { count: 'exact', head: true }),
    (supabase as any).from('listings').select('*', { count: 'exact', head: true }).gte('created_at', d7),
    (supabase as any).from('profiles').select('*', { count: 'exact', head: true }),
    (supabase as any).from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', d30),
    (supabase as any).from('inquiries').select('*', { count: 'exact', head: true }),
    (supabase as any).from('listings').select('category').eq('status', 'active') as { data: { category: string }[] | null },
    (supabase as any).from('listings').select('created_at').gte('created_at', d90).order('created_at', { ascending: true }) as { data: { created_at: string }[] | null },
    (supabase as any).from('listings').select('source').eq('status', 'active') as { data: { source: string }[] | null },
  ])

  // Category distribution
  const catCount: Record<string, number> = {}
  for (const r of catRows ?? []) catCount[r.category] = (catCount[r.category] ?? 0) + 1
  const catSorted = Object.entries(catCount).sort((a, b) => b[1] - a[1])
  const catMax = catSorted[0]?.[1] ?? 1

  // Weekly growth (bucket by ISO week)
  const weekMap: Record<string, number> = {}
  for (const r of weeklyRows ?? []) {
    const d = new Date(r.created_at)
    const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const key = mon.toISOString().slice(0, 10)
    weekMap[key] = (weekMap[key] ?? 0) + 1
  }
  const weeks = Object.entries(weekMap).sort((a, b) => a[0].localeCompare(b[0]))
  const weekMax = Math.max(...weeks.map(w => w[1]), 1)

  // Source distribution
  const srcCount: Record<string, number> = {}
  for (const r of sourceRows ?? []) srcCount[r.source ?? 'manual'] = (srcCount[r.source ?? 'manual'] ?? 0) + 1
  const srcSorted = Object.entries(srcCount).sort((a, b) => b[1] - a[1])
  const srcMax = srcSorted[0]?.[1] ?? 1

  const SRC_COLORS: Record<string, string> = { nasta: '#388bfd', hesselberg: '#3fb950', rockmann: '#f0883e', oslomaskin: '#bc8cff', manual: '#e3b341' }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Analytics
        </h1>
        <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: 13 }}>
          Siste oppdatering: {now.toLocaleString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          <span style={{ marginLeft: 8, color: '#30363d' }}>· Cache: 5 min</span>
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 36 }}>
        <KpiCard label="Aktive listings"         value={(totalListings  ?? 0).toLocaleString('nb-NO')} color="#388bfd" />
        <KpiCard label="Nye siste 7 dager"        value={(newLast7d      ?? 0).toString()}              color="#3fb950" />
        <KpiCard label="Registrerte bedrifter"    value={(totalProfiles  ?? 0).toLocaleString('nb-NO')} color="#f0883e" />
        <KpiCard label="Nye bedrifter (30d)"      value={(newProfiles30d ?? 0).toString()}              color="#bc8cff" />
        <KpiCard label="Totale forespørsler"      value={(totalInquiries ?? 0).toLocaleString('nb-NO')} color="#e3b341" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Category distribution */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '20px 24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Kategorifordeling (aktive)
          </h2>
          {catSorted.length === 0
            ? <p style={{ color: '#8b949e', fontSize: 13 }}>Ingen data</p>
            : catSorted.map(([cat, count]) => (
                <HBar key={cat} label={cat} value={count} max={catMax} color={CAT_COLORS[cat] ?? '#8b949e'} />
              ))
          }
        </div>

        {/* Source distribution */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '20px 24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Kilde (aktive listings)
          </h2>
          {srcSorted.length === 0
            ? <p style={{ color: '#8b949e', fontSize: 13 }}>Ingen data</p>
            : srcSorted.map(([src, count]) => (
                <HBar key={src} label={src} value={count} max={srcMax} color={SRC_COLORS[src] ?? '#8b949e'} />
              ))
          }
        </div>
      </div>

      {/* Weekly growth chart */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '20px 24px', marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Nye listings per uke (siste 90 dager)
        </h2>
        {weeks.length === 0
          ? <p style={{ color: '#8b949e', fontSize: 13 }}>Ingen data</p>
          : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
              {weeks.map(([week, count]) => {
                const h = Math.max(4, Math.round((count / weekMax) * 100))
                return (
                  <div key={week} title={`Uke ${fmtDate(week)}: ${count} nye`}
                    style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', height: h, background: '#388bfd', borderRadius: '2px 2px 0 0', minHeight: 4, opacity: 0.8 }} />
                    <span style={{ fontSize: 9, color: '#30363d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                      {fmtDate(week)}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    </div>
  )
}
