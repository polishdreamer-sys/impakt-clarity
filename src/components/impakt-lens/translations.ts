export type Lang = "en" | "pl";

export const t = {
  en: {
   brand: "Impakt Clarity",
    tagline: "ESG Jargon Buster & Regulatory Copilot",
    langLabel: "PL",
    tabAnalyze: "Text Analysis",
    tabSearch: "Term Search",
    industryLabel: "Industry Context",
    industries: {
      manufacturing: "Manufacturing",
      retail: "Retail",
      services: "Services",
      tech: "Tech / Digital",
    },
    inputTextTitle: "Paste regulatory text",
    inputTextHint: "Drop a paragraph from a directive, standard, or report. We'll decode it in plain language.",
    inputTextPlaceholder: "e.g. 'Undertakings shall report on Scope 3 emissions in line with ESRS E1, disclosing methodologies and assumptions used to calculate value chain impacts...'",
    inputTermTitle: "Look up an ESG term",
    inputTermHint: "Pick a framework, metric, or directive. Or type your own.",
    inputTermPlaceholder: "e.g. CSRD, Scope 3, ESRS E1, Omnibus Directive EU 2026/470",
    presets: ["CSRD", "Scope 3", "ESRS E1", "Omnibus Directive EU 2026/470", "Double Materiality", "EU Taxonomy"],
    analyze: "Analyze",
    explain: "Explain",
    loading: "Reading between the regulatory lines…",
    empty: {
      title: "Your plain-language briefing appears here",
      body: "Choose a mode, add context, and we'll translate ESG jargon into concrete actions for your business.",
    },
    sections: {
      definition: "Plain-English Definition",
      impact: "SME Business Impact & Materiality Risk",
      steps: "Actionable Next Steps",
    },
    ctaTitle: "Ready to automate your compliance?",
    ctaBody: "Generate a full, verified ESG report in 15 minutes with Impakt.ai.",
    ctaBtn: "Start with Impakt.ai",
    openSource: "Open source · Built for EU SMEs",
    footer: "Prototype for FutureAI Global Hackathon 2026",
    poweredBy: "AI response · illustrative preview",
    liveBadge: "Live AI analysis",
    demoBadge: "Demo preview",
    requiredInput: "Please enter some text first.",
    riskLabel: "Materiality risk",
    complexityLabel: "Complexity",
    riskLevels: { low: "Low", medium: "Medium", high: "High" },
    complexityLevels: { low: "Low", medium: "Medium", high: "High" },
    contextFor: "Context",
    suggested: "Suggested terms",
    downloadPdf: "Download PDF Briefing",
    builtBy: "Student project · Inspired by Impakt.ai",
    aiBriefing: "AI Briefing",
    section: "Section",
    sectorNoteTitle: "Sector focus",
    tldrLabel: "TL;DR · Executive Summary",
    tldrIndustrySentence: (industryLabel: string) =>
      `For an SME in ${industryLabel}, the practical stakes are commercial: banks, big clients and regulators are converging on the same disclosure bar, and being unprepared shows up first as a lost tender or a repriced loan.`,
    uploadTitle: "Upload PDF report or drop a screenshot of a regulatory table",
    uploadHint: "PDF, PNG or JPG · up to 20MB · analysed on-device for this demo",
    uploadOrDivider: "or paste text below",
    uploadReady: "Ready to analyse",
    uploadProcessing: "Reading PDF…",
    uploadRemove: "Remove",
    pdfPagesRead: (n: number, total: number) => `Extracted ${n} of ${total} pages`,
    pdfTruncated: "Long document — only the first portion was analyzed.",
    pdfScannedNoText:
      "This PDF appears to be a scanned image with no selectable text. Please paste the relevant paragraph manually below.",
    imageNoOcr:
      "Image analysis (OCR) isn't available in this preview — please paste the table content as text below.",
    fileTooLarge:
      "This file is larger than the 20 MB limit. Please upload a smaller PDF or paste the relevant section as text below.",
    unsupportedFile:
      "Unsupported file type. Please upload a PDF or PNG/JPG image, or paste the text below.",
    pdfExtractFailed:
      "We couldn't read this PDF — it may be corrupted or password-protected. Please try another file or paste the text below.",
    uploadedLabel: (name: string) => `Uploaded: ${name}`,
    progressLabel: "Compliance progress",
    completed: "completed",
    ctaHref: "https://impact-insight-poland.vercel.app/",
    mapLoading: (done: number, total: number) => `Analyzing document in sections… ${done}/${total}`,
    reduceLoading: "Synthesising final briefing…",
    partialNote: (used: number, total: number) =>
      `Analysis based on the first ${used} of ${total} sections due to document length.`,
    honestFail:
      "We couldn't complete a full analysis of this document. Try a shorter excerpt, or paste the most relevant paragraph directly.",
  },
  pl: {
    brand: "Impakt Clarity",
    tagline: "Tłumacz Żargonu ESG i Kopilot Regulacyjny",
    langLabel: "EN",
    tabAnalyze: "Analiza Tekstu",
    tabSearch: "Słownik Pojęć",
    industryLabel: "Kontekst Branżowy",
    industries: {
      manufacturing: "Produkcja",
      retail: "Handel",
      services: "Usługi",
      tech: "Tech / Digital",
    },
    inputTextTitle: "Wklej treść regulacyjną",
    inputTextHint: "Wklej fragment dyrektywy, standardu lub raportu. Przetłumaczymy go na prosty język.",
    inputTextPlaceholder: "np. 'Jednostki raportują emisje Zakresu 3 zgodnie z ESRS E1, ujawniając metodyki i założenia użyte do obliczenia wpływu łańcucha wartości...'",
    inputTermTitle: "Wyszukaj pojęcie ESG",
    inputTermHint: "Wybierz framework, wskaźnik lub dyrektywę. Lub wpisz własne.",
    inputTermPlaceholder: "np. CSRD, Zakres 3, ESRS E1, Dyrektywa Omnibus UE 2026/470",
    presets: ["CSRD", "Zakres 3", "ESRS E1", "Dyrektywa Omnibus UE 2026/470", "Podwójna Istotność", "Taksonomia UE"],
    analyze: "Analizuj",
    explain: "Wyjaśnij",
    loading: "Czytamy między wierszami regulacji…",
    empty: {
      title: "Twój przystępny briefing pojawi się tutaj",
      body: "Wybierz tryb, dodaj kontekst, a my przełożymy żargon ESG na konkretne działania dla Twojej firmy.",
    },
    sections: {
      definition: "Definicja po ludzku",
      impact: "Wpływ na MŚP i Ryzyko Istotności",
      steps: "Konkretne kroki do zgodności",
    },
    ctaTitle: "Gotowi zautomatyzować compliance?",
    ctaBody: "Wygeneruj pełny, zweryfikowany raport ESG w 15 minut z Impakt.ai.",
    ctaBtn: "Zacznij z Impakt.ai",
    openSource: "Open source · Stworzone dla MŚP w UE",
    footer: "Prototyp na FutureAI Global Hackathon 2026",
    poweredBy: "Odpowiedź AI · podgląd ilustracyjny",
    liveBadge: "Analiza AI na żywo",
    demoBadge: "Podgląd demo",
    requiredInput: "Najpierw wpisz treść.",
    riskLabel: "Ryzyko istotności",
    complexityLabel: "Złożoność",
    riskLevels: { low: "Niskie", medium: "Średnie", high: "Wysokie" },
    complexityLevels: { low: "Niska", medium: "Średnia", high: "Wysoka" },
    contextFor: "Kontekst",
    suggested: "Sugerowane pojęcia",
    downloadPdf: "Pobierz Briefing PDF",
    builtBy: "Projekt studencki · Inspirowany Impakt.ai",
    aiBriefing: "Briefing AI",
    section: "Sekcja",
    sectorNoteTitle: "Fokus branżowy",
    tldrLabel: "TL;DR · Streszczenie wykonawcze",
    tldrIndustrySentence: (industryLabel: string) =>
      `Dla MŚP w branży ${industryLabel} praktyczna stawka jest handlowa: banki, duzi klienci i regulator zbiegają się do tego samego poziomu ujawnień, a brak przygotowania pojawia się najpierw jako przegrany przetarg lub przewartościowany kredyt.`,
    uploadTitle: "Wrzuć raport PDF lub screenshot tabeli regulacyjnej",
    uploadHint: "PDF, PNG lub JPG · do 20 MB · analiza lokalna w tym demo",
    uploadOrDivider: "lub wklej tekst poniżej",
    uploadReady: "Gotowe do analizy",
    uploadProcessing: "Czytamy PDF…",
    uploadRemove: "Usuń",
    pdfPagesRead: (n: number, total: number) => `Wyodrębniono ${n} z ${total} stron`,
    pdfTruncated: "Długi dokument — przeanalizowano tylko pierwszą część.",
    pdfScannedNoText:
      "Ten PDF wygląda na zeskanowany obraz bez warstwy tekstowej. Wklej odpowiedni fragment ręcznie poniżej.",
    imageNoOcr:
      "Analiza obrazu (OCR) nie jest dostępna w tym podglądzie — wklej treść tabeli jako tekst poniżej.",
    uploadedLabel: (name: string) => `Wgrano: ${name}`,
    progressLabel: "Postęp zgodności",
    completed: "ukończone",
    ctaHref: "https://impact-insight-poland.vercel.app/",
    mapLoading: (done: number, total: number) => `Analiza dokumentu w sekcjach… ${done}/${total}`,
    reduceLoading: "Syntetyzujemy końcowy briefing…",
    partialNote: (used: number, total: number) =>
      `Analiza oparta na pierwszych ${used} z ${total} sekcji ze względu na długość dokumentu.`,
    honestFail:
      "Nie udało się wykonać pełnej analizy tego dokumentu. Spróbuj krótszego fragmentu lub wklej najistotniejszy akapit bezpośrednio.",
  },
} as const;

