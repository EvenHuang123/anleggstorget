import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Non-cookie client for public data — does NOT call cookies(), allowing ISR/static caching.
// Use this for reads that don't require authentication (public listings, profiles).
// Never use this for writes or auth-gated queries.
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
