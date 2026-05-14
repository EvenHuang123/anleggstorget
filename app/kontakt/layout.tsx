import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kontakt Anleggstorget – Hjelp og support',
  description: 'Ta kontakt med Anleggstorget for hjelp med kjøp, salg og leie av anleggsmaskiner. Vi svarer raskt på spørsmål fra verifiserte bedrifter.',
  keywords: ['kontakt Anleggstorget', 'support maskinmarked', 'hjelp anleggsutstyr'],
  openGraph: {
    title: 'Kontakt Anleggstorget – Hjelp og support',
    description: 'Ta kontakt med Anleggstorget for hjelp med kjøp, salg og leie av anleggsmaskiner.',
    url: 'https://anleggstorget.no/kontakt',
  },
}

export default function KontaktLayout({ children }: { children: React.ReactNode }) {
  return children
}
