import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'

export const revalidate = 300 // 5 min cache

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function KpiCard({ label, value, sub, color = '#B45309' }: {
  label: string; value: string; sub?: string; color?: string
}) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <p style={{ margin: 0, color: '#6B7280', fontSize: 11, fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '6px 0 0', color, fontSize: 28, fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 12 }}>{sub}</p>}
    </div>
  )
}

function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: '#1A1A1A', textTransform: 'capitalize' }}>{label}</span>
        <span style={{ fontSize: 13, color: '#6B7280', fontFamily: 'Barlow Condensed, sans-serif' }}>{value}</span>
      </div>
      <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

const CAT_COLORS: Record<string, string> = {
  gravemaskiner: '#B45309', hjullastere: '#16a34a', dumpers: '#D97706',
  kompaktmaskiner: '#7C3AED', kraner: '#0ea5e9', traktorer: '#6B7280', annet: '#9CA3AF',
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

  const catCount: Record<string, number> = {}
  for (const r of catRows ?? []) catCount[r.category] = (catCount[r.category] ?? 0) + 1
  const catSorted = Object.entries(catCount).sort((a, b) => b[1] - a[1])
  const catMax = catSorted[0]?.[1] ?? 1

  const weekMap: Record<string, number> = {}
  for (const r of weeklyRows ?? []) {
    const d = new Date(r.created_at)
    const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const key = mon.toISOString().slice(0, 10)
    weekMap[key] = (weekMap[key] ?? 0) + 1
  }
  const weeks = Object.entries(weekMap).sort((a, b) => a[0].localeCompare(b[0]))
  const weekMax = Math.max(...weeks.map(w => w[1]), 1)

  const srcCount: Record<string, number> = {}
  for (const r of sourceRows ?? []) srcCount[r.source ?? 'manual'] = (srcCount[r.source ?? 'manual'] ?? 0) + 1
  const srcSorted = Object.entries(srcCount).sort((a, b) => b[1] - a[1])
  const srcMax = srcSorted[0]?.[1] ?? 1

  const SRC_COLORS: Record<string, string> = { nasta: '#B45309', hesselberg: '#16a34a', rockmann: '#D97706', oslomaskin: '#7C3AED', manual: '#0ea5e9' }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#1A1A1A' }}>
          Analytics
        </h1>
        <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 13 }}>
          Siste oppdatering: {now.toLocaleString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          <span style={{ marginLeft: 8, color: '#D1D5DB' }}>· Cache: 5 min</span>
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 36 }}>
        <KpiCard label="Aktive annonser"        value={(totalListings  ?? 0).toLocaleString('nb-NO')} color="#B45309" />
        <KpiCard label="Nye siste 7 dager"       value={(newLast7d      ?? 0).toString()}              color="#16a34a" />
        <KpiCard label="Registrerte bedrifter"   value={(totalProfiles  ?? 0).toLocaleString('nb-NO')} color="#D97706" />
        <KpiCard label="Nye bedrifter (30d)"     value={(newProfiles30d ?? 0).toString()}              color="#7C3AED" />
        <KpiCard label="Totale forespørsler"     value={(totalInquiries ?? 0).toLocaleString('nb-NO')} color="#0ea5e9" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
            Kategorifordeling (aktive)
          </h2>
          {catSorted.length === 0
            ? <p style={{ color: '#6B7280', fontSize: 13 }}>Ingen data</p>
            : catSorted.map(([cat, count]) => (
                <HBar key={cat} label={cat} value={count} max={catMax} color={CAT_COLORS[cat] ?? '#6B7280'} />
              ))
          }
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
            Kilde (aktive annonser)
          </h2>
          {srcSorted.length === 0
            ? <p style={{ color: '#6B7280', fontSize: 13 }}>Ingen data</p>
            : srcSorted.map(([src, count]) => (
                <HBar key={src} label={src} value={count} max={srcMax} color={SRC_COLORS[src] ?? '#6B7280'} />
              ))
          }
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
          Nye annonser per uke (siste 90 dager)
        </h2>
        {weeks.length === 0
          ? <p style={{ color: '#6B7280', fontSize: 13 }}>Ingen data</p>
          : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
              {weeks.map(([week, count]) => {
                const h = Math.max(4, Math.round((count / weekMax) * 100))
                return (
                  <div key={week} title={`Uke ${fmtDate(week)}: ${count} nye`}
                    style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', height: h, background: '#B45309', borderRadius: '2px 2px 0 0', minHeight: 4, opacity: 0.75 }} />
                    <span style={{ fontSize: 9, color: '#D1D5DB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
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
