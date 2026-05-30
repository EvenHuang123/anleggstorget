'use client'

import { ReactNode } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

interface Props {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right'
  className?: string
  style?: React.CSSProperties
}

export default function AnimatedSection({
  children,
  delay = 0,
  direction = 'up',
  className,
  style,
}: Props) {
  const { ref, visible } = useScrollReveal()

  const hiddenTransform =
    direction === 'up'    ? 'translateY(28px)' :
    direction === 'left'  ? 'translateX(-28px)' :
                            'translateX(28px)'

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translate(0,0)' : hiddenTransform,
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
