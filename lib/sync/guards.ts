/**
 * Delaraktig sikkerhetsventil for scrapere.
 *
 * Hvis en sync-kjøring vil markere mer enn 30 % av kildens nåværende aktive
 * annonser som 'delisted', betyr det nesten alltid at scraperen er ødelagt
 * (kilden endret HTML, blokkerte oss, e.l.) — ikke at alt faktisk forsvant.
 * Da avbryter vi HELE delisting-steget og lar statusene stå urørt.
 *
 * Ventilen slår ikke ut for små kilder (< 10 aktive) for å unngå falske alarmer.
 */

export const MIN_ACTIVE_FOR_GUARD = 10
export const MAX_DELIST_FRACTION = 0.30

export interface DelistGuardResult {
  /** true = trygt å delist'e; false = ventilen har utløst, ikke skriv noe. */
  allowed: boolean
  toDelist: number
  activeCount: number
  /** Maks antall som kan delist'es uten å utløse ventilen (floor). */
  threshold: number
  reason?: string
}

/**
 * Ren funksjon — ingen I/O, lett å teste og kjøre dry-run.
 * @param activeCount  Antall rader kilden har som er 'active' i DB nå.
 * @param toDelistCount Antall aktive rader denne kjøringen vil sette til 'delisted'.
 */
export function checkDelistGuard(activeCount: number, toDelistCount: number): DelistGuardResult {
  const threshold = Math.floor(activeCount * MAX_DELIST_FRACTION)

  // Små kilder: hopp over ventilen.
  if (activeCount < MIN_ACTIVE_FOR_GUARD) {
    return { allowed: true, toDelist: toDelistCount, activeCount, threshold }
  }

  if (toDelistCount > threshold) {
    const pct = activeCount > 0 ? Math.round((toDelistCount / activeCount) * 100) : 0
    return {
      allowed: false,
      toDelist: toDelistCount,
      activeCount,
      threshold,
      reason: `${toDelistCount} av ${activeCount} aktive annonser (${pct}%) ville blitt delistet — over 30 %-terskelen (maks ${threshold}). Avbryter delisting; scraperen er sannsynligvis ødelagt.`,
    }
  }

  return { allowed: true, toDelist: toDelistCount, activeCount, threshold }
}

/**
 * Skriv en revisjonsrad til sync_logs når ventilen utløser. Nye/oppdaterte
 * annonser er allerede skrevet normalt; kun delisting ble avbrutt, derav 'partial'.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logDelistGuardTripped(supabase: any, source: string, guard: DelistGuardResult): Promise<void> {
  try {
    await supabase.from('sync_logs').insert({
      source,
      status: 'partial',
      created_count: 0,
      updated_count: 0,
      removed_count: 0,
      total_scraped: guard.activeCount,
      error_message: `[SIKKERHETSVENTIL/ERROR] ${guard.reason}`,
    })
  } catch {
    /* logging skal aldri kaste videre */
  }
}
