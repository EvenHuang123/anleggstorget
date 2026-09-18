'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const STORAGE_KEY = 'cookie-consent-v2'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function analyticsGranted(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    return JSON.parse(raw)?.analytics === true
  } catch {
    return false
  }
}

/** Slett alle _ga*-cookies på domenet — inkl. .anleggstorget.no og bare-host. */
function clearGaCookies() {
  try {
    const host = location.hostname
    const domains = ['', host, `.${host}`, '.anleggstorget.no', 'anleggstorget.no']
    for (const c of document.cookie.split(';')) {
      const name = c.split('=')[0].trim()
      if (!name.startsWith('_ga')) continue
      for (const d of domains) {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${d ? `; domain=${d}` : ''}`
      }
    }
  } catch {
    /* private mode / SSR */
  }
}

/**
 * Laster GA4 KUN etter samtykke (analytics=true i cookie-consent-v2).
 * Consent Mode v2: default denied settes før gtag.js lastes; ved samtykke
 * settes analytics_storage=granted og scriptet injiseres — uten reload.
 * Samtykke leses client-side etter mount → ingen hydration mismatch (server og
 * første klient-render gir begge null).
 */
export default function GoogleAnalytics() {
  const [granted, setGranted] = useState(false)

  useEffect(() => {
    const sync = () => {
      const g = analyticsGranted()
      setGranted(g)
      // Reflekter valget live hvis gtag allerede er lastet (endring uten reload).
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: g ? 'granted' : 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        })
      }
      if (!g) clearGaCookies()
    }
    sync()
    window.addEventListener('cookie-consent-changed', sync)
    return () => window.removeEventListener('cookie-consent-changed', sync)
  }, [])

  if (!GA_ID || !granted) return null

  return (
    <>
      {/* Consent Mode v2 — default denied FØR gtag.js, deretter granted for analytics. */}
      <Script id="ga4-consent-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
          });
          gtag('consent', 'update', { analytics_storage: 'granted' });
        `}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-config" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}
