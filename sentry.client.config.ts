import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,       // 10% av requests — lavt for å unngå ytelsespåvirkning
  replaysSessionSampleRate: 0, // Deaktivert — krever samtykke
  replaysOnErrorSampleRate: 0,
  enabled: process.env.NODE_ENV === 'production',
  ignoreErrors: [
    // Nettleser-extensions og network-noise
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    /^Network request failed/,
  ],
})
