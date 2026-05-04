"use client";

import { useState, useEffect } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface TeamMember {
  agent: string;
  role: string;
  isPlayer: boolean;
}

interface Reasoning {
  whyThisAgent: string;
  whyThisComp: string;
  playstyleFit: string;
}

interface ProfileData {
  playstyleScores: { aggression: number; precision: number; support: number };
  preferredRole: string;
  topAgents: { agent: string; role: string; games: number; kda: number }[];
  totalGames: number;
  agentPool: { primary: string[]; secondary: string[] };
  identity: {
    isOnetrick: boolean;
    lockedAgent: string | null;
    lockedRole: string | null;
    dominanceRatio: number;
  };
}

interface AnalysisResult {
  bestAgent: string;
  bestAgentRole: string;
  confidenceScore: number;
  teamComp: TeamMember[];
  reasoning: Reasoning;
  metaInsight: string;
  lowDataWarning: boolean;
}

/* ─── Agent UUIDs — verified from valorant-api.com ─────────────────────── */
const AGENT_UUIDS: Record<string, string> = {
  Jett: "add6443a-41bd-e414-f6ad-e58d267f4e95",
  Reyna: "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
  Raze: "f94c3b30-42be-e959-889c-5aa313dba261",
  Phoenix: "eb93336a-449b-9c1b-0a54-a891f7921d69",
  Yoru: "7f94d92c-4234-0a36-9646-3a87eb8b5c89",
  Neon: "bb2a4828-46eb-8cd1-e765-15848195d751",
  Iso: "0e38b510-41a8-5780-5e8f-568b2a4f2d6c",
  Waylay: "df1cb487-4902-002e-5c17-d28e83e78588",
  Omen: "8e253930-4c05-31dd-1b6c-968525494517",
  Brimstone: "9f0d8ba9-4140-b941-57d3-a7ad57c6b417",
  Viper: "707eab51-4836-f488-046a-cda6bf494859",
  Astra: "41fb69c1-4189-7b37-f117-bcaf1e96f1bf",
  Harbor: "95b78ed7-4637-86d9-7e41-71ba8c293152",
  Clove: "1dbf2edd-4729-0984-3115-daa5eed44993",
  Sova: "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
  Breach: "5f8d3a7f-467b-97f3-062c-13acf203c006",
  Skye: "6f2a04ca-43e0-be17-7f36-b3908627744d",
  "KAY/O": "601dbbe7-43ce-be57-2a40-4abd24953621",
  Fade: "dade69b4-4f5a-8528-247b-219e5a1facd6",
  Gekko: "e370fa57-4757-3604-3648-499e1f642d3f",
  Tejo: "b444168c-4e35-8076-db47-ef9bf368f384",
  Killjoy: "1e58de9c-4950-5125-93e9-a0aee9f98746",
  Cypher: "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
  Sage: "569fdd95-4d10-43ab-ca70-79becc718b46",
  Chamber: "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
  Deadlock: "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235",
  Vyse: "efba5359-4016-a1e5-7626-b1ae76895940",
  Miks: "7c8a4701-4de6-9355-b254-e09bc2a34b72",
  Veto: "92eeef5d-43b5-1d4a-8d03-b3927a09034b",
};

const getAgentImage = (agentName: string) => {
  const uuid = AGENT_UUIDS[agentName];
  if (!uuid) return null;
  return `https://media.valorant-api.com/agents/${uuid}/displayicon.png`;
};

