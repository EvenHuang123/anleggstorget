import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import CookieBanner from '@/components/CookieBanner'
import { SkipToContent } from '@/components/SkipToContent'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-barlow',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.anleggstorget.no'),
  title: {
    default: 'Anleggstorget – Kjøp og selg tunge maskiner | B2B Maskinmarkedsplass',
    template: '%s | Anleggstorget',
  },
  alternates: {
    canonical: 'https://www.anleggstorget.no',
    languages: {
      'nb-NO': 'https://www.anleggstorget.no',
      'x-default': 'https://www.anleggstorget.no',
    },
  },
  description:
    'Norges B2B-markedsplass for verifiserte bedrifter. Kjøp, selg og leie gravemaskiner, hjullastere, dumpere og anleggsutstyr trygt og gratis.',
  keywords: [
    'kjøp maskiner', 'selg gravemaskin', 'anleggsutstyr Norge', 'brukt maskin til salgs',
    'hjullaster', 'dumper', 'traktor', 'kranbil', 'B2B maskinmarked', 'gravemaskin',
    'maskin utleie', 'anleggsmaskiner', 'Brønnøysund verifisert', 'maskinsalg Norge',
  ],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'nb_NO',
    siteName: 'Anleggstorget',
    url: 'https://www.anleggstorget.no',
    title: 'Anleggstorget – Norges B2B-markedsplass for tunge maskiner',
    description: 'Kjøp, selg og leie anleggsmaskiner mellom verifiserte norske bedrifter. Gratis annonsering.',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anleggstorget – Kjøp og selg tunge maskiner',
    description: 'Norges B2B-markedsplass for anleggsmaskiner. Verifiserte bedrifter, gratis annonsering.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DYN1RCTLN5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DYN1RCTLN5');
          `}
        </Script>
        {/* Plausible — GDPR-vennlig analytics, ingen cookies */}
        <Script
          defer
          data-domain="anleggstorget.no"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
        <SkipToContent />
        {children}
        <SpeedInsights />
        <Analytics />
        <CookieBanner />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg3)',
              color: 'var(--t1)',
              border: '1px solid var(--border2)',
              fontFamily: 'Barlow, sans-serif',
              fontSize: '14px',
              borderRadius: '4px',
            },
            success: {
              iconTheme: { primary: '#a87030', secondary: '#f9f7f4' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f9f7f4' },
            },
          }}
        />
      </body>
    </html>
  )
}
