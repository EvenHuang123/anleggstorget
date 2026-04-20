'use client'

import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'horizontal' | 'stacked' | 'icon'
  href?: string
}

const SIZES = {
  sm: { icon: 28, text: 15, gap: 8 },
  md: { icon: 34, text: 18, gap: 10 },
  lg: { icon: 56, text: 28, gap: 14 },
}

export default function Logo({ size = 'md', variant = 'horizontal', href = '/' }: LogoProps) {
  const { icon, text, gap } = SIZES[size]

  const inner = (
    <>
      <ExcavatorMark size={icon} />
      {variant !== 'icon' && (
        <span style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800,
          fontSize: text,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--t1)',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}>
          Maskin<span style={{ color: 'var(--gold)' }}>torget</span>
        </span>
      )}
    </>
  )

  const flexStyle: React.CSSProperties = variant === 'stacked'
    ? { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: gap * 0.6, textDecoration: 'none' }
    : { display: 'flex', alignItems: 'center', gap, textDecoration: 'none' }

  return (
    <Link href={href} style={flexStyle}>
      {inner}
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
      {/* Tracks (undercarriage) */}
      <rect x="6" y="32" width="26" height="6" rx="3" fill="var(--gold)" />
      <circle cx="10" cy="35" r="2.5" fill="var(--bg)" />
      <circle cx="18" cy="35" r="2.5" fill="var(--bg)" />
      <circle cx="26" cy="35" r="2.5" fill="var(--bg)" />

      {/* Upper body / counterweight */}
      <rect x="6" y="22" width="8" height="10" rx="1" fill="var(--gold)" opacity="0.7" />

      {/* Cab */}
      <rect x="13" y="18" width="12" height="14" rx="1.5" fill="var(--gold)" />
      {/* Cab window */}
      <rect x="15" y="20" width="7" height="5" rx="1" fill="var(--bg)" opacity="0.5" />

      {/* Boom (main arm) */}
      <rect
        x="24" y="14"
        width="14" height="4"
        rx="2"
        fill="var(--gold)"
        transform="rotate(-20 24 16)"
      />

      {/* Stick (lower arm) */}
      <rect
        x="31" y="10"
        width="11" height="3.5"
        rx="1.5"
        fill="var(--gold)"
        transform="rotate(15 31 11)"
      />

      {/* Bucket */}
      <path
        d="M40 6 L44 9 L42 14 L37 14 L36 10 Z"
        fill="var(--gold)"
      />
      {/* Bucket teeth */}
      <path
        d="M37.5 14 L38.5 16.5 M39.5 14 L40.5 16.5 M41.5 14 L42 16.5"
        stroke="var(--gold)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
