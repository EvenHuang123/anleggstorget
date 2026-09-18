/**
 * Kjørbar dry-run/verifisering av sikkerhetsventilen — skriver INGENTING til DB.
 *
 *   npx tsx scripts/verify-delist-guard.ts
 *
 * Exit 0 = alle scenarioer som forventet, exit 1 = avvik.
 */
import { checkDelistGuard } from '../lib/sync/guards'

interface Case { name: string; active: number; toDelist: number; expectAllowed: boolean }

const cases: Case[] = [
  { name: 'Liten kilde (< 10 aktive): alltid tillatt selv om alt forsvinner', active: 8, toDelist: 8, expectAllowed: true },
  { name: 'Liten kilde grense: 9 aktive, alle forsvinner', active: 9, toDelist: 9, expectAllowed: true },
  { name: 'Normal: 100 aktive, 5 forsvinner (5%)', active: 100, toDelist: 5, expectAllowed: true },
  { name: 'Normal: 100 aktive, 30 forsvinner (akkurat 30%, = terskel)', active: 100, toDelist: 30, expectAllowed: true },
  { name: 'Trip: 100 aktive, 31 forsvinner (31% > 30%)', active: 100, toDelist: 31, expectAllowed: false },
  { name: 'Trip: 40 aktive, alle forsvinner (scraper ødelagt)', active: 40, toDelist: 40, expectAllowed: false },
  { name: 'Normal: 40 aktive, 12 forsvinner (30% = floor 12)', active: 40, toDelist: 12, expectAllowed: true },
  { name: 'Trip: 40 aktive, 13 forsvinner (>floor 12)', active: 40, toDelist: 13, expectAllowed: false },
  { name: 'Ingen forsvinner', active: 50, toDelist: 0, expectAllowed: true },
]

let failed = 0
for (const c of cases) {
  const r = checkDelistGuard(c.active, c.toDelist)
  const ok = r.allowed === c.expectAllowed
  if (!ok) failed++
  console.log(
    `${ok ? '✓' : '✗'} ${c.name}\n    active=${c.active} toDelist=${c.toDelist} threshold=${r.threshold} → allowed=${r.allowed} (forventet ${c.expectAllowed})` +
    (r.reason ? `\n    ${r.reason}` : ''),
  )
}

console.log(`\n${failed === 0 ? 'ALLE OK' : `${failed} FEILET`}`)
process.exit(failed === 0 ? 0 : 1)
