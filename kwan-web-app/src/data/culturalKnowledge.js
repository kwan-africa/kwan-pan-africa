// ==============================================================================
// KWAN CULTURAL KNOWLEDGE BASE & VERIFIED HOST REGISTRY (RAG CORPUS)
// ==============================================================================

export const FX_USD_TO_GHS = 15.2;

/**
 * Formats a USD amount into either USD or GHS based on the active currency.
 */
export function formatPrice(usdAmount, currency = 'USD') {
  const num = Number(usdAmount) || 0;
  if (currency === 'GHS') {
    const ghs = Math.round(num * FX_USD_TO_GHS);
    return `GHS ${ghs.toLocaleString()}`;
  }
  return `$${num.toFixed(2)}`;
}

/**
 * Audio pronunciation coach using Web Speech API with synthetic speech.
 */
export function playPronunciation(phrase) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      utterance.lang = 'en-GH'; // Ghanaian English dialect if supported
      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio playback fallback
    }
  }
}

export const PILOT_CORRIDORS = [
  {
    id: "ga_mashie",
    name: "Ga-Mashie & Jamestown",
    subtitle: "Living Heritage, Boxing Guilds & Harbour Rhythms",
    description: "The historic cradle of Accra. Home to 150+ generational artisans, colonial forts, traditional Ga Kenkey houses, and the famed Bukom boxing academies.",
    badge: "Corridor 1 · Heritage Beachhead",
    color: "#F5A623",
    highlights: ["Bukom Boxing Academies", "Jamestown Lighthouse (1871)", "Canoe Fishermen's Landing", "Chale Wote Street Murals"],
    etiquette: [
      "Always greet with your right hand; the left hand is considered taboo in traditional settings.",
      "Say 'Ojekoo' (Good day) when approaching elders seated outside family compounds.",
      "Ask permission before photographing sacred shrines (Wulomei) or fishermen mending nets."
    ]
  },
  {
    id: "high_street",
    name: "Kwame Nkrumah Park & High Street",
    subtitle: "Pan-African Liberation & Crafts Guilds",
    description: "Ghana's premier tourism corridor drawing 1.38M annual visitors. Anchored by the Nkrumah Mausoleum, Independence Arch, and the Arts Centre artisans.",
    badge: "Corridor 2 · Pan-African Heart",
    color: "#38BDF8",
    highlights: ["Kwame Nkrumah Memorial Park", "Arts Centre Artisan Guilds", "Black Star Square", "Christianborg Crossroads"],
    etiquette: [
      "Respect sacred monument grounds; remove hats when entering memorial pavilions.",
      "Bargaining at the Arts Centre is a warm social exchange, not an adversarial argument. Smile and greet first.",
      "Shake hands firmly when entering a woodcarver's or drummer's workshop."
    ]
  },
  {
    id: "aburi_ridge",
    name: "Aburi Gardens & Akuapem Ridge",
    subtitle: "Botanical Medicine, Highlands & Cocoa Heritage",
    description: "Nestled in the cool hills 45 minutes above Accra. Renowned for 130-year-old healing trees, master woodcraft villages, and heritage cocoa groves.",
    badge: "Corridor 3 · Mountain Escarpment",
    color: "#10B981",
    highlights: ["Aburi Botanical Gardens (1890)", "Tetteh Quarshie Cocoa Farm", "Woodcarvers Village", "Akuapem Highlands Trek"],
    etiquette: [
      "In Akuapem culture, greetings are sacred. Say 'Akwaaba' (Welcome) or 'Medaase' (Thank you) warmly.",
      "Do not snap branches or pluck plants in sacred medicinal reserves without the elder's consent.",
      "Dress comfortably for walking and keep voices moderate in sacred garden groves."
    ]
  },
  {
    id: "cape_coast",
    name: "Cape Coast Castle & Ancestral Corridor",
    subtitle: "Sacred Pilgrimage, Door of No Return & Fante Heritage",
    description: "The spiritual gateway of the African diaspora. Anchored by the 17th-century oceanfront dungeons of Cape Coast Castle, ancestral remembrance shrines, and coastal artisan communities.",
    badge: "Corridor 4 · Ancestral Pilgrimage",
    color: "#E06D3B",
    highlights: ["Cape Coast Castle (Door of No Return)", "Ancestral Wall of Remembrance", "Palaver Hall Historic Chambers", "Oguaa Traditional Fishing Harbor"],
    etiquette: [
      "Cape Coast Castle is a sacred site of remembrance. Maintain reflective, respectful decorum inside the dungeons.",
      "Pouring libation or offering prayers at the Wall of Return is welcomed; consult the resident elder before proceeding.",
      "Greet Fante community elders with a respectful nod and 'Akwaaba'."
    ]
  }
];

