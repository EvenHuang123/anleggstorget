import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://anleggstorget.no'
  const privateRoutes = ['/dashboard/', '/ny-annonse', '/api/', '/auth/', '/registrer/bekreft']

  return {
    rules: [
      // All bots: allow public content, block private routes
      {
        userAgent: '*',
        allow: '/',
        disallow: privateRoutes,
      },
      // AI crawlers — explicit allow so audits don't flag them as blocked
      { userAgent: 'ChatGPT-User',     allow: '/' },
      { userAgent: 'OAI-SearchBot',    allow: '/' },
      { userAgent: 'Claude-User',      allow: '/' },
      { userAgent: 'Claude-SearchBot', allow: '/' },
      { userAgent: 'Google-Extended',  allow: '/' },
      { userAgent: 'PerplexityBot',    allow: '/' },
      { userAgent: 'Perplexity-User',  allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      // Spam/scraper bots — block entirely
      { userAgent: 'AhrefsBot',  disallow: '/' },
      { userAgent: 'SemrushBot', disallow: '/' },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
