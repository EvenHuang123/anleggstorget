export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'flex-start' }}>
        {/* Venstre: bilde + detaljer */}
        <div>
          {/* Breadcrumb skeleton */}
          <div style={{ height: 14, background: 'var(--bg2)', borderRadius: 3, width: 200, marginBottom: 20, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />

          {/* Tittel skeleton */}
          <div style={{ height: 32, background: 'var(--bg2)', borderRadius: 4, width: '70%', marginBottom: 8, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 18, background: 'var(--bg2)', borderRadius: 3, width: '40%', marginBottom: 28, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />

          {/* Bildegalleri skeleton */}
          <div style={{ height: 420, background: 'var(--bg2)', borderRadius: 6, marginBottom: 16, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ width: 72, height: 56, background: 'var(--bg2)', borderRadius: 4, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>

          {/* Spesifikasjoner skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 52, background: 'var(--bg2)', borderRadius: 4, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>

          {/* Beskrivelse skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 14, background: 'var(--bg2)', borderRadius: 3, width: i === 3 ? '60%' : '100%', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        </div>

        {/* Høyre: priskort skeleton */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ height: 36, background: 'var(--bg2)', borderRadius: 4, width: '60%', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 14, background: 'var(--bg2)', borderRadius: 3, width: '40%', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 1, background: 'var(--border)' }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 14, background: 'var(--bg2)', borderRadius: 3, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
          ))}
          <div style={{ height: 50, background: 'var(--bg2)', borderRadius: 4, marginTop: 8, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        @media (max-width: 768px) {
          .annonse-loading-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
