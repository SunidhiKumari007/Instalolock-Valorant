import { MapMeta } from "./types";

/**
 * Hardcoded map meta data — the deterministic backbone of InstaloLock.
 * Each map defines the role skeleton and optimal agents per slot.
 * Updated when Valorant patches change the meta (roughly every 2 weeks).
 */
export const MAP_META: Record<string, MapMeta> = {
  Ascent: {
    mapName: "Ascent",
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Jett", "Reyna", "Neon"],
      Controller: ["Omen", "Brimstone", "Astra"],
      Sentinel: ["Killjoy", "Cypher"],
      Initiator: ["Sova", "KAY/O", "Fade"],
      Flex: ["KAY/O", "Breach", "Skye"],
    },
    notes:
      "Mid-control map. Recon Initiators and Sentinels thrive. Strong for Sova lineups and Killjoy lockdowns. Controllers must smoke mid effectively.",
  },

  Bind: {
    mapName: "Bind",
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Raze", "Jett", "Reyna"],
      Controller: ["Brimstone", "Viper", "Astra"],
      Sentinel: ["Cypher", "Killjoy", "Sage"],
      Initiator: ["Skye", "Fade", "Gekko"],
      Flex: ["Breach", "Skye"],
    },
    notes:
      "Teleporter-based rotations. No mid — flanks are critical. Raze excels with Boom Bot in tight corridors. Close-range utility is king.",
  },

  Breeze: {
    mapName: "Breeze",
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Jett", "Yoru", "Neon"],
      Controller: ["Viper", "Harbor", "Omen"],
      Sentinel: ["Cypher", "Chamber", "Killjoy"],
      Initiator: ["Sova", "KAY/O", "Fade"],
      Flex: ["KAY/O", "Skye"],
    },
    notes:
      "Largest map — long sight lines favor Operator users and Viper walls. Viper is near mandatory. Precision-based agents shine here.",
  },

  Fracture: {
    mapName: "Fracture",
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Neon", "Raze", "Phoenix"],
      Controller: ["Brimstone", "Astra", "Omen"],
      Sentinel: ["Killjoy", "Cypher", "Sage"],
      Initiator: ["Breach", "Fade", "Gekko"],
      Flex: ["Breach", "Fade"],
    },
    notes:
      "Attacker-sided with dual entry points. Utility-heavy meta. Breach excels at clearing multiple angles. Double Initiator comps are common.",
  },

  Haven: {
    mapName: "Haven",
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Jett", "Reyna", "Phoenix"],
      Controller: ["Omen", "Astra", "Brimstone"],
      Sentinel: ["Killjoy", "Cypher"],
      Initiator: ["Sova", "Breach", "Fade"],
      Flex: ["Breach", "KAY/O", "Skye"],
    },
    notes:
      "Three-site map requiring fast rotations. Sentinels must anchor one site solo. Controllers need flexible smoke placements. Information gathering is critical.",
  },

  Icebox: {
    mapName: "Icebox",
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Jett", "Reyna", "Neon"],
      Controller: ["Viper", "Omen", "Harbor"],
      Sentinel: ["Killjoy", "Sage", "Chamber"],
      Initiator: ["Sova", "Fade", "KAY/O"],
      Flex: ["Sage", "KAY/O"],
    },
    notes:
      "Vertical map with tight chokepoints. Viper wall is essential for B site. Sage walls create unique angles. Operator-heavy map favors precision players.",
  },

  Lotus: {
    mapName: "Lotus",
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Raze", "Jett", "Neon"],
      Controller: ["Omen", "Astra", "Harbor"],
      Sentinel: ["Killjoy", "Cypher", "Deadlock"],
      Initiator: ["Fade", "Skye", "Gekko"],
      Flex: ["Skye", "KAY/O"],
    },
    notes:
      "Three sites with rotating doors and destructible walls. Map control is complex. Initiators with clearing utility are essential. Fast rotators thrive.",
  },

  Pearl: {
    mapName: "Pearl",
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Jett", "Neon", "Reyna"],
      Controller: ["Astra", "Omen", "Viper"],
      Sentinel: ["Killjoy", "Cypher"],
      Initiator: ["Fade", "KAY/O", "Gekko"],
      Flex: ["KAY/O", "Breach"],
    },
    notes:
      "Standard two-site map with mid control emphasis. No gimmicks — pure fundamentals. Controllers and Initiators who can contest mid are crucial.",
  },

  Split: {
    mapName: "Split",
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Raze", "Jett", "Reyna"],
      Controller: ["Omen", "Viper", "Astra"],
      Sentinel: ["Cypher", "Killjoy", "Sage"],
      Initiator: ["Breach", "Skye", "Gekko"],
      Flex: ["Sage", "Breach"],
    },
    notes:
      "Tight corridors and verticality favor close-range duelists. Raze is dominant. Mid control wins rounds. Sage wall can block ramps effectively.",
  },

  Sunset: {
    mapName: "Sunset",
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Jett", "Neon", "Raze"],
      Controller: ["Omen", "Astra", "Clove"],
      Sentinel: ["Killjoy", "Cypher"],
      Initiator: ["Fade", "Gekko", "Skye"],
      Flex: ["Breach", "KAY/O"],
    },
    notes:
      "Mid-focused map. Fast utility trades matter. Gekko and Fade excel at clearing entries. Good Controllers can stall pushes effectively.",
  },

  Abyss: {
    mapName: "Abyss",
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Jett", "Neon", "Yoru"],
      Controller: ["Omen", "Brimstone", "Astra"],
      Sentinel: ["Killjoy", "Cypher", "Vyse"],
      Initiator: ["Sova", "Fade", "Breach"],
      Flex: ["KAY/O", "Skye"],
    },
    notes:
      "Open map with fall-off zones. Positioning discipline is critical. Agents with displacement abilities (knockback, pulls) gain unique kill potential near edges.",
  },

  Corrode: {
    mapName: "Corrode",
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Jett", "Raze", "Neon"],
      Controller: ["Viper", "Omen", "Harbor"],
      Sentinel: ["Killjoy", "Cypher", "Sage"],
      Initiator: ["Fade", "Gekko", "Breach"],
      Flex: ["KAY/O", "Skye"],
    },
    notes:
      "Toxic-themed map with tight corridors and hazard zones. Area denial agents like Viper dominate. Utility-heavy compositions excel at controlling choke points and clearing contaminated zones.",
  },
};

/**
 * Returns the map meta for a given map name.
 * Falls back to a generic skeleton if the map is not found.
 */
export function getMapMeta(mapName: string): MapMeta {
  const meta = MAP_META[mapName];
  if (meta) return meta;

  // Fallback for unknown/new maps
  return {
    mapName,
    teamSkeleton: ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"],
    optimalAgents: {
      Duelist: ["Jett", "Reyna"],
      Controller: ["Omen", "Brimstone"],
      Sentinel: ["Killjoy", "Cypher"],
      Initiator: ["Sova", "Fade"],
      Flex: ["KAY/O", "Skye"],
    },
    notes: "No specific meta data available for this map yet.",
  };
}
