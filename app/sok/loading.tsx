export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Søkefelt skeleton */}
        <div style={{ height: 52, background: 'var(--bg2)', borderRadius: 4, marginBottom: 32, maxWidth: 480, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Filterpanel skeleton */}
          <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: 40, background: 'var(--bg2)', borderRadius: 4, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>

          {/* Kortgrid skeleton */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: 190, background: 'var(--bg2)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ height: 14, background: 'var(--bg2)', borderRadius: 3, width: '75%', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 14, background: 'var(--bg2)', borderRadius: 3, width: '50%', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 20, background: 'var(--bg2)', borderRadius: 3, width: '40%', marginTop: 4, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  )
}
