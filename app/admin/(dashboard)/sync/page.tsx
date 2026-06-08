import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'

export const dynamic = 'force-dynamic'

interface SyncLog {
  id: string
  source: string
  status: string
  created_count: number
  updated_count: number
  removed_count: number
  total_scraped: number
  error_message: string | null
  duration_ms: number | null
  created_at: string
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('nb-NO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtMs(ms: number | null) {
  if (ms == null) return '—'
  if (ms < 1000) return ms + ' ms'
  return (ms / 1000).toFixed(1) + ' s'
}

function StatusBadge({ status }: { status: string }) {
  const cfg = status === 'success'
    ? { bg: 'rgba(63,185,80,0.1)', color: '#3fb950', border: 'rgba(63,185,80,0.3)', label: 'Success' }
    : status === 'error'
    ? { bg: 'rgba(248,81,73,0.1)', color: '#f85149', border: 'rgba(248,81,73,0.3)', label: 'Feilet' }
    : { bg: 'rgba(240,136,62,0.1)', color: '#f0883e', border: 'rgba(240,136,62,0.3)', label: 'Delvis' }

  return (
    <span style={{
      padding: '3px 9px', borderRadius: 4, fontSize: 12, fontWeight: 600,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  )
}

export default async function AdminSyncPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: logs } = await (supabase as any)
    .from('sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50) as { data: SyncLog[] | null }

  const s = {
    th: { padding: '10px 16px', textAlign: 'left' as const, color: '#8b949e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', whiteSpace: 'nowrap' as const },
    td: { padding: '12px 16px', fontSize: 14, color: '#e6edf3', borderTop: '1px solid #21262d', verticalAlign: 'top' as const },
  }

  const totalSuccess = (logs ?? []).filter(l => l.status === 'success').length
  const totalErrors = (logs ?? []).filter(l => l.status === 'error').length
  const avgDuration = (logs ?? []).reduce((sum, l) => sum + (l.duration_ms ?? 0), 0) / Math.max((logs ?? []).length, 1)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Sync-logger
        </h1>
        <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: 13 }}>Siste 50 NASTA-synkroniseringer</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Vellykket', value: totalSuccess, color: '#3fb950' },
          { label: 'Feilet', value: totalErrors, color: '#f85149' },
          { label: 'Snitt varighet', value: fmtMs(Math.round(avgDuration)), color: '#8b949e' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '14px 20px', minWidth: 140 }}>
            <p style={{ margin: 0, color: '#8b949e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ margin: '4px 0 0', color, fontSize: 22, fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif' }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #30363d' }}>
              <th style={s.th}>Dato / tid</th>
              <th style={s.th}>Kilde</th>
              <th style={s.th}>Status</th>
              <th style={{ ...s.th, textAlign: 'right' as const }}>Nye</th>
              <th style={{ ...s.th, textAlign: 'right' as const }}>Oppdatert</th>
              <th style={{ ...s.th, textAlign: 'right' as const }}>Fjernet</th>
              <th style={{ ...s.th, textAlign: 'right' as const }}>Scraped</th>
              <th style={{ ...s.th, textAlign: 'right' as const }}>Varighet</th>
              <th style={s.th}>Feilmelding</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).length === 0 && (
              <tr><td colSpan={9} style={{ ...s.td, textAlign: 'center', color: '#8b949e', padding: '32px 16px' }}>
                Ingen sync-logger ennå
              </td></tr>
            )}
            {(logs ?? []).map(log => (
              <tr key={log.id} className="admin-tr">
                <td style={{ ...s.td, whiteSpace: 'nowrap', fontSize: 13, color: '#8b949e' }}>{fmtDateTime(log.created_at)}</td>
                <td style={{ ...s.td, fontWeight: 600, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.04em', color: '#f0883e' }}>{log.source}</td>
                <td style={s.td}><StatusBadge status={log.status} /></td>
                <td style={{ ...s.td, textAlign: 'right', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 16, color: log.created_count > 0 ? '#3fb950' : '#8b949e' }}>{log.created_count ?? 0}</td>
                <td style={{ ...s.td, textAlign: 'right', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 16, color: log.updated_count > 0 ? '#388bfd' : '#8b949e' }}>{log.updated_count ?? 0}</td>
                <td style={{ ...s.td, textAlign: 'right', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 16, color: log.removed_count > 0 ? '#f85149' : '#8b949e' }}>{log.removed_count ?? 0}</td>
                <td style={{ ...s.td, textAlign: 'right', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 16 }}>{log.total_scraped ?? 0}</td>
                <td style={{ ...s.td, textAlign: 'right', fontSize: 13, color: '#8b949e', whiteSpace: 'nowrap' }}>{fmtMs(log.duration_ms)}</td>
                <td style={{ ...s.td, maxWidth: 280 }}>
                  {log.error_message
                    ? <code style={{ color: '#f85149', fontSize: 11, wordBreak: 'break-all', background: 'rgba(248,81,73,0.08)', padding: '3px 6px', borderRadius: 4 }}>{log.error_message}</code>
                    : <span style={{ color: '#30363d' }}>—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`.admin-tr { transition: background 0.1s; } .admin-tr:hover { background: #21262d44; }`}</style>
    </div>
  )
}
