'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Truck, RefreshCcw, MessageSquare, BarChart2 } from 'lucide-react'

const NAV = [
  { href: '/admin',             icon: LayoutDashboard, label: 'Oversikt',      exact: true  },
  { href: '/admin/kunder',      icon: Users,           label: 'Kunder',        exact: false },
  { href: '/admin/maskiner',    icon: Truck,           label: 'Maskiner',      exact: false },
  { href: '/admin/foresporsler',icon: MessageSquare,   label: 'Forespørsler',  exact: false },
  { href: '/admin/analytics',   icon: BarChart2,       label: 'Analytics',     exact: false },
  { href: '/admin/sync',        icon: RefreshCcw,      label: 'Sync-logger',   exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: '#161b22', borderRight: '1px solid #30363d',
      height: 'calc(100vh - 56px)', position: 'sticky', top: 56,
      overflowY: 'auto', padding: '16px 0',
    }}>
      <p style={{
        color: '#8b949e', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.07em', padding: '0 16px', marginBottom: 8,
      }}>
        Navigasjon
      </p>
      <nav>
        {NAV.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 16px', textDecoration: 'none', fontSize: 14,
              color: active ? '#e6edf3' : '#8b949e',
              background: active ? '#21262d' : 'transparent',
              borderLeft: `2px solid ${active ? '#388bfd' : 'transparent'}`,
              transition: 'all 0.12s',
            }}
              onMouseOver={e => { if (!active) { e.currentTarget.style.color = '#e6edf3'; e.currentTarget.style.background = '#21262d22' } }}
              onMouseOut={e => { if (!active) { e.currentTarget.style.color = '#8b949e'; e.currentTarget.style.background = 'transparent' } }}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div style={{ margin: '24px 16px 0', paddingTop: 16, borderTop: '1px solid #21262d' }}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', textAlign: 'center', fontSize: 12,
            color: '#8b949e', textDecoration: 'none', padding: '6px 0',
          }}
        >
          Åpne anleggstorget.no →
        </a>
      </div>
    </aside>
  )
}
