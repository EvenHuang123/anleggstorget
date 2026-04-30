import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kontakt oss',
  description: 'Ta kontakt med Anleggstorget. Vi hjelper deg med spørsmål om kjøp, salg og leie av anleggsmaskiner, eller teknisk support.',
  keywords: ['kontakt Anleggstorget', 'support maskinmarked', 'hjelp anleggsutstyr'],
  openGraph: {
    title: 'Kontakt oss | Anleggstorget',
    description: 'Ta kontakt med Anleggstorget for hjelp med kjøp, salg og leie av anleggsmaskiner.',
  },
}

export default function KontaktLayout({ children }: { children: React.ReactNode }) {
  return children
}
