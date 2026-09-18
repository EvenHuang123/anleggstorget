import { cache } from 'react'
import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { treeKeysToDbValues } from '@/lib/utils/format'
import type { Listing } from '@/lib/supabase/types'

const BASE = 'https://www.anleggstorget.no'

/** Config for a category SEO landing page. */
export interface CategoryPageConfig {
  /** CATEGORY_TREE key used for filtering (e.g. 'dumpers', 'kraner'). */
  category: string
  /** Landing-page URL slug (e.g. 'dumpere', 'kraner-og-loft'). May differ from `category`. */
  slug: string
  h1: string
  metaTitle: string
  metaDescription: string
  keywords?: string[]
  /** Representative Open Graph image for the category. */
  ogImage?: string
  intro: string[]
  faq: { q: string; a: string }[]
  relatedCategories: { label: string; href: string }[]
}

export interface CategoryData {
  listings: Listing[]
  /** Total active listings in the category (not limited by the grid page size). */
  count: number
}

/**
 * Fetch the newest listings + total active count for a category.
 * Wrapped in React cache() so generateMetadata and the page component share one query.
 * Uses the cookie-less public client so pages can be statically cached (ISR).
 */
export const getCategoryData = cache(async (categoryKey: string): Promise<CategoryData> => {
  try {
    const supabase = createPublicClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let qb = (supabase as any)
      .from('listings')
      .select('*, profiles(company_name, verified, org_number), favorites_count:favorites(count)', { count: 'exact' })
      .eq('status', 'active')

    const dbCats = treeKeysToDbValues([categoryKey])
    const cats = dbCats.length > 0 ? dbCats : [categoryKey]
    if (cats.length === 1) qb = qb.eq('category', cats[0])
    else                   qb = qb.in('category', cats)

    const { data, count } = await qb
      .order('created_at', { ascending: false })
      .limit(12) as { data: Listing[] | null; count: number | null }

    return { listings: data ?? [], count: count ?? 0 }
  } catch {
    return { listings: [], count: 0 }
  }
})

/** Build SEO metadata for a category landing page, folding in the live active count. */
export function buildCategoryMetadata(config: CategoryPageConfig, count: number): Metadata {
  const description = count > 0
    ? `${config.metaDescription} ${count} aktive annonser fra verifiserte norske bedrifter.`
    : config.metaDescription
  const url = `${BASE}/${config.slug}`

  return {
    title: config.metaTitle,
    description,
    keywords: config.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: config.metaTitle,
      description,
      url,
      images: config.ogImage
        ? [{ url: config.ogImage, width: 1200, height: 630, alt: config.h1 }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: config.metaTitle,
      description,
      images: config.ogImage ? [config.ogImage] : undefined,
    },
  }
}
