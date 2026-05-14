import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legg ut maskinannonse gratis | Anleggstorget',
  description: 'Legg ut annonse for din anleggsmaskin på Anleggstorget. Gratis for verifiserte bedrifter. Nå tusenvis av kjøpere i Norge.',
  robots: { index: false },
}

export default function NyAnnonseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
