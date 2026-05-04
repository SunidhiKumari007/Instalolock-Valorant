import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema, PlayerProfile } from "@/lib/types";
import { fetchPlayerStats } from "@/lib/henrikApi";
import {
  calculatePlaystyleScores,
  determineRolePreference,
  extractAgentPool,
  detectPlayerIdentity,
} from "@/lib/scoringEngine";
import { getMapMeta } from "@/lib/mapMeta";
import { buildSkeletonAroundPlayer } from "@/lib/teamBuilder";
import { generateRecommendation } from "@/lib/aiService";
import { getCached, setCached, makeAICacheKey } from "@/lib/cache";
import { checkRateLimit } from "@/lib/rateLimiter";
import { AnalyzeResponse } from "@/lib/types";

/**
 * POST /api/analyze  (v2.0 — Player-First Pipeline)
 *
 * Pipeline:
 * Input → Validate → L3 Cache → Henrik API + Map Meta (parallel)
 *       → Agent Pool + Identity Lock → Scoring Engine
 *       → Build Skeleton Around Player → AI Refinement → Respond
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Rate limited. Try again shortly.",
          resetMs: rateCheck.resetMs,
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = AnalyzeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parseResult.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { riotId, map } = parseResult.data;
    const [name, tag] = riotId.split("#");

    // ─── L3 Cache Check ───────────────────────────────────────────────
    const cacheKey = makeAICacheKey(riotId, map);
    const cachedResponse = getCached<{ data: AnalyzeResponse; profile: unknown }>(
      "aiResponse",
      cacheKey
    );
    if (cachedResponse) {
      return NextResponse.json({
        success: true,
        cached: true,
        data: cachedResponse.data,
        profile: cachedResponse.profile,
      });
    }

    // ─── Parallel Fetch: Player Stats + Map Meta ──────────────────────
    const [rawStats, mapMeta] = await Promise.all([
      fetchPlayerStats(name, tag),
      Promise.resolve(getMapMeta(map)),
    ]);

    // ─── Agent Pool Extraction ────────────────────────────────────────
    const agentPool = extractAgentPool(rawStats.agentStats);

    // ─── Player Identity Lock ─────────────────────────────────────────
    const identity = detectPlayerIdentity(
      rawStats.agentStats,
      rawStats.matchesPlayed
    );

    // ─── Scoring Engine ───────────────────────────────────────────────
    const playstyleScores = calculatePlaystyleScores(rawStats);
    const preferredRole = determineRolePreference(
      playstyleScores,
      rawStats.agentStats
    );

    const playerProfile: PlayerProfile = {
      riotId,
      region: "ap",
      playstyleScores,
      topAgents: rawStats.agentStats.slice(0, 5),
      overallKDA:
        rawStats.deaths > 0
          ? Math.round(
              ((rawStats.kills + rawStats.assists) / rawStats.deaths) * 100
            ) / 100
          : rawStats.kills + rawStats.assists,
      overallHeadshotPercent: rawStats.headshotPercent,
      totalGamesAnalyzed: rawStats.matchesPlayed,
      preferredRole,
      agentPool,
      identity,
    };

    // ─── Build Skeleton Around Player ─────────────────────────────────
    const skeleton = buildSkeletonAroundPlayer(mapMeta, playerProfile);

    // ─── AI Refinement ────────────────────────────────────────────────
    const result = await generateRecommendation(
      playerProfile,
      mapMeta,
      skeleton
    );

    // ─── Build profile payload ────────────────────────────────────────
    const profilePayload = {
      playstyleScores: playerProfile.playstyleScores,
      preferredRole: playerProfile.preferredRole,
      topAgents: playerProfile.topAgents.slice(0, 5).map((a) => ({
        agent: a.agentName,
        role: a.role,
        games: a.gamesPlayed,
        kda: a.kda,
      })),
      totalGames: playerProfile.totalGamesAnalyzed,
      agentPool: playerProfile.agentPool,
      identity: playerProfile.identity,
    };

    // ─── Cache & Respond ──────────────────────────────────────────────
    setCached("aiResponse", cacheKey, { data: result, profile: profilePayload });

    return NextResponse.json({
      success: true,
      cached: false,
      data: result,
      profile: profilePayload,
    });
  } catch (error) {
    console.error("Analyze API Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
