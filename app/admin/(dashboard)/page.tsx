import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'
import { Users, Truck, RefreshCcw, Wrench, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string
}) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12,
      padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ width: 44, height: 44, background: color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ margin: 0, color: '#6B7280', fontSize: 12, fontWeight: 500 }}>{label}</p>
        <p style={{ margin: '4px 0 0', color: '#1A1A1A', fontSize: 28, fontWeight: 700, lineHeight: 1, fontFamily: 'Barlow Condensed, sans-serif' }}>{value.toLocaleString('nb-NO')}</p>
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

  const today = new Date().toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#1A1A1A' }}>
          Oversikt
        </h1>
        <p style={{ margin: '6px 0 0', color: '#6B7280', fontSize: 13 }}>
          {today.charAt(0).toUpperCase() + today.slice(1)}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 36 }}>
        <StatCard icon={Users}      label="Registrerte bedrifter" value={totalCompanies ?? 0} color="#B45309" />
        <StatCard icon={Truck}      label="Aktive annonser"       value={activeListings ?? 0} color="#16a34a" />
        <StatCard icon={RefreshCcw} label="NASTA-annonser"        value={nastaListings ?? 0}  color="#D97706" />
        <StatCard icon={Wrench}     label="Manuelle annonser"     value={manualListings ?? 0} color="#6B7280" />
      </div>

      {/* Recent companies */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>
            Siste 10 registrerte bedrifter
          </h2>
          <Link href="/admin/kunder" style={{ fontSize: 13, color: '#B45309', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            Se alle <LinkIcon size={11} />
          </Link>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                {['Bedriftsnavn', 'Org.nr', 'E-post', 'Verifisert', 'Registrert'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#6B7280', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentProfiles ?? []).length === 0 && (
                <tr><td colSpan={5} style={{ padding: '24px 16px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
                  Ingen kunder ennå
                </td></tr>
              )}
              {(recentProfiles ?? []).map((p: any) => (
                <tr key={p.id} className="admin-tr">
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#1A1A1A', fontWeight: 600 }}>{p.company_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280', fontFamily: 'monospace' }}>{p.org_number}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{emailMap[p.id] ?? '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      background: p.verified ? '#f0fdf4' : '#fef2f2',
                      color: p.verified ? '#16a34a' : '#dc2626',
                      border: `1px solid ${p.verified ? '#86efac' : '#fca5a5'}`,
                    }}>
                      {p.verified ? 'Ja' : 'Nei'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{fmtDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`.admin-tr { border-top: 1px solid #F3F4F6; transition: background 0.1s; } .admin-tr:hover { background: #F9FAFB; }`}</style>
    </div>
  )
}
