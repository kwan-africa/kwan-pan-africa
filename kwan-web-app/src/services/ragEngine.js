// ==============================================================================
// KWAN CULTURAL RAG & RETRIEVAL-AUGMENTED GENERATION ENGINE
// ==============================================================================

import { PILOT_CORRIDORS, VERIFIED_HOSTS, CULTURAL_LEXICON, THEMES } from '../data/culturalKnowledge';

const DEFAULT_THEME_ID = 'heritage_spiritual';
const MAX_HOSTS = 4;

function normalizeQuery(query) {
  if (typeof query !== 'string' || !query.trim()) {
    throw new Error('A non-empty travel request is required.');
  }
  return query.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ');
}

function containsAny(query, terms) {
  return terms.some((term) => query.includes(term));
}

/**
 * Analyzes query text and extracts semantic entities (corridors, interests, duration, and theme classification).
 */
export function analyzeQuery(query) {
  const q = normalizeQuery(query);
  
  // Theme classification mapping
  let theme = THEMES.find((item) => item.id === DEFAULT_THEME_ID) || THEMES[0];
  if (containsAny(q, ["spiritual", "roots", "ancest", "heritage", "pilgrim", "cape coast", "castle", "door of no return"])) {
    theme = THEMES.find(t => t.id === "heritage_spiritual") || THEMES[0];
  } else if (containsAny(q, ["box", "bukom", "fight", "adventur", "sport", "fitness"])) {
    theme = THEMES.find(t => t.id === "adventure") || THEMES[1];
  } else if (containsAny(q, ["food", "waakye", "kenkey", "cook", "culinary", "shito", "chop"])) {
    theme = THEMES.find(t => t.id === "food") || THEMES[2];
  } else if (containsAny(q, ["art", "carv", "drum", "adinkra", "craft", "bead"])) {
    theme = THEMES.find(t => t.id === "art") || THEMES[3];
  }

  // Detect Corridors
  const detectedCorridors = [];
  if (q.includes("spiritual") || q.includes("roots") || q.includes("ancest") || q.includes("cape coast") || q.includes("castle") || q.includes("pilgrim") || q.includes("door of no return")) {
    detectedCorridors.push("cape_coast");
  }
  if (q.includes("ga") || q.includes("jamestown") || q.includes("bukom") || q.includes("boxing") || q.includes("kenkey") || q.includes("bead") || q.includes("roots")) {
    if (!detectedCorridors.includes("ga_mashie")) detectedCorridors.push("ga_mashie");
  }
  if (q.includes("nkrumah") || q.includes("high street") || q.includes("independence") || q.includes("history") || q.includes("art centre") || q.includes("carv") || q.includes("drum")) {
    if (!detectedCorridors.includes("high_street")) detectedCorridors.push("high_street");
  }
  if (q.includes("aburi") || q.includes("botanical") || q.includes("mountain") || q.includes("ridge") || q.includes("nature") || q.includes("herbal") || q.includes("plant") || q.includes("cocoa")) {
    if (!detectedCorridors.includes("aburi_ridge")) detectedCorridors.push("aburi_ridge");
  }
  if (detectedCorridors.length === 0) {
    detectedCorridors.push("cape_coast", "ga_mashie");
  }

  // Detect Days / Duration
  let days = 1;
  if (q.includes("2 day") || q.includes("two day") || q.includes("weekend")) days = 2;
  else if (q.includes("3 day") || q.includes("three day")) days = 3;
  else if (q.includes("4 day") || q.includes("four day")) days = 4;

  return { detectedCorridors, days, theme };
}

/**
 * RAG Retriever: Fetches top matching hosts, corridor guidelines, and cultural etiquette.
 */
export function retrieveContext(query) {
  const { detectedCorridors, days, theme } = analyzeQuery(query);
  const q = normalizeQuery(query);

  // Score & Rank Hosts
  const scoredHosts = VERIFIED_HOSTS.map(host => {
    let score = 0;
    if (detectedCorridors.includes(host.corridorId)) score += 8;
    
    // Tag matching
    host.tags.forEach(tag => {
      if (q.includes(tag)) score += 4;
    });

    // Language / Role matching
    if ((q.includes("spiritual") || q.includes("roots") || q.includes("ancest") || q.includes("castle") || q.includes("cape coast") || q.includes("pilgrim")) && host.id === "host_07") score += 25;
    if (q.includes("boxing") && host.id === "host_01") score += 15;
    if (q.includes("bead") && host.id === "host_02") score += 15;
    if (q.includes("nkrumah") && host.id === "host_03") score += 15;
    if (containsAny(q, ["drum", "carv"]) && host.id === "host_04") score += 15;
    if (containsAny(q, ["plant", "herbal", "nature"]) && host.id === "host_05") score += 15;
    if (containsAny(q, ["food", "waakye"]) && host.id === "host_06") score += 15;

    return { host, score };
  });

  scoredHosts.sort((a, b) => b.score - a.score || a.host.id.localeCompare(b.host.id));
  const matchedHosts = scoredHosts
    .filter(({ score }) => score > 0)
    .slice(0, Math.min(days * 2, MAX_HOSTS))
    .map(item => item.host);
  if (matchedHosts.length === 0 && scoredHosts.length > 0) {
    matchedHosts.push(scoredHosts[0].host);
  }

  // Retrieve Corridors & Etiquette
  const matchedCorridors = PILOT_CORRIDORS.filter(c => detectedCorridors.includes(c.id));
  if (matchedCorridors.length === 0 && PILOT_CORRIDORS.length > 0) {
    matchedCorridors.push(PILOT_CORRIDORS[0]);
  }
  const etiquetteTips = [...new Set(matchedCorridors.flatMap(c => c.etiquette))];

  // Relevant phrases
  const phrases = CULTURAL_LEXICON.slice(0, 3);

  return {
    matchedHosts,
    matchedCorridors,
    etiquetteTips,
    phrases,
    days,
    theme
  };
}

