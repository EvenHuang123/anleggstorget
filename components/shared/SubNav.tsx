'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/',               label: 'Hjem' },
  { href: '/sok',            label: 'Finn maskin' },
  { href: '/selgere',        label: 'Bedrifter' },
  { href: '/om-oss',         label: 'Om oss' },
  { href: '/markedsinnsikt', label: 'Markedsinnsikt' },
  { href: '/kontakt',        label: 'Kontakt' },
]

export default function SubNav() {
  const pathname = usePathname()

  return (
    <div style={{
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 64,
      zIndex: 90,
    }}>
      <div className="container-main">
        <nav style={{
          display: 'flex',
          gap: 0,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }} className="subnav-scroll">
          {LINKS.map(link => {
            const isActive = link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '13px 16px',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'Barlow, sans-serif',
                  color: isActive ? 'var(--gold)' : 'var(--t2)',
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                className="subnav-link"
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <style>{`
        .subnav-scroll::-webkit-scrollbar { display: none; }
        .subnav-link:hover { color: var(--t1) !important; }
      `}</style>
    </div>
  )
}
