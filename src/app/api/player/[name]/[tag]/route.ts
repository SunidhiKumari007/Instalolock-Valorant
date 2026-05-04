import { NextRequest, NextResponse } from "next/server";
import { fetchPlayerStats } from "@/lib/henrikApi";
import {
  calculatePlaystyleScores,
  determineRolePreference,
  calculateMostPlayedRole,
  extractAgentPool,
  detectPlayerIdentity,
} from "@/lib/scoringEngine";
import { checkRateLimit } from "@/lib/rateLimiter";

/**
 * GET /api/player/[name]/[tag]
 *
 * Fetches player stats from Henrik API (with L2 cache),
 * runs the scoring engine, and returns a PlayerProfile.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; tag: string }> }
) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limited. Try again shortly.", resetMs: rateCheck.resetMs },
        { status: 429 }
      );
    }

    const { name, tag } = await params;

    // Input validation
    if (!name || !tag) {
      return NextResponse.json(
        { error: "Missing name or tag parameter" },
        { status: 400 }
      );
    }

    const nameRegex = /^[a-zA-Z0-9\s]{3,16}$/;
    const tagRegex = /^[a-zA-Z0-9]{3,5}$/;
    if (!nameRegex.test(name) || !tagRegex.test(tag)) {
      return NextResponse.json(
        { error: "Invalid Riot ID format" },
        { status: 400 }
      );
    }

    // Fetch stats (L2 cache handled internally)
    const rawStats = await fetchPlayerStats(name, tag);

    // Run scoring engine
    const playstyleScores = calculatePlaystyleScores(rawStats);
    const agentPool = extractAgentPool(rawStats.agentStats);
    const identity = detectPlayerIdentity(rawStats.agentStats, rawStats.matchesPlayed);
    const mostPlayedRole = calculateMostPlayedRole(rawStats.agentStats);
    const preferredRole = determineRolePreference(playstyleScores, rawStats.agentStats);

    const profile = {
      riotId: `${name}#${tag}`,
      region: "ap",
      playstyleScores,
      topAgents: rawStats.agentStats.slice(0, 5),
      overallKDA:
        rawStats.deaths > 0
          ? Math.round(((rawStats.kills + rawStats.assists) / rawStats.deaths) * 100) / 100
          : rawStats.kills + rawStats.assists,
      overallHeadshotPercent: rawStats.headshotPercent,
      totalGamesAnalyzed: rawStats.matchesPlayed,
      preferredRole,
      mostPlayedRole,
      agentPool,
      identity,
    };

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("Player API Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch player stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
