// ==============================================================================
// KWAN CULTURAL RAG & RETRIEVAL-AUGMENTED GENERATION ENGINE
// ==============================================================================

import { PILOT_CORRIDORS, VERIFIED_HOSTS, CULTURAL_LEXICON, THEMES } from '../data/culturalKnowledge';

/**
 * Analyzes query text and extracts semantic entities (corridors, interests, duration, and theme classification).
 */
export function analyzeQuery(query) {
  const q = query.toLowerCase();
  
  // Theme classification mapping
  let theme = THEMES[0]; // Default: heritage & spiritual
  if (q.includes("spiritual") || q.includes("roots") || q.includes("ancest") || q.includes("heritage") || q.includes("pilgrim") || q.includes("cape coast") || q.includes("castle") || q.includes("door of no return")) {
    theme = THEMES.find(t => t.id === "heritage_spiritual") || THEMES[0];
  } else if (q.includes("box") || q.includes("bukom") || q.includes("fight") || q.includes("adventur") || q.includes("sport") || q.includes("fitness")) {
    theme = THEMES.find(t => t.id === "adventure") || THEMES[1];
  } else if (q.includes("food") || q.includes("waakye") || q.includes("kenkey") || q.includes("cook") || q.includes("culinary") || q.includes("shito") || q.includes("chop")) {
    theme = THEMES.find(t => t.id === "food") || THEMES[2];
  } else if (q.includes("art") || q.includes("carv") || q.includes("drum") || q.includes("adinkra") || q.includes("craft") || q.includes("bead")) {
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
  const q = query.toLowerCase();

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
    if (q.includes("drum") || q.includes("carv") && host.id === "host_04") score += 15;
    if (q.includes("plant") || q.includes("herbal") || q.includes("nature") && host.id === "host_05") score += 15;
    if (q.includes("food") || q.includes("waakye") && host.id === "host_06") score += 15;

    return { host, score };
  });

  scoredHosts.sort((a, b) => b.score - a.score);
  const matchedHosts = scoredHosts.slice(0, Math.min(days * 2, 4)).map(item => item.host);

  // Retrieve Corridors & Etiquette
  const matchedCorridors = PILOT_CORRIDORS.filter(c => detectedCorridors.includes(c.id));
  const etiquetteTips = matchedCorridors.flatMap(c => c.etiquette);

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
      ghanaCard: host.ghanaCard,
      momoNetwork: host.momoNetwork,
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

I have matched you directly with verified masters: **${hostNames}**. Each host has undergone in-person Ghana Card biometric verification and is registered to receive their 90% booking payout instantly to their Mobile Money wallet upon completion.

### Why this corridor matters:
${ragContext.matchedCorridors.map(c => `• **${c.name}**: ${c.description}`).join("\n")}

### Key Cultural Protocols:
${ragContext.etiquetteTips.slice(0, 2).map(tip => `• ${tip}`).join("\n")}

Review your interactive itinerary breakdown below. You can customize or remove any stop to live-recalculate pricing, then click **Book with Escrow PIN** to lock funds in regulated escrow!
  `.trim();

  return {
    message: conversationalText,
    itinerary,
    retrievedDocs: {
      theme: ragContext.theme,
      anchorSite: ragContext.theme.anchorSite,
      hosts: ragContext.matchedHosts.map(h => ({ name: h.name, corridor: h.corridorName, card: h.ghanaCard })),
      corridors: ragContext.matchedCorridors.map(c => c.name),
      etiquetteCount: ragContext.etiquetteTips.length
    }
  };
}
