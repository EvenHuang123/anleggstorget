export function SkipToContent() {
  return (
    <>
      <style>{`
        .skip-link {
          position: absolute;
          left: -9999px;
          top: -9999px;
          width: 1px;
          height: 1px;
          overflow: hidden;
          text-decoration: none;
        }
        .skip-link:focus-visible {
          position: fixed;
          left: 16px;
          top: 16px;
          width: auto;
          height: auto;
          overflow: visible;
          z-index: 9999;
          padding: 8px 18px;
          background: var(--gold);
          color: #0d0c0a;
          border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          outline: none;
        }
      `}</style>
      <a href="#main-content" className="skip-link">
        Hopp til innhold
      </a>
    </>
  )
}
