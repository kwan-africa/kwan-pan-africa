// ==============================================================================
// KWAN OFFLINE FALLBACK ENGINE
// Mirrors the Java backend's /api/classify, /api/hosts, and /api/itinerary
// endpoints using the local VERIFIED_HOSTS roster.
// Activated automatically when the backend is unreachable (demo / network issues).
// ==============================================================================

import { VERIFIED_HOSTS, THEMES, FX_USD_TO_GHS } from '../data/culturalKnowledge';

/**
 * Classifies the user's query into a theme and picks the best-matching guide
 * from the local VERIFIED_HOSTS roster.
 *
 * Returns a guide object in the same shape as the live backend response,
 * plus extra enrichment fields (bio, rating, languages, etc.).
 */
export function matchGuideOffline(query) {
  const q = query.toLowerCase();

  // ── Theme classification ────────────────────────────────────────────────────
  let theme = THEMES.find(t => t.id === 'heritage_spiritual'); // safe default

  if (
    q.includes('box') || q.includes('bukom') || q.includes('fight') ||
    q.includes('sport') || q.includes('fitness') || q.includes('adventur')
  ) {
    theme = THEMES.find(t => t.id === 'adventure');
  } else if (
    q.includes('food') || q.includes('waakye') || q.includes('kenkey') ||
    q.includes('cook') || q.includes('culinary') || q.includes('shito') || q.includes('chop')
  ) {
    theme = THEMES.find(t => t.id === 'food');
  } else if (
    q.includes('art') || q.includes('carv') || q.includes('drum') ||
    q.includes('adinkra') || q.includes('craft') || q.includes('bead')
  ) {
    theme = THEMES.find(t => t.id === 'art');
  }

  // Heritage / spiritual overrides other matches when explicit
  if (
    q.includes('spiritual') || q.includes('roots') || q.includes('ancest') ||
    q.includes('heritage') || q.includes('pilgrim') || q.includes('cape coast') ||
    q.includes('castle') || q.includes('door of no return')
  ) {
    theme = THEMES.find(t => t.id === 'heritage_spiritual');
  }

  // ── Host scoring ────────────────────────────────────────────────────────────
  const scored = VERIFIED_HOSTS.map(host => {
    let score = (host.rating || 4.9) * 2; // base from verified rating

    // Keyword-tag overlap
    host.tags.forEach(tag => { if (q.includes(tag)) score += 4; });

    // Role-specific boosts
    if ((q.includes('spiritual') || q.includes('roots') || q.includes('cape coast') || q.includes('ancest')) && host.id === 'host_07') score += 25;
    if (q.includes('boxing') && host.id === 'host_01') score += 15;
    if (q.includes('bead') && host.id === 'host_02') score += 15;
    if ((q.includes('nkrumah') || q.includes('independence') || q.includes('history')) && host.id === 'host_03') score += 15;
    if ((q.includes('art') || q.includes('carv') || q.includes('adinkra') || q.includes('drum')) && host.id === 'host_04') score += 15;
    if ((q.includes('plant') || q.includes('herbal') || q.includes('nature') || q.includes('aburi') || q.includes('botanical')) && host.id === 'host_05') score += 15;
    if ((q.includes('food') || q.includes('waakye') || q.includes('culinary')) && host.id === 'host_06') score += 15;

    // Theme-corridor alignment
    if (theme?.id === 'heritage_spiritual' && host.corridorId === 'cape_coast') score += 12;
    if (theme?.id === 'adventure'          && host.corridorId === 'ga_mashie')   score += 10;
    if (theme?.id === 'art'                && host.corridorId === 'high_street')  score += 10;
    if (theme?.id === 'food'               && host.corridorId === 'ga_mashie')    score += 8;

    return { host, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0].host;

  return {
    // Core fields — same shape as backend /api/hosts response
    id: best.id,
    name: best.name,
    role: best.role,
    area: best.corridorName,
    price: best.hourlyRateUsd,
    anchorSite: theme?.anchorSite || best.corridorName,
    theme: theme?.id || 'heritage_spiritual',
    initials: best.name.split(' ').map(n => n[0]).join('').slice(0, 2),
    color: 'ochre',
    image: best.image,
    // Enrichment fields (not available from backend without extra lookup)
    bio: best.bio,
    rating: best.rating,
    reviewsCount: best.reviewsCount,
    languages: best.languages,
    momoNetwork: best.momoNetwork,
    ghanaCard: best.ghanaCard,
    corridorId: best.corridorId,
  };
}

/**
 * Calculates itinerary pricing locally — mirrors /api/itinerary.
 */
export function getOfflinePricing(basePriceUsd, addonIncluded = false) {
  const total = Math.round((addonIncluded ? basePriceUsd + 15 : basePriceUsd) * 100) / 100;
  return {
    total_usd: total,
    total_ghs: Math.round(total * FX_USD_TO_GHS),
    platform_fee_usd: Math.round(total * 0.10 * 100) / 100,
    host_payout_usd:  Math.round(total * 0.90 * 100) / 100,
    tourism_levy_usd: Math.round(total * 0.01 * 100) / 100,
  };
}
