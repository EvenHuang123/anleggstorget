import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://anleggstorget.no'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/ny-annonse', '/api/', '/auth/', '/registrer/bekreft'],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