export type Industry = "manufacturing" | "retail" | "services" | "tech";
export type Level = "low" | "medium" | "high";

// Suggested chip list shown under the Term Search input.
export const SUGGESTED_CHIPS = {
  en: ["Scope 3", "CSRD", "VSME", "Double Materiality", "ESRS E1", "EU Taxonomy"] as const,
  pl: ["Zakres 3", "CSRD", "VSME", "Podwójna Istotność", "ESRS E1", "Taksonomia UE"] as const,
};

// Numeric complexity for the radial gauge (0-100).
export const COMPLEXITY_SCORE: Record<Level, number> = {
  low: 32,
  medium: 64,
  high: 88,
};

// Industry-specific "sector focus" note that gets appended to the impact section
// so the dropdown visibly changes the AI text.
export const INDUSTRY_NOTES: Record<
  Lang,
  Record<Industry, { title: string; body: string }>
> = {
  en: {
    manufacturing: {
      title: "Manufacturing",
      body: "Focus on **supply chain traceability** and **energy intensity per unit produced**. Scope 3 Category 1 (purchased goods) is usually the largest hotspot; expect audit-grade requests from OEM buyers on embedded carbon and conflict-mineral due diligence.",
    },
    retail: {
      title: "Retail",
      body: "Focus on **product-level footprint** and **supplier code of conduct**. Consumers and marketplaces increasingly demand digital product passports; private-label goods carry the highest greenwashing exposure.",
    },
    services: {
      title: "Services",
      body: "Focus on **workforce metrics** (turnover, gender pay gap, training hours) and **business travel**. Direct emissions are small, so materiality shifts to governance, data ethics, and human capital.",
    },
    tech: {
      title: "Tech / Digital",
      body: "Focus on **cloud & data-center energy**, **AI compute footprint**, and **hardware end-of-life**. Investor scrutiny concentrates on Scope 2 sourcing (renewable PPAs) and responsible-AI governance disclosures.",
    },
  },
  pl: {
    manufacturing: {
      title: "Produkcja",
      body: "Skup się na **śledzeniu łańcucha dostaw** i **intensywności energetycznej na jednostkę produkcji**. Zakres 3 Kat. 1 (zakupione towary) to zwykle największy hotspot; oczekuj audytowych zapytań od klientów OEM o ślad wbudowany i due diligence minerałów konfliktowych.",
    },
    retail: {
      title: "Handel",
      body: "Skup się na **śladzie na poziomie produktu** i **kodeksie postępowania dostawców**. Konsumenci i marketplace'y coraz częściej wymagają cyfrowego paszportu produktu; towary marek własnych mają najwyższą ekspozycję na greenwashing.",
    },
    services: {
      title: "Usługi",
      body: "Skup się na **wskaźnikach kadrowych** (rotacja, luka płacowa, godziny szkoleń) i **podróżach służbowych**. Emisje bezpośrednie są niskie, więc istotność przesuwa się na ład korporacyjny, etykę danych i kapitał ludzki.",
    },
    tech: {
      title: "Tech / Digital",
      body: "Skup się na **energii chmury i data center**, **śladzie obliczeń AI** i **końcu życia sprzętu**. Inwestorzy patrzą na źródła Zakresu 2 (PPA na OZE) i ujawnienia dot. odpowiedzialnej AI.",
    },
  },
};