/* ─── Map Data — UUIDs + theme colors for backgrounds ──────────────────── */
const MAP_DATA: Record<string, { uuid: string; gradient: string }> = {
  Abyss: {
    uuid: "224b0a95-48b9-f703-1bd8-67aca101a61f",
    gradient: "linear-gradient(135deg, rgba(40, 40, 100, 0.15) 0%, rgba(10, 10, 40, 0.3) 100%)",
  },
  Ascent: {
    uuid: "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
    gradient: "linear-gradient(135deg, rgba(180, 100, 50, 0.15) 0%, rgba(60, 30, 15, 0.3) 100%)",
  },
  Bind: {
    uuid: "2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba",
    gradient: "linear-gradient(135deg, rgba(200, 150, 60, 0.15) 0%, rgba(80, 50, 20, 0.3) 100%)",
  },
  Breeze: {
    uuid: "2fb9a4fd-47b8-4e7d-a969-74b4046ebd53",
    gradient: "linear-gradient(135deg, rgba(40, 180, 160, 0.12) 0%, rgba(20, 80, 100, 0.3) 100%)",
  },
  Corrode: {
    uuid: "1c18ab1f-420d-0d8b-71d0-77ad3c439115",
    gradient: "linear-gradient(135deg, rgba(80, 200, 60, 0.15) 0%, rgba(30, 60, 20, 0.3) 100%)",
  },
  Haven: {
    uuid: "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
    gradient: "linear-gradient(135deg, rgba(60, 140, 80, 0.12) 0%, rgba(30, 60, 30, 0.3) 100%)",
  },
  Icebox: {
    uuid: "e2ad5c54-4114-a870-9641-8ea21279579a",
    gradient: "linear-gradient(135deg, rgba(100, 180, 220, 0.12) 0%, rgba(20, 40, 80, 0.3) 100%)",
  },
  Lotus: {
    uuid: "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
    gradient: "linear-gradient(135deg, rgba(200, 100, 140, 0.12) 0%, rgba(80, 40, 60, 0.3) 100%)",
  },
  Split: {
    uuid: "d960549e-485c-e861-8d71-aa9d1aed12a2",
    gradient: "linear-gradient(135deg, rgba(180, 60, 120, 0.15) 0%, rgba(60, 20, 50, 0.3) 100%)",
  },
  Sunset: {
    uuid: "92584fbe-486a-b1b2-9faa-39b0f486b498",
    gradient: "linear-gradient(135deg, rgba(220, 120, 50, 0.15) 0%, rgba(100, 40, 20, 0.3) 100%)",
  },
};

const getMapSplash = (mapName: string) => {
  const data = MAP_DATA[mapName];
  if (!data) return null;
  return `https://media.valorant-api.com/maps/${data.uuid}/splash.png`;
};

/* Manual ordered map list */
const MAPS = [
  "Abyss", "Ascent", "Bind", "Breeze", "Corrode",
  "Haven", "Icebox", "Lotus", "Split", "Sunset",
];

