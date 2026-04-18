'use client'

import Navbar from '@/components/shared/Navbar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListOrdered, MessageSquare, Heart, Settings } from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Oversikt' },
  { href: '/dashboard/annonser', icon: ListOrdered, label: 'Mine annonser' },
  { href: '/dashboard/foresporsler', icon: MessageSquare, label: 'Forespørsler' },
  { href: '/dashboard/favoritter', icon: Heart, label: 'Favoritter' },
  { href: '/dashboard/innstillinger', icon: Settings, label: 'Innstillinger' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64, display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, flexShrink: 0,
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          padding: '32px 0',
          position: 'sticky', top: 64, height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }} className="dash-sidebar">
          <div style={{ padding: '0 16px', marginBottom: 24 }}>
            <p className="label-sm">Min konto</p>
          </div>
          <nav>
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href} className={`dash-nav-link${active ? ' active' : ''}`} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px',
                  color: active ? 'var(--gold)' : 'var(--t2)',
                  textDecoration: 'none',
                  fontSize: 14, fontFamily: 'Barlow',
                  transition: 'all 0.15s ease',
                  borderLeft: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
                  background: active ? 'var(--bg3)' : 'transparent',
                }}>
                  <Icon size={15} />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div style={{ margin: '24px 16px 0', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <Link href="/ny-annonse" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12, height: 40 }}>
              + Ny annonse
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: '40px 32px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      <style>{`
        .dash-sidebar { display: block; }
        @media (max-width: 768px) { .dash-sidebar { display: none; } }
        .dash-nav-link:hover { color: var(--t1) !important; background: var(--bg3) !important; }
        .dash-nav-link.active:hover { color: var(--gold) !important; }
      `}</style>
    </>
  )
}
