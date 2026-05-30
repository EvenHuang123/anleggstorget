import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { articles } from '@/lib/guides/articles'

// Force HTTPS — env var may be http:// on local/staging but sitemap must always be HTTPS in prod
const rawBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://anleggstorget.no'
const BASE = rawBase.includes('localhost') ? rawBase : rawBase.replace(/^http:\/\//, 'https://')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                             lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/sok`,                          lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/gravemaskiner`,               lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/hjullastere`,                 lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/dumpere`,                     lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/traktorer`,                   lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/selgere`,                      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/markedsinnsikt`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/om-oss`,                       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/kontakt`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/guide`,                        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    ...articles.map(a => ({
      url: `${BASE}/guide/${a.slug}`,
      lastModified: new Date(a.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]

  try {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any
    const [{ data: listings }, { data: sellers }] = await Promise.all([
      sb.from('listings').select('id, slug, updated_at').eq('status', 'active') as
        Promise<{ data: { id: string; slug: string | null; updated_at: string }[] | null }>,
      sb.from('profiles').select('id, slug, updated_at') as
        Promise<{ data: { id: string; slug: string | null; updated_at: string }[] | null }>,
    ])

    const listingPages: MetadataRoute.Sitemap = (listings ?? []).map(l => ({
      url: `${BASE}/annonse/${l.slug || l.id}`,
      lastModified: new Date(l.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const sellerPages: MetadataRoute.Sitemap = (sellers ?? []).map(s => ({
      url: `${BASE}/selgere/${s.slug || s.id}`,
      lastModified: new Date(s.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...listingPages, ...sellerPages]
  } catch {
    return staticPages
  }
}
