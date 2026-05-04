'use client'

import Navbar from '@/components/shared/Navbar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LayoutDashboard, ListOrdered, MessageSquare, Heart, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUnread() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: ids } = await (supabase as any)
        .from('listings')
        .select('id')
        .eq('seller_id', session.user.id) as { data: { id: string }[] | null }

      if (!ids?.length) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase as any)
        .from('inquiries')
        .select('id', { count: 'exact', head: true })
        .in('listing_id', ids.map(l => l.id))
        .eq('status', 'new') as { count: number | null }

      setUnreadCount(count ?? 0)
    }
    fetchUnread()

    const channel = supabase
      .channel('dash-layout-inquiries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, fetchUnread)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Oversikt', badge: 0 },
    { href: '/dashboard/annonser', icon: ListOrdered, label: 'Mine annonser', badge: 0 },
    { href: '/dashboard/foresporsel', icon: MessageSquare, label: 'Forespørsler', badge: unreadCount },
    { href: '/dashboard/favoritter', icon: Heart, label: 'Favoritter', badge: 0 },
    { href: '/dashboard/innstillinger', icon: Settings, label: 'Innstillinger', badge: 0 },
  ]

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80, display: 'flex' }}>
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
            {NAV.map(({ href, icon: Icon, label, badge }) => {
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
                  justifyContent: 'space-between',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={15} />
                    {label}
                  </span>
                  {badge > 0 && (
                    <span style={{
                      background: 'var(--gold)', color: '#0d0c0a',
                      borderRadius: 10, padding: '1px 7px',
                      fontSize: 11, fontWeight: 700,
                      fontFamily: 'Barlow Condensed, sans-serif',
                      lineHeight: '18px',
                    }}>
                      {badge}
                    </span>
                  )}
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
