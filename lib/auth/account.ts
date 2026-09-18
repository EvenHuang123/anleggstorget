import type { AccountType } from '@/lib/supabase/types'

/**
 * Read account_type from a Supabase auth user's metadata.
 * Legacy users (registered before buyer accounts existed) have no account_type —
 * they are all businesses, so we default them to 'seller'. This keeps existing
 * seller registration and access 100% unchanged.
 */
export function accountTypeFromMetadata(meta: Record<string, unknown> | null | undefined): AccountType {
  const t = meta?.account_type
  if (t === 'buyer' || t === 'seller' || t === 'admin') return t
  return 'seller'
}

/** Only sellers (and admins) may create listings. Buyers may browse, favourite and inquire. */
export function canSell(meta: Record<string, unknown> | null | undefined): boolean {
  return accountTypeFromMetadata(meta) !== 'buyer'
}
