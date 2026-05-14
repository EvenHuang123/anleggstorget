'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, PlusSquare, Settings, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string; company?: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fetchUnreadCount = async (userId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ids } = await (supabase as any)
      .from('listings')
      .select('id')
      .eq('seller_id', userId) as { data: { id: string }[] | null }

    if (!ids?.length) { setUnreadCount(0); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .in('listing_id', ids.map(l => l.id))
      .eq('status', 'new') as { count: number | null }

    setUnreadCount(count ?? 0)
  }

  useEffect(() => {
    let userId: string | null = null

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        userId = data.session.user.id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('company_name')
          .eq('id', userId)
          .single() as { data: { company_name: string } | null }
        setUser({
          email: data.session.user.email,
          company: profile?.company_name,
        })
        fetchUnreadCount(userId)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) { setUser(null); setUnreadCount(0) }
    })

    // Realtime — re-count when any inquiry changes
    const channel = supabase
      .channel('navbar-inquiries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => {
        if (userId) fetchUnreadCount(userId)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'color-mix(in srgb, var(--bg) 95%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.15)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <div className="container-main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 80 }}>
          {/* Logo */}
          <Logo size="lg" variant="navbar" />

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hidden-mobile">
            <Link href="/sok" className={`nav-link ${pathname.startsWith('/sok') ? 'active' : ''}`}>
              Finn maskin
            </Link>
            <Link href="/selgere" className="nav-link">Selgere</Link>
            <Link href="/om-oss" className="nav-link">Om oss</Link>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hidden-mobile">
            {user ? (
              <>
                <ThemeToggle variant="navbar" />
                <Link href="/ny-annonse" className="btn-primary" style={{ fontSize: 12, padding: '9px 18px' }}>
                  <PlusSquare size={14} />
                  Legg ut annonse
                </Link>

                {/* Notification bell */}
                <Link
                  href="/dashboard/foresporsel"
                  style={{
                    position: 'relative', flexShrink: 0,
                    width: 38, height: 38, borderRadius: 3,
                    background: unreadCount > 0 ? 'var(--gold3)' : 'var(--bg3)',
                    border: `1px solid ${unreadCount > 0 ? 'rgba(200,149,58,0.4)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: unreadCount > 0 ? 'var(--gold)' : 'var(--t2)',
                    textDecoration: 'none', transition: 'all 0.15s',
                  }}
                  title="Forespørsler"
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -5, right: -5,
                      background: 'var(--gold)', color: '#0d0c0a',
                      borderRadius: '50%', width: 17, height: 17,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                      border: '2px solid var(--bg)',
                      fontFamily: 'Barlow Condensed, sans-serif',
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button
                    className="btn-ghost"
                    onClick={() => setDropdownOpen(o => !o)}
                    style={{ gap: 6 }}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: 'var(--gold)',
                      fontFamily: 'Barlow Condensed, sans-serif',
                    }}>
                      {(user.company || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.company || user.email}
                    </span>
                    <ChevronDown size={12} style={{ transition: 'transform 0.15s ease', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>

                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      minWidth: 200,
                      background: 'var(--bg3)',
                      border: '1px solid var(--border2)',
                      borderRadius: 4,
                      boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                      padding: 8,
                      zIndex: 200,
                    }}>
                      <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                        <p style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Innlogget som
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--t1)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.company || user.email}
                        </p>
                      </div>
                      <Link href="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <LayoutDashboard size={14} /> Min side
                      </Link>
                      <Link href="/ny-annonse" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <PlusSquare size={14} /> Ny annonse
                      </Link>
                      <Link href="/dashboard/innstillinger" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <Settings size={14} /> Innstillinger
                      </Link>
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                      <button onClick={handleLogout} className="dropdown-item" style={{ width: '100%', textAlign: 'left', color: '#ef4444' }}>
                        <LogOut size={14} /> Logg ut
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <ThemeToggle variant="navbar" />
                <Link href="/logg-inn" className="btn-ghost">Logg inn</Link>
                <Link href="/ny-annonse" className="btn-primary" style={{ fontSize: 12, padding: '9px 18px' }}>
                  <PlusSquare size={14} />
                  Legg ut annonse
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="btn-ghost show-mobile"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ padding: 8 }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          padding: '16px 24px 24px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Link href="/sok" className="nav-link" style={{ padding: '10px 0', fontSize: 15 }} onClick={() => setMobileOpen(false)}>
              Finn maskin
            </Link>
            <Link href="/selgere" className="nav-link" style={{ padding: '10px 0', fontSize: 15 }} onClick={() => setMobileOpen(false)}>
              Selgere
            </Link>
            <Link href="/om-oss" className="nav-link" style={{ padding: '10px 0', fontSize: 15 }} onClick={() => setMobileOpen(false)}>
              Om oss
            </Link>
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
            {user ? (
              <>
                <Link href="/dashboard" className="btn-secondary" style={{ justifyContent: 'center', marginBottom: 8 }} onClick={() => setMobileOpen(false)}>
                  Min side
                </Link>
                <Link href="/ny-annonse" className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                  Legg ut annonse
                </Link>
              </>
            ) : (
              <>
                <Link href="/logg-inn" className="btn-secondary" style={{ justifyContent: 'center', marginBottom: 8 }} onClick={() => setMobileOpen(false)}>
                  Logg inn
                </Link>
                <Link href="/ny-annonse" className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                  Legg ut annonse
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .hidden-mobile { display: flex !important; }
        .show-mobile { display: none !important; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        .dropdown-item:hover { background: var(--gold4) !important; color: var(--t1) !important; }
      `}</style>
    </nav>
  )
}