export const THEMES = [
  { id: "heritage_spiritual", label: "Heritage & Spiritual Roots", anchorSite: "Cape Coast Castle (Door of No Return)", tag: "heritage/spiritual" },
  { id: "adventure", label: "Adventure & Boxing Guilds", anchorSite: "Bukom Boxing Academies", tag: "adventure" },
  { id: "food", label: "Culinary & Night Markets", anchorSite: "Traditional Ga Kenkey & Shito Trail", tag: "food" },
  { id: "art", label: "Master Crafts & Adinkra Carving", anchorSite: "Arts Centre Drumming & Woodcraft", tag: "art" }
];

export const VERIFIED_HOSTS = [
  {
    id: "host_01",
    name: "Coach Joshua 'Bukom Hammer' Clottey",
    role: "Master Boxing Trainer & Ga Community Elder",
    corridorId: "ga_mashie",
    corridorName: "Ga-Mashie / Jamestown",
    rating: 4.96,
    reviewsCount: 48,
    ghanaCard: "GHA-718293019-4",
    verified: true,
    momoNumber: "024 *** 8912",
    momoNetwork: "MTN Mobile Money",
    hourlyRateUsd: 45,
    languages: ["Ga", "English", "Twi"],
    image: "/ghana_guide_kwesi.jpg",
    bio: "Former national bantamweight champion now training the next generation of youth in Bukom. Leads unforgettable morning training sessions followed by stories of Azumah Nelson and Ga bravery.",
    tags: ["boxing", "fitness", "youth", "history", "ga-mashie", "bukom", "sports"]
  },
  {
    id: "host_02",
    name: "Naa Densua Addy",
    role: "Traditional Bead Master & Cultural Historian",
    corridorId: "ga_mashie",
    corridorName: "Ga-Mashie / Jamestown",
    rating: 4.98,
    reviewsCount: 62,
    ghanaCard: "GHA-829103948-2",
    verified: true,
    momoNumber: "020 *** 4410",
    momoNetwork: "Telecel Cash",
    hourlyRateUsd: 40,
    languages: ["Ga", "English"],
    image: "/kwan_logo_square_white_bg.png",
    bio: "Descendant of Ga royal regalia beadmakers. Teaches travelers the meaning behind waist beads, funeral ornaments, and hands-on glass bead crafting over freshly prepared local Kenkey.",
    tags: ["beads", "crafts", "kente", "fashion", "kenkey", "food", "women", "ga-mashie"]
  },
  {
    id: "host_03",
    name: "Kwesi Amponsah",
    role: "Pan-African Historian & Monument Guide",
    corridorId: "high_street",
    corridorName: "Kwame Nkrumah Park / High Street",
    rating: 4.99,
    reviewsCount: 114,
    ghanaCard: "GHA-910293847-1",
    verified: true,
    momoNumber: "054 *** 3321",
    momoNetwork: "MTN Mobile Money",
    hourlyRateUsd: 50,
    languages: ["English", "Twi", "Fante"],
    image: "/ghana_guide_kwesi.jpg",
    bio: "Accredited heritage researcher who has spent 12 years documenting the anti-colonial resistance of 1948 and Kwame Nkrumah's speeches. Brings the liberation struggle to life with unmatched eloquence.",
    tags: ["history", "nkrumah", "pan-african", "independence", "politics", "high-street"]
  },
  {
    id: "host_04",
    name: "Uncle Ebo Mensah",
    role: "Master Adinkra Carver & Drum Patriarch",
    corridorId: "high_street",
    corridorName: "Arts Centre / High Street",
    rating: 4.92,
    reviewsCount: 37,
    ghanaCard: "GHA-629102837-9",
    verified: true,
    momoNumber: "024 *** 7712",
    momoNetwork: "MTN Mobile Money",
    hourlyRateUsd: 35,
    languages: ["Twi", "Fante", "English"],
    image: "/kwan_logo_square_white_bg.png",
    bio: "Carving calabash stamps for 30 years at the Arts Centre. Travelers carve their personal Adinkra emblem (e.g. Gye Nyame, Sankofa) and learn the talking drum rhythm of their Akan day name.",
    tags: ["adinkra", "carving", "drums", "music", "crafts", "art", "high-street"]
  },
  {
    id: "host_05",
    name: "Papa Kofi Asare",
    role: "Indigenous Botanist & Herbal Medicine Elder",
    corridorId: "aburi_ridge",
    corridorName: "Aburi Botanical Ridge",
    rating: 4.97,
    reviewsCount: 53,
    ghanaCard: "GHA-519203847-3",
    verified: true,
    momoNumber: "055 *** 9980",
    momoNetwork: "MTN Mobile Money",
    hourlyRateUsd: 50,
    languages: ["Twi", "English"],
    image: "/ghana_guide_kwesi.jpg",
    bio: "Third-generation herbalist who guides walks under the 100-foot mahogany and ficus trees of Aburi. Explains natural bark remedies, forest ecology, and samples fresh cacao pods straight from the branch.",
    tags: ["nature", "herbs", "botanical", "plants", "aburi", "cocoa", "wellness"]
  },
  {
    id: "host_06",
    name: "Auntie Mary Ofei",
    role: "Culinary Matriarch & Night Market Specialist",
    corridorId: "ga_mashie",
    corridorName: "Osu & Ga-Mashie Corridors",
    rating: 4.95,
    reviewsCount: 89,
    ghanaCard: "GHA-419283746-8",
    verified: true,
    momoNumber: "024 *** 1198",
    momoNetwork: "MTN Mobile Money",
    hourlyRateUsd: 35,
    languages: ["Ga", "Twi", "English"],
    image: "/kwan_logo_square_white_bg.png",
    bio: "Beloved cook known across Accra for her 4-hour simmering black pepper shito and authentic Waakye. Takes small groups through night spice stalls with zero tourist markups.",
    tags: ["food", "culinary", "waakye", "shito", "chichinga", "chop-bar", "cooking"]
  },
  {
    id: "host_07",
    name: "Nana Kwesi Mensah",
    role: "Ancestral Roots Guide & Cape Coast Castle Historian",
    corridorId: "cape_coast",
    corridorName: "Cape Coast Castle & Ancestral Corridor",
    rating: 4.99,
    reviewsCount: 142,
    ghanaCard: "GHA-992817264-5",
    verified: true,
    momoNumber: "024 *** 6621",
    momoNetwork: "MTN Mobile Money",
    hourlyRateUsd: 50,
    languages: ["Fante", "English", "Twi"],
    image: "/ghana_guide_kwesi.jpg",
    bio: "Accredited ancestral remembrance guide who has led over 600 African-American and diaspora travelers through the Door of No Return at Cape Coast Castle. Conducts sacred libation ceremonies and Fante naming rituals.",
    tags: ["spiritual", "heritage", "roots", "ancestral", "cape-coast", "castle", "door of no return", "pilgrimage"]
  }
];

