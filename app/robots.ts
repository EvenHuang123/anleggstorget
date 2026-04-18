import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://maskintorget.no'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/ny-annonse', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
