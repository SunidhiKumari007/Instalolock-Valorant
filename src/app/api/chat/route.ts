/* ═══════════════════════════════════════════════════════════════════════════
   Valorant Chatbot — API Route (POST /api/chat)
   Gemini-primary with local knowledge enrichment & conversation memory
   ═══════════════════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import {
  AGENTS,
  MAPS,
  COUNTER_TIPS,
  BEGINNER_AGENTS,
  WEAPONS,
  ABILITIES,
  DEFENSE,
  ECONOMY,
  STRATEGY_TIPS,
} from "@/lib/valorantKnowledge";

/* ─── System Prompt ──────────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are a highly knowledgeable Valorant coach and assistant.

You provide complete, structured, and practical answers about:
• Agents (abilities, counters, playstyle)
• Maps (strategies, best picks)
• Weapons (comparisons, usage)
• Economy (credits, shields, buy rounds)
• Ability costs and loadouts
• Player improvement tips

Rules:
• Always give complete answers, never partial
• For comparisons (e.g., Vandal vs Phantom), explain BOTH sides and give a clear conclusion
• Use reasoning and explain WHY
• Never say "I don't have data" or "I can't help with that"
• Use previous conversation context when answering follow-ups
• Answer like a coach, not a generic chatbot
• Use markdown formatting: **bold** for key terms, bullet points for lists
• Keep answers concise but complete (aim for 100-300 words)
• When discussing agents, mention their role, key abilities, and playstyle
• When discussing economy, include specific credit values
• Always end with a practical takeaway or recommendation
• If the user asks a follow-up like "which is better" or "why", use the conversation history to understand what they're referring to`;

/* ─── Conversation History Type ──────────────────────────────────────────── */
interface HistoryMessage {
  role: "user" | "bot";
  content: string;
}

/* ─── Knowledge Context Builder ──────────────────────────────────────────── */
function buildKnowledgeContext(message: string, history: HistoryMessage[]): string {
  // Combine current message with recent history for broader keyword matching
  const recentText = history
    .slice(-6)
    .map((m) => m.content)
    .join(" ");
  const searchText = (message + " " + recentText).toLowerCase().trim();

  const contextParts: string[] = [];

  // Inject relevant agent data
  const agentKeys = Object.keys(AGENTS);
  for (const key of agentKeys) {
    if (searchText.includes(key) || searchText.includes(AGENTS[key].name.toLowerCase())) {
      const agent = AGENTS[key];
      contextParts.push(
        `[AGENT DATA] ${agent.name}: Role=${agent.role}, Difficulty=${agent.difficulty}, ` +
        `Origin=${agent.origin}, Abilities=[${agent.abilities.join("; ")}], ` +
        `Playstyle="${agent.playstyle}", BestMaps=[${agent.bestMaps.join(", ")}]`
      );

      // Include ability costs if available
      if (ABILITIES[key]) {
        const costs = Object.entries(ABILITIES[key])
          .map(([name, cost]) => `${name}=${cost}`)
          .join(", ");
        contextParts.push(`[ABILITY COSTS] ${agent.name}: ${costs}`);
      }

      // Include counter tips if available
      if (COUNTER_TIPS[key]) {
        const ct = COUNTER_TIPS[key];
        const counters = ct.counters.map(c => `${c.agent}: ${c.tip}`).join("; ");
        const tips = ct.generalTips.join("; ");
        contextParts.push(`[COUNTERS] ${ct.agent}: Counters=[${counters}], Tips=[${tips}]`);
      }
    }
  }

  // Inject relevant map data
  const mapKeys = Object.keys(MAPS);
  for (const key of mapKeys) {
    if (searchText.includes(key)) {
      const map = MAPS[key];
      const agents = map.bestAgents.map(a => `${a.agent} (${a.reason})`).join("; ");
      contextParts.push(
        `[MAP DATA] ${map.name}: Type=${map.type}, Sites=${map.sites}, ` +
        `BestAgents=[${agents}], Tips=[${map.tips.join("; ")}]`
      );
    }
  }

  // Inject weapon data — also check for comparison keywords
  const weaponKeys = Object.keys(WEAPONS);
  const isComparison = /\bvs\b|\bversus\b|\bcompare\b|\bbetter\b|\bor\b/.test(searchText);
  for (const key of weaponKeys) {
    if (searchText.includes(key)) {
      const w = WEAPONS[key];
      contextParts.push(`[WEAPON DATA] ${key}: Type=${w.type}, Cost=${w.cost}, Tip="${w.tip}"`);
    }
  }

  // For weapon comparisons, also inject the two most common rifles if mentioned
  if (isComparison && (searchText.includes("vandal") || searchText.includes("phantom"))) {
    if (!contextParts.some(p => p.includes("[WEAPON DATA] vandal"))) {
      contextParts.push(`[WEAPON DATA] vandal: Type=${WEAPONS.vandal.type}, Cost=${WEAPONS.vandal.cost}, Tip="${WEAPONS.vandal.tip}"`);
    }
    if (!contextParts.some(p => p.includes("[WEAPON DATA] phantom"))) {
      contextParts.push(`[WEAPON DATA] phantom: Type=${WEAPONS.phantom.type}, Cost=${WEAPONS.phantom.cost}, Tip="${WEAPONS.phantom.tip}"`);
    }
  }

  // Inject economy data for economy-related queries
  if (
    /\b(economy|econ|credits?|creds|money|loss bonus|buy|save|force buy|eco round|half buy)\b/.test(searchText)
  ) {
    const r = ECONOMY.rewards;
    const s = ECONOMY.startingCredits;
    contextParts.push(
      `[ECONOMY DATA] MaxCredits=${ECONOMY.maxCredits}, StartingCredits: standard=${s.standard}/overtime=${s.overtime}, ` +
      `Rewards: kill=${r.kill}, spikePlant=${r.spikePlant}, roundWin=${r.roundWin}, ` +
      `roundLoss=${r.roundLoss}, 2ndLossStreak=${r.secondLossStreak}, 3rdLossStreak+=${r.thirdLossStreakPlus}, ` +
      `ReducedLossBonus=${ECONOMY.specialCases.reducedLossBonus.credits} (${ECONOMY.specialCases.reducedLossBonus.conditions.join("; ")})`
    );
  }

  // Inject shield/defense data
  if (/\b(shield|armor|armour|defense|defence|light armor|heavy armor|regen)\b/.test(searchText)) {
    const shields = Object.entries(DEFENSE)
      .map(([key, data]) => `${key}=${data.cost}`)
      .join(", ");
    contextParts.push(`[DEFENSE DATA] Shields: ${shields}`);
  }

  // Inject strategy tips
  if (/\b(strategy|strateg|tip|improve|get better|rank up|how to win|practice|aim|crosshair)\b/.test(searchText)) {
    contextParts.push(`[STRATEGY TIPS] Attack=[${STRATEGY_TIPS.attack.join("; ")}]`);
    contextParts.push(`[STRATEGY TIPS] Defense=[${STRATEGY_TIPS.defense.join("; ")}]`);
    contextParts.push(`[STRATEGY TIPS] General=[${STRATEGY_TIPS.general.join("; ")}]`);
  }

  // Inject beginner data
  if (/\b(beginner|new player|new to valorant|just started|first agent|start with|noob)\b/.test(searchText)) {
    const recs = BEGINNER_AGENTS.map(a => `${a.agent} (${a.role}): ${a.reason}`).join("; ");
    contextParts.push(`[BEGINNER RECS] ${recs}`);
  }

  if (contextParts.length === 0) return "";
  return "\n\n--- REFERENCE DATA (use to ensure accuracy, but supplement with your own knowledge) ---\n" + contextParts.join("\n");
}