export const CULTURAL_LEXICON = [
  { term: "Akwaaba", language: "Twi / Fante", meaning: "Welcome", usage: "Warm greeting to any visitor entering a home or community." },
  { term: "Medaase", language: "Twi", meaning: "Thank you", usage: "Expressing genuine gratitude to hosts or elders." },
  { term: "Ojekoo", language: "Ga", meaning: "Good morning / day", usage: "Standard daylight greeting in Jamestown and Bukom." },
  { term: "Baashi", language: "Ga", meaning: "Safe journey / Goodbye", usage: "Blessing spoken when parting ways with your host." },
  { term: "Chale", language: "Ghanaian Slang", meaning: "Friend / Mate", usage: "Affectionate informal term used among peers." },
  { term: "Sankofa", language: "Akan / Adinkra", meaning: "Go back and fetch it", usage: "Reclaiming ancestral heritage to move forward." }
];

export const UNIT_ECONOMICS = {
  averageBookingUsd: 50.00,
  hostMoMoPayoutUsd: 45.00, // 90%
  kwanGrossFeeUsd: 5.00,    // 10%
  paystackGatewayFeeUsd: 1.75, // 3.5%
  tourismLevyAct817Usd: 0.50, // 1%
  kwanNetMarginUsd: 2.75,   // 55% net contribution margin
  settlementCurrency: "GHS / USD",
  escrowMechanism: "4-Digit Private Traveler Release PIN"
};

