import OpenAI from "openai";
import { AIOutput, AIOutputSchema, AnalyzeResponse, PlayerProfile, MapMeta } from "./types";
import { TeamSlot } from "./teamBuilder";
import { calculateConfidenceScore } from "./scoringEngine";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Service v2.0 — Constrained Explainer
 *
 * FIXES APPLIED:
 *  - AI no longer computes confidence (backend does it)
 *  - Prompt priority: Player Pool → Identity → Map Meta
 *  - AI CANNOT suggest agents outside the player's pool unless justified
 *  - Deterministic fallback respects player identity
 */
export async function generateRecommendation(
  player: PlayerProfile,
  mapMeta: MapMeta,
  skeleton: TeamSlot[]
): Promise<AnalyzeResponse> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(player, mapMeta, skeleton);

  // Pre-compute confidence from backend (used regardless of AI success)
  const playerSlot = skeleton.find((s) => s.isPlayer);
  const suggestedAgent = playerSlot?.agent || player.topAgents[0]?.agentName || "Unknown";
  const suggestedRole = playerSlot?.role || player.preferredRole;
  // Find how many games the player has on the suggested agent
  const agentStats = player.topAgents.find((a) => a.agentName === suggestedAgent);
  const agentGames = agentStats?.gamesPlayed || 0;

  const confidenceScore = calculateConfidenceScore(
    suggestedAgent,
    player.agentPool,
    player.playstyleScores,
    suggestedRole,
    mapMeta,
    player.totalGamesAnalyzed,
    agentGames
  );
  const lowDataWarning = player.totalGamesAnalyzed < 5;

  // Try AI generation with retry
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Lower temp for more consistent output
        max_tokens: 1200,
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error("Empty AI response");

      const parsed = JSON.parse(raw);
      const aiOutput = AIOutputSchema.parse(parsed);

      // Merge AI reasoning with backend-computed confidence
      return {
        ...aiOutput,
        confidenceScore,
        lowDataWarning,
      };
    } catch (err) {
      if (attempt === 0) continue; // Retry once
      console.error("AI generation failed after retries:", err);
    }
  }

  // ─── Deterministic Fallback ─────────────────────────────────────────
  return buildDeterministicFallback(player, mapMeta, skeleton, confidenceScore, lowDataWarning);
}

/**
 * System prompt — strict behavioral constraints with PLAYER-FIRST priority.
 */
function buildSystemPrompt(): string {
  return `You are an expert Valorant tactical analyst. You MUST output ONLY valid JSON matching this exact schema:

{
  "bestAgent": "string (agent name for the player)",
  "bestAgentRole": "string (one of: Duelist, Controller, Sentinel, Initiator, Flex)",
  "teamComp": [
    { "agent": "string", "role": "string", "isPlayer": boolean }
  ],
  "reasoning": {
    "whyThisAgent": "string (2-3 sentences explaining agent choice)",
    "whyThisComp": "string (2-3 sentences explaining team synergy)",
    "playstyleFit": "string (2-3 sentences on how player stats match)"
  },
  "metaInsight": "string (2-3 sentences about the map meta)"
}

## STRICT PRIORITY ORDER (FOLLOW THIS EXACTLY):

1. **PLAYER AGENT POOL** — You MUST suggest an agent from the player's PRIMARY pool.
   Only use SECONDARY pool if no primary agent fits.
   NEVER suggest agents outside the pool unless absolutely zero viable options exist.
   If you must go outside pool, explicitly explain why in reasoning.

2. **PLAYER IDENTITY** — If the player is a one-trick, ALWAYS suggest their locked agent.
   Do NOT override one-trick identity with map meta.
   The player's comfort on an agent is MORE valuable than theoretical optimal picks.

3. **MAP META** — Optimize within the above constraints. Map meta refines,
   it does NOT override player identity.

Rules:
- teamComp MUST have exactly 5 agents with different roles
- Exactly one entry must have isPlayer: true
- Use only real Valorant agent names
- Reference the player's actual stats and pool in reasoning
- Build the team composition AROUND the player, not against them`;
}

/**
 * User prompt — player identity and pool presented FIRST, map meta LAST.
 */