const LOADING_TIPS = [
  "Analyzing your match history...",
  "Calculating playstyle scores...",
  "Building optimal team comp...",
  "Evaluating map meta...",
  "Generating AI insights...",
];

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function Home() {
  const [riotId, setRiotId] = useState("");
  const [selectedMap, setSelectedMap] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingTip, setLoadingTip] = useState(0);
  const [mapBgLoaded, setMapBgLoaded] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Preload map background when map is selected
  useEffect(() => {
    if (!selectedMap) {
      setMapBgLoaded(false);
      return;
    }
    const splash = getMapSplash(selectedMap);
    if (!splash) return;

    setMapBgLoaded(false);
    const img = new Image();
    img.onload = () => setMapBgLoaded(true);
    img.src = splash;
  }, [selectedMap]);

  const handleAnalyze = async () => {
    setError("");
    setResult(null);
    setProfile(null);

    if (!riotId.includes("#")) {
      setError("Please enter a valid Riot ID (e.g., Username#TAG)");
      return;
    }
    if (!selectedMap) {
      setError("Please select a map");
      return;
    }

    setLoading(true);
    setLoadingTip(0);

    const tipInterval = setInterval(() => {
      setLoadingTip((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2500);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riotId, map: selectedMap }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.data);
      setProfile(data.profile);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      clearInterval(tipInterval);
      setLoading(false);
    }
  };

  const getRoleClass = (role: string) => role.toLowerCase();

  const getAgentEnergyClass = (agent: string) => {
    const agentColors: Record<string, string> = {
      Jett: "energy-jett", Reyna: "energy-reyna", Sage: "energy-sage",
      Omen: "energy-omen", Viper: "energy-viper", Phoenix: "energy-phoenix",
      Raze: "energy-raze", Sova: "energy-sova", Breach: "energy-breach",
      Cypher: "energy-cypher", Killjoy: "energy-killjoy", Brimstone: "energy-brimstone",
      Skye: "energy-skye", Yoru: "energy-yoru", Astra: "energy-astra",
      "KAY/O": "energy-kayo", Chamber: "energy-chamber", Neon: "energy-neon",
      Fade: "energy-fade", Harbor: "energy-harbor", Gekko: "energy-gekko",
      Deadlock: "energy-deadlock", Iso: "energy-iso", Clove: "energy-clove",
      Vyse: "energy-vyse", Tejo: "energy-tejo",
    };
    return agentColors[agent] || "energy-default";
  };

  const getRoleFitLabel = (score: number) => {
    if (score >= 8) return "High";
    if (score >= 5) return "Moderate";
    if (score >= 3) return "Low";
    return "Minimal";
  };

  const getPlaystyleMatchLabel = (score: number) => {
    if (score >= 8) return "Strong";
    if (score >= 5) return "Decent";
    if (score >= 3) return "Weak";
    return "Poor";
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 8) return "confidence-high";
    if (score >= 5) return "confidence-mid";
    if (score >= 3) return "confidence-risky";
    return "confidence-low";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 8) return "🔥 Strong Fit";
    if (score >= 5) return "⚖️ Viable Pick";
    if (score >= 3) return "⚠️ Risky Pick";
    return "❌ Expand Agent Pool";
  };

  const getConfidenceBarColor = (score: number) => {
    if (score >= 7) return "var(--accent-green)";
    if (score >= 4) return "var(--accent-gold)";
    return "var(--accent-red)";
  };

  const getRoleGlowClass = (role: string) => {
    const r = role.toLowerCase();
    if (r === "duelist") return "role-glow-duelist";
    if (r === "controller") return "role-glow-controller";
    if (r === "initiator") return "role-glow-initiator";
    if (r === "sentinel") return "role-glow-sentinel";
    return "";
  };

  const handleImageError = (agentName: string) => {
    setFailedImages((prev) => new Set(prev).add(agentName));
  };

  /* Agent image with fallback to styled initials */
  const AgentImage = ({
    agent,
    role,
    size = 56,
    className = "",
  }: {
    agent: string;
    role: string;
    size?: number;
    className?: string;
  }) => {
    const imgUrl = getAgentImage(agent);
    const hasFailed = failedImages.has(agent);

    if (!imgUrl || hasFailed) {
      const initials = agent.slice(0, 2).toUpperCase();
      const roleColors: Record<string, string> = {
        duelist: "var(--accent-red)",
        controller: "var(--accent-purple)",
        initiator: "var(--accent-cyan)",
        sentinel: "var(--accent-green)",
      };
      const color = roleColors[role.toLowerCase()] || "var(--text-secondary)";
      return (
        <div
          className={`agent-initials ${className}`}
          style={{
            width: size,
            height: size,
            borderColor: color,
            color,
          }}
          title={`${agent} — ${role}`}
        >
          {initials}
        </div>
      );
    }

    return (
      <img
        className={className}
        src={imgUrl}
        alt={agent}
        title={`${agent} — ${role}`}
        width={size}
        height={size}
        onError={() => handleImageError(agent)}
        style={{ objectFit: "cover", objectPosition: "center top" }}
      />
    );
  };

  /* ─── Radar Chart Component ─────────────────────────────────────────── */
  const RadarChart = ({ scores }: { scores: { aggression: number; precision: number; support: number } }) => {
    const size = 320;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = 120;
    const levels = 4;

    // 3 axes: top (Aggression), bottom-right (Precision), bottom-left (Support)
    const angleOffset = -Math.PI / 2; // Start from top
    const axes = [
      { label: "🔥 Aggression", value: scores.aggression, angle: angleOffset },
      { label: "🎯 Precision", value: scores.precision, angle: angleOffset + (2 * Math.PI) / 3 },
      { label: "🛡️ Support", value: scores.support, angle: angleOffset + (4 * Math.PI) / 3 },
    ];

    const getPoint = (angle: number, radius: number) => ({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });

    // Grid levels
    const gridPolygons = Array.from({ length: levels }, (_, i) => {
      const r = (maxR / levels) * (i + 1);
      return axes.map((a) => getPoint(a.angle, r)).map((p) => `${p.x},${p.y}`).join(" ");
    });

    // Data polygon
    const dataPoints = axes.map((a) => {
      const r = (a.value / 100) * maxR;
      return getPoint(a.angle, r);
    });
    const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

    // Axis lines
    const axisLines = axes.map((a) => ({
      x1: cx,
      y1: cy,
      ...getPoint(a.angle, maxR),
    }));

    // Label positions (slightly outside the chart)
    const labelPositions = axes.map((a) => {
      const p = getPoint(a.angle, maxR + 28);
      return { ...p, label: a.label, value: a.value };
    });

    return (
      <div className="radar-chart-container">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-red)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="var(--accent-cyan)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Grid polygons */}
          {gridPolygons.map((points, i) => (
            <polygon
              key={i}
              points={points}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          ))}
          {/* Axis lines */}
          {axisLines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x}
              y2={line.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}
          {/* Data fill */}
          <polygon
            points={dataPolygon}
            fill="url(#radarFill)"
            stroke="var(--accent-red)"
            strokeWidth="2"
            opacity="0.9"
          />
          {/* Data points */}
          {dataPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--accent-red)"
              stroke="var(--bg-primary)"
              strokeWidth="2"
            />
          ))}
        </svg>
        {/* Labels */}
        {labelPositions.map((lp, i) => (
          <div
            key={i}
            className="radar-label"
            style={{
              left: `${(lp.x / size) * 100}%`,
              top: `${(lp.y / size) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="radar-label-text">{lp.label}</span>
            <span className="radar-label-value">{lp.value}</span>
          </div>
        ))}
      </div>
    );
  };

  /* ─── Rejected Agents Logic ────────────────────────────────────────── */
  const AGENT_ROLE_MAP: Record<string, string> = {
    Jett: "Duelist", Reyna: "Duelist", Raze: "Duelist", Phoenix: "Duelist",
    Yoru: "Duelist", Neon: "Duelist", Iso: "Duelist", Waylay: "Duelist",
    Omen: "Controller", Brimstone: "Controller", Viper: "Controller",
    Astra: "Controller", Harbor: "Controller", Clove: "Controller",
    Sova: "Initiator", Breach: "Initiator", Skye: "Initiator",
    "KAY/O": "Initiator", Fade: "Initiator", Gekko: "Initiator", Tejo: "Initiator",
    Killjoy: "Sentinel", Cypher: "Sentinel", Sage: "Sentinel",
    Chamber: "Sentinel", Deadlock: "Sentinel", Vyse: "Sentinel",
  };

  const getRejectedAgents = () => {
    if (!profile || !result) return [];
    const bestAgent = result.bestAgent;
    const candidates = profile.topAgents
      .filter((a: { agent: string }) => a.agent !== bestAgent)
      .slice(0, 4);

    const rejected: { agent: string; reason: string }[] = [];
    const { aggression, precision, support } = profile.playstyleScores;

    for (const candidate of candidates) {
      if (rejected.length >= 2) break;
      const role = AGENT_ROLE_MAP[candidate.agent] || "Flex";
      let reason = "";

      // Generate contextual reason
      if (role === "Duelist" && aggression < 40) {
        reason = "Low aggression score doesn't match Duelist requirements";
      } else if (role === "Sentinel" && precision < 35) {
        reason = "Precision too low for effective Sentinel play";
      } else if (role === "Controller" && support < 30) {
        reason = "Support score indicates aggressive playstyle — poor Controller fit";
      } else if (role === "Initiator" && support < 25 && aggression > 60) {
        reason = "Playstyle too aggressive for Initiator role";
      } else if (!profile.agentPool.primary.includes(candidate.agent)) {
        reason = "Outside your primary agent pool — lower comfort level";
      } else if (candidate.kda < (profile.topAgents[0]?.kda || 0) * 0.7) {
        reason = "Significantly lower performance stats compared to main";
      } else {
        reason = `${result.bestAgent} provides better synergy with the team on this map`;
      }

      rejected.push({ agent: candidate.agent, reason });
    }
    return rejected;
  };

  /* ─── Skeleton Loading UI ────────────────────────────────────────────── */
  const renderSkeleton = () => (
    <div className="skeleton-wrapper fade-in-up">
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div className="skeleton-line medium" style={{ margin: "0 auto", height: "24px", width: "280px" }} />
      </div>
      <div className="skeleton-grid">
        <div className="skeleton-card">
          <div className="skeleton-line short" />
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "8px" }}>
            <div className="skeleton-circle" />
            <div style={{ flex: 1 }}>
              <div className="skeleton-line long" />
              <div className="skeleton-line short" />
            </div>
          </div>
          <div className="skeleton-bar" style={{ marginTop: "16px" }} />
        </div>
        <div className="skeleton-card">
          <div className="skeleton-line short" />
          <div className="skeleton-bar" />
          <div className="skeleton-bar" />
          <div className="skeleton-bar" />
          <div className="skeleton-line medium" style={{ marginTop: "12px" }} />
        </div>
      </div>
      <div className="skeleton-card" style={{ marginTop: "4px" }}>
        <div className="skeleton-line short" style={{ marginBottom: "20px" }} />
        <div className="skeleton-team-grid">
          {[...Array(5)].map((_, i) => (
            <div className="skeleton-team-card" key={i}>
              <div className="skeleton-small-circle" />
              <div className="skeleton-line medium" style={{ width: "60%" }} />
              <div className="skeleton-line short" style={{ width: "40%" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const mapSplash = selectedMap ? getMapSplash(selectedMap) : null;
  const mapGradient = selectedMap ? MAP_DATA[selectedMap]?.gradient : null;

  return (
    <>
      {/* ─── Dynamic Map Background ─────────────────────────────────── */}
      <div
        className={`map-background ${mapBgLoaded ? "map-background--visible" : ""}`}
        style={
          mapSplash && mapBgLoaded
            ? { backgroundImage: `url(${mapSplash})` }
            : undefined
        }
      />
      {/* Colored gradient overlay that matches map theme */}
      <div
        className="map-gradient-overlay"
        style={mapGradient ? { background: mapGradient, opacity: 1 } : undefined}
      />
      {/* Dark overlay for readability */}
      <div className="map-dark-overlay" />

      {/* ─── Background Orbs ────────────────────────────────────────── */}
      <div className="bg-orb bg-orb--red" />
      <div className="bg-orb bg-orb--cyan" />
      <div className="bg-orb bg-orb--purple" />

      {/* ─── Animated Grid Lines ────────────────────────────────────── */}
      <div className="grid-lines" />

      {/* ─── Hero Section ───────────────────────────────────────────── */}
      <section className="hero-section container">
        <h1 className="hero-title heading-display fade-in-up">
          <span className="text-gradient">Instalo</span>Lock
        </h1>
        <p className="hero-subtitle fade-in-up delay-1">
          AI-powered agent selection based on your real Valorant stats.
          Get personalized picks, optimal team comps, and map meta insights.
        </p>
        <div className="hero-divider fade-in-up delay-2" />
      </section>

      {/* ─── Form ───────────────────────────────────────────────────── */}
      <div className="container">
        <div className="analyze-form fade-in-up delay-2">
          <div className="form-group">
            <label className="form-label" htmlFor="riot-id">
              Riot ID
            </label>
            <input
              id="riot-id"
              type="text"
              className="input-field"
              placeholder="Username#TAG"
              value={riotId}
              onChange={(e) => setRiotId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="map-select">
              Select Map
            </label>
            <select
              id="map-select"
              className="select-field"
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
            >
              <option value="">Choose a map...</option>
              {MAPS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Analyzing...
              </>
            ) : (
              "⚡ Analyze & Recommend"
            )}
          </button>
        </div>

        {/* ─── Error ──────────────────────────────────────────────── */}
        {error && (
          <div className="error-card fade-in-up">
            <p className="error-text">{error}</p>
          </div>
        )}

        {/* ─── Loading ────────────────────────────────────────────── */}
        {loading && (
          <>
            <div className="loading-overlay">
              <div className="spinner" />
              <p className="loading-text">{LOADING_TIPS[loadingTip]}</p>
              <p className="loading-tips">This may take a few seconds...</p>
            </div>
            {renderSkeleton()}
          </>
        )}

        {/* ─── Results ────────────────────────────────────────────── */}
        {result && !loading && (
          <section className="results-section">
            <div className="results-header fade-in-up">
              <h2 className="heading-display" style={{ fontSize: "1.8rem" }}>
                Your <span className="text-gradient">Analysis</span> for{" "}
                {selectedMap}
              </h2>
            </div>

            {/* Low Data Warning */}
            {result.lowDataWarning && (
              <div className="warning-card glass-card fade-in-up">
                <span>
                  ⚠️ Limited match data available. Recommendations are based on{" "}
                  {profile?.totalGames || "<5"} matches and may improve with
                  more games.
                </span>
              </div>
            )}

            {/* Player Identity Badge */}
            {profile?.identity?.isOnetrick && (
              <div className="identity-card glass-card fade-in-up">
                <span className="identity-icon">🔒</span>
                <span>
                  Identity Locked:{" "}
                  <span className="text-gradient">
                    {profile.identity.lockedAgent}
                  </span>{" "}
                  main ({Math.round(profile.identity.dominanceRatio * 100)}% of
                  recent matches) — team built around you
                </span>
              </div>
            )}

            {/* Best Agent + Playstyle Scores */}
            <div className="results-grid">
              {/* Best Agent Card — with role aura + energy effect */}
              <div className={`glass-card result-card best-agent-card fade-in-up delay-1`}>
                <div className={`energy-overlay ${getAgentEnergyClass(result.bestAgent)}`} />
                <div className="result-card-title">🎯 Best Agent</div>
                <div className="best-agent-display">
                  <div
                    className={`agent-portrait-wrapper ${getRoleClass(result.bestAgentRole)}`}
                  >
                    <div className={`role-aura ${getRoleClass(result.bestAgentRole)}`} />
                    <div className="agent-portrait-ring" />
                    <AgentImage
                      agent={result.bestAgent}
                      role={result.bestAgentRole}
                      size={120}
                      className="agent-portrait"
                    />
                  </div>
                  <div className="best-agent-info">
                    <div className="best-agent-name text-gradient">
                      {result.bestAgent}
                    </div>
                    <span
                      className={`role-badge ${getRoleClass(result.bestAgentRole)}`}
                    >
                      {result.bestAgentRole}
                    </span>
                    <div className="best-agent-meta">
                      <span className="meta-item">
                        <span className="meta-label">Role Fit</span>
                        <span className={`meta-value ${getConfidenceColor(result.confidenceScore)}`}>
                          {getRoleFitLabel(result.confidenceScore)}
                        </span>
                      </span>
                      <span className="meta-divider">·</span>
                      <span className="meta-item">
                        <span className="meta-label">Playstyle Match</span>
                        <span className={`meta-value ${getConfidenceColor(result.confidenceScore)}`}>
                          {getPlaystyleMatchLabel(result.confidenceScore)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                      }}
                    >
                      Confidence
                    </span>
                    <span
                      className={getConfidenceColor(result.confidenceScore)}
                      style={{ fontWeight: 700, fontFamily: "Outfit" }}
                    >
                      {result.confidenceScore}/10 —{" "}
                      {getConfidenceLabel(result.confidenceScore)}
                    </span>
                  </div>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${result.confidenceScore * 10}%`,
                        background: getConfidenceBarColor(
                          result.confidenceScore
                        ),
                      }}
                    />
                  </div>
                </div>
                {/* Agent Pool — moved here from Playstyle card */}
                {profile?.agentPool && (
                  <div className="agent-pool-section">
                    <span className="agent-pool-label">Agent Pool</span>
                    <div className="agent-pool-avatars">
                      {profile.agentPool.primary.map((a: string, i: number) => (
                        <div key={a} className={`agent-pool-avatar-wrapper ${i === 0 ? "most-played" : ""}`}>
                          <AgentImage
                            agent={a}
                            role={AGENT_ROLE_MAP[a] || "Flex"}
                            size={42}
                            className="agent-pool-avatar"
                          />
                          {i === 0 && <span className="most-played-label">Most Played</span>}
                          <span className="agent-pool-avatar-name">{a}</span>
                        </div>
                      ))}
                      {profile.agentPool.secondary.map((a: string) => (
                        <div key={a} className="agent-pool-avatar-wrapper secondary">
                          <AgentImage
                            agent={a}
                            role={AGENT_ROLE_MAP[a] || "Flex"}
                            size={42}
                            className="agent-pool-avatar"
                          />
                          <span className="agent-pool-avatar-name">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Playstyle Scores Card — Radar Chart */}
              {profile && (
                <div className="glass-card result-card fade-in-up delay-2">
                  <div className="result-card-title">📊 Your Playstyle</div>
                  <RadarChart scores={profile.playstyleScores} />
                  <div style={{ marginTop: "18px" }}>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      Preferred Role:{" "}
                    </span>
                    <span
                      className={`role-badge ${getRoleClass(profile.preferredRole)}`}
                    >
                      {profile.preferredRole}
                    </span>
                    <span
                      style={{
                        marginLeft: "12px",
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      ({profile.totalGames} matches analyzed)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Why NOT Other Agents */}
            {(() => {
              const rejected = getRejectedAgents();
              if (rejected.length === 0) return null;
              return (
                <div className="glass-card rejected-agents-card fade-in-up delay-3">
                  <div className="result-card-title">🚫 Why NOT Other Agents?</div>
                  {rejected.map((r) => (
                    <div key={r.agent} className="rejected-agent-item">
                      <div className="rejected-agent-header">
                        <AgentImage
                          agent={r.agent}
                          role={AGENT_ROLE_MAP[r.agent] || "Flex"}
                          size={32}
                          className="rejected-agent-icon"
                        />
                        <span className="rejected-agent-name">❌ Why not {r.agent}?</span>
                      </div>
                      <p className="rejected-agent-reason">{r.reason}</p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Team Composition */}
            <div className="glass-card result-card fade-in-up delay-3">
              <div className="result-card-title">
                🛡️ Optimal Team Composition
              </div>
              <div className="team-grid">
                {result.teamComp.map((member, idx) => (
                  <div
                    key={idx}
                    className={`glass-card agent-card ${getRoleGlowClass(member.role)} ${
                      member.isPlayer ? "is-player" : ""
                    }`}
                  >
                    <AgentImage
                      agent={member.agent}
                      role={member.role}
                      size={60}
                      className="agent-card-portrait"
                    />
                    <div className="agent-name">{member.agent}</div>
                    <span
                      className={`role-badge ${getRoleClass(member.role)}`}
                    >
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reasoning */}
            <div className="reasoning-section">
              <div className="glass-card reasoning-card fade-in-up delay-4">
                <div className="reasoning-label role-duelist">
                  🎯 Why This Agent?
                </div>
                <p className="reasoning-text">
                  {result.reasoning.whyThisAgent}
                </p>
              </div>
              <div className="glass-card reasoning-card fade-in-up delay-5">
                <div className="reasoning-label role-initiator">
                  🛡️ Why This Comp?
                </div>
                <p className="reasoning-text">
                  {result.reasoning.whyThisComp}
                </p>
              </div>
              <div className="glass-card reasoning-card fade-in-up delay-6">
                <div className="reasoning-label role-controller">
                  ⚡ Playstyle Fit
                </div>
                <p className="reasoning-text">
                  {result.reasoning.playstyleFit}
                </p>
              </div>
            </div>

            {/* Meta Insight */}
            <div className="meta-insight-card glass-card fade-in-up delay-7">
              <div className="result-card-title">🌍 Map Meta Insight</div>
              <p className="meta-insight-text">{result.metaInsight}</p>
            </div>
          </section>
        )}
      </div>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="footer container">
        <p className="footer-text">
          InstaloLock — Built with Next.js, OpenAI & Henrik Dev API. Not
          affiliated with Riot Games.
        </p>
      </footer>
    </>
  );
}