// ==============================================================================
// LIVING CORRIDOR — Cultural facts for rotating ticker, guide cards & pre-briefs
// Each fact has: text, site (anchor site key), category, source label
// ==============================================================================
export const LIVING_CORRIDOR_FACTS = [
  // ── Cape Coast / Ancestral ──────────────────────────────────────────────────
  {
    text: "Cape Coast Castle's dungeons once held up to 1,500 enslaved people at a time. Many were named after the day of the week they were born — Kofi (Friday boy), Ama (Saturday girl), Kweku (Wednesday boy).",
    site: "cape_coast",
    category: "history",
    source: "UNESCO / GMMB"
  },
  {
    text: "The Castle was first built by Swedish traders in 1653. It changed hands between the Dutch, British, and local Fante people before the British used it as their largest slave-holding fort in West Africa.",
    site: "cape_coast",
    category: "history",
    source: "Ghana Museums & Monuments Board"
  },
  {
    text: "In 2009, Barack Obama stood inside the Cape Coast Castle dungeons and said: \"It reminds us of the capacity of human beings to commit great evil.\" Michelle Obama wept at the Door of No Return.",
    site: "cape_coast",
    category: "legacy",
    source: "White House State Visit Records"
  },
  {
    text: "The Fante people developed a secret musical code — war songs encoding resistance messages — during colonial rule. The tradition survives today in contemporary highlife and gospel.",
    site: "cape_coast",
    category: "culture",
    source: "University of Cape Coast Oral Archives"
  },
  {
    text: "The Wall of Remembrance at Cape Coast Castle lists the names of over 12,000 enslaved individuals who passed through its gates — cross-referenced from plantation records across 14 countries.",
    site: "cape_coast",
    category: "remembrance",
    source: "African Diaspora Heritage Trail"
  },
  {
    text: "Cape Coast was called 'Oguaa' by the Fante people — meaning 'the market place' — long before European contact. It was a thriving trade hub for gold, kola, and cloth.",
    site: "cape_coast",
    category: "etymology",
    source: "Fante Oral Tradition / UCC History Dept"
  },

  // ── Ga-Mashie / Jamestown ───────────────────────────────────────────────────
  {
    text: "Jamestown's Bukom neighbourhood has produced more world boxing champions per square mile than anywhere on earth. Azumah Nelson, Ike Quartey, and Joshua Clottey all trained on the same cracked concrete ring.",
    site: "ga_mashie",
    category: "sport",
    source: "Ghana Boxing Authority"
  },
  {
    text: "The Jamestown Lighthouse was built by the British in 1871. On a clear day you can see Labadi Beach 8 km east — and on historic days, the lighthouse keeper could signal incoming slave ships.",
    site: "ga_mashie",
    category: "history",
    source: "Ghana Ports & Harbours Authority"
  },
  {
    text: "Ga people celebrate Homowo ('hooting at hunger') each August — a harvest festival where families cook palm nut soup and kpokpoi together and pour libations for their ancestors.",
    site: "ga_mashie",
    category: "culture",
    source: "Ga Traditional Council"
  },
  {
    text: "The Chale Wote Street Art Festival in Jamestown has grown from a small community gathering in 2011 into one of Africa's largest contemporary art events, drawing 50,000+ visitors annually.",
    site: "ga_mashie",
    category: "arts",
    source: "Alliance Française Accra"
  },
  {
    text: "Ga waist beads are not decoration — each colour carries a specific cultural meaning. Red = danger/power; blue = peace; gold = royalty; white = purity and spiritual protection.",
    site: "ga_mashie",
    category: "culture",
    source: "Naa Densua Addy, Bead Master (Kwan Pilot Host)"
  },
  {
    text: "The canoe-fishing tradition in Jamestown dates back over 500 years. Ga fishing clans still launch wooden canoes before sunrise, guided by constellations their great-grandparents mapped.",
    site: "ga_mashie",
    category: "tradition",
    source: "Ga-Mashie Fishermen's Cooperative"
  },

  // ── High Street / Nkrumah ───────────────────────────────────────────────────
  {
    text: "Kwame Nkrumah declared Ghana's independence on 6 March 1957, making it the first sub-Saharan African country to gain independence from colonial rule. He stood at Black Star Square and said: 'Ghana, your beloved country is free forever.'",
    site: "high_street",
    category: "history",
    source: "Ghana Public Records Archive"
  },
  {
    text: "The Black Star in Ghana's flag was adapted from Marcus Garvey's Black Star Line — a shipping company designed to repatriate African diaspora to Africa. Nkrumah was deeply influenced by Garvey.",
    site: "high_street",
    category: "symbolism",
    source: "Kwame Nkrumah Memorial Park Educational Display"
  },
  {
    text: "Adinkra symbols were originally printed by the Bono people of Ashanti in the 1800s using carved calabash stamps. Each symbol is a complete philosophical statement — 'Gye Nyame' means 'except for God, I fear none.'",
    site: "high_street",
    category: "art",
    source: "Uncle Ebo Mensah, Adinkra Carver (Kwan Pilot Host)"
  },
  {
    text: "Ghana's Arts Centre on High Street was established in 1951 and houses over 600 artisan stalls. It is the largest marketplace for traditional Ghanaian crafts in West Africa.",
    site: "high_street",
    category: "economy",
    source: "Ghana Tourism Authority"
  },
  {
    text: "The talking drum (fontomfrom) can replicate the tonal patterns of Akan speech — effectively transmitting full sentences across several kilometres. Akan royals historically communicated across distances this way.",
    site: "high_street",
    category: "culture",
    source: "National Museum of Ghana"
  },
  {
    text: "Ghana's 1948 Crossroads Uprising — sparked by the shooting of ex-servicemen marching for their war pensions — is considered the decisive catalyst that forced Britain to accelerate independence negotiations.",
    site: "high_street",
    category: "history",
    source: "Kwesi Amponsah, Historian (Kwan Pilot Host)"
  },

  // ── Aburi Ridge ─────────────────────────────────────────────────────────────
  {
    text: "Aburi Botanical Gardens was established in 1890 by the British as an experimental agricultural station. Today it houses over 800 species of tropical plants, including a 130-year-old mahogany tree that is a local elder in its own right.",
    site: "aburi_ridge",
    category: "nature",
    source: "Forestry Commission of Ghana"
  },
  {
    text: "The cocoa that built modern Ghana was first cultivated by Tetteh Quarshie, who smuggled cocoa pods from Equatorial Guinea in 1876 hidden in his clothing. His farm in Mampong is still active today.",
    site: "aburi_ridge",
    category: "history",
    source: "COCOBOD Ghana"
  },
  {
    text: "Traditional Akuapem herbalists on the ridge use over 200 plant species for healing. Many compounds in modern anti-malaria treatments were first identified by communities on the Akuapem Hills.",
    site: "aburi_ridge",
    category: "medicine",
    source: "CSIR Plant Genetic Resources Research Institute"
  },
  {
    text: "Aburi is home to some of the finest woodcarvers in West Africa. The Akuapem ridge villages produce stools that carry political authority — a chief's stool is considered his soul and is never allowed to touch the bare ground.",
    site: "aburi_ridge",
    category: "culture",
    source: "Aburi Woodcarvers Guild"
  },

  // ── Pan-Ghana / General ─────────────────────────────────────────────────────
  {
    text: "Ghana is the world's second-largest cocoa producer, responsible for approximately 20% of global supply. A single cocoa pod contains 20–50 beans — it takes roughly 400 beans to make one pound of chocolate.",
    site: "general",
    category: "economy",
    source: "ICCO / COCOBOD"
  },
  {
    text: "The kente cloth worn at major events across the African diaspora was originally reserved for Ashanti royalty. The first kente was reportedly woven after two young men observed a spider spinning its web.",
    site: "general",
    category: "culture",
    source: "Bonwire Kente Weavers Council"
  },
  {
    text: "Ghana's 'Year of Return' in 2019 drew over 200,000 diaspora visitors — the largest organised ancestral homecoming in modern African history. It generated over $1.9 billion in tourism revenue.",
    site: "general",
    category: "diaspora",
    source: "Ghana Tourism Authority / GIS"
  },
  {
    text: "Highlife music — Ghana's first globally exported sound — was born in Accra's beachfront bars in the 1920s by mixing Ga rhythms with colonial brass-band instruments. It directly influenced Afrobeats.",
    site: "general",
    category: "music",
    source: "Institute of African Studies, University of Ghana"
  },
  {
    text: "'Akwaaba' — the Twi word for welcome — appears on road signs at every major entry point to Ghana. It is the unofficial national greeting of a country internationally known for its hospitality.",
    site: "general",
    category: "language",
    source: "Ghana Tourism Authority"
  },
  {
    text: "Every person in Akan culture is given a day name — Kojo (Monday boy), Ama (Saturday girl), Kofi (Friday boy). These soul names carry spiritual significance and connect you to your ancestors.",
    site: "general",
    category: "spirituality",
    source: "Akan Naming Traditions / Manhyia Palace"
  },
];

