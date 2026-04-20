import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/lib/context/ThemeContext'

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
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('anleggstorget-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();` }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
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
                iconTheme: { primary: '#c8953a', secondary: '#0d0c0a' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#0d0c0a' },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
