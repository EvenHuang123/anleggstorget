import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink, CheckCircle, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtPrice(p: number | null) {
  if (p == null) return '—'
  return p.toLocaleString('nb-NO') + ' kr'
}

const S = {
  th: { padding: '9px 14px', textAlign: 'left' as const, color: '#8b949e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', whiteSpace: 'nowrap' as const },
  td: { padding: '11px 14px', fontSize: 13, color: '#e6edf3', borderTop: '1px solid #21262d' },
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #21262d' }}>
      <span style={{ color: '#8b949e', fontSize: 13, minWidth: 180, flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#e6edf3', fontSize: 13 }}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? 'active'
  if (s === 'active') return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: 'rgba(63,185,80,0.1)', color: '#3fb950', border: '1px solid rgba(63,185,80,0.3)' }}>Aktiv</span>
  if (s === 'sold') return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: 'rgba(56,139,253,0.1)', color: '#388bfd', border: '1px solid rgba(56,139,253,0.3)' }}>Solgt</span>
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: 'rgba(139,148,158,0.1)', color: '#8b949e', border: '1px solid rgba(139,148,158,0.3)' }}>{s}</span>
}

function InqStatusBadge({ status }: { status: string | null }) {
  const s = status ?? 'new'
  const cfg = s === 'answered' || s === 'replied'
    ? { bg: 'rgba(63,185,80,0.1)', color: '#3fb950', border: 'rgba(63,185,80,0.3)', label: 'Besvart' }
    : s === 'rejected' || s === 'closed'
    ? { bg: 'rgba(248,81,73,0.1)', color: '#f85149', border: 'rgba(248,81,73,0.3)', label: 'Avvist' }
    : { bg: 'rgba(240,200,62,0.1)', color: '#e3b341', border: 'rgba(240,200,62,0.3)', label: 'Ny' }
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
}

