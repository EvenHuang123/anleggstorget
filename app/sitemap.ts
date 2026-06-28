import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { articles } from '@/lib/guides/articles'

// Force HTTPS — env var may be http:// on local/staging but sitemap must always be HTTPS in prod
const rawBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.anleggstorget.no'
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
    // /markedsinnsikt er en «kommer snart»-side — ikke indeksverdig ennå
    { url: `${BASE}/om-oss`,                       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/kontakt`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/guide`,                        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/sok?category=gravemaskiner`,   lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE}/sok?category=hjullastere`,     lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE}/sok?category=dumpers`,         lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE}/sok?category=kompaktmaskiner`, lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE}/sok?category=kraner`,          lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE}/sok?category=annet`,           lastModified: now, changeFrequency: 'daily',   priority: 0.6 },
    ...articles.map(a => ({
      url: `${BASE}/guide/${a.slug}`,
      lastModified: new Date(a.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]

  try {
    const supabase = createPublicClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any
    const [{ data: listings }, { data: sellers }] = await Promise.all([
      // Only active listings — removed/sold listings returning 404 would hurt SEO
      sb.from('listings').select('id, slug, updated_at')
        .eq('status', 'active')
        .not('slug', 'is', null) as
        Promise<{ data: { id: string; slug: string; updated_at: string }[] | null }>,
      // Only profiles with a slug — UUID-based URLs may not resolve to a valid page
      sb.from('profiles').select('id, slug, updated_at')
        .not('slug', 'is', null) as
        Promise<{ data: { id: string; slug: string; updated_at: string }[] | null }>,
    ])

    const listingPages: MetadataRoute.Sitemap = (listings ?? []).map(l => ({
      url: `${BASE}/annonse/${l.slug}`,
      lastModified: new Date(l.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const sellerPages: MetadataRoute.Sitemap = (sellers ?? []).map(s => ({
      url: `${BASE}/selgere/${s.slug}`,
      lastModified: new Date(s.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...listingPages, ...sellerPages]
  } catch {
    return staticPages
  }
}