export type MockResponse = {
  tldr: string;
  definition: string;
  impact: string;
  steps: string;
  risk: Level;
  complexity: Level;
  matchedTerm: string;
};

// Sector labels in-line for grammar (locative/adjectival forms in Polish).
const industryLabelEn: Record<Industry, string> = {
  manufacturing: "manufacturing",
  retail: "retail",
  services: "services",
  tech: "tech / digital",
};
const industryLabelPl: Record<Industry, string> = {
  manufacturing: "produkcyjnym",
  retail: "handlowym",
  services: "usługowym",
  tech: "tech / cyfrowym",
};

type TermBody = { tldr?: string } & Pick<MockResponse, "definition" | "impact" | "steps">;
type TermEntry = {
  aliases: RegExp;
  displayEn: string;
  displayPl: string;
  risk: Level;
  complexity: Level;
  en: (industry: Industry) => TermBody;
  pl: (industry: Industry) => TermBody;
};

const TERMS: TermEntry[] = [
  {
    aliases: /csrd|corporate sustainability reporting|dyrektyw[ay] o sprawozdawczo/i,
    displayEn: "CSRD (Corporate Sustainability Reporting Directive)",
    displayPl: "CSRD (Dyrektywa o Sprawozdawczości Zrównoważonego Rozwoju)",
    risk: "high",
    complexity: "high",
    en: (industry) => ({
      tldr:
        `CSRD turns sustainability reporting into audited, comparable disclosure alongside your financial statements. Even if you're not directly in scope, expect ${industryLabelEn[industry]} clients, banks and tenders to pass the requirements down to you within months.`,
      definition:
        `**CSRD** is the EU rulebook that forces companies to report sustainability data with the same rigor as financial data. Instead of a nice PDF full of pictures, you now publish audited numbers on climate, workforce, and governance inside your management report — following a common EU template called ESRS.`,
      impact:
        `For an SME in the **${industryLabelEn[industry]}** sector, direct scope only kicks in for larger companies, but the **trickle-down effect is immediate**:\n\n• **Client questionnaires** from CSRD-obliged buyers land in your inbox within months.\n• **Bank & insurance pricing** starts reflecting your ability to answer them.\n• **Tender exclusion risk** — public and corporate procurement now filters on ESG readiness.\n\nMost SMEs are exposed indirectly through the value chain rather than directly by law.`,
      steps:
        `1. **Confirm your status** — directly in scope, or value-chain exposed?\n2. **Adopt the VSME voluntary standard** as your baseline — it's the SME-sized version of ESRS.\n3. **Run a double materiality workshop** to identify which 6-10 topics you'll actually report.\n4. **Collect Scope 1 & 2 emissions** and basic social/governance data for the current fiscal year.\n5. **Automate reporting** with Impakt.ai so year two is a refresh, not a rebuild.`,
    }),
    pl: (industry) => ({
      tldr:
        `CSRD zamienia raportowanie ESG w audytowane, porównywalne ujawnienia obok sprawozdania finansowego. Nawet jeśli nie jesteś w zakresie bezpośrednim, klienci z sektora ${industryLabelPl[industry]}, banki i przetargi przełożą te wymogi na Ciebie w ciągu miesięcy.`,
      definition:
        `**CSRD** to unijna dyrektywa, która wymusza raportowanie danych zrównoważonego rozwoju z tą samą rygorystycznością co danych finansowych. Zamiast ładnego PDF-a ze zdjęciami, publikujesz zbadane liczby o klimacie, pracownikach i ładzie korporacyjnym w sprawozdaniu zarządu — według wspólnego unijnego szablonu o nazwie ESRS.`,
      impact:
        `Dla MŚP w sektorze **${industryLabelPl[industry]}** obowiązek bezpośredni dotyczy większych firm, ale **efekt kaskadowy jest natychmiastowy**:\n\n• **Ankiety od klientów** objętych CSRD trafią do Twojej skrzynki w ciągu miesięcy.\n• **Wycena banków i ubezpieczycieli** zaczyna zależeć od Twojej zdolności do odpowiedzi na te ankiety.\n• **Ryzyko wykluczenia w przetargach** — zamówienia publiczne i korporacyjne filtrują dostawców po gotowości ESG.\n\nWiększość MŚP jest narażona pośrednio przez łańcuch wartości, a nie bezpośrednio z mocy prawa.`,
      steps:
        `1. **Potwierdź swój status** — w zakresie bezpośrednim czy przez łańcuch wartości?\n2. **Przyjmij dobrowolny standard VSME** jako punkt wyjścia — to wersja ESRS skrojona dla MŚP.\n3. **Przeprowadź warsztat podwójnej istotności**, żeby wskazać 6-10 tematów, które faktycznie raportujesz.\n4. **Zbierz emisje Zakresu 1 i 2** oraz podstawowe dane społeczne i ładu za bieżący rok obrotowy.\n5. **Zautomatyzuj raportowanie** z Impakt.ai, żeby drugi rok był odświeżeniem, a nie budową od zera.`,
    }),

  },
  {
    aliases: /scope\s*3|zakres\s*3/i,
    displayEn: "Scope 3 emissions",
    displayPl: "Emisje Zakresu 3",
    risk: "high",
    complexity: "high",
    en: (industry) => ({
      definition:
        `**Scope 3** covers all the CO₂ your company causes but doesn't directly emit — everything from the trucks your supplier drives to how customers use and dispose of your product. It's usually **the biggest chunk of your carbon footprint** (60-90% for most SMEs) and by far the hardest to measure.`,
      impact:
        `In the **${industryLabelEn[industry]}** sector, Scope 3 hotspots are typically purchased goods & services and upstream transport. Practical consequences:\n\n• **Data requests from big clients** — they need your product-level footprint to close their own Scope 3.\n• **Green procurement premiums** — buyers increasingly reward lower embedded carbon.\n• **Estimation risk** — poor spend-based estimates can flip a supplier into an "avoid" list.`,
      steps:
        `1. **Screen your 15 Scope 3 categories** and identify the 2-3 material ones (usually Cat. 1 and Cat. 4).\n2. **Start spend-based**, then upgrade critical categories to activity-based data.\n3. **Ask your top 20 suppliers** for their emission factors — a one-page questionnaire is enough.\n4. **Publish assumptions** transparently to avoid greenwashing exposure.\n5. **Set a supplier engagement target** with a 3-year horizon.`,
    }),
    pl: (industry) => ({
      definition:
        `**Zakres 3** obejmuje całą emisję CO₂, którą Twoja firma powoduje, ale nie emituje bezpośrednio — od ciężarówek dostawców po sposób, w jaki klienci używają i utylizują Twój produkt. To zazwyczaj **największa część śladu węglowego** (60-90% dla większości MŚP) i zdecydowanie najtrudniejsza do zmierzenia.`,
      impact:
        `W sektorze **${industryLabelPl[industry]}** hotspoty Zakresu 3 to zwykle zakupione towary i usługi oraz transport nabywany. Praktyczne konsekwencje:\n\n• **Zapytania danych od dużych klientów** — potrzebują śladu produktowego, by zamknąć swój Zakres 3.\n• **Premia w zielonych zamówieniach** — nabywcy coraz częściej nagradzają niższy ślad wbudowany.\n• **Ryzyko szacunku** — słabe estymaty oparte na wydatkach mogą przenieść dostawcę na listę „unikać”.`,
      steps:
        `1. **Zrób screening 15 kategorii Zakresu 3** i wskaż 2-3 istotne (najczęściej Kat. 1 i Kat. 4).\n2. **Zacznij od danych wydatkowych**, potem podnieś kluczowe kategorie do metody działań.\n3. **Zapytaj 20 największych dostawców** o ich wskaźniki emisji — jednostronicowa ankieta wystarczy.\n4. **Publikuj założenia** transparentnie, by uniknąć ryzyka greenwashingu.\n5. **Ustal cel zaangażowania dostawców** w horyzoncie trzech lat.`,
    }),
  },
  {
    aliases: /omnibus/i,
    displayEn: "Omnibus Directive EU 2026/470",
    displayPl: "Dyrektywa Omnibus UE 2026/470",
    risk: "medium",
    complexity: "medium",
    en: (industry) => ({
      definition:
        `The **Omnibus Directive** bundles simplifications to CSRD, CSDDD, and the EU Taxonomy into a single reform. In plain English: Brussels heard that ESG reporting was crushing SMEs, so this package **narrows the direct scope, delays deadlines, and caps what large companies can ask smaller suppliers to disclose.**`,
      impact:
        `For an SME in the **${industryLabelEn[industry]}** sector, the direction is largely positive:\n\n• **Fewer direct filings** — many mid-caps drop out of the CSRD scope.\n• **A "value-chain cap"** limits data requests to the VSME baseline.\n• **But** — expectations from banks, insurers and top clients don't drop, they just move from "law" to "market practice".`,
      steps:
        `1. **Recheck your CSRD status** under the revised thresholds.\n2. **Use the VSME baseline** as your defensive shield against oversized questionnaires.\n3. **Track transposition** into Polish and other national law — timelines will diverge by member state.\n4. **Don't slow down** on Scope 1 & 2 data — that's still your commercial license to operate.`,
    }),
    pl: (industry) => ({
      definition:
        `**Dyrektywa Omnibus** łączy uproszczenia dla CSRD, CSDDD i Taksonomii UE w jedną reformę. Po ludzku: Bruksela usłyszała, że raportowanie ESG przygniata MŚP, więc ten pakiet **zawęża zakres bezpośredni, opóźnia terminy i ogranicza to, o co duże firmy mogą pytać mniejszych dostawców.**`,
      impact:
        `Dla MŚP w sektorze **${industryLabelPl[industry]}** kierunek jest w większości pozytywny:\n\n• **Mniej bezpośrednich obowiązków** — wiele średnich spółek wypada z zakresu CSRD.\n• **„Cap łańcucha wartości”** ogranicza żądania danych do poziomu VSME.\n• **Ale** — oczekiwania banków, ubezpieczycieli i kluczowych klientów nie spadają, tylko przesuwają się z „prawa” na „praktykę rynkową”.`,
      steps:
        `1. **Zweryfikuj ponownie swój status CSRD** według zmienionych progów.\n2. **Wykorzystaj baseline VSME** jako tarczę przed przerośniętymi ankietami.\n3. **Śledź transpozycję** do prawa polskiego i innych państw członkowskich — terminy będą się różnić.\n4. **Nie zwalniaj** z danymi Zakresu 1 i 2 — to nadal Twoja handlowa licencja na działanie.`,
    }),
  },
  {
    aliases: /esrs\s*e1|climate change/i,
    displayEn: "ESRS E1 — Climate Change",
    displayPl: "ESRS E1 — Zmiana klimatu",
    risk: "high",
    complexity: "medium",
    en: (industry) => ({
      definition:
        `**ESRS E1** is the climate chapter of the EU sustainability reporting standards. It asks companies to disclose emissions, a transition plan aligned with 1.5°C, physical and transition climate risks, and how climate feeds into strategy, capex and remuneration.`,
      impact:
        `In the **${industryLabelEn[industry]}** sector, E1 typically becomes the anchor topic in a double materiality assessment. It drives most of the reporting workload and it's the one investors read first.`,
      steps:
        `1. **Baseline Scope 1, 2 and material Scope 3** for the current year.\n2. **Draft a transition plan** with 2030 and 2050 milestones.\n3. **Run a climate risk screening** (physical + transition) at site level.\n4. **Connect the plan to capex** — auditors specifically check this.`,
    }),
    pl: (industry) => ({
      definition:
        `**ESRS E1** to klimatyczny rozdział unijnych standardów sprawozdawczości zrównoważonego rozwoju. Wymaga ujawnienia emisji, planu transformacji zgodnego z 1,5°C, ryzyk fizycznych i transformacyjnych oraz tego, jak klimat wpływa na strategię, capex i wynagrodzenia zarządu.`,
      impact:
        `W sektorze **${industryLabelPl[industry]}** E1 staje się zwykle tematem-kotwicą w ocenie podwójnej istotności. Generuje większość pracy raportowej i to jego jako pierwszego czytają inwestorzy.`,
      steps:
        `1. **Policz Zakres 1, 2 i istotny Zakres 3** za bieżący rok.\n2. **Opracuj plan transformacji** z kamieniami milowymi 2030 i 2050.\n3. **Przeprowadź screening ryzyk klimatycznych** (fizyczne + transformacyjne) na poziomie zakładów.\n4. **Powiąż plan z capex** — audytorzy sprawdzają to punktowo.`,
    }),
  },
  {
    aliases: /double materiality|podwójn[aą] istotno/i,
    displayEn: "Double Materiality",
    displayPl: "Podwójna Istotność",
    risk: "medium",
    complexity: "medium",
    en: () => ({
      definition:
        `**Double materiality** means you assess sustainability topics from two angles at once: how your business impacts the outside world (**impact materiality**) and how sustainability trends impact your business financially (**financial materiality**). A topic is reportable if either angle is material.`,
      impact:
        `Practically, this is the workshop that decides **what you'll actually report on** for the next 3 years. Getting it wrong means either over-reporting (expensive) or under-reporting (audit risk and greenwashing exposure).`,
      steps:
        `1. **List candidate topics** from ESRS + peer benchmarks.\n2. **Score impact** with internal stakeholders.\n3. **Score financial materiality** with finance & risk teams.\n4. **Set thresholds** and lock the material topic list with governance sign-off.`,
    }),
    pl: () => ({
      definition:
        `**Podwójna istotność** to spojrzenie na tematy zrównoważonego rozwoju z dwóch stron naraz: jak Twój biznes wpływa na otoczenie (**istotność wpływu**) i jak trendy zrównoważonego rozwoju wpływają finansowo na Twój biznes (**istotność finansowa**). Temat jest raportowalny, jeśli istotny jest choć jeden wymiar.`,
      impact:
        `W praktyce to warsztat, który decyduje, **o czym faktycznie będziesz raportować przez najbliższe 3 lata**. Błąd oznacza albo nadmiar raportowania (drogie), albo niedobór (ryzyko audytu i greenwashingu).`,
      steps:
        `1. **Zestaw listę tematów kandydujących** z ESRS i benchmarków branżowych.\n2. **Oceń wpływ** z interesariuszami wewnętrznymi.\n3. **Oceń istotność finansową** z zespołami finansów i ryzyka.\n4. **Ustal progi** i zatwierdź listę tematów istotnych na poziomie zarządu.`,
    }),
  },
  {
    aliases: /taxonomy|taksonomi/i,
    displayEn: "EU Taxonomy",
    displayPl: "Taksonomia UE",
    risk: "medium",
    complexity: "high",
    en: (industry) => ({
      definition:
        `The **EU Taxonomy** is a classification system that decides which economic activities count as "environmentally sustainable". If an activity is on the list and meets the technical criteria, revenue, capex and opex from it can be labeled Taxonomy-aligned — a magnet for green financing.`,
      impact:
        `For an SME in the **${industryLabelEn[industry]}** sector, direct alignment reporting is voluntary, but banks increasingly ask for **an alignment estimate** as part of loan pricing. Being able to point to one aligned activity often unlocks better rates.`,
      steps:
        `1. **Map your revenue** to Taxonomy activity codes.\n2. **Check technical screening criteria** for the top 2-3 activities.\n3. **Verify Do No Significant Harm & minimum safeguards.**\n4. **Publish a simple alignment table** in your management report or website.`,
    }),
    pl: (industry) => ({
      definition:
        `**Taksonomia UE** to system klasyfikacji rozstrzygający, które działania gospodarcze są „środowiskowo zrównoważone”. Jeżeli działanie jest na liście i spełnia kryteria techniczne, przychody, capex i opex z niego można oznaczyć jako zgodne z Taksonomią — magnes na zielone finansowanie.`,
      impact:
        `Dla MŚP w sektorze **${industryLabelPl[industry]}** raportowanie zgodności jest dobrowolne, ale banki coraz częściej proszą o **oszacowanie zgodności** w ramach wyceny kredytu. Pokazanie choć jednej zgodnej działalności często odblokowuje lepsze warunki.`,
      steps:
        `1. **Zmapuj przychody** do kodów działań Taksonomii.\n2. **Sprawdź techniczne kryteria kwalifikacji** dla 2-3 kluczowych działań.\n3. **Zweryfikuj zasadę „Nie czyń istotnej szkody” i minimalne gwarancje.**\n4. **Opublikuj prostą tabelę zgodności** w sprawozdaniu zarządu lub na stronie.`,
    }),
  },
];

