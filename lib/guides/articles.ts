export type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string; id: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; text: string }
  | { type: 'cta'; text: string; href: string; label: string }

export interface GuideFaq {
  q: string
  a: string
}

export interface GuideArticle {
  slug: string
  title: string
  shortTitle: string
  description: string
  keywords: string[]
  publishedAt: string
  updatedAt: string
  readingMinutes: number
  category: string
  content: ContentBlock[]
  faq: GuideFaq[]
}

export const articles: GuideArticle[] = [
  {
    slug: 'kjope-brukt-gravemaskin-guide',
    title: 'Kjøpe brukt gravemaskin – Komplett guide for 2026',
    shortTitle: 'Kjøpe brukt gravemaskin',
    description: 'Alt du trenger å vite om kjøp av brukt gravemaskin i Norge. Sjekkliste for inspeksjon, prisforhandling, dokumentasjon og vanlige feil å unngå.',
    keywords: ['kjøpe brukt gravemaskin', 'gravemaskin guide', 'brukt gravemaskin sjekkliste', 'gravemaskin inspeksjon', 'gravemaskin kjøp tips'],
    publishedAt: '2026-01-15',
    updatedAt: '2026-04-01',
    readingMinutes: 12,
    category: 'Kjøpsguider',
    content: [
      { type: 'p', text: 'En brukt gravemaskin kan være en av de beste investeringene en anleggsbedrift gjør — eller en kostbar feilkjøp som tapper kassen i måneder. Forskjellen ligger nesten alltid i forberedelsene. Markedet for brukte gravemaskiner i Norge er aktivt, med alt fra 1-tonns minigravere til 50-tonns bandgravemaskiner tilgjengelig fra verifiserte norske bedrifter. Denne guiden gir deg en komplett gjennomgang av alt du trenger å vite for å gjøre et trygt og lønnsomt kjøp.' },

      { type: 'h2', text: 'Velg riktig vektklasse for ditt bruksområde', id: 'vektklasse' },
      { type: 'p', text: 'Det første og viktigste spørsmålet er ikke merke eller pris — det er hvilken vektklasse du faktisk trenger. For liten maskin gir for lav produktivitet; for stor maskin gir unødvendige driftskostnader og logistikkutfordringer. Norske anleggsforhold varierer enormt, fra tette byområder til krevende fjell- og myrrbruk.' },
      { type: 'h3', text: 'Minigraver: 1–6 tonn' },
      { type: 'p', text: 'Minigravere er ideelle for VA-arbeid i trange bystrøk, hagearbeid, grøfting og innendørs arbeider. De er lett å transportere på henger og krever ikke tungtransporttillatelse. Pris for brukte minigravere starter fra rundt 150 000 kr, og de er svært ettertraktede i markedet. Merk at slitasjedeler som belte og bøttentenner er relativt rimelige, men hydraulikklekkasjer kan fort koste mye.' },
      { type: 'h3', text: 'Mellomklasse: 8–20 tonn' },
      { type: 'p', text: 'Dette er den mest allsidige klassen og den dominerende i norsk anleggsbransje. Maskiner på 12–18 tonn håndterer de fleste grøftearbeider, sprengsteinsgraving og masseflytting effektivt. De transporteres med semihenger. Et godt brukteksemplar fra Volvo, Komatsu eller Hitachi i denne klassen kan gi mange gode år med normalt vedlikehold.' },
      { type: 'h3', text: 'Stor bandgravemaskin: 20–50+ tonn' },
      { type: 'p', text: 'Store gravemaskiner brukes i veganlegg, tunnelarbeid og større masseflyttingsprosjekter. De krever spesielt utstyr for transport og høy driftsintensitet for å rettferdiggjøre investeringen. Kjøp i denne klassen bør alltid inkludere en fagkyndig inspeksjon fra en uavhengig mekaniker.' },

      { type: 'cta', text: 'Se aktuelle gravemaskiner til salgs fra verifiserte norske bedrifter', href: '/gravemaskiner', label: 'Se alle gravemaskiner' },

      { type: 'h2', text: 'Ny eller brukt gravemaskin — hva lønner seg?', id: 'ny-vs-brukt' },
      { type: 'p', text: 'En ny 14-tonns Volvo EC140E koster mellom 1,8 og 2,5 millioner kroner avhengig av utstyrsnivå. Et tilsvarende 2018-modell med 5 000 timer kan kjøpes for 700 000–1 100 000 kr. Den brukte maskinen har allerede tatt det meste av verdifallet — ny maskin mister typisk 25–35 % av verdien i løpet av de første to–tre årene. For de fleste norske anleggsbedrifter er brukt det klart mest lønnsomme valget, forutsatt at man gjør en grundig inspeksjon og kjøper fra en seriøs selger.' },
      { type: 'p', text: 'Unntaket er dersom du har svært spesifikke krav til garantidekning, behov for finansiering gjennom leverandør, eller arbeider i en bransje der maskinkontinuitet er kritisk og nedetid er svært kostbar. I disse tilfellene kan en ny maskin med full servicekontrakt være riktig valg.' },

      { type: 'h2', text: 'Slik inspiserer du en brukt gravemaskin', id: 'inspeksjon' },
      { type: 'p', text: 'En grundig inspeksjon er ikke en formalitet — det er den viktigste investeringen du gjør i kjøpsprosessen. Sett av minimum 2–3 timer, ta med en erfaren mekaniker om mulig, og ikke la deg presse av selger til å beslutte på stedet.' },
      { type: 'h3', text: 'Motor og drivverk' },
      { type: 'p', text: 'Start kaldmotoren og lytt etter uregelmessige lyder, røyk eller overdreven vibrasjon. Sjekk all olje — motorolje bør ikke lukte brent og ikke være blakket (tegn på vann i olje). Sjekk kjølevæskenivå og at termostaten fungerer. Kontroller alle beltedrev og at tomgangsdriften er stabil. Be om å se motortimetelleren — og kontroller at den stemmer med det selger oppgir.' },
      { type: 'h3', text: 'Hydraulikksystem' },
      { type: 'p', text: 'Hydraulikk er det dyreste å reparere. Kjør alle funksjoner gjennom full bevegelse — bom, stick, bøtte, sving og kjøring. Merk deg om bevegelsene er jevne eller rykkvise. Søk etter oljeflekker under maskinen, rundt sylindere og ved slanger. En slitt hydraulikkpumpe kan koste 40 000–120 000 kr å bytte, avhengig av maskintype.' },
      { type: 'h3', text: 'Understell og belte' },
      { type: 'p', text: 'Understell er gjerne det mest undervurderte slitasjeelementet. Sjekk beltenes tykkelse og slitasjegrad — er de under 50 % gjenstående levetid, bør dette prises inn. Kontroller belteskiver, ruller og frontskiver for slitasje og lekkasjer. Et komplett beltebytte på en 20-tonner kan koste 200 000–400 000 kr.' },
      { type: 'h3', text: 'Bom, stick og rotasjonslager' },
      { type: 'p', text: 'Kontroller alle leddpunkter for slark — bøtt-festet, pinnene på bom og stick. Slark her er normalt, men overdreven slark (mer enn 3–5 mm) indikerer at pinner og bussinger trenger utskifting. Sjekk at svingehuset roterer jevnt og uten rykk. Svingelager er dyrt å erstatte på store maskiner.' },
      { type: 'h3', text: 'Kabinen og elektronikk' },
      { type: 'p', text: 'En velstelt kabin er ofte et godt tegn på at maskinen generelt er tatt vare på. Kontroller at alle instrumenter fungerer, varme og ventilasjon, vindusvisker, ryggekamera om montert, og at alle sikringsskap er i orden. Sjekk at feilkodeloggen i maskinens datasystem er uten aktive feilkoder.' },

      { type: 'callout', text: 'Tips: Be alltid om en diagnostikkutskrift fra maskinens on-board computer. Moderne gravemaskiner logger feilkoder og timeverk som er vanskelige å manipulere. Dette gir deg verdifull informasjon om maskinens historikk.' },

      { type: 'h2', text: 'Dokumentasjon du bør kreve fra selger', id: 'dokumentasjon' },
      { type: 'p', text: 'Enhver seriøs selger av brukt anleggsutstyr bør kunne fremlegge relevant dokumentasjon. Mangel på dokumentasjon er aldri et godt tegn — det er enten et tegn på slurvete drift eller noe selger vil skjule.' },
      { type: 'ul', items: [
        'Komplett servicejournal med datoer, utøver og utførte arbeider',
        'Originalfaktura eller importdokumentasjon som bekrefter maskinens opprinnelse',
        'Eventuelle reparasjonsrapporter fra de siste 2–3 år',
        'Siste hydraulikkanalyse og motoroljeanalyse (noen selgere tilbyr dette)',
        'Dokumentasjon på belteutskifting, understellsrenovering eller andre større arbeider',
        'EU-godkjenningsdokumenter og CE-merking der relevant',
        'Kvittering for siste periodiske service',
      ] },

      { type: 'h2', text: 'Prisforhandling og kjøpsprosessen', id: 'prisforhandling' },
      { type: 'p', text: 'Når du har gjort inspeksjonen og vet hva maskinen faktisk holder, er det tid for å forhandle. Ikke vær redd for å bruke funnene fra inspeksjonen aktivt i forhandlingen. En slitt belterigg er ikke bare en teknisk observasjon — det er et prisargument verdt kanskje 100 000–200 000 kr.' },
      { type: 'p', text: 'Sjekk tilsvarende maskiner i markedet på Anleggstorget og andre norske markedsplasser. Pris varierer mye med timeverk, alder, merke og utstyrsnivå. En Volvo EC220D med 8 000 timer bør prises annerledes enn en tilsvarende med 4 000 timer i god stand. Som tommelfingerregel kan du forvente 5–15 % prisfleksibilitet på seriøse annonser — mer dersom du kan identifisere konkrete mangler.' },
      { type: 'p', text: 'Kjøpsavtalen bør inngås skriftlig og inkludere maskinnummer, timeteller, liste over inkludert tilbehør og eventuelle betingelser. For kjøp mellom norske bedrifter gjelder kjøpsloven, og selger har ansvar for skjulte mangler i fem år.' },

      { type: 'cta', text: 'Sammenlign priser på gravemaskiner fra norske bedrifter', href: '/sok?category=gravemaskin', label: 'Se prissammenligning' },

      { type: 'h2', text: 'Transport av gravemaskin', id: 'transport' },
      { type: 'p', text: 'Gravemaskiner over 6 tonn krever spesialtransport med semihenger og ofte følgebil. Dette er en kostnad kjøper normalt dekker, og bør regnes med i totalbudsjettet. Fra Sørlandet til Trondheim kan transport koste 15 000–30 000 kr avhengig av maskinens bredde og vekt. Sjekk med Statens vegvesen om det kreves dispensasjon for bredde eller totalvekt.' },

      { type: 'h2', text: 'Vanlige feil ved kjøp av brukt gravemaskin', id: 'vanlige-feil' },
      { type: 'p', text: 'Etter mange kjøp og salg av brukte anleggsmaskiner i det norske markedet er det noen gjengangere blant feilkjøpene. De fleste kan unngås med litt mer grundighet i prosessen.' },
      { type: 'ol', items: [
        'Kjøpe på bilder uten befaring — bilder kan skjule mye. Alltid inspiser fysisk.',
        'Ignorere understellets tilstand — belterigg er dyrt; sjekk det grundig.',
        'Ikke sjekke servicejournalen — drift uten service gir slitasje langt utover timetelleren.',
        'La seg haste til beslutning — seriøse selgere aksepterer at du tar deg tid.',
        'Glemme transportkostnad i budsjettet — kan utgjøre 10–20 % av maskinens pris.',
        'Kjøpe fra uverifiserte private — B2B-kjøp fra verifiserte bedrifter gir langt bedre rettigheter.',
        'Ikke kontrollere om maskinen har heftelse — sjekk i Løsøreregisteret.',
      ] },
    ],
    faq: [
      { q: 'Hva er normal timeverk for en brukt gravemaskin?', a: 'En gravemaskin på 8 timer per dag i 220 arbeidsdager per år akkumulerer omtrent 1 750 timer per år. Mellomklasse gravemaskiner (10–20 tonn) med 4 000–8 000 timer fra norsk bruk er vanlig i markedet. Over 12 000 timer bør prisreflektere behovet for forestående større service.' },
      { q: 'Hvilke merker er best for norske forhold?', a: 'Volvo, Komatsu og Hitachi dominerer det norske bruktmarkedet og har godt etablert servicenettverk. Volvo (laget i Eskilstuna, Sverige) er spesielt godt tilpasset skandinaviske forhold. Doosan og Hyundai er rimeligere i innkjøp men kan ha høyere driftskostnad på grunn av dyrere reservedeler.' },
      { q: 'Er det trygt å kjøpe fra Anleggstorget?', a: 'Alle selgere på Anleggstorget er verifisert mot Brønnøysundregisteret. Du handler alltid med aktive, norske aksjeselskaper — ikke private. Betaling og avtaler inngår du direkte med selger uten mellomledd.' },
      { q: 'Hva bør en full inspeksjon koste?', a: 'En uavhengig fagkyndig inspeksjon koster typisk 3 000–8 000 kr avhengig av maskinens størrelse og inspektørens reisevei. Det er penger svært godt brukt — en inspeksjon kan avdekke mangler som ville kostet ti ganger mer å reparere.' },
      { q: 'Kan jeg finansiere kjøp av brukt gravemaskin?', a: 'Ja. Mange banker og leasingselskaper tilbyr finansiering av brukt anleggsutstyr, typisk med 20–30 % egenkapital og 3–7 års nedbetalingstid. DNB, Nordea og spesialiserte aktører som Scania Finance og Caterpillar Financial tilbyr slike løsninger.' },
    ],
  },

  {
    slug: 'prisguide-brukte-anleggsmaskiner-2026',
    title: 'Prisguide for brukte anleggsmaskiner 2026 – Hva koster det?',
    shortTitle: 'Prisguide anleggsmaskiner 2026',
    description: 'Oppdaterte prisoversikter for brukte gravemaskiner, hjullastere, dumpere og traktorer i Norge 2026. Forstå hva som påvirker prisen og hva du bør betale.',
    keywords: ['pris brukt gravemaskin', 'prisguide anleggsmaskiner', 'hva koster gravemaskin', 'brukt hjullaster pris', 'anleggsutstyr priser 2026'],
    publishedAt: '2026-02-01',
    updatedAt: '2026-04-01',
    readingMinutes: 10,
    category: 'Prisoversikter',
    content: [
      { type: 'p', text: 'Bruktmarkedet for anleggsmaskiner i Norge er dynamisk, og prisene varierer betydelig ut fra maskintype, alder, timeverk, merke og stand. Denne guiden gir deg realistiske prisintervaller for de viktigste kategoriene per 2026, basert på annonserte priser i det norske markedet. Bruk tallene som veiledende — hva du faktisk bør betale avhenger av den konkrete maskinens tilstand.' },

      { type: 'h2', text: 'Hva påvirker prisen på brukte anleggsmaskiner?', id: 'prisfaktorer' },
      { type: 'p', text: 'Prisen på en brukt anleggsmaskin bestemmes av langt mer enn alder og timeverk. Det er viktig å forstå alle faktorene for å kunne vurdere om en annonsert pris er realistisk — eller om du betaler overpris.' },
      { type: 'ul', items: [
        'Timeverk: Nøkkelfaktoren. Under 3 000 timer regnes som lavt; over 10 000 timer som høyt for mellomklasse.',
        'Servicehistorikk: Dokumentert vedlikehold kan løfte prisen med 10–20 % sammenlignet med udokumentert maskin.',
        'Merke og modell: Volvo, Komatsu og Caterpillar holder bedre verdi enn mindre kjente merker.',
        'Norsk vs importert: Norske maskiner med kjent historikk prises gjerne 15–25 % høyere enn tilsvarende importert fra søre Europa.',
        'Tilbehør: Frontlaster, sorteringsgripper, hydraulisk rask-kobling og andre tillegg øker verdien direkte.',
        'Understell og beltestatus: Slitt belte er en direkte prisreduserende faktor — bytte koster 150 000–400 000 kr.',
        'Årstall og generasjon: Nyere Tier 4/Stage V-motorer er mer verdt enn eldre Tier 3 på grunn av strengere utslippskrav i EU/EØS.',
      ] },
      { type: 'p', text: 'En maskin med halvt slitt belte, udokumentert service og importert fra Italia bør ha betydelig lavere pris enn en tilsvarende maskin fra norsk bruk med komplett servicehistorikk. Begge kan fremstå like i en annonse — derav viktigheten av befaring.' },

      { type: 'h2', text: 'Prisguide: Gravemaskiner', id: 'pris-gravemaskiner' },
      { type: 'p', text: 'Gravemaskiner er den klart mest omsatte kategorien i det norske bruktmarkedet for anleggsutstyr. Her er realistiske prisintervaller per 2026, forutsatt at maskinen er i god stand med dokumentert service:' },
      { type: 'h3', text: 'Minigravere (1–6 tonn)' },
      { type: 'ul', items: [
        '1–2 tonn: 150 000–350 000 kr',
        '3–4 tonn: 250 000–550 000 kr',
        '5–6 tonn: 400 000–750 000 kr',
      ] },
      { type: 'h3', text: 'Mellomklasse bandgravemaskin (8–20 tonn)' },
      { type: 'ul', items: [
        '8–10 tonn (2015–2019, 4000–7000 t): 550 000–950 000 kr',
        '12–15 tonn (2016–2020, 3000–6000 t): 800 000–1 500 000 kr',
        '18–20 tonn (2017–2021, 3000–6000 t): 1 100 000–1 900 000 kr',
      ] },
      { type: 'h3', text: 'Stor bandgravemaskin (22–50 tonn)' },
      { type: 'ul', items: [
        '22–30 tonn (2015–2020, 4000–8000 t): 1 400 000–2 800 000 kr',
        '35–50 tonn (2015–2020, 4000–8000 t): 2 500 000–5 000 000 kr',
      ] },
      { type: 'h3', text: 'Hjulgravemaskiner' },
      { type: 'p', text: 'Hjulgravemaskiner selges typisk for 10–20 % lavere enn tilsvarende bandgravemaskin i samme klasse, men har fordel av å ikke slite belte og enklere transport.' },
      { type: 'cta', text: 'Se aktuelle priser på gravemaskiner til salgs i Norge', href: '/gravemaskiner', label: 'Se gravemaskiner' },

      { type: 'h2', text: 'Prisguide: Hjullastere', id: 'pris-hjullastere' },
      { type: 'p', text: 'Hjullastere brukes i alt fra massehåndtering og lossing til kommunalteknikk og industri. Prisene varierer mye etter størrelse og utstyrsnivå:' },
      { type: 'ul', items: [
        'Kompaktlaster (< 5 tonn, 2015–2020, god stand): 300 000–700 000 kr',
        'Mellomklasse hjullaster (6–12 tonn, 2015–2020, 4000–8000 t): 700 000–1 800 000 kr',
        'Stor hjullaster (15–25 tonn, 2014–2020, 5000–9000 t): 1 500 000–4 000 000 kr',
        'Teleskoplaster (Manitou/JCB/Merlo, 2016–2021): 400 000–1 200 000 kr avhengig av rekkevidde',
      ] },
      { type: 'p', text: 'Hjullastere med oppgradert gaffellager, snøblad eller spesialutstyr prises gjerne 100 000–300 000 kr høyere enn basemodellen. Dekkslitasje kan koste 80 000–200 000 kr å bytte og bør inkluderes i forhandlingen.' },
      { type: 'cta', text: 'Se hjullastere til salgs fra norske bedrifter', href: '/hjullastere', label: 'Se hjullastere' },

      { type: 'h2', text: 'Prisguide: Dumpere', id: 'pris-dumpere' },
      { type: 'p', text: 'Dumpere er spesialmaskineri for masseflytting og varierer enormt i størrelse og pris. I Norge er artikulerte dumpere mest vanlige på grunn av god manøvreringsevne i krevende terreng:' },
      { type: 'ul', items: [
        'Minidumper (1–3 tonn, roterende plattform): 80 000–250 000 kr',
        'Liten artikulert dumper (10–15 tonn, 2014–2019): 600 000–1 200 000 kr',
        'Mellomklasse artikulert dumper (25–35 tonn, Volvo A25/A30, Bell B25–B30, 2014–2019): 1 200 000–2 500 000 kr',
        'Stor artikulert dumper (35–40 tonn, Volvo A40, Bell B40, 2014–2019): 2 000 000–4 000 000 kr',
        'Rigid dumper for gruve/havn (40–90 tonn): 3 000 000–12 000 000 kr',
      ] },
      { type: 'cta', text: 'Se dumpere til salgs fra verifiserte norske bedrifter', href: '/dumpere', label: 'Se dumpere' },

      { type: 'h2', text: 'Prisguide: Traktorer', id: 'pris-traktorer' },
      { type: 'p', text: 'Traktorer brukes i et enormt spenn av applikasjoner — fra landbruk og skogsdrift til kommunalteknikk og industri. Prisene varierer tilsvarende:' },
      { type: 'ul', items: [
        'Kompakttraktor (< 50 hk, 2014–2020): 150 000–500 000 kr',
        'Mellomklasse landbrukstraktor (60–100 hk, 2015–2021, < 5000 t): 400 000–1 000 000 kr',
        'Stor landbrukstraktor (120–200 hk, 2016–2022, med frontlaster): 800 000–2 000 000 kr',
        'Spesialtraktor med redskaper og GPS-autostyring: 1 200 000–3 000 000 kr',
      ] },
      { type: 'cta', text: 'Se traktorer til salgs fra norske bedrifter', href: '/traktorer', label: 'Se traktorer' },

      { type: 'h2', text: 'Norske maskiner vs importerte', id: 'norske-vs-importerte' },
      { type: 'p', text: 'Et viktig prisaspekt som mange overser er maskinens opprinnelse. Maskiner som har arbeidet i Skandinavia eller Sentral-Europa under strengere regulatoriske krav (norske/svenske arbeidsmiljøkrav, Service-dokumentasjonskrav fra store entreprenørselskaper) er gjerne bedre vedlikeholdt enn maskiner importert fra Sør-Europa, Øst-Europa eller Midtøsten.' },
      { type: 'p', text: 'En maskin importert fra f.eks. Italia eller Hellas kan virke som et kupp på papiret — 30–40 % under norsk markedspris. Men kombinasjonen av dårligere servicehistorikk, mulig saltskade fra fuktig klima, høyere timeverk og mangel på norsk servicehistorikk gjør at det reelle prisforskjellen ofte fordunster etter de første reparasjonene.' },
      { type: 'callout', text: 'Råd: Be alltid om originalfaktura eller importdokumentasjon for maskinen. For maskiner med norsk opprinnelse bør du kunne spore servicejournalen til en norsk forhandler. Kjøp fra verifiserte norske bedrifter på Anleggstorget gir deg denne tryggheten.' },

      { type: 'h2', text: 'Slik vurderer du om prisen er riktig', id: 'vurdere-pris' },
      { type: 'p', text: 'Med prisguiden over har du et godt utgangspunkt, men husk at intervallene er brede fordi markedet er heterogent. Her er en praktisk fremgangsmåte for å vurdere en konkret annonse:' },
      { type: 'ol', items: [
        'Identifiser maskinens nøkkelfaktorer: alder, timeverk, maskintype, merke og opprinnelse.',
        'Finn tilsvarende annonser i markedet — minst 3–5 sammenlignbare maskiner.',
        'Juster for dokumentert servicehistorikk (+10–15 %), nylig belte-bygg (+8–12 %), slitt understell (-10–20 %).',
        'Regn med kostnad for opplagte mangler oppdaget under inspeksjon og trekk dette fra prisforslaget.',
        'Vurder selgerens troverdighet — er dette en verifisert norsk bedrift med kjent historikk?',
        'Husk å inkludere transportkostnad, eventuell service ved mottak og MVA/finansieringskostnad i totalbudsjettet.',
      ] },
    ],
    faq: [
      { q: 'Er prisene på Anleggstorget forhandlingsbare?', a: 'Ja, i de aller fleste tilfeller. Norske maskinpriser er annonsert som utgangspunkt for forhandling. Med befaring, konkrete observasjoner og kunnskap om markedspris er 5–15 % prisfleksibilitet vanlig.' },
      { q: 'Hvorfor varierer prisene på tilsynelatende like maskiner så mye?', a: 'Til tross for likt navn og timeverk kan servicehistorikk, opprinnelse, utstyrsnivå, understellets tilstand og selgerens hastegrad skape store prisforskjeller. En grundig inspeksjon avdekker hva du faktisk kjøper.' },
      { q: 'Er det billigere å kjøpe maskin på auksjon?', a: 'Auksjoner kan by på gode priser, men risikoen er høyere: Maskinen selges som den er, uten mulighet til grundig inspeksjon, og du konkurrerer mot budgivere med mer maskinkunnskap. For uerfarne kjøpere er B2B-markedsplasser som Anleggstorget tryggere.' },
      { q: 'Hva er minstepris for en brukbar brukt gravemaskin?', a: 'En 1–2 tonns minigraver i fungerende stand kan finnes for 80 000–150 000 kr. For mellomklasse bandgravemaskin (12–15 tonn) bør du forvente minst 600 000–700 000 kr for noe med fornuftig restlevetid.' },
      { q: 'Inkluderer prisene MVA?', a: 'Annonser mellom norske bedrifter angir ofte pris eksklusive MVA. Sjekk annonsebeskrivelsen. MVA er fradragsberettiget for norske bedrifter registrert i MVA-registeret.' },
    ],
  },

  {
    slug: 'vedlikehold-gravemaskiner-eksperttips',
    title: 'Vedlikehold av gravemaskiner – Komplett guide og serviceintervaller',
    shortTitle: 'Vedlikehold av gravemaskiner',
    description: 'Komplett vedlikeholdsguide for gravemaskiner med sjekklister for daglig, ukentlig og periodisk service. Eksperttips fra erfarne maskinoperatører og mekanikere.',
    keywords: ['vedlikehold gravemaskin', 'gravemaskin service', 'gravemaskin serviceintervall', 'gravemaskin sjekkliste', 'gravemaskin mekaniker'],
    publishedAt: '2026-03-01',
    updatedAt: '2026-04-01',
    readingMinutes: 11,
    category: 'Vedlikehold',
    content: [
      { type: 'p', text: 'Riktig vedlikehold er den enkeltfaktoren som har størst innvirkning på en gravemaskines levetid og annenhåndsverdi. En maskin med dokumentert servicehistorikk kan selges for 20–30 % mer enn en tilsvarende maskin uten papirer — og den holder seg produktiv langt lenger. Denne guiden gir deg en komplett oversikt over vedlikeholdsintervaller, sjekklister og eksperttips for å holde gravemaskinen i topp stand.' },
      { type: 'p', text: 'Veiledningen er primært basert på standard anbefalinger fra Volvo, Komatsu og Hitachi, som er de mest brukte merkene i Norge. Din maskins operatørmanual er alltid primærkilden — bruk denne guiden som supplement og huskeliste.' },

      { type: 'h2', text: 'Daglig sjekk og tilstandsvurdering', id: 'daglig-sjekk' },
      { type: 'p', text: 'Den daglige sjekken tar 10–15 minutter og er den viktigste rutinen for å unngå kostbare driftstopp. Den bør utføres av operatøren ved arbeidsstart, helst mens motoren er kald.' },
      { type: 'ul', items: [
        'Motorolje: Nivå skal være mellom min og maks på peilepinnen. Merk oljefargen — skal være amber, ikke svart eller blakket.',
        'Kjølevæske: Kontroller nivå i ekspansjonsbeholderen. Aldri åpne radiatoren på varm motor.',
        'Hydraulikkolje: Sjekk nivå i tanken. Se etter oljefilm under maskinen eller rundt sylindere.',
        'Drivstoff: Fyll alltid på slutten av dagen for å hindre kondensering i tanken.',
        'Luftfilterindikator: Rød indikator betyr filteret må renses eller byttes.',
        'Belte og understell: Gå rundt maskinen og sjekk synlig belitasje, løse belteskinner eller steininnklemming.',
        'Lekkasjer under maskinen: Olje, vann eller drivstoff på bakken er alltid et varselsignal.',
        'Belysning og alarmer: Test ryggealarm, arbeidslys og varsellys.',
      ] },
      { type: 'callout', text: 'Operatørtips: Før opp avvik i en enkel loggbok — dato, observasjon og tiltak. Dette tar 2 minutter og er uvurderlig dokumentasjon ved fremtidig salg eller garanti-diskusjon.' },

      { type: 'h2', text: 'Ukentlig vedlikehold', id: 'ukentlig' },
      { type: 'p', text: 'I tillegg til den daglige sjekken bør ukentlige punkter gjennomgås ved ukestart eller i løpet av en stille periode. Disse punktene krever litt mer tid — sett av 30–45 minutter.' },
      { type: 'ul', items: [
        'Smøring av alle leddpunkter: Bøtte-ledd, stick-ledd, bom-ledd og svinglageret. Bruk korrekt fett iht. maskinens spesifikasjoner — feil fetttype kan skade tettingene.',
        'Beltespenning: Mål slengen på beltet — skal være iht. fabrikantens spesifikasjoner (typisk 10–30 mm slenk for større maskiner). For stram belte sliter rask; for løs belte kan sporet av.',
        'Batteristatus: Kontroller batteriets plussmerking og minus for korrosjon. Spray med polspray.',
        'Kjølerribber: Spyl med lavtrykksvann om nødvendig. Tette kjølerribber gir overoppheting.',
        'Luftfilter (pre-cleaner): Rengjør støvkollektoren på pre-cleaneren om maskinen arbeider i støvete miljø.',
        'Svingehus-olje: Sjekk nivå — separat fra hydraulikkoljenivå.',
        'Kabinen: Rengjør fremre ruter innvendig for best sikt. Kontroller at nødutgangen fungerer.',
      ] },

      { type: 'h2', text: '250-timers service', id: '250-timer' },
      { type: 'p', text: 'Det første store serviceintervallet. For en maskin i full drift (8 timer/dag) inntreffer dette omtrent annenhver måned. Mange av disse punktene krever fagfolk — spesielt hydraulikkanalysen.' },
      { type: 'ul', items: [
        'Motoroljeskift: Alltid med nytt oljefilter. Bruk produsentspesifisert viskositet for norsk klima.',
        'Drivstofffilter: Primær- og sekundærfilter byttes. Viktig for å beskytte injektorer.',
        'Hydraulikkolje analyse (prøvetaking): Send inn en prøve til laboratorium. Analysen kan avdekke metallpartikler fra slitasje og kontaminering med vann.',
        'Understellssmøring: Grundigere smøring enn den ukentlige, inkludert sponskiver og fremre støtteruller.',
        'Svingelager-smøring: Følg produsentens anbefaling — typisk 4–8 smørepunkter.',
        'Kontroll av hydrauliske slanger: Se etter sprekker, blemmer eller mekanisk slitasje, særlig i svingeområdet.',
        'Rensing av kjølesystem: Sjekk termostatens funksjon og at kjølevifte roterer korrekt.',
      ] },
      { type: 'p', text: 'Kostnadsanslag for 250-timers service: 3 000–8 000 kr avhengig av maskinens størrelse og hvilke deler som byttes. Bruk alltid godkjente deler — billige kopideler kan ugyldiggjøre garantier og påvirke salgsverdi.' },

      { type: 'h2', text: '500-timers service', id: '500-timer' },
      { type: 'p', text: 'Den halve store servicen. Inkluderer alt fra 250-timers service, pluss:' },
      { type: 'ul', items: [
        'Hydraulikkfilter: Returfilter og høytrykkfilter byttes.',
        'Luftfilter: Primærelement byttes; sikkerhetselement inspiseres.',
        'Svingehus-olje: Byttes ved 500 timer første gang, deretter per 1 000 timer.',
        'Klimaanlegg: Sjekk kjølemiddeltrykk og kondenserens renslighet.',
        'Elektriske tilkoblinger: Kontroller alle kontakter i motorrommet for korrosjon og løse forbindelser.',
        'Bremser (om montert på hjulgravemaskin): Funksjonskontroll og slitasjesjekk.',
        'Motorfeste og vibrasjonsdempere: Kontroller for sprekker og slitasje.',
      ] },
      { type: 'p', text: 'Kostnadsanslag for 500-timers service: 8 000–20 000 kr. Dette er en naturlig stopp for mer grundig gjennomgang av maskinen, og mange velger å legge inn en full understellsgjennomgang her.' },

      { type: 'h2', text: '1 000-timers og større service', id: '1000-timer' },
      { type: 'p', text: 'Det store serviceintervallet som mange utsetter og dermed betaler dyrt for. 1 000-timers servicen bør ses på som en forebyggende investering — et tungt vedlikehold nå forhindrer et motorhavari om 2 000 timer.' },
      { type: 'ul', items: [
        'Kjølevæskeskift: Forfriskes typisk hvert 2. år eller per 2 000 timer.',
        'Hydraulikkolje total skift: Tappes og fylles med ny olje. Kjøles tanken og filterene.',
        'Endegir-olje (kjørehjul): Kontrolleres og byttes etter behov.',
        'Komplett smøreanalyse: Alle oljekvaliteter verifiseres.',
        'Motorventilklaring: Justeres etter produsentens spesifikasjoner — kritisk for motorlevetid.',
        'Injektortest: Spesielt viktig for maskiner over 8 000 timer totalt.',
      ] },

      { type: 'h2', text: 'Understell og belte — det dyreste slitasjeelementet', id: 'understell' },
      { type: 'p', text: 'Understellet representerer typisk 30–40 % av en bandgravemaskines restverdi, og slitasjen her er den største kostnadsdriveren i bruktmarkedet. Riktig vedlikehold kan forlenge levetiden med 30–50 %.' },
      { type: 'p', text: 'Beltespenning er det viktigste vedlikeholdspunktet. For løst belte sliter på sporskiver og ruller; for stram forårsaker unødig belastning på drivhjul og øker drivstofforbruket. Sjekk belitasje på belteskinners innside (der de møter rullen) jevnlig — er mer enn 50 % borte, er det tid for vurdering av bytte.' },
      { type: 'ul', items: [
        'Smør beltepinner der dette er mulig (eldre maskintyper med smørenippler)',
        'Kjør maskinen på tvers av stigningsretningen — ikke alltid langs skrå helninger, da dette forårsaker skjev beltebelastning',
        'Unngå kjøring i skarpe svinger på hard undergrunn over tid — dette sliter uforholdsmessig på understellet',
        'Rengjør understell etter arbeid i kalk, betong eller salt miljø',
        'Kontroller at alle ruller roterer fritt og ikke er frosne',
      ] },

      { type: 'h2', text: 'Hydraulikksystem — kritisk vedlikehold', id: 'hydraulikk' },
      { type: 'p', text: 'Hydraulikksystemet er hjertet i gravemaskinen og det dyreste systemet å reparere ved havari. En hydraulikkpumpe på en stor maskin koster 60 000–150 000 kr; en hovedstyreventil kan koste 100 000–250 000 kr. Forebygging er langt rimeligere.' },
      { type: 'p', text: 'Forurensning er fienden til hydraulikksystemet. Selv mikroskopiske partikler av metall, vann eller luft i systemet kan ødelegge presisjonskalibrerte ventiler og pumper. Alltid bruk rene beholdere ved påfylling, og pass på at lokk sitter tett på hydraulikktanken.' },
      { type: 'ul', items: [
        'Hydraulikkoljeanalyse per 250 timer avdekker tidlige tegn på pumpe- eller motorslitasje',
        'Bytt hydraulikkfilter iht. produsents anbefaling — ikke vente på varsellampe',
        'Kontroller sylindertettinger månedlig — tidlig lekkasje er lett å fikse, avansert lekkasje krever sylinderskift',
        'Hold hydraulikkoljetemperaturen under 85–90 °C — overoppheting nedbryter olje og tettinger raskt',
        'Bruk alltid produsentspesifisert hydraulikkolje — viskositetsklasse og tilsetningsstoff er kritisk',
      ] },

      { type: 'h2', text: 'Vinterdrift av gravemaskin i norsk klima', id: 'vinterdrift' },
      { type: 'p', text: 'Norske vintre stiller særskilte krav til gravemaskiner. Temperaturer under -20 °C er ikke uvanlig på indre Østlandet og i Nord-Norge, og feil forberedelse kan føre til kostbare motorstopp.' },
      { type: 'ul', items: [
        'Skift til vinterspesifisert motorolje (lavere viskositet, f.eks. 5W-40 i stedet for 15W-40)',
        'Kontroller kjølevæskens frostpunktstemperatur — skal tåle minst -35 °C i Norge',
        'Varm alltid opp motoren til driftstemperatur før full belastning — aldri gi full gass på kald motor',
        'Hydraulikkolje er treg i kulde — gi 5–10 minutter for systemet å varme opp',
        'Bruk eventuell motorvarmeplugg i frost for å gjøre oppstart enklere og redusere startslitasje',
        'Rengjør beltene grundig ved endt arbeidsdag — is og pakket snø i undestell kan deformere belte',
        'Kontroller batteri spesielt hyppig om vinteren — kuldereduserer batterikapasiteten markant',
      ] },

      { type: 'cta', text: 'Se brukte gravemaskiner med dokumentert servicehistorikk', href: '/gravemaskiner', label: 'Se gravemaskiner til salgs' },
    ],
    faq: [
      { q: 'Hva koster det å service en gravemaskin?', a: 'En 250-timers service koster typisk 3 000–8 000 kr; en 500-timers 8 000–20 000 kr. Et komplett 1 000-timers service med alle filterbytt og oljer kan koste 15 000–40 000 kr avhengig av maskinens størrelse og merke.' },
      { q: 'Kan jeg gjøre servicen selv?', a: 'Enkel service som oljebytt og filterbytt kan gjøres av maskinkyndig personell uten spesialverktøy. Hydraulikkarbeid, injektorkalibrering og elektronisk diagnostikk krever fagkompetanse og spesialverktøy. Udokumentert service svekker maskinens salgsverdi.' },
      { q: 'Hvor ofte bør jeg smøre leddpunktene?', a: 'For maskiner i full drift: bøtte og stick daglig; bom og svingelager ukentlig. I meget støvete miljøer, sand eller fjell anbefales daglig smøring av alle punkter. Bruk alltid korrekt fetttype fra produsentens spesifikasjon.' },
      { q: 'Hva er tegn på at hydraulikken trenger service?', a: 'Langsommere bevegelser enn normalt, rykkvis funksjon, overoppheting av olje over 90 °C, oljeflekker under maskinen og en merkbar økning i driftslyd er alle varseltegn. Hydraulikkolje som er mørkere enn brun eller lukter brent, bør alltid analyseres.' },
      { q: 'Hvorfor er servicehistorikk så viktig ved salg?', a: 'En verifisert servicehistorikk gir kjøper trygghet for at maskinen er tatt vare på etter produsentens anbefalinger. Dokumentert service kan øke salgsprisen med 10–20 % og forkorter salgstiden betraktelig i et konkurransepreget bruktmarked.' },
    ],
  },
]

export function getArticle(slug: string): GuideArticle | undefined {
  return articles.find(a => a.slug === slug)
}
