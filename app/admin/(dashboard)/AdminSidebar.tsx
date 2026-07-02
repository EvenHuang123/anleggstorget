'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Truck, RefreshCcw, MessageSquare, BarChart2, Mail, LogOut } from 'lucide-react'

const NAV = [
  { href: '/admin',              icon: LayoutDashboard, label: 'Oversikt',      exact: true  },
  { href: '/admin/kunder',       icon: Users,           label: 'Kunder',        exact: false },
  { href: '/admin/maskiner',     icon: Truck,           label: 'Maskiner',      exact: false },
  { href: '/admin/foresporsler', icon: MessageSquare,   label: 'Forespørsler',  exact: false },
  { href: '/admin/broadcast',    icon: Mail,            label: 'Broadcast',     exact: false },
  { href: '/admin/analytics',    icon: BarChart2,       label: 'Analytics',     exact: false },
  { href: '/admin/sync',         icon: RefreshCcw,      label: 'Sync-logger',   exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: '#FFFFFF', borderRight: '1px solid #E5E7EB',
      height: 'calc(100vh - 56px)', position: 'sticky', top: 56,
      overflowY: 'auto', padding: '20px 0',
      display: 'flex', flexDirection: 'column',
    }}>
      <p style={{
        color: '#9CA3AF', fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.08em', padding: '0 16px', marginBottom: 6,
      }}>
        Navigasjon
      </p>

      <nav style={{ flex: 1 }}>
        {NAV.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', margin: '1px 8px', borderRadius: 8,
              textDecoration: 'none', fontSize: 14,
              color: active ? '#92400E' : '#6B7280',
              background: active ? '#FEF3C7' : 'transparent',
              fontWeight: active ? 600 : 400,
              transition: 'all 0.12s',
            }}
              onMouseOver={e => { if (!active) { e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#F3F4F6' } }}
              onMouseOut={e => { if (!active) { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'transparent' } }}
            >
              <Icon size={15} color={active ? '#B45309' : '#9CA3AF'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid #F3F4F6', marginTop: 8 }}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', textAlign: 'center', fontSize: 12,
            color: '#9CA3AF', textDecoration: 'none', padding: '6px 8px',
            borderRadius: 6,
          }}
          onMouseOver={e => { e.currentTarget.style.color = '#B45309' }}
          onMouseOut={e => { e.currentTarget.style.color = '#9CA3AF' }}
        >
          Åpne anleggstorget.no →
        </a>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', marginTop: 4, borderRadius: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9CA3AF', fontSize: 13, transition: 'all 0.12s',
          }}
          onMouseOver={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fef2f2' }}
          onMouseOut={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'none' }}
        >
          <LogOut size={13} />
          Logg ut
        </button>
      </div>
    </aside>
  )
}