function findTerm(input: string): TermEntry | null {
  for (const term of TERMS) {
    if (term.aliases.test(input)) return term;
  }
  return null;
}

/** True when the input clearly matches one of our known mock scenarios. */
export function hasKnownTerm(input: string): boolean {
  return findTerm(input) !== null;
}


// Mock AI response generator. Returns three sections of markdown-like content.
export function generateMockResponse(params: {
  lang: Lang;
  mode: "analyze" | "search";
  input: string;
  industry: Industry;
}): MockResponse {
  const { lang, mode, input, industry } = params;

  const note = INDUSTRY_NOTES[lang][industry];
  const sectorHeader = lang === "en" ? "Sector focus" : "Fokus branżowy";
  const sectorBlock = `\n\n**${sectorHeader} — ${note.title}:** ${note.body}`;

  // Fallback TL;DR builders — fully in-language, topic-aware via matched term
  // name or generic phrasing. Never concatenates raw input text (which can be
  // the raw first line of an uploaded PDF, possibly in a foreign language).
  const industryLabel =
    lang === "en" ? industryLabelEn[industry] : industryLabelPl[industry];

  const genericTldr = (topicName: string | null): string => {
    if (lang === "en") {
      const topic = topicName ?? "This ESG topic";
      return `${topic} is one of the disclosures large clients, banks and EU regulators are converging on — you'll be asked about it well before it becomes a direct legal duty. For an SME in ${industryLabel}, the practical stake is commercial: unpreparedness typically surfaces first as a lost tender, a repriced loan, or an unanswerable client questionnaire.`;
    }
    const topic = topicName ?? "Ten temat ESG";
    return `${topic} to jedno z ujawnień, wokół którego zbiegają się duzi klienci, banki i unijny regulator — zapytają Cię o to długo zanim stanie się to Twoim bezpośrednim obowiązkiem prawnym. Dla MŚP w branży ${industryLabel} praktyczna stawka jest handlowa: brak przygotowania pojawia się najpierw jako przegrany przetarg, przewartościowany kredyt lub ankieta klienta, na którą nie umiesz odpowiedzieć.`;
  };

  const attach = (
    body: TermBody,
    extras: Pick<MockResponse, "risk" | "complexity" | "matchedTerm">,
  ): MockResponse => ({
    ...body,
    tldr: body.tldr ?? genericTldr(extras.matchedTerm),
    ...extras,
  });

  const match = findTerm(input);
  if (match) {
    const body = lang === "en" ? match.en(industry) : match.pl(industry);
    return attach(
      { ...body, impact: body.impact + sectorBlock },
      {
        risk: match.risk,
        complexity: match.complexity,
        matchedTerm: lang === "en" ? match.displayEn : match.displayPl,
      },
    );
  }

  // Generic fallback (no term match). For Term Search we can safely echo the
  // (short) typed term. For Text Analysis / uploaded PDFs we deliberately do
  // NOT reference the raw input text.
  const trimmed = input.trim().slice(0, 80);
  const isSearch = mode === "search";
  const topicEn = isSearch && trimmed ? trimmed : "this ESG topic";
  const topicPl = isSearch && trimmed ? trimmed : "ten temat ESG";
  const matchedTerm = lang === "en" ? topicEn : topicPl;

  if (lang === "en") {
    return attach(
      {
        definition:
        `**${topicEn}** essentially asks companies to disclose how their operations affect people and the planet — and how sustainability issues affect the business back. In plain terms: you have to show your homework on climate, workers, and governance, using a common EU rulebook so that investors, banks and customers can compare you fairly with peers.`,
        impact:
        `For an SME in the **${industryLabelEn[industry]}** sector, the practical exposure is threefold:\n\n• **Value-chain pressure** — large clients under CSRD will cascade data requests down to you.\n• **Financing costs** — banks increasingly price ESG risk into loans and insurance.\n• **Reputational risk** — vague or missing disclosures can be flagged as greenwashing under the EU Green Claims regime.\n\nMateriality is likely **medium to high** unless your revenue mix is fully domestic and B2C.` +
        sectorBlock,
        steps:
        `1. **Map your material topics** using a lightweight double-materiality workshop (½ day is enough).\n2. **Collect baseline data** on Scope 1 & 2 emissions, energy, water, headcount by gender, and governance policies.\n3. **Adopt a reporting skeleton** aligned with the VSME voluntary standard — it's designed for SMEs and satisfies most bank / client questionnaires.\n4. **Automate the repeat work.** Use a tool like Impakt.ai so next year's report is a refresh, not a rewrite.`,
      },
      { risk: "medium", complexity: "medium", matchedTerm },
    );
  }

  return attach(
    {
      definition:
      `**${topicPl}** to w istocie obowiązek pokazania, jak Twoja firma wpływa na ludzi i planetę — oraz jak kwestie zrównoważonego rozwoju wpływają zwrotnie na biznes. Po ludzku: musisz odrobić pracę domową z klimatu, pracowników i ładu korporacyjnego, według wspólnych unijnych zasad, żeby inwestorzy, banki i klienci mogli Cię uczciwie porównać z konkurencją.`,
      impact:
      `Dla MŚP w sektorze **${industryLabelPl[industry]}** realna ekspozycja jest trojaka:\n\n• **Presja łańcucha wartości** — duzi klienci objęci CSRD zejdą z żądaniem danych w dół, do Ciebie.\n• **Koszt finansowania** — banki coraz częściej wyceniają ryzyko ESG w kredytach i ubezpieczeniach.\n• **Ryzyko reputacyjne** — mgliste lub brakujące ujawnienia mogą zostać uznane za greenwashing pod unijnym reżimem Green Claims.\n\nIstotność jest prawdopodobnie **średnia do wysokiej**, o ile Twój miks przychodów nie jest w 100% krajowy i B2C.` +
      sectorBlock,
      steps:
      `1. **Zmapuj tematy istotne** w krótkim warsztacie podwójnej istotności (wystarczy pół dnia).\n2. **Zbierz dane bazowe** o emisjach Zakresu 1 i 2, energii, wodzie, zatrudnieniu wg płci i politykach ładu.\n3. **Przyjmij szkielet raportu** zgodny ze standardem VSME — jest zaprojektowany dla MŚP i pokrywa większość ankiet bankowych i klienckich.\n4. **Zautomatyzuj powtarzalną robotę.** Użyj narzędzia takiego jak Impakt.ai, żeby raport za rok był odświeżeniem, a nie pisaniem od zera.`,
    },
    { risk: "medium", complexity: "medium", matchedTerm },
  );
}
