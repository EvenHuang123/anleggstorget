'use client'

import { ShieldCheck, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminTopbar() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 56, zIndex: 100,
      background: '#161b22', borderBottom: '1px solid #30363d',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShieldCheck size={18} color="#388bfd" />
        <span style={{
          color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: 16, letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          Anleggstorget Admin
        </span>
        <span style={{
          background: '#388bfd22', color: '#388bfd', border: '1px solid #388bfd44',
          borderRadius: 4, fontSize: 10, fontWeight: 700, padding: '2px 7px',
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          Intern
        </span>
      </div>

      <button
        onClick={handleLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: '1px solid #30363d', borderRadius: 6,
          color: '#8b949e', fontSize: 13, cursor: 'pointer', padding: '6px 12px',
          transition: 'all 0.15s',
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor = '#f85149'; e.currentTarget.style.color = '#f85149' }}
        onMouseOut={e => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#8b949e' }}
      >
        <LogOut size={13} />
        Logg ut
      </button>
    </header>
  )
}
