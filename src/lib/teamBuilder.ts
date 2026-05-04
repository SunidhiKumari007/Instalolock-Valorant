import { MapMeta, PlayerProfile, AgentRole, AGENT_ROLES } from "./types";

export interface TeamSlot {
  role: AgentRole;
  agent: string | null;
  isPlayer: boolean;
}

/**
 * Team Builder v2.0 — Player-First Approach
 *
 * FIX: Old system forced the player into the skeleton.
 * New system anchors the skeleton AROUND the player.
 *
 * Flow:
 *  1. Lock the player's agent and role FIRST
 *  2. Build remaining 4 slots around them
 *  3. Adapt skeleton if player's role doesn't match map meta
 */

/**
 * Builds a complete team skeleton with the player already anchored.
 * The skeleton adapts to the player, not the reverse.
 */
export function buildSkeletonAroundPlayer(
  mapMeta: MapMeta,
  player: PlayerProfile
): TeamSlot[] {
  const { identity, agentPool, preferredRole, topAgents } = player;

  // ─── Step 1: Determine the player's agent ──────────────────────────
  let playerAgent: string;
  let playerRole: AgentRole;

  if (identity.isOnetrick && identity.lockedAgent && identity.lockedRole) {
    // One-trick → respect their identity unconditionally
    playerAgent = identity.lockedAgent;
    playerRole = identity.lockedRole;
  } else {
    // Pick the best agent from their primary pool that fits the map
    const pick = findBestPoolAgentForMap(agentPool.primary, mapMeta, preferredRole);
    if (pick) {
      playerAgent = pick.agent;
      playerRole = pick.role;
    } else {
      // Fallback: their most-played agent regardless of map
      playerAgent = topAgents[0]?.agentName || agentPool.primary[0] || "Jett";
      playerRole = AGENT_ROLES[playerAgent] || preferredRole;
    }
  }

  // ─── Step 2: Build skeleton around the player ──────────────────────
  const baseSkeleton = [...mapMeta.teamSkeleton];

  // Check if the player's role exists in the map skeleton
  const playerRoleIndex = baseSkeleton.indexOf(playerRole);

  let adaptedSkeleton: AgentRole[];
  if (playerRoleIndex !== -1) {
    // Player's role fits the skeleton → use it directly
    adaptedSkeleton = [...baseSkeleton];
  } else {
    // Player's role doesn't fit → replace the Flex slot (or last slot)
    adaptedSkeleton = [...baseSkeleton];
    const flexIndex = adaptedSkeleton.indexOf("Flex");
    if (flexIndex !== -1) {
      adaptedSkeleton[flexIndex] = playerRole;
    } else {
      // Replace the last slot
      adaptedSkeleton[adaptedSkeleton.length - 1] = playerRole;
    }
  }

  // ─── Step 3: Assemble team slots ───────────────────────────────────
  let playerPlaced = false;
  const slots: TeamSlot[] = adaptedSkeleton.map((role) => {
    if (role === playerRole && !playerPlaced) {
      playerPlaced = true;
      return { role, agent: playerAgent, isPlayer: true };
    }
    return { role, agent: null, isPlayer: false };
  });

  // Safety: if player wasn't placed (shouldn't happen), force into first slot
  if (!playerPlaced) {
    slots[0] = { role: playerRole, agent: playerAgent, isPlayer: true };
  }

  // ─── Step 4: Fill remaining slots with map-optimal agents ──────────
  const usedAgents = new Set<string>([playerAgent]);
  for (let i = 0; i < slots.length; i++) {
    if (slots[i].isPlayer) continue;

    const role = slots[i].role;
    const optimal = mapMeta.optimalAgents[role] || [];

    // Pick first optimal agent not already used
    const agent = optimal.find((a) => !usedAgents.has(a)) || optimal[0] || "Unknown";
    slots[i].agent = agent;
    usedAgents.add(agent);
  }

  return slots;
}

/**
 * Finds the best agent from the player's primary pool
 * that has a role match in the map's skeleton.
 */
function findBestPoolAgentForMap(
  primaryPool: string[],
  mapMeta: MapMeta,
  preferredRole: AgentRole
): { agent: string; role: AgentRole } | null {
  // Priority 1: agent in pool whose role matches the preferred role AND is optimal for map
  for (const agentName of primaryPool) {
    const role = AGENT_ROLES[agentName];
    if (!role) continue;

    if (role === preferredRole) {
      const optimalForRole = mapMeta.optimalAgents[role] || [];
      if (optimalForRole.includes(agentName)) {
        return { agent: agentName, role };
      }
    }
  }

  // Priority 2: agent in pool whose role matches the preferred role (even if not map-optimal)
  for (const agentName of primaryPool) {
    const role = AGENT_ROLES[agentName];
    if (role === preferredRole) {
      return { agent: agentName, role };
    }
  }

  // Priority 3: any agent in pool that fills any skeleton role and is map-optimal
  for (const agentName of primaryPool) {
    const role = AGENT_ROLES[agentName];
    if (!role) continue;

    if (mapMeta.teamSkeleton.includes(role)) {
      const optimalForRole = mapMeta.optimalAgents[role] || [];
      if (optimalForRole.includes(agentName)) {
        return { agent: agentName, role };
      }
    }
  }

  // Priority 4: any agent in pool
  if (primaryPool.length > 0) {
    const agentName = primaryPool[0];
    const role = AGENT_ROLES[agentName] || "Flex";
    return { agent: agentName, role };
  }

  return null;
}
