'use client'

import { useState } from 'react'
import Link from 'next/link'

interface LogoProps {
  variant?: 'navbar' | 'footer'
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

const IMG_HEIGHTS = {
  sm: 32,
  md: 44,
  lg: 60,
}

const SVG_SIZES = {
  sm: { icon: 26, text: 15, gap: 8 },
  md: { icon: 32, text: 18, gap: 10 },
  lg: { icon: 52, text: 28, gap: 14 },
}

export default function Logo({ variant = 'navbar', size = 'md', href = '/' }: LogoProps) {
  const [imgError, setImgError] = useState(false)
  const h = IMG_HEIGHTS[size]
  const src = '/logo-dark.png'

  if (imgError) {
    const { icon, text, gap } = SVG_SIZES[size]
    return (
      <Link href={href} style={{ display: 'flex', alignItems: 'center', gap, textDecoration: 'none', flexShrink: 0 }}>
        <ExcavatorMark size={icon} />
        <span style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800, fontSize: text,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--t1)', lineHeight: 1, whiteSpace: 'nowrap',
        }}>
          Anleggs<span style={{ color: 'var(--gold)' }}>torget</span>
        </span>
      </Link>
    )
  }

  return (
    <Link href={href} style={{ display: 'block', lineHeight: 0, flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Anleggstorget – B2B markedsplass for anleggsmaskiner"
        height={h}
        style={{ height: h, width: 'auto', maxWidth: '100%', display: 'block' }}
        onError={() => setImgError(true)}
      />
    </Link>
  )
}

function ExcavatorMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="35" width="30" height="9" rx="4.5" fill="var(--gold)" />
      <circle cx="9"  cy="39.5" r="3" fill="var(--bg)" />
      <circle cx="18" cy="39.5" r="3" fill="var(--bg)" />
      <circle cx="27" cy="39.5" r="3" fill="var(--bg)" />
      <rect x="5" y="22" width="14" height="13" rx="2" fill="var(--gold)" />
      <path d="M17 27 L40 11 L43 16 L20 32 Z" fill="var(--gold)" />
      <path d="M37 7 L45 4 L46 10 L39 14 Z" fill="var(--gold)" />
    </svg>
  )
}
