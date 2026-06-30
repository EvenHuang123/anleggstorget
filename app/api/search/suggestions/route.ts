import { NextRequest } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'

interface Row {
  brand: string | null
  model: string | null
  title: string | null
}

export interface Suggestion {
  text: string
  type: 'brand' | 'model' | 'title'
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return Response.json([])

  // Prevent SQL injection via ilike wildcard — strip special chars
  const safe = q.replace(/[%_\\]/g, '')
  if (!safe) return Response.json([])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createPublicClient() as any
  const { data } = await supabase
    .from('listings')
    .select('brand, model, title')
    .eq('status', 'active')
    .or(`brand.ilike.%${safe}%,model.ilike.%${safe}%,title.ilike.%${safe}%`)
    .limit(40) as { data: Row[] | null }

  if (!data || data.length === 0) return Response.json([])

  const ql = safe.toLowerCase()
  const brandSet  = new Set<string>()
  const modelSet  = new Set<string>()
  const titleSet  = new Set<string>()

  for (const row of data) {
    if (row.brand && row.brand.toLowerCase().includes(ql)) {
      brandSet.add(row.brand)
    }
    if (row.model && row.model.toLowerCase().includes(ql)) {
      // Prefix with brand for context ("Volvo EC300" not just "EC300")
      const key = row.brand ? `${row.brand} ${row.model}` : row.model
      modelSet.add(key)
    }
    if (row.title && row.title.toLowerCase().includes(ql)) {
      titleSet.add(row.title)
    }
  }

  const brands = [...brandSet].slice(0, 4)
  const models = [...modelSet]
    // Drop model entries that just repeat a brand we already show
    .filter(m => !brands.some(b => m.toLowerCase() === b.toLowerCase()))
    .slice(0, 4)

  const suggestions: Suggestion[] = [
    ...brands.map(text => ({ text, type: 'brand' as const })),
    ...models.map(text => ({ text, type: 'model' as const })),
  ]

  // Fill remaining slots with title suggestions (when few brand/model matches)
  if (suggestions.length < 5) {
    for (const text of titleSet) {
      if (suggestions.some(s => s.text.toLowerCase() === text.toLowerCase())) continue
      suggestions.push({ text, type: 'title' })
      if (suggestions.length >= 8) break
    }
  }

  return Response.json(suggestions.slice(0, 8))
}
