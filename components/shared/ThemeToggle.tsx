'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'

export default function ThemeToggle({ variant = 'navbar' }: { variant?: 'navbar' | 'settings' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  if (variant === 'navbar') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 38, height: 38, borderRadius: 3, flexShrink: 0,
          background: 'var(--bg3)', border: '1px solid var(--border)',
          color: 'var(--t2)', cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(200,149,58,0.4)'
          e.currentTarget.style.color = 'var(--gold)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--t2)'
        }}
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    )
  }

  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 4, padding: '20px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--t1)', marginBottom: 3 }}>
          Utseende
        </p>
        <p style={{ color: 'var(--t3)', fontSize: 13, margin: 0 }}>
          {isDark ? 'Mørk modus aktiv' : 'Lys modus aktiv'}
        </p>
      </div>
      <button
        onClick={toggleTheme}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 18px',
          background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.4)',
          borderRadius: 3, color: 'var(--gold)',
          fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: 13,
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--gold)'
          e.currentTarget.style.color = '#0d0c0a'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--gold3)'
          e.currentTarget.style.color = 'var(--gold)'
        }}
      >
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
        {isDark ? 'Bytt til lys' : 'Bytt til mørk'}
      </button>
    </div>
  )
}
