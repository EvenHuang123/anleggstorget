interface BrregEnhet {
  organisasjonsnummer: string
  navn: string
  organisasjonsform?: { kode: string; beskrivelse: string }
  konkurs?: boolean
  underAvvikling?: boolean
  underTvangsavviklingEllerTvangsopplosning?: boolean
}

export interface OrgVerifyResult {
  valid: boolean
  name: string | null
  error?: string
}

export async function verifyOrgNumber(orgNumber: string): Promise<OrgVerifyResult> {
  const cleaned = orgNumber.replace(/\s/g, '')

  if (!/^\d{9}$/.test(cleaned)) {
    return { valid: false, name: null, error: 'Organisasjonsnummer må være nøyaktig 9 siffer' }
  }

  const res = await fetch(
    `https://data.brreg.no/enhetsregisteret/api/enheter/${cleaned}`,
    {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    }
  )

  if (res.status === 404) {
    return { valid: false, name: null, error: 'Org.nummer ikke funnet i Brønnøysundregistrene' }
  }

  if (!res.ok) {
    return { valid: false, name: null, error: `Brønnøysundregistrene svarte med feil (${res.status})` }
  }

  const data: BrregEnhet = await res.json()

  if (data.konkurs) {
    return { valid: false, name: data.navn, error: 'Bedriften er registrert som konkurs' }
  }
  if (data.underAvvikling) {
    return { valid: false, name: data.navn, error: 'Bedriften er under avvikling' }
  }
  if (data.underTvangsavviklingEllerTvangsopplosning) {
    return { valid: false, name: data.navn, error: 'Bedriften er under tvangsavvikling eller tvangsoppløsning' }
  }

  return { valid: true, name: data.navn }
}
