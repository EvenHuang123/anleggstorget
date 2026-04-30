import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://anleggstorget.no'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                             lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/sok`,                          lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/sok?category=gravemaskin`,     lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/sok?category=traktor`,         lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/sok?category=hjullaster`,      lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/sok?category=dumper`,          lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/sok?category=kranbil`,         lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/sok?category=skogsutstyr`,     lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/selgere`,                      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/markedsinnsikt`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/om-oss`,                       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/kontakt`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/registrer`,                    lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  try {
    const supabase = await createClient()

    const [{ data: listings }, { data: sellers }] = await Promise.all([
      supabase
        .from('listings')
        .select('id, slug, updated_at')
        .eq('status', 'active'),
      supabase
        .from('profiles')
        .select('id, slug, updated_at'),
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
