import NodeCache from "node-cache";

/**
 * Multi-Layer Cache System
 *
 * L1: Map Meta (30 day TTL) — static game knowledge
 * L2: Player Stats (1 hour TTL) — Henrik API responses
 * L3: AI Responses (24 hour TTL) — full analysis results
 *
 * For MVP, all layers use in-memory node-cache.
 * To scale: replace with Upstash Redis by swapping this module.
 */

// L1: Map Meta — rarely changes (only on Valorant patches)
const mapMetaCache = new NodeCache({ stdTTL: 60 * 60 * 24 * 30 }); // 30 days

// L2: Player Stats — fresh enough for a gaming session
const playerStatsCache = new NodeCache({ stdTTL: 60 * 60 }); // 1 hour

// L3: AI Responses — keyed by hash of (riotId + map + date)
const aiResponseCache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // 24 hours

type CacheLayer = "mapMeta" | "playerStats" | "aiResponse";

function getStore(layer: CacheLayer): NodeCache {
  switch (layer) {
    case "mapMeta":
      return mapMetaCache;
    case "playerStats":
      return playerStatsCache;
    case "aiResponse":
      return aiResponseCache;
  }
}

export function getCached<T>(layer: CacheLayer, key: string): T | undefined {
  return getStore(layer).get<T>(key);
}

export function setCached<T>(layer: CacheLayer, key: string, value: T): void {
  getStore(layer).set(key, value);
}

/**
 * Generate a deterministic cache key for AI responses.
 * Uses riotId + map + today's date to invalidate daily.
 */
export function makeAICacheKey(riotId: string, map: string): string {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `ai:${riotId}:${map}:${today}`;
}
