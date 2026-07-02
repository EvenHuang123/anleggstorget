import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'
import SyncControls from './SyncControls'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

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
    ? { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', label: 'Vellykket' }
    : status === 'error'
    ? { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5', label: 'Feilet' }
    : { bg: '#fffbeb', color: '#D97706', border: '#fde68a', label: 'Delvis' }

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

  const th = { padding: '10px 16px', textAlign: 'left' as const, color: '#6B7280', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' as const }
  const td = { padding: '12px 16px', fontSize: 14, color: '#1A1A1A', borderTop: '1px solid #F3F4F6', verticalAlign: 'top' as const }

  const totalSuccess = (logs ?? []).filter(l => l.status === 'success').length
  const totalErrors  = (logs ?? []).filter(l => l.status === 'error').length
  const avgDuration  = (logs ?? []).reduce((sum, l) => sum + (l.duration_ms ?? 0), 0) / Math.max((logs ?? []).length, 1)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#1A1A1A' }}>
          Sync-logger
        </h1>
        <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 13 }}>Siste 50 synkroniseringer (alle kilder)</p>
      </div>

      <SyncControls />

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Vellykket', value: totalSuccess, color: '#16a34a', bg: '#f0fdf4', border: '#86efac', icon: CheckCircle2 },
          { label: 'Feilet',    value: totalErrors,  color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', icon: XCircle },
          { label: 'Snitt varighet', value: fmtMs(Math.round(avgDuration)), color: '#6B7280', bg: '#FFFFFF', border: '#E5E7EB', icon: Clock },
        ].map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '14px 20px', minWidth: 150, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Icon size={18} color={color} />
            <div>
              <p style={{ margin: 0, color: '#6B7280', fontSize: 11, fontWeight: 500 }}>{label}</p>
              <p style={{ margin: '2px 0 0', color, fontSize: 22, fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
              <th style={th}>Dato / tid</th>
              <th style={th}>Kilde</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: 'right' as const }}>Nye</th>
              <th style={{ ...th, textAlign: 'right' as const }}>Oppdatert</th>
              <th style={{ ...th, textAlign: 'right' as const }}>Fjernet</th>
              <th style={{ ...th, textAlign: 'right' as const }}>Scraped</th>
              <th style={{ ...th, textAlign: 'right' as const }}>Varighet</th>
              <th style={th}>Feilmelding</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).length === 0 && (
              <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: '#6B7280', padding: '32px 16px' }}>
                Ingen sync-logger ennå
              </td></tr>
            )}
            {(logs ?? []).map(log => (
              <tr key={log.id} style={{ transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ ...td, whiteSpace: 'nowrap', fontSize: 13, color: '#6B7280' }}>{fmtDateTime(log.created_at)}</td>
                <td style={td}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D97706', display: 'inline-block', flexShrink: 0 }} />
                    {log.source}
                  </span>
                </td>
                <td style={td}><StatusBadge status={log.status} /></td>
                <td style={{ ...td, textAlign: 'right', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 16, color: log.created_count > 0 ? '#16a34a' : '#6B7280' }}>{log.created_count ?? 0}</td>
                <td style={{ ...td, textAlign: 'right', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 16, color: log.updated_count > 0 ? '#B45309' : '#6B7280' }}>{log.updated_count ?? 0}</td>
                <td style={{ ...td, textAlign: 'right', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 16, color: log.removed_count > 0 ? '#dc2626' : '#6B7280' }}>{log.removed_count ?? 0}</td>
                <td style={{ ...td, textAlign: 'right', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 16 }}>{log.total_scraped ?? 0}</td>
                <td style={{ ...td, textAlign: 'right', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmtMs(log.duration_ms)}</td>
                <td style={{ ...td, maxWidth: 280 }}>
                  {log.error_message
                    ? <code style={{ color: '#dc2626', fontSize: 11, wordBreak: 'break-all', background: '#fef2f2', padding: '3px 6px', borderRadius: 4 }}>{log.error_message}</code>
                    : <span style={{ color: '#D1D5DB' }}>—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
