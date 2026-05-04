import { PlaystyleScores, AgentRole, AgentPool, PlayerIdentity, AgentStats, AGENT_ROLES, MapMeta } from "./types";

/**
 * Playstyle Analysis Engine v2.0
 *
 * FIXES APPLIED:
 *  - Rebalanced scoring weights (aggression boosted, support reduced)
 *  - Agent pool extraction (primary/secondary)
 *  - Player identity lock (one-trick detection)
 *  - Weighted role probability (replaces rigid thresholds)
 *  - Deterministic confidence scoring (backend, not AI)
 */

export interface RawPlayerStats {
  kills: number;
  deaths: number;
  assists: number;
  headshotPercent: number;
  firstBloods: number;
  firstDeaths: number;
  roundsPlayed: number;
  avgDamagePerRound: number;
  matchesPlayed: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. PLAYSTYLE SCORING (Rebalanced)
// ═══════════════════════════════════════════════════════════════════════════

export function calculatePlaystyleScores(
  stats: RawPlayerStats
): PlaystyleScores {
  const { kills, deaths, assists, headshotPercent, firstBloods, firstDeaths, roundsPlayed, avgDamagePerRound } = stats;

  // ─── Aggression Score (Boosted) ─────────────────────────────────────
  // Weights: First Blood rate (45%), Kill-per-round (35%), ADR (20%)
  const firstBloodRate = roundsPlayed > 0 ? (firstBloods / roundsPlayed) * 100 : 0;
  const killsPerRound = roundsPlayed > 0 ? kills / roundsPlayed : 0;
  const firstDeathRate = roundsPlayed > 0 ? (firstDeaths / roundsPlayed) * 100 : 0;

  const aggressionRaw =
    clamp(firstBloodRate * 9, 0, 45) +             // FB rate → up to 45 pts
    clamp(killsPerRound * 40, 0, 35) +              // Kills/round → up to 35 pts
    clamp((avgDamagePerRound / 180) * 20, 0, 20) -  // ADR → up to 20 pts
    clamp(firstDeathRate * 2, 0, 10);                // Small penalty for dying first

  const aggression = clamp(Math.round(aggressionRaw), 0, 100);

  // ─── Precision Score ────────────────────────────────────────────────
  // Weights: HS% (55%), KD ratio (30%), Kill efficiency (15%)
  const kdRatio = deaths > 0 ? kills / deaths : kills;
  const killEfficiency = roundsPlayed > 0 ? kills / roundsPlayed : 0;

  const precisionRaw =
    clamp((headshotPercent / 30) * 55, 0, 55) +    // HS% → up to 55 pts (30% = max)
    clamp((kdRatio / 1.8) * 30, 0, 30) +            // KD → up to 30 pts (1.8 KD = max)
    clamp(killEfficiency * 18, 0, 15);               // Kill efficiency → up to 15 pts

  const precision = clamp(Math.round(precisionRaw), 0, 100);

  // ─── Support Score (Reduced) ────────────────────────────────────────
  // Weights: Assist ratio relative to kills (40%), KAST approx (35%), low-frag-high-assist (25%)
  const assistsPerRound = roundsPlayed > 0 ? assists / roundsPlayed : 0;
  const assistToKillRatio = kills > 0 ? assists / kills : assists;
  const kastApprox =
    roundsPlayed > 0
      ? ((kills + assists + Math.max(0, roundsPlayed - deaths)) / (roundsPlayed * 2)) * 100
      : 0;

  // Low-frag-high-assist: only scores high if assists outpace kills (true support behavior)
  const lowFragHighAssist = assistToKillRatio > 0.7 ? clamp(assistToKillRatio * 18, 0, 25) : 0;

  const supportRaw =
    clamp(assistsPerRound * 80, 0, 40) +           // Assists/round → up to 40 pts (reduced from 50)
    clamp((kastApprox / 85) * 35, 0, 35) +          // KAST → up to 35 pts (reduced from 50)
    lowFragHighAssist;                               // Only true support players score here

  const support = clamp(Math.round(supportRaw), 0, 100);

  return { aggression, precision, support };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. AGENT POOL EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

export function extractAgentPool(agentStats: AgentStats[]): AgentPool {
  // Sort by games played descending (already sorted from henrikApi)
  const sorted = [...agentStats].sort((a, b) => b.gamesPlayed - a.gamesPlayed);

  return {
    primary: sorted.slice(0, 3).map((a) => a.agentName),
    secondary: sorted.slice(3, 5).map((a) => a.agentName),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. PLAYER IDENTITY LOCK (One-trick detection)
// ═══════════════════════════════════════════════════════════════════════════

export function detectPlayerIdentity(
  agentStats: AgentStats[],
  totalGames: number
): PlayerIdentity {
  if (agentStats.length === 0 || totalGames === 0) {
    return { isOnetrick: false, lockedAgent: null, lockedRole: null, dominanceRatio: 0 };
  }

  const topAgent = agentStats[0]; // Already sorted by gamesPlayed
  const dominanceRatio = topAgent.gamesPlayed / totalGames;

  // If top agent is ≥50% of matches → one-trick
  if (dominanceRatio >= 0.5) {
    return {
      isOnetrick: true,
      lockedAgent: topAgent.agentName,
      lockedRole: AGENT_ROLES[topAgent.agentName] || "Flex",
      dominanceRatio: Math.round(dominanceRatio * 100) / 100,
    };
  }

  return {
    isOnetrick: false,
    lockedAgent: null,
    lockedRole: null,
    dominanceRatio: Math.round(dominanceRatio * 100) / 100,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. WEIGHTED ROLE MAPPING (Replaces rigid thresholds)
// ═══════════════════════════════════════════════════════════════════════════

export interface RoleFitScores {
  Duelist: number;
  Controller: number;
  Sentinel: number;
  Initiator: number;
}

export function calculateRoleFitScores(scores: PlaystyleScores): RoleFitScores {
  const { aggression, precision, support } = scores;

  return {
    Duelist:     (aggression * 0.55) + (precision * 0.35) + (support * 0.10),
    Initiator:   (support * 0.40) + (aggression * 0.30) + (precision * 0.30),
    Controller:  (support * 0.50) + (precision * 0.25) + (aggression * 0.25),
    Sentinel:    (precision * 0.45) + (support * 0.40) + (aggression * 0.15),
  };
}

/**
 * Determines role using weighted fit scores, cross-validated with agent history.
 * Agent history takes priority if there's a mismatch.
 */
export function determineRolePreference(
  scores: PlaystyleScores,
  agentStats: AgentStats[]
): AgentRole {
  const fitScores = calculateRoleFitScores(scores);

  // Sort roles by fit score
  const sortedRoles = (Object.entries(fitScores) as [AgentRole, number][])
    .sort((a, b) => b[1] - a[1]);

  const mathRole = sortedRoles[0][0];
  const secondRole = sortedRoles[1][0];

  // Cross-validate with agent history
  const historyRole = calculateMostPlayedRole(agentStats);

  // If math and history agree → strong signal
  if (mathRole === historyRole) return mathRole;

  // If they disagree, trust agent history (player identity > math)
  // Unless the math role is MUCH stronger (>15 pts difference)
  const mathScore = fitScores[mathRole as keyof RoleFitScores];
  const historyFitScore = fitScores[historyRole as keyof RoleFitScores] || 0;

  if (mathScore - historyFitScore > 15) {
    return mathRole; // Math is significantly better
  }

  // If close, check if top two are within 10% → Flex
  if (sortedRoles[0][1] - sortedRoles[1][1] < sortedRoles[0][1] * 0.10) {
    // Close call: if history matches second role, use it
    if (secondRole === historyRole) return historyRole;
    return "Flex";
  }

  return historyRole; // Trust player behavior
}

/**
 * Given a player's top agents, calculates their most played role.
 */
export function calculateMostPlayedRole(
  agents: { agentName: string; gamesPlayed: number }[]
): AgentRole {
  const roleCounts: Record<string, number> = {};

  for (const agent of agents) {
    const role = AGENT_ROLES[agent.agentName] || "Flex";
    roleCounts[role] = (roleCounts[role] || 0) + agent.gamesPlayed;
  }

  let maxRole: AgentRole = "Flex";
  let maxCount = 0;
  for (const [role, count] of Object.entries(roleCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxRole = role as AgentRole;
    }
  }

  return maxRole;
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. DETERMINISTIC CONFIDENCE SCORE (v2.1 — anti-inflation)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * confidence = 0.50 × familiarity + 0.30 × playstyleFit + 0.20 × mapFit
 *
 * v2.1 fixes:
 *  - Familiarity weighted by actual games played (not just pool position)
 *  - Playstyle fit uses absolute scoring (not normalized to max)
 *  - Low-data penalty caps the final score
 *  - Small sample sizes (<10 games) reduce ceiling
 */
export function calculateConfidenceScore(
  suggestedAgent: string,
  agentPool: AgentPool,
  playstyleScores: PlaystyleScores,
  suggestedRole: AgentRole,
  mapMeta: MapMeta,
  totalGames?: number,
  agentGames?: number
): number {
  // ─── Familiarity (0-10) — weighted by actual usage ──────────────────
  let familiarity: number;
  const gamesOnAgent = agentGames || 0;

  if (agentPool.primary.includes(suggestedAgent)) {
    const idx = agentPool.primary.indexOf(suggestedAgent);
    // Base: 7-9 based on position (reduced from 8-10)
    const baseScore = 9 - idx; // 9, 8, 7
    // Boost by +1 if agent has 10+ games, or penalize if <3 games
    if (gamesOnAgent >= 10) {
      familiarity = Math.min(baseScore + 1, 10);
    } else if (gamesOnAgent >= 3) {
      familiarity = baseScore;
    } else {
      familiarity = Math.max(baseScore - 2, 4); // Low games = less confident
    }
  } else if (agentPool.secondary.includes(suggestedAgent)) {
    familiarity = gamesOnAgent >= 5 ? 5 : 3;
  } else {
    familiarity = 1; // Out of pool — very low
  }

  // ─── Playstyle Fit (0-10) — absolute scoring ────────────────────────
  const fitScores = calculateRoleFitScores(playstyleScores);
  const roleFit = fitScores[suggestedRole as keyof RoleFitScores] || 0;
  // Use absolute thresholds instead of normalizing to max
  // roleFit ranges roughly 0-100 (weighted sum of 0-100 scores)
  // 60+ = great fit, 40-60 = decent, 20-40 = weak, <20 = poor
  let playstyleFit: number;
  if (roleFit >= 55) playstyleFit = 8 + ((roleFit - 55) / 45) * 2; // 8-10
  else if (roleFit >= 40) playstyleFit = 5 + ((roleFit - 40) / 15) * 3; // 5-8
  else if (roleFit >= 25) playstyleFit = 3 + ((roleFit - 25) / 15) * 2; // 3-5
  else playstyleFit = (roleFit / 25) * 3; // 0-3
  playstyleFit = clamp(playstyleFit, 0, 10);

  // ─── Map Fit (0-10) ────────────────────────────────────────────────
  const optimalForRole = mapMeta.optimalAgents[suggestedRole] || [];
  let mapFit: number;
  if (optimalForRole.includes(suggestedAgent)) {
    mapFit = 9; // Optimal (reduced from 10)
  } else if (optimalForRole.length > 0) {
    mapFit = 4; // Viable but not optimal
  } else {
    mapFit = 5; // No data
  }

  let raw = (0.50 * familiarity) + (0.30 * playstyleFit) + (0.20 * mapFit);

  // ─── Low-data penalty ──────────────────────────────────────────────
  const games = totalGames || 0;
  if (games < 5) {
    raw = Math.min(raw, 5); // Hard cap at 5 for <5 games
  } else if (games < 10) {
    raw = Math.min(raw, 7); // Cap at 7 for <10 games
  }

  return clamp(Math.round(raw), 1, 10);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
