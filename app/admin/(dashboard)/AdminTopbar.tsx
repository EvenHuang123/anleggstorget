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
      background: '#FFFFFF', borderBottom: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShieldCheck size={18} color="#B45309" />
        <span style={{
          color: '#1A1A1A', fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: 16, letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          Anleggstorget Admin
        </span>
        <span style={{
          background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A',
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
          background: 'none', border: '1px solid #E5E7EB', borderRadius: 6,
          color: '#6B7280', fontSize: 13, cursor: 'pointer', padding: '6px 12px',
          transition: 'all 0.15s',
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#dc2626' }}
        onMouseOut={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
      >
        <LogOut size={13} />
        Logg ut
      </button>
    </header>
  )
}
