'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, PlusSquare, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string; company?: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('company_name')
          .eq('id', data.session.user.id)
          .single() as { data: { company_name: string } | null }
        setUser({
          email: data.session.user.email,
          company: profile?.company_name,
        })
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) setUser(null)
    })
    return () => subscription.unsubscribe()
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
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(13,12,10,0.95)' : 'rgba(13,12,10,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.09)' : 'transparent'}`,
        transition: 'all 0.3s ease',
      }}
    >
      <div className="container-main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: 'var(--gold)',
              borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 800, fontSize: 16,
                color: '#0d0c0a', letterSpacing: '-0.02em',
              }}>M</span>
            </div>
            <span style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 18,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--t1)',
            }}>
              Maskintorget
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hidden-mobile">
            <Link href="/sok" className={`nav-link ${pathname.startsWith('/sok') ? 'active' : ''}`}>
              Finn maskin
            </Link>
            <Link href="/sok?type=selger" className="nav-link">Selgere</Link>
            <Link href="/om-oss" className="nav-link">Om oss</Link>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hidden-mobile">
            {user ? (
              <>
                <Link href="/ny-annonse" className="btn-primary" style={{ fontSize: 12, padding: '9px 18px' }}>
                  <PlusSquare size={14} />
                  Legg ut annonse
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
            <Link href="/sok?type=selger" className="nav-link" style={{ padding: '10px 0', fontSize: 15 }} onClick={() => setMobileOpen(false)}>
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