function buildUserPrompt(
  player: PlayerProfile,
  mapMeta: MapMeta,
  skeleton: TeamSlot[]
): string {
  const { identity, agentPool, playstyleScores, preferredRole, topAgents } = player;

  // Top agents with stats (for reasoning)
  const topAgentSummary = topAgents.slice(0, 5).map((a) => ({
    agent: a.agentName,
    role: a.role,
    games: a.gamesPlayed,
    kda: a.kda,
    hs: a.headshotPercent,
  }));

  const playerSlot = skeleton.find((s) => s.isPlayer);

  return `## PRIORITY 1: PLAYER AGENT POOL (MUST pick from here)
- Primary Pool (top 3): ${JSON.stringify(agentPool.primary)}
- Secondary Pool: ${JSON.stringify(agentPool.secondary)}
- Agent Stats: ${JSON.stringify(topAgentSummary)}

## PRIORITY 2: PLAYER IDENTITY
- Riot ID: ${player.riotId}
- One-trick: ${identity.isOnetrick ? `YES — Locked to ${identity.lockedAgent} (${identity.lockedRole}), dominance: ${Math.round(identity.dominanceRatio * 100)}% of recent matches` : "No"}
- Playstyle Scores: Aggression ${playstyleScores.aggression}/100, Precision ${playstyleScores.precision}/100, Support ${playstyleScores.support}/100
- Preferred Role: ${preferredRole}
- Overall KDA: ${player.overallKDA}
- Overall HS%: ${player.overallHeadshotPercent}%

## PRIORITY 3: MAP CONTEXT (optimize within above constraints)
- Map: ${mapMeta.mapName}
- Map Notes: ${mapMeta.notes}
- Skeleton: ${JSON.stringify(mapMeta.teamSkeleton)}

## PRE-ASSIGNED (by backend)
- Player slot: ${playerSlot?.role || "unassigned"} → ${playerSlot?.agent || "none"}

Confirm or adjust the player's agent (ONLY from their pool). Fill remaining 4 team slots with optimal agents that synergize with the player's pick. Build the team AROUND the player.`;
}

/**
 * Deterministic fallback — respects player identity fully.
 */
function buildDeterministicFallback(
  player: PlayerProfile,
  mapMeta: MapMeta,
  skeleton: TeamSlot[],
  confidenceScore: number,
  lowDataWarning: boolean
): AnalyzeResponse {
  const playerSlot = skeleton.find((s) => s.isPlayer);
  const bestAgent = playerSlot?.agent || player.agentPool.primary[0] || player.topAgents[0]?.agentName || "Jett";
  const bestRole = playerSlot?.role || player.preferredRole;

  // Fill remaining slots with map-optimal agents
  const usedAgents = new Set<string>([bestAgent]);
  const teamComp = skeleton.map((slot) => {
    if (slot.isPlayer) {
      return { agent: bestAgent, role: slot.role, isPlayer: true };
    }
    const optimal = mapMeta.optimalAgents[slot.role] || [];
    const agent = optimal.find((a) => !usedAgents.has(a)) || optimal[0] || "Unknown";
    usedAgents.add(agent);
    return { agent, role: slot.role, isPlayer: false };
  });

  const identityNote = player.identity.isOnetrick
    ? `As a ${player.identity.lockedAgent} main (${Math.round(player.identity.dominanceRatio * 100)}% usage), this is your strongest pick.`
    : `Based on your agent pool (${player.agentPool.primary.join(", ")}), ${bestAgent} aligns with your ${bestRole} playstyle.`;

  return {
    bestAgent,
    bestAgentRole: bestRole,
    confidenceScore,
    teamComp,
    reasoning: {
      whyThisAgent: identityNote,
      whyThisComp: `This composition fills the standard ${mapMeta.mapName} skeleton with high-tier agents, built around your ${bestAgent} pick in the ${bestRole} slot.`,
      playstyleFit: `Your scores (Aggression: ${player.playstyleScores.aggression}, Precision: ${player.playstyleScores.precision}, Support: ${player.playstyleScores.support}) align with the ${bestRole} role.`,
    },
    metaInsight: mapMeta.notes,
    lowDataWarning,
  };
}
