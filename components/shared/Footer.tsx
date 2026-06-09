'use client'

import Link from 'next/link'
import Logo from './Logo'

const FOOTER_LINKS = {
  'Markeder': [
    { label: 'Gravemaskiner',       href: '/sok?category=gravemaskiner'  },
    { label: 'Hjullastere',         href: '/sok?category=hjullastere'    },
    { label: 'Dumpers',             href: '/sok?category=dumpers'        },
    { label: 'Kompaktmaskiner',     href: '/sok?category=kompaktmaskiner'},
    { label: 'Kraner og løft',      href: '/sok?category=kraner'         },
    { label: 'Komprimering/asfalt', href: '/sok?category=komprimering'   },
  ],
  'Tjenester': [
    { label: 'Legg ut annonse', href: '/ny-annonse' },
    { label: 'Bedriftsverifisering', href: '/registrer' },
    { label: 'Søk maskiner', href: '/sok' },
    { label: 'Min side', href: '/dashboard' },
  ],
  'Selskap': [
    { label: 'Om Anleggstorget', href: '/om-oss' },
    { label: 'Kontakt oss', href: '/kontakt' },
    { label: 'Personvern', href: '/personvern' },
    { label: 'Vilkår', href: '/vilkar' },
  ],
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
      {/* Main footer */}
      <div className="container-main" style={{ padding: '64px 24px 48px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr repeat(3, 1fr)',
          gap: 48,
        }} className="footer-grid">
          {/* Brand column */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <Logo size="sm" variant="footer" />
            </div>

            <p style={{ color: 'var(--t3)', fontSize: 14, lineHeight: 1.7, maxWidth: 260, marginBottom: 24 }}>
              Norges første dedikerte B2B-markedsplass for kjøp, salg og utleie av tunge maskiner mellom verifiserte bedrifter.
            </p>

            <div style={{ display: 'flex', gap: 8 }}>
              <div className="tag tag-gold">
                <span className="live-dot" style={{ width: 5, height: 5 }} />
                Live markedsplass
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <p className="label-sm" style={{ marginBottom: 12 }}>Kontakt</p>
              <a href="mailto:kontakt@anleggstorget.no" style={{
                color: 'var(--t2)', fontSize: 14, textDecoration: 'none',
                transition: 'color 0.15s', display: 'block',
              }}>kontakt@anleggstorget.no</a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="label-sm" style={{ marginBottom: 16 }}>{heading}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container-main footer-bottom" style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <p style={{ color: 'var(--t3)', fontSize: 12 }}>
            © {year} Anleggstorget — Norges B2B-markedsplass for tunge maskiner
          </p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link href="/personvern" style={{ color: 'var(--t3)', fontSize: 12, textDecoration: 'none' }}>Personvernerklæring</Link>
            <Link href="/vilkar" style={{ color: 'var(--t3)', fontSize: 12, textDecoration: 'none' }}>Vilkår</Link>
            <button
              onClick={() => { localStorage.removeItem('cookie-consent'); window.location.reload() }}
              style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: 12, cursor: 'pointer', padding: 0 }}
            >
              Administrer cookies
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid { grid-template-columns: 2fr repeat(3, 1fr); }
        .footer-bottom { flex-direction: row; }
        .footer-link { color: var(--t2); font-size: 14px; text-decoration: none; transition: color 0.15s ease; }
        .footer-link:hover { color: var(--t1); }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-bottom { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>
    </footer>
  )
}
