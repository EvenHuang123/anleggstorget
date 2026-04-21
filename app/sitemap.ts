import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://anleggstorget.no'
  const now = new Date()

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/sok`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/sok?category=gravemaskin`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/sok?category=traktor`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/sok?category=hjullaster`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/sok?category=dumper`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/sok?category=kranbil`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/sok?category=skogsutstyr`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/ny-annonse`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/registrer`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/logg-inn`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
