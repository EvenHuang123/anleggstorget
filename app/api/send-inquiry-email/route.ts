import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { inquiryId } = await request.json()
    if (!inquiryId) return NextResponse.json({ error: 'inquiryId required' }, { status: 400 })

    const supabase = await createServiceClient()

    // Fetch inquiry with listing + profiles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inq, error } = await (supabase as any)
      .from('inquiries')
      .select(`
        *,
        listing:listings (
          id, title, price, category,
          seller:profiles!seller_id ( company_name, contact_person, id )
        ),
        sender:profiles!sender_id ( company_name, contact_person )
      `)
      .eq('id', inquiryId)
      .single() as {
        data: {
          id: string; message: string; email: string | null; phone: string | null
          listing: {
            id: string; title: string; price: number
            seller: { id: string; company_name: string; contact_person: string | null }
          }
          sender: { company_name: string; contact_person: string | null }
        } | null
        error: unknown
      }

    if (error || !inq) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // Get seller's email from auth.users via admin API
    const { data: { user: sellerUser } } = await supabase.auth.admin.getUserById(inq.listing.seller.id)
    const sellerEmail = sellerUser?.email
    if (!sellerEmail) {
      console.warn('No seller email found for listing', inq.listing.id)
      return NextResponse.json({ error: 'Seller email not found' }, { status: 404 })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.warn('RESEND_API_KEY not set — skipping email')
      return NextResponse.json({ skipped: true })
    }

    const priceFormatted = new Intl.NumberFormat('nb-NO', {
      style: 'currency', currency: 'NOK', maximumFractionDigits: 0,
    }).format(inq.listing.price)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://anleggstorget.no'

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f4f4f4}
  .wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1)}
  .header{background:#0d0c0a;padding:28px 32px;text-align:center}
  .logo{font-size:22px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#ede8de}
  .logo span{color:#c8953a}
  .body{padding:32px}
  .tag{display:inline-block;background:rgba(200,149,58,0.12);border:1px solid rgba(200,149,58,0.3);color:#c8953a;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:3px 10px;border-radius:2px;margin-bottom:20px}
  h2{margin:0 0 20px;font-size:22px;color:#0d0c0a}
  .listing{background:#fafafa;border:1px solid #e5e5e5;border-left:4px solid #c8953a;border-radius:4px;padding:16px 20px;margin-bottom:20px}
  .listing-title{font-size:18px;font-weight:700;color:#0d0c0a;margin:0 0 6px}
  .listing-price{font-size:22px;font-weight:800;color:#c8953a;margin:0}
  .section{margin-bottom:20px}
  .label{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;margin-bottom:6px}
  .value{font-size:14px;color:#333;margin:0}
  .msg-box{background:#f8f8f8;border:1px solid #e5e5e5;border-radius:4px;padding:16px 20px;margin-bottom:24px}
  .msg{font-size:14px;color:#444;white-space:pre-wrap;margin:8px 0 0}
  .cta{display:inline-block;background:#c8953a;color:#0d0c0a;padding:14px 28px;text-decoration:none;border-radius:4px;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.06em}
  .footer{background:#fafafa;border-top:1px solid #eee;padding:20px 32px;text-align:center;font-size:12px;color:#999}
  .footer a{color:#c8953a;text-decoration:none}
  a[href^="mailto"]{color:#c8953a}
  a[href^="tel"]{color:#c8953a}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">ANLEGGS<span>TORGET</span></div>
  </div>
  <div class="body">
    <div class="tag">Ny forespørsel</div>
    <h2>Du har fått en kjøperhenvendelse!</h2>

    <div class="listing">
      <div class="listing-title">${inq.listing.title}</div>
      <div class="listing-price">${priceFormatted}</div>
    </div>

    <div class="section">
      <div class="label">Fra bedrift</div>
      <p class="value"><strong>${inq.sender.company_name}</strong>${inq.sender.contact_person ? `<br>${inq.sender.contact_person}` : ''}</p>
    </div>

    <div class="section">
      <div class="label">Kontakt kjøper direkte</div>
      ${inq.email ? `<p class="value"><a href="mailto:${inq.email}">${inq.email}</a></p>` : ''}
      ${inq.phone ? `<p class="value"><a href="tel:${inq.phone}">${inq.phone}</a></p>` : ''}
    </div>

    <div class="msg-box">
      <div class="label">Melding fra kjøper</div>
      <p class="msg">${inq.message}</p>
    </div>

    <a href="${siteUrl}/dashboard/foresporsel" class="cta">Se alle forespørsler →</a>

    <p style="margin-top:24px;font-size:13px;color:#888">
      Tips: Kjøpere som sender forespørsel er seriøse interessenter. Svar raskt for best salgsmulighet.
    </p>
  </div>
  <div class="footer">
    © ${new Date().getFullYear()} Anleggstorget · Norges B2B maskinmarkedsplass<br>
    <a href="${siteUrl}">${siteUrl.replace('https://', '')}</a>
  </div>
</div>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'Anleggstorget <noreply@anleggstorget.no>',
        to: sellerEmail,
        subject: `Ny forespørsel på: ${inq.listing.title}`,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('Resend API error:', res.status, body)
      return NextResponse.json({ error: 'Email send failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('send-inquiry-email error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
