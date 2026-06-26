import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/admin/supabase'
import { requireAdmin } from '@/lib/admin/auth'
import { z } from 'zod'

// SQL to run once in Supabase SQL Editor:
// CREATE TABLE IF NOT EXISTS broadcast_logs (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   sent_by text,
//   subject text NOT NULL,
//   message text NOT NULL,
//   recipients integer,
//   sent_at timestamptz DEFAULT now()
// );

const schema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
})

export async function POST(req: NextRequest) {
  // Admin cookie auth — requireAdmin throws/redirects for pages,
  // so we handle it inline here for an API route
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Ugyldig JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Ugyldig input' }, { status: 400 })

  const { subject, message } = parsed.data
  const supabase = createAdminClient()

  const { data: sellers } = await (supabase as any)
    .from('profiles')
    .select('id, email, company_name')
    .eq('verified', true)
    .not('email', 'is', null) as { data: { id: string; email: string; company_name: string }[] | null }

  if (!sellers || sellers.length === 0) {
    return NextResponse.json({ sent: 0, total: 0 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY ikke konfigurert' }, { status: 500 })
  }

  const site = 'https://anleggstorget.no'

  const results = await Promise.allSettled(
    sellers.map(seller =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'Anleggstorget <kontakt@anleggstorget.no>',
          to: seller.email,
          subject,
          html: `<!DOCTYPE html>
<html lang="nb">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:Barlow,system-ui,sans-serif;background:#f5f4f1;padding:32px 16px">
  <div style="max-width:540px;margin:0 auto;background:#fff;border:1px solid #e2ddd6;border-radius:6px;overflow:hidden">
    <div style="background:#1a1915;padding:20px 28px">
      <span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:22px;color:#c9a861;letter-spacing:0.06em;text-transform:uppercase">ANLEGGSTORGET</span>
    </div>
    <div style="padding:28px 28px 24px">
      <p style="margin:0 0 8px;font-size:15px;color:#1a1915">Hei ${seller.company_name},</p>
      <div style="font-size:15px;color:#3d3a34;line-height:1.7;white-space:pre-wrap;margin:16px 0">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      <p style="margin:20px 0 0;font-size:14px;color:#6b6560">Med vennlig hilsen,<br>Anleggstorget-teamet</p>
    </div>
    <div style="background:#f5f4f1;padding:14px 28px;border-top:1px solid #e2ddd6;font-size:12px;color:#9b938a">
      <a href="${site}" style="color:#9b938a">${site.replace('https://', '')}</a>
    </div>
  </div>
</body>
</html>`,
        }),
      })
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length

  // Log the broadcast
  await (supabase as any).from('broadcast_logs').insert({
    subject,
    message,
    recipients: sent,
  })

  return NextResponse.json({ sent, total: sellers.length })
}