export default async function KundeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const supabase = createAdminClient()

  const [
    { data: profile },
    { data: listings },
    { data: inquiriesReceived },
    { data: authUser },
  ] = await Promise.all([
    (supabase as any).from('profiles')
      .select('id, company_name, org_number, email, contact_person, verified, created_at, notes')
      .eq('id', id)
      .single() as { data: any },

    (supabase as any).from('listings')
      .select('id, title, category, price, status, views, created_at, source')
      .eq('seller_id', id)
      .order('created_at', { ascending: false }) as { data: any[] | null },

    (supabase as any).from('inquiries')
      .select(`id, status, created_at, listing:listings!listing_id(title), sender:profiles!sender_id(company_name)`)
      .in('listing_id',
        // subquery workaround: pass listing ids
        [] // will be replaced after we have listings
      )
      .limit(0) as { data: any[] }, // placeholder — done separately below

    supabase.auth.admin.getUserById(id),
  ])

  if (!profile) return notFound()

  const listingIds: string[] = (listings ?? []).map((l: any) => l.id)

  const { data: inquiries } = listingIds.length > 0
    ? await (supabase as any)
        .from('inquiries')
        .select(`id, status, created_at, listing:listings!listing_id(id, title), sender:profiles!sender_id(company_name)`)
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false })
        .limit(10) as { data: any[] | null }
    : { data: [] as any[] }

  const activeListings   = (listings ?? []).filter((l: any) => l.status === 'active').length
  const inactiveListings = (listings ?? []).filter((l: any) => l.status !== 'active').length
  const answeredInqs     = (inquiries ?? []).filter((i: any) => i.status === 'answered' || i.status === 'replied').length
  const totalInqs        = inquiries?.length ?? 0
  const inqRate          = totalInqs > 0 ? Math.round((answeredInqs / totalInqs) * 100) : null
  const lastSignIn       = (authUser as any)?.data?.user?.last_sign_in_at ?? null

  return (
    <div>
      {/* Back link */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/kunder" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#8b949e', fontSize: 13, textDecoration: 'none' }}>
          <ChevronLeft size={14} /> Alle kunder
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {profile.company_name}
            </h1>
            <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: 13, fontFamily: 'monospace' }}>{profile.org_number}</p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: profile.verified ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)',
            color: profile.verified ? '#3fb950' : '#f85149',
            border: `1px solid ${profile.verified ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`,
          }}>
            {profile.verified ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {profile.verified ? 'Verifisert' : 'Ikke verifisert'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>

        {/* Kundeinfo */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '18px 22px' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Bedriftsinformasjon</h2>
          <InfoRow label="E-post" value={profile.email ?? '—'} />
          <InfoRow label="Kontaktperson" value={profile.contact_person ?? '—'} />
          <InfoRow label="Registrert" value={fmtDate(profile.created_at)} />
          <InfoRow label="Siste innlogging" value={fmtDateTime(lastSignIn)} />
          {profile.notes && <InfoRow label="Notater" value={<span style={{ fontStyle: 'italic', color: '#8b949e' }}>{profile.notes}</span>} />}
        </div>

        {/* Aktivitetsoversikt */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '18px 22px' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Aktivitet</h2>
          <InfoRow label="Aktive annonser" value={<span style={{ color: '#3fb950', fontWeight: 600 }}>{activeListings}</span>} />
          <InfoRow label="Inaktive annonser" value={<span style={{ color: '#8b949e' }}>{inactiveListings}</span>} />
          <InfoRow label="Mottatte forespørsler" value={totalInqs > 0 ? totalInqs : '—'} />
          <InfoRow label="Besvart" value={totalInqs > 0 ? `${answeredInqs} / ${totalInqs} (${inqRate ?? 0} %)` : '—'} />
        </div>
      </div>

      {/* Listings */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Annonser ({(listings ?? []).length})
        </h2>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #30363d' }}>
                {['Tittel', 'Kategori', 'Pris', 'Status', 'Visninger', 'Dato', 'Se'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(listings ?? []).length === 0 && (
                <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#8b949e', padding: '24px 16px' }}>
                  Ingen annonser
                </td></tr>
              )}
              {(listings ?? []).map((l: any) => (
                <tr key={l.id} style={{ transition: 'background 0.1s' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#21262d44')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ ...S.td, maxWidth: 260, fontWeight: 500 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                    {l.source && l.source !== 'manual' && (
                      <div style={{ fontSize: 10, color: '#f0883e', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{l.source}</div>
                    )}
                  </td>
                  <td style={{ ...S.td, color: '#8b949e', textTransform: 'capitalize' }}>{l.category ?? '—'}</td>
                  <td style={{ ...S.td, fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15 }}>{fmtPrice(l.price)}</td>
                  <td style={S.td}><StatusBadge status={l.status} /></td>
                  <td style={{ ...S.td, color: '#8b949e' }}>{l.views ?? 0}</td>
                  <td style={{ ...S.td, color: '#8b949e', whiteSpace: 'nowrap' }}>{fmtDate(l.created_at)}</td>
                  <td style={S.td}>
                    <Link href={`/annonse/${l.id}`} target="_blank"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#388bfd', fontSize: 12, textDecoration: 'none' }}>
                      <ExternalLink size={11} /> Se
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent inquiries received */}
      {listingIds.length > 0 && (
        <div>
          <h2 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Mottatte forespørsler (siste 10)
          </h2>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #30363d' }}>
                  {['Dato', 'Maskin', 'Fra (kjøper)', 'Status'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(inquiries ?? []).length === 0 && (
                  <tr><td colSpan={4} style={{ ...S.td, textAlign: 'center', color: '#8b949e', padding: '24px 16px' }}>
                    Ingen forespørsler
                  </td></tr>
                )}
                {(inquiries ?? []).map((i: any) => (
                  <tr key={i.id}>
                    <td style={{ ...S.td, whiteSpace: 'nowrap', fontSize: 12, color: '#8b949e' }}>{fmtDateTime(i.created_at)}</td>
                    <td style={{ ...S.td, maxWidth: 220 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.listing?.title ?? '—'}</div>
                    </td>
                    <td style={{ ...S.td, color: '#8b949e' }}>{i.sender?.company_name ?? '—'}</td>
                    <td style={S.td}><InqStatusBadge status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