/**
 * Synthesizes an interactive multi-vendor itinerary from retrieved RAG context.
 */
export function buildItineraryFromContext(query, ragContext) {
  const { matchedHosts, matchedCorridors, etiquetteTips, days } = ragContext;

  const totalCost = matchedHosts.reduce((sum, h) => sum + h.hourlyRateUsd, 0);
  const hostMoMoPayout = Math.round(totalCost * 0.90 * 100) / 100;
  const kwanPlatformFee = Math.round(totalCost * 0.10 * 100) / 100;
  const tourismLevy = Math.round(totalCost * 0.01 * 100) / 100;

  const stops = matchedHosts.map((host, idx) => {
    let timeSlot = idx % 2 === 0 ? "09:30 AM — 12:30 PM" : "02:00 PM — 05:00 PM";
    let dayNum = Math.floor(idx / 2) + 1;
    return {
      day: dayNum,
      time: timeSlot,
      title: `${host.name} · ${host.role}`,
      hostName: host.name,
      hostId: host.id,
      hostRole: host.role,
      hostImage: host.image,
      corridor: host.corridorName,
      cost: host.hourlyRateUsd,
      description: host.bio
    };
  });

  return {
    title: `${days}-Day Cultural Journey: ${matchedCorridors.map(c => c.name).join(" & ")}`,
    daysCount: days,
    theme: ragContext.theme,
    anchorSite: ragContext.theme.anchorSite,
    corridors: matchedCorridors.map(c => c.name),
    stops,
    hostsCount: matchedHosts.length,
    pricing: {
      totalUsd: totalCost,
      isEstimate: true,
      hostMoMoPayoutUsd: hostMoMoPayout,
      kwanPlatformFeeUsd: kwanPlatformFee,
      tourismLevyUsd: tourismLevy,
      payoutPercent: "90% Direct MoMo Payout"
    },
    etiquetteSummary: etiquetteTips.slice(0, 2)
  };
}

/**
 * Main RAG Execution: Coordinates retrieval, prompt assembly, and response generation.
 */
export async function executeRAGQuery(userPrompt) {
  normalizeQuery(userPrompt);
  const ragContext = retrieveContext(userPrompt);
  const itinerary = buildItineraryFromContext(userPrompt, ragContext);

  const greeting = ragContext.matchedCorridors.some(c => c.id === "cape_coast")
    ? "Akwaaba! Welcome to the sacred ancestral corridor!"
    : ragContext.matchedCorridors.some(c => c.id === "ga_mashie") 
      ? "Ojekoo! Akwaaba to Accra!" 
      : "Akwaaba! Welcome to Ghana!";

  const hostNames = ragContext.matchedHosts.map(h => h.name).join(" and ");

  const conversationalText = `
${greeting} I have classified your journey under **${ragContext.theme.label}** (\`${ragContext.theme.tag}\`) anchored by **${ragContext.theme.anchorSite}**.

I have matched you with verified cultural hosts: **${hostNames}**. Their profiles are reviewed before they appear here, and you can adjust the experience before confirming.

### Why this corridor matters:
${ragContext.matchedCorridors.map(c => `• **${c.name}**: ${c.description}`).join("\n")}

### Key Cultural Protocols:
${ragContext.etiquetteTips.slice(0, 2).map(tip => `• ${tip}`).join("\n")}

Review your interactive itinerary below. You can customize or remove any stop and request a live server-side price recalculation. The final amount is confirmed at checkout, while the connection stays protected until the experience is complete.
  `.trim();

  return {
    message: conversationalText,
    itinerary,
    retrievedDocs: {
      theme: ragContext.theme,
      anchorSite: ragContext.theme.anchorSite,
      hosts: ragContext.matchedHosts.map(h => ({ name: h.name, corridor: h.corridorName })),
      corridors: ragContext.matchedCorridors.map(c => c.name),
      etiquetteCount: ragContext.etiquetteTips.length
    }
  };
}
