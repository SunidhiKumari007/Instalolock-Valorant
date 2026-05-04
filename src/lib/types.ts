import { z } from "zod";

// ─── Enums ──────────────────────────────────────────────────────────────────────
export const AgentRole = z.enum([
  "Duelist",
  "Controller",
  "Sentinel",
  "Initiator",
  "Flex",
]);
export type AgentRole = z.infer<typeof AgentRole>;

export const ValorantMap = z.enum([
  "Ascent",
  "Bind",
  "Breeze",
  "Fracture",
  "Haven",
  "Icebox",
  "Lotus",
  "Pearl",
  "Split",
  "Sunset",
  "Abyss",
  "Corrode",
]);
export type ValorantMap = z.infer<typeof ValorantMap>;

// ─── Playstyle Scores ───────────────────────────────────────────────────────────
export const PlaystyleScoresSchema = z.object({
  aggression: z.number().min(0).max(100),
  precision: z.number().min(0).max(100),
  support: z.number().min(0).max(100),
});
export type PlaystyleScores = z.infer<typeof PlaystyleScoresSchema>;

// ─── Agent Stats ────────────────────────────────────────────────────────────────
export const AgentStatsSchema = z.object({
  agentName: z.string(),
  role: AgentRole,
  gamesPlayed: z.number(),
  wins: z.number(),
  kills: z.number(),
  deaths: z.number(),
  assists: z.number(),
  kda: z.number(),
  headshotPercent: z.number(),
  avgDamagePerRound: z.number(),
});
export type AgentStats = z.infer<typeof AgentStatsSchema>;

// ─── Agent Pool ─────────────────────────────────────────────────────────────────
export const AgentPoolSchema = z.object({
  primary: z.array(z.string()),   // Top 3 most-played agents
  secondary: z.array(z.string()), // Next 2 agents
});
export type AgentPool = z.infer<typeof AgentPoolSchema>;

// ─── Player Identity ────────────────────────────────────────────────────────────
export const PlayerIdentitySchema = z.object({
  isOnetrick: z.boolean(),
  lockedAgent: z.string().nullable(),  // Dominant agent if one-trick
  lockedRole: AgentRole.nullable(),    // Locked role if one-trick
  dominanceRatio: z.number(),          // 0-1, how dominant their top agent is
});
export type PlayerIdentity = z.infer<typeof PlayerIdentitySchema>;

// ─── Player Profile ─────────────────────────────────────────────────────────────
export const PlayerProfileSchema = z.object({
  riotId: z.string(),
  region: z.string().default("ap"),
  playstyleScores: PlaystyleScoresSchema,
  topAgents: z.array(AgentStatsSchema),
  overallKDA: z.number(),
  overallHeadshotPercent: z.number(),
  totalGamesAnalyzed: z.number(),
  preferredRole: AgentRole,
  agentPool: AgentPoolSchema,
  identity: PlayerIdentitySchema,
});
export type PlayerProfile = z.infer<typeof PlayerProfileSchema>;

// ─── Map Meta ───────────────────────────────────────────────────────────────────
export const MapMetaSchema = z.object({
  mapName: z.string(),
  teamSkeleton: z.array(AgentRole),
  optimalAgents: z.record(AgentRole, z.array(z.string())),
  notes: z.string(),
});
export type MapMeta = z.infer<typeof MapMetaSchema>;

// ─── API Request / Response ─────────────────────────────────────────────────────
export const AnalyzeRequestSchema = z.object({
  riotId: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]{3,16}#[a-zA-Z0-9]{3,5}$/,
      "Invalid Riot ID format. Expected: Username#Tag"
    ),
  map: ValorantMap,
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// AI only returns reasoning + team comp. Confidence is computed by backend.
export const AIOutputSchema = z.object({
  bestAgent: z.string(),
  bestAgentRole: AgentRole,
  teamComp: z.array(
    z.object({
      agent: z.string(),
      role: AgentRole,
      isPlayer: z.boolean(),
    })
  ),
  reasoning: z.object({
    whyThisAgent: z.string(),
    whyThisComp: z.string(),
    playstyleFit: z.string(),
  }),
  metaInsight: z.string(),
});
export type AIOutput = z.infer<typeof AIOutputSchema>;

// Full response includes backend-computed confidence + low data warning
export const AnalyzeResponseSchema = z.object({
  bestAgent: z.string(),
  bestAgentRole: AgentRole,
  confidenceScore: z.number().min(1).max(10),
  teamComp: z.array(
    z.object({
      agent: z.string(),
      role: AgentRole,
      isPlayer: z.boolean(),
    })
  ),
  reasoning: z.object({
    whyThisAgent: z.string(),
    whyThisComp: z.string(),
    playstyleFit: z.string(),
  }),
  metaInsight: z.string(),
  lowDataWarning: z.boolean().default(false),
});
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

// ─── Agent-Role Mapping (static lookup) ─────────────────────────────────────────
export const AGENT_ROLES: Record<string, AgentRole> = {
  Jett: "Duelist",
  Reyna: "Duelist",
  Raze: "Duelist",
  Phoenix: "Duelist",
  Yoru: "Duelist",
  Neon: "Duelist",
  Iso: "Duelist",
  Waylay: "Duelist",
  Omen: "Controller",
  Brimstone: "Controller",
  Viper: "Controller",
  Astra: "Controller",
  Harbor: "Controller",
  Clove: "Controller",
  Sova: "Initiator",
  Breach: "Initiator",
  Skye: "Initiator",
  "KAY/O": "Initiator",
  Fade: "Initiator",
  Gekko: "Initiator",
  Tejo: "Initiator",
  Killjoy: "Sentinel",
  Cypher: "Sentinel",
  Sage: "Sentinel",
  Chamber: "Sentinel",
  Deadlock: "Sentinel",
  Vyse: "Sentinel",
};
