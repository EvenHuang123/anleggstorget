import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import type { Listing } from '@/lib/supabase/types'

// React cache() deduplicates calls within the same render pass.
// generateMetadata + page component can both call getListing() — only 1 Supabase request is made.
export const getListing = cache(async (slugOrId: string): Promise<Listing | null> => {
  try {
    const supabase = createPublicClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any
    for (const field of ['slug', 'id']) {
      const { data } = await sb
        .from('listings')
        .select('*, profiles(*), favorites_count:favorites(count)')
        .eq(field, slugOrId)
        .in('status', ['active', 'sold', 'reserved'])
        .single() as { data: Listing | null }
      if (data) return data
    }
    return null
  } catch {
    return null
  }
})
