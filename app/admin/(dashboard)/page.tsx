import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'
import { Users, Truck, RefreshCcw, Wrench } from 'lucide-react'

export const dynamic = 'force-dynamic'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string
}) {
  return (
    <div style={{
      background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
      padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16,
    }}>
      <div style={{ width: 40, height: 40, background: color + '22', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <p style={{ margin: 0, color: '#8b949e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ margin: '4px 0 0', color: '#e6edf3', fontSize: 28, fontWeight: 700, lineHeight: 1, fontFamily: 'Barlow Condensed, sans-serif' }}>{value.toLocaleString('nb-NO')}</p>
      </div>
    </div>
  )
}

export default async function AdminOverviewPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  const [
    { count: totalCompanies },
    { count: activeListings },
    { count: nastaListings },
    { count: manualListings },
    { data: recentProfiles },
    { data: authData },
  ] = await Promise.all([
    (supabase as any).from('profiles').select('*', { count: 'exact', head: true }),
    (supabase as any).from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    (supabase as any).from('listings').select('*', { count: 'exact', head: true }).eq('source', 'nasta'),
    (supabase as any).from('listings').select('*', { count: 'exact', head: true }).eq('source', 'manual'),
    (supabase as any).from('profiles').select('id, company_name, org_number, verified, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const emailMap: Record<string, string> = {}
  for (const u of authData?.users ?? []) emailMap[u.id] = u.email ?? ''

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Oversikt
        </h1>
        <p style={{ margin: '6px 0 0', color: '#8b949e', fontSize: 13 }}>
          {new Date().toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 36 }}>
        <StatCard icon={Users} label="Registrerte bedrifter" value={totalCompanies ?? 0} color="#388bfd" />
        <StatCard icon={Truck} label="Aktive listings" value={activeListings ?? 0} color="#3fb950" />
        <StatCard icon={RefreshCcw} label="NASTA-listings" value={nastaListings ?? 0} color="#f0883e" />
        <StatCard icon={Wrench} label="Manuelle listings" value={manualListings ?? 0} color="#8b949e" />
      </div>

      {/* Recent companies */}
      <div>
        <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Siste 10 registrerte bedrifter
        </h2>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #30363d' }}>
                {['Bedriftsnavn', 'Org.nr', 'E-post', 'Verifisert', 'Registrert'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#8b949e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentProfiles ?? []).length === 0 && (
                <tr><td colSpan={5} style={{ padding: '24px 16px', textAlign: 'center', color: '#8b949e', fontSize: 14 }}>
                  Ingen kunder ennå
                </td></tr>
              )}
              {(recentProfiles ?? []).map((p: any) => (
                <tr key={p.id} className="admin-tr">
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#e6edf3', fontWeight: 600 }}>{p.company_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#8b949e', fontFamily: 'monospace' }}>{p.org_number}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#8b949e' }}>{emailMap[p.id] ?? '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      background: p.verified ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)',
                      color: p.verified ? '#3fb950' : '#f85149',
                      border: `1px solid ${p.verified ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`,
                    }}>
                      {p.verified ? 'Ja' : 'Nei'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#8b949e' }}>{fmtDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`.admin-tr { border-top: 1px solid #21262d; transition: background 0.1s; } .admin-tr:hover { background: #21262d44; }`}</style>
    </div>
  )
}
