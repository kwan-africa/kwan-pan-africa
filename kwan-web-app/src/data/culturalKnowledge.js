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
