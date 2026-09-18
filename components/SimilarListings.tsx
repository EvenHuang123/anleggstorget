import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createPublicClient } from '@/lib/supabase/public'
import ListingCard from '@/components/listings/ListingCard'
import { CATEGORIES } from '@/lib/utils/format'
import type { Listing } from '@/lib/supabase/types'

interface Props {
  currentListing: Listing
  limit?: number
}

/** PostgREST .or()-verdier: fjern anførselstegn og komma som ville brutt filteret. */
function safe(v: string): string {
  return v.replace(/["(),]/g, '').trim()
}

/** Har annonsen en reell pris? "Forhandlingsbar" (negotiable / 0) teller som uten pris. */
function priceOf(l: Listing): number | null {
  if (l.price_type === 'negotiable') return null
  const p = l.price_ex_vat ?? l.price
  return p && p > 0 ? p : null
}

/**
 * "Lignende maskiner" — server component. ÉN Supabase-spørring: en pool på ~40
 * kandidater via et OR-filter (samme kategori ELLER samme merke), rangert i
 * TypeScript. Ekskluderer alltid currentListing. Kun statuser anon har
 * lesetilgang til (RLS begrenser klienten), med 'active' rangert foran sold/delisted.
 *
 * Rangeringsprioritet: subcategory+brand > category+brand > category+weight_class
 * > category (nærmest i pris). Annonser uten pris sist innen sitt nivå.
 * Rendrer ingenting hvis 0 treff.
 */
export default async function SimilarListings({ currentListing: cur, limit = 6 }: Props) {
  let pool: Listing[] = []
  try {
    const supabase = createPublicClient()
    const orFilter = cur.brand
      ? `category.eq."${safe(cur.category)}",brand.eq."${safe(cur.brand)}"`
      : `category.eq."${safe(cur.category)}"`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('listings')
      .select('*, profiles(company_name, verified, org_number), favorites_count:favorites(count)')
      .or(orFilter)
      .in('status', ['active', 'sold', 'reserved', 'delisted'])
      .neq('id', cur.id)
      .limit(40) as { data: Listing[] | null }
    pool = data ?? []
  } catch {
    pool = []
  }

  const curPrice = priceOf(cur)

  // Rangér i TS. Lavere sorteringsverdier = høyere prioritet.
  const ranked = pool
    .map(l => {
      const statusRank = l.status === 'active' ? 0 : 1
      let tier: number
      if (cur.subcategory && l.subcategory === cur.subcategory && cur.brand && l.brand === cur.brand) tier = 1
      else if (l.category === cur.category && cur.brand && l.brand === cur.brand) tier = 2
      else if (l.category === cur.category && cur.weight_class && l.weight_class === cur.weight_class) tier = 3
      else if (l.category === cur.category) tier = 4
      else tier = 5 // samme merke, annen kategori
      const p = priceOf(l)
      const priced = p != null ? 0 : 1 // uten pris sist innen nivå
      const priceDiff = p != null && curPrice != null ? Math.abs(p - curPrice) : Number.POSITIVE_INFINITY
      return { l, statusRank, tier, priced, priceDiff }
    })
    .sort((a, b) =>
      a.statusRank - b.statusRank ||
      a.tier - b.tier ||
      a.priced - b.priced ||
      a.priceDiff - b.priceDiff ||
      (b.l.created_at ?? '').localeCompare(a.l.created_at ?? ''),
    )
    .slice(0, limit)
    .map(r => r.l)

  if (ranked.length === 0) return null

  const categoryLabel = CATEGORIES[cur.category]?.label ?? cur.category

  return (
    <section style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
      <div className="container-main" style={{ padding: '56px 24px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <p className="section-label" style={{ marginBottom: 6 }}>Fortsett å utforske</p>
            <h2 className="section-title" style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}>
              Lignende maskiner
            </h2>
          </div>
          <Link
            href={`/sok?category=${cur.category}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'var(--gold)', fontSize: 13, textDecoration: 'none',
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0,
            }}
            aria-label={`Se alle ${categoryLabel} i søket`}
          >
            Se alle i kategorien <ArrowRight size={14} />
          </Link>
        </div>

        <div className="similar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {ranked.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      </div>

      <style>{`
        .similar-grid { grid-template-columns: repeat(3, 1fr) !important; }
        @media (max-width: 1024px) { .similar-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px)  { .similar-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