// ==============================================================================
// SANKOFA PLAN — Pre-built week templates for the week planner
// ==============================================================================
export const SANKOFA_WEEK_TEMPLATES = [
  {
    id: "roots_week",
    name: "Roots & Remembrance",
    description: "A diaspora heritage itinerary — from the dungeons of Cape Coast to the liberation murals of Jamestown.",
    days: [
      { dayIndex: 0, label: "Mon", theme: "heritage_spiritual", hostId: "host_07", notes: "Cape Coast Castle — Door of No Return" },
      { dayIndex: 1, label: "Tue", theme: null, hostId: null, notes: "Rest / travel back to Accra" },
      { dayIndex: 2, label: "Wed", theme: "art", hostId: "host_04", notes: "Adinkra carving & talking drum" },
      { dayIndex: 3, label: "Thu", theme: "adventure", hostId: "host_01", notes: "Morning boxing session in Bukom" },
      { dayIndex: 4, label: "Fri", theme: "food", hostId: "host_06", notes: "Night market & shito trail" },
    ],
  },
  {
    id: "creative_week",
    name: "Maker's Circuit",
    description: "For the creative traveller — bead craft, Adinkra carving, woodwork, and street art in 5 days.",
    days: [
      { dayIndex: 0, label: "Mon", theme: "art", hostId: "host_02", notes: "Bead making in Jamestown" },
      { dayIndex: 1, label: "Tue", theme: "art", hostId: "host_04", notes: "Adinkra stamps & drums, Arts Centre" },
      { dayIndex: 2, label: "Wed", theme: null, hostId: null, notes: "Free day — Chale Wote murals self-guided" },
      { dayIndex: 3, label: "Thu", theme: "heritage_spiritual", hostId: "host_03", notes: "Nkrumah Mausoleum & liberation history" },
      { dayIndex: 4, label: "Fri", theme: "adventure", hostId: "host_01", notes: "Bukom boxing send-off session" },
    ],
  },
  {
    id: "nature_week",
    name: "Green Ridge to Coastline",
    description: "From botanical healing walks in Aburi to ancestral remembrance on the Atlantic coast.",
    days: [
      { dayIndex: 0, label: "Mon", theme: "art", hostId: "host_05", notes: "Aburi Botanical Gardens & herbal walk" },
      { dayIndex: 1, label: "Tue", theme: null, hostId: null, notes: "Cocoa grove visit — Tetteh Quarshie farm" },
      { dayIndex: 2, label: "Wed", theme: "food", hostId: "host_06", notes: "Culinary tour — Waakye & night spice market" },
      { dayIndex: 3, label: "Thu", theme: "heritage_spiritual", hostId: "host_07", notes: "Cape Coast Castle — ancestral pilgrimage" },
      { dayIndex: 4, label: "Fri", theme: null, hostId: null, notes: "Oguaa fishing harbour at sunrise" },
    ],
  },
];
