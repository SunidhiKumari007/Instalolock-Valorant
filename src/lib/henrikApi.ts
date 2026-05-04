import { AgentStats, AGENT_ROLES, AgentRole } from "./types";
import { getCached, setCached } from "./cache";

const HENRIK_BASE_URL = "https://api.henrikdev.xyz";

/**
 * Fetches player match history from Henrik Dev Valorant API.
 * Implements L2 caching and exponential backoff retry.
 *
 * Returns aggregated stats across recent matches.
 */
export async function fetchPlayerStats(
  name: string,
  tag: string
): Promise<{
  kills: number;
  deaths: number;
  assists: number;
  headshotPercent: number;
  firstBloods: number;
  firstDeaths: number;
  roundsPlayed: number;
  avgDamagePerRound: number;
  matchesPlayed: number;
  agentStats: AgentStats[];
}> {
  const cacheKey = `stats:${name}#${tag}`;
  const cached = getCached<ReturnType<typeof aggregateMatchData>>(
    "playerStats",
    cacheKey
  );
  if (cached) return cached;

  const apiKey = process.env.HENRIK_API_KEY;
  if (!apiKey) {
    throw new Error("HENRIK_API_KEY is not configured");
  }

  // Fetch recent matches with retry
  const matchData = await fetchWithRetry(
    `${HENRIK_BASE_URL}/valorant/v3/matches/ap/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
    {
      headers: { Authorization: apiKey },
    }
  );

  const result = aggregateMatchData(matchData, `${name}#${tag}`);
  setCached("playerStats", cacheKey, result);
  return result;
}

/**
 * Aggregates raw match data from Henrik API into our internal format.
 */
function aggregateMatchData(
  apiResponse: HenrikMatchResponse,
  riotId: string
) {
  const matches = apiResponse.data || [];
  const agentMap: Record<
    string,
    {
      gamesPlayed: number;
      wins: number;
      kills: number;
      deaths: number;
      assists: number;
      headshots: number;
      bodyshots: number;
      legshots: number;
      damageTotal: number;
      roundsTotal: number;
    }
  > = {};

  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalHeadshots = 0;
  let totalBodyshots = 0;
  let totalLegshots = 0;
  let totalDamage = 0;
  let totalRounds = 0;
  let totalFirstBloods = 0;
  let totalFirstDeaths = 0;

  for (const match of matches) {
    const metadata = match.metadata;
    if (!metadata) continue;

    const allPlayers = [
      ...(match.players?.all_players || []),
    ];

    const player = allPlayers.find((p: HenrikPlayer) => {
      const playerRiotId = `${p.name}#${p.tag}`;
      return playerRiotId.toLowerCase() === riotId.toLowerCase();
    });

    if (!player) continue;

    const stats = player.stats;
    const agentName = player.character;
    const roundsInMatch = metadata.rounds_played || 24;
    const didWin =
      player.team === "Red"
        ? (match.teams?.red?.has_won ?? false)
        : (match.teams?.blue?.has_won ?? false);

    totalKills += stats.kills || 0;
    totalDeaths += stats.deaths || 0;
    totalAssists += stats.assists || 0;
    totalHeadshots += stats.headshots || 0;
    totalBodyshots += stats.bodyshots || 0;
    totalLegshots += stats.legshots || 0;
    totalDamage += player.damage_made || 0;
    totalRounds += roundsInMatch;

    // Approximate first bloods from the kill timeline if available
    if (player.behavior?.first_blood_taken) {
      totalFirstBloods++;
    }
    if (player.behavior?.first_death_given) {
      totalFirstDeaths++;
    }

    // Agent-level aggregation
    if (agentName) {
      if (!agentMap[agentName]) {
        agentMap[agentName] = {
          gamesPlayed: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          headshots: 0,
          bodyshots: 0,
          legshots: 0,
          damageTotal: 0,
          roundsTotal: 0,
        };
      }
      const a = agentMap[agentName];
      a.gamesPlayed++;
      if (didWin) a.wins++;
      a.kills += stats.kills || 0;
      a.deaths += stats.deaths || 0;
      a.assists += stats.assists || 0;
      a.headshots += stats.headshots || 0;
      a.bodyshots += stats.bodyshots || 0;
      a.legshots += stats.legshots || 0;
      a.damageTotal += player.damage_made || 0;
      a.roundsTotal += roundsInMatch;
    }
  }

  const totalShots = totalHeadshots + totalBodyshots + totalLegshots;
  const headshotPercent = totalShots > 0 ? (totalHeadshots / totalShots) * 100 : 0;
  const avgDamagePerRound = totalRounds > 0 ? totalDamage / totalRounds : 0;

  // Build sorted agent stats
  const agentStats: AgentStats[] = Object.entries(agentMap)
    .map(([agentName, data]) => {
      const agentShots = data.headshots + data.bodyshots + data.legshots;
      const agentHsPercent = agentShots > 0 ? (data.headshots / agentShots) * 100 : 0;
      const agentKda = data.deaths > 0
        ? (data.kills + data.assists) / data.deaths
        : data.kills + data.assists;

      return {
        agentName,
        role: (AGENT_ROLES[agentName] || "Flex") as AgentRole,
        gamesPlayed: data.gamesPlayed,
        wins: data.wins,
        kills: data.kills,
        deaths: data.deaths,
        assists: data.assists,
        kda: Math.round(agentKda * 100) / 100,
        headshotPercent: Math.round(agentHsPercent * 10) / 10,
        avgDamagePerRound: data.roundsTotal > 0
          ? Math.round(data.damageTotal / data.roundsTotal)
          : 0,
      };
    })
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed);

  return {
    kills: totalKills,
    deaths: totalDeaths,
    assists: totalAssists,
    headshotPercent: Math.round(headshotPercent * 10) / 10,
    firstBloods: totalFirstBloods,
    firstDeaths: totalFirstDeaths,
    roundsPlayed: totalRounds,
    avgDamagePerRound: Math.round(avgDamagePerRound),
    matchesPlayed: matches.length,
    agentStats,
  };
}

/**
 * Fetch with exponential backoff retry (3 attempts).
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<HenrikMatchResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);

      if (res.status === 429) {
        // Rate limited — wait and retry
        const waitMs = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      if (!res.ok) {
        throw new Error(`Henrik API returned ${res.status}: ${res.statusText}`);
      }

      return (await res.json()) as HenrikMatchResponse;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries - 1) {
        const waitMs = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  throw lastError || new Error("Henrik API request failed after retries");
}

// ─── Henrik API Response Types ──────────────────────────────────────────────────
// Minimal type definitions for the parts we use from Henrik Dev API
interface HenrikMatchResponse {
  status: number;
  data: HenrikMatch[];
}

interface HenrikMatch {
  metadata: {
    map: string;
    game_length: number;
    rounds_played: number;
    mode: string;
  };
  players: {
    all_players: HenrikPlayer[];
  };
  teams?: {
    red?: { has_won: boolean };
    blue?: { has_won: boolean };
  };
}

interface HenrikPlayer {
  name: string;
  tag: string;
  team: string;
  character: string;
  currenttier_patched: string;
  stats: {
    kills: number;
    deaths: number;
    assists: number;
    headshots: number;
    bodyshots: number;
    legshots: number;
  };
  damage_made: number;
  behavior?: {
    first_blood_taken?: boolean;
    first_death_given?: boolean;
  };
}
