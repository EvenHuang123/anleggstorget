import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'
import BroadcastClient from './BroadcastClient'

export const dynamic = 'force-dynamic'

export default async function BroadcastPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  // Fetch all verified sellers that have an email — same filter as the broadcast API
  const { data: sellers } = await (supabase as any)
    .from('profiles')
    .select('id, company_name, email')
    .eq('verified', true)
    .not('email', 'is', null)
    .order('company_name', { ascending: true }) as {
      data: { id: string; company_name: string; email: string }[] | null
    }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Broadcast e-post
        </h1>
        <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: 13 }}>
          Send e-post til utvalgte selgere. Kun verifiserte kontoer med e-post vises.
        </p>
      </div>

      <BroadcastClient sellers={sellers ?? []} />
    </div>
  )
}
