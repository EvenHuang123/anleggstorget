import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

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
  title: {
    default: 'Maskintorget – Norges B2B Maskinmarkedsplass',
    template: '%s | Maskintorget',
  },
  description:
    'Kjøp og selg tunge maskiner mellom verifiserte norske bedrifter. Gravemaskiner, traktorer, hjullastere og mer.',
  keywords: ['maskin', 'gravemaskin', 'traktor', 'hjullaster', 'b2b', 'maskinsalg', 'Norge'],
  openGraph: {
    type: 'website',
    locale: 'nb_NO',
    siteName: 'Maskintorget',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1814',
              color: '#ede8de',
              border: '1px solid rgba(255,255,255,0.12)',
              fontFamily: 'Barlow, sans-serif',
              fontSize: '14px',
              borderRadius: '4px',
            },
            success: {
              iconTheme: { primary: '#c8953a', secondary: '#0d0c0a' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0d0c0a' },
            },
          }}
        />
      </body>
    </html>
  )
}