/* ─── Build Gemini Conversation History ──────────────────────────────────── */
function buildGeminiHistory(history: HistoryMessage[]) {
  return history.map(msg => ({
    role: msg.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: msg.content }],
  }));
}

/* ─── API Handler ────────────────────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message: string = body.message;
    const history: HistoryMessage[] = body.history || [];

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build knowledge context from local data (searches current message + recent history)
    const knowledgeContext = buildKnowledgeContext(message, history);

    // Gemini is the PRIMARY and ONLY engine
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);

      // Models to try in order — fallback if primary quota is exhausted
      const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash-preview-04-17"];

      // Build conversation history for context (last 5 exchanges = 10 messages)
      const recentHistory = history.slice(-10);
      const geminiHistory = buildGeminiHistory(recentHistory);

      // Append knowledge context to the user message so Gemini has reference data
      const enrichedMessage = knowledgeContext
        ? message + knowledgeContext
        : message;

      let lastError: unknown = null;

      for (const modelName of MODELS) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: SYSTEM_PROMPT,
          });

          const chat = model.startChat({
            history: geminiHistory,
          });

          const result = await chat.sendMessage(enrichedMessage);
          const text = result.response.text();

          return NextResponse.json({
            reply: text || "I'm here to help! Could you rephrase your question about Valorant?",
            source: "gemini",
          });
        } catch (modelErr: unknown) {
          lastError = modelErr;
          const isRateLimit =
            modelErr instanceof Error &&
            (modelErr.message.includes("429") ||
             modelErr.message.includes("quota") ||
             modelErr.message.includes("Too Many Requests") ||
             modelErr.message.includes("RESOURCE_EXHAUSTED"));

          if (isRateLimit) {
            console.log(`[Chat API] ${modelName} rate limited, trying next model...`);
            continue;
          }
          // Non-rate-limit errors — don't try next model
          throw modelErr;
        }
      }

      // All models exhausted
      throw lastError;
    } catch (err: unknown) {
      console.error("[Chat API] Gemini error:", err);

      const isRateLimit =
        err instanceof Error &&
        (err.message.includes("429") ||
         err.message.includes("quota") ||
         err.message.includes("RESOURCE_EXHAUSTED"));

      const reply = isRateLimit
        ? "⚠️ I'm getting a lot of questions right now! Please wait about 30 seconds and try again."
        : "⚠️ I'm having trouble connecting to my AI engine right now. Please try again in a moment!";

      return NextResponse.json({
        reply,
        source: "error",
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Try again!" },
      { status: 500 }
    );
  }
}
