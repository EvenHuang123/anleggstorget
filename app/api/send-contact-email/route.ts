import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, company, phone, message } = await request.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Navn, e-post og melding er påkrevd.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Ugyldig e-postadresse.' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set — skipping contact email')
      return NextResponse.json({ success: true })
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#0d0c0a;padding:28px 32px;text-align:center;">
      <span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:22px;letter-spacing:0.08em;text-transform:uppercase;color:#ede8de;">
        MASKIN<span style="color:#c8953a;">TORGET</span>
      </span>
    </div>

    <div style="padding:32px;">
      <h2 style="margin:0 0 24px;font-size:20px;color:#0d0c0a;font-weight:700;">
        📩 Ny kontaktmelding
      </h2>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#666;font-size:13px;width:110px;vertical-align:top;">Fra</td>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#0d0c0a;font-size:14px;font-weight:600;">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#666;font-size:13px;vertical-align:top;">E-post</td>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#c8953a;font-size:14px;"><a href="mailto:${email}" style="color:#c8953a;text-decoration:none;">${email}</a></td>
        </tr>
        ${company ? `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#666;font-size:13px;vertical-align:top;">Bedrift</td>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#0d0c0a;font-size:14px;">${company}</td>
        </tr>` : ''}
        ${phone ? `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#666;font-size:13px;vertical-align:top;">Telefon</td>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#0d0c0a;font-size:14px;"><a href="tel:${phone}" style="color:#0d0c0a;text-decoration:none;">${phone}</a></td>
        </tr>` : ''}
      </table>

      <div style="background:#f8f8f8;border-left:4px solid #c8953a;border-radius:0 4px 4px 0;padding:20px 24px;">
        <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;font-weight:600;">Melding</p>
        <p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      </div>

      <div style="margin-top:24px;padding:16px;background:#fff8ed;border:1px solid rgba(200,149,58,0.3);border-radius:4px;">
        <p style="margin:0;font-size:13px;color:#666;">
          💡 <strong>Svar direkte</strong> på denne e-posten for å kontakte <strong>${name}</strong>.
        </p>
      </div>
    </div>

    <div style="background:#f4f4f4;padding:20px 32px;text-align:center;border-top:1px solid #e5e5e5;">
      <p style="margin:0;font-size:12px;color:#999;">
        © ${new Date().getFullYear()} Anleggstorget ·
        <a href="https://anleggstorget.no" style="color:#c8953a;text-decoration:none;">anleggstorget.no</a>
      </p>
    </div>
  </div>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Anleggstorget <kontakt@anleggstorget.no>',
        to: 'huangevenzhe@gmail.com',
        reply_to: email,
        subject: `Ny kontaktmelding fra ${name}`,
        html,
      }),
    })

    if (!res.ok) {
      console.error('Resend error:', await res.text())
      return NextResponse.json({ error: 'Kunne ikke sende melding. Prøv igjen.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact email error:', err)
    return NextResponse.json({ error: 'Intern feil. Prøv igjen.' }, { status: 500 })
  }
}
