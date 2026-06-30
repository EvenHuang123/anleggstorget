export const FYLKE_MAP: Record<string, string> = {
  // Oslo
  'Oslo': 'Oslo',
  // Akershus
  'Kjeller': 'Akershus',
  'Lillestrøm': 'Akershus',
  'Ski': 'Akershus',
  'Ås': 'Akershus',
  'Jessheim': 'Akershus',
  'Asker': 'Akershus',
  'Bærum': 'Akershus',
  'Lørenskog': 'Akershus',
  'Rælingen': 'Akershus',
  'Nittedal': 'Akershus',
  // Innlandet
  'Hamar': 'Innlandet',
  'Gjøvik': 'Innlandet',
  'Lillehammer': 'Innlandet',
  'Brumunddal': 'Innlandet',
  'Elverum': 'Innlandet',
  'Kongsvinger': 'Innlandet',
  'Moelv': 'Innlandet',
  // Vestfold og Telemark
  'Larvik': 'Vestfold og Telemark',
  'Tønsberg': 'Vestfold og Telemark',
  'Sandefjord': 'Vestfold og Telemark',
  'Skien': 'Vestfold og Telemark',
  'Porsgrunn': 'Vestfold og Telemark',
  'Horten': 'Vestfold og Telemark',
  'Holmestrand': 'Vestfold og Telemark',
  // Agder
  'Kristiansand': 'Agder',
  'Arendal': 'Agder',
  'Mandal': 'Agder',
  'Farsund': 'Agder',
  'Grimstad': 'Agder',
  // Rogaland
  'Sandnes': 'Rogaland',
  'Stavanger': 'Rogaland',
  'Haugesund': 'Rogaland',
  'Egersund': 'Rogaland',
  'Bryne': 'Rogaland',
  'Nærbø': 'Rogaland',
  // Vestland
  'Bergen': 'Vestland',
  'Espeland': 'Vestland',
  'Stord': 'Vestland',
  'Voss': 'Vestland',
  'Odda': 'Vestland',
  'Florø': 'Vestland',
  // Møre og Romsdal
  'Ålesund': 'Møre og Romsdal',
  'Molde': 'Møre og Romsdal',
  'Kristiansund': 'Møre og Romsdal',
  'Vikebukt': 'Møre og Romsdal',
  'Sunndalsøra': 'Møre og Romsdal',
  // Trøndelag
  'Trondheim': 'Trøndelag',
  'Hell': 'Trøndelag',
  'Hommelvik': 'Trøndelag',
  'Steinkjer': 'Trøndelag',
  'Levanger': 'Trøndelag',
  'Verdal': 'Trøndelag',
  'Røros': 'Trøndelag',
  // Nordland
  'Bodø': 'Nordland',
  'Tverrlandet': 'Nordland',
  'Mo i Rana': 'Nordland',
  'Narvik': 'Nordland',
  'Fauske': 'Nordland',
  'Mosjøen': 'Nordland',
  // Troms og Finnmark
  'Tromsø': 'Troms og Finnmark',
  'Sørreisa': 'Troms og Finnmark',
  'Alta': 'Troms og Finnmark',
  'Harstad': 'Troms og Finnmark',
  'Finnsnes': 'Troms og Finnmark',
  'Hammerfest': 'Troms og Finnmark',
  // Norge (catch-all for NASTA/Rockmann entries)
  'Norge': 'Annet',
}

export function getFylkeForSted(sted: string): string {
  return FYLKE_MAP[sted] ?? 'Annet'
}

export function getStederForFylke(fylke: string): string[] {
  return Object.entries(FYLKE_MAP)
    .filter(([, f]) => f === fylke)
    .map(([sted]) => sted)
}
