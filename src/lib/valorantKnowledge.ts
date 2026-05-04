/* ═══════════════════════════════════════════════════════════════════════════
   Valorant Chatbot — Structured Knowledge Base
   Local JSON data used for deterministic responses before Gemini enhancement
   ═══════════════════════════════════════════════════════════════════════════ */

export interface AgentInfo {
  name: string;
  role: string;
  difficulty: "Easy" | "Medium" | "Hard";
  origin: string;
  abilities: string[];
  playstyle: string;
  bestMaps: string[];
}

export interface MapInfo {
  name: string;
  type: string;
  sites: number;
  bestAgents: { agent: string; reason: string }[];
  tips: string[];
}

export interface CounterTip {
  agent: string;
  counters: { agent: string; tip: string }[];
  generalTips: string[];
}

/* ─── Agent Data ─────────────────────────────────────────────────────────── */
export const AGENTS: Record<string, AgentInfo> = {
  jett: {
    name: "Jett",
    role: "Duelist",
    difficulty: "Medium",
    origin: "South Korea",
    abilities: ["Cloudburst (smoke)", "Updraft (vertical boost)", "Tailwind (dash)", "Blade Storm (knives ult)"],
    playstyle: "Aggressive entry fragger with high mobility. Dash in, get a kill, dash out.",
    bestMaps: ["Ascent", "Icebox", "Breeze", "Haven"],
  },
  reyna: {
    name: "Reyna",
    role: "Duelist",
    difficulty: "Easy",
    origin: "Mexico",
    abilities: ["Leer (flash)", "Devour (heal)", "Dismiss (invulnerable escape)", "Empress (combat stim ult)"],
    playstyle: "Self-sufficient fragger. Relies on getting kills to activate healing and escape abilities.",
    bestMaps: ["Bind", "Split", "Ascent", "Sunset"],
  },
  raze: {
    name: "Raze",
    role: "Duelist",
    difficulty: "Medium",
    origin: "Brazil",
    abilities: ["Boom Bot (seeking robot)", "Blast Pack (satchel)", "Paint Shells (cluster grenade)", "Showstopper (rocket ult)"],
    playstyle: "Area denial duelist. Excels at clearing tight spaces with explosives.",
    bestMaps: ["Bind", "Split", "Haven", "Fracture"],
  },
  phoenix: {
    name: "Phoenix",
    role: "Duelist",
    difficulty: "Easy",
    origin: "England",
    abilities: ["Blaze (fire wall)", "Curveball (flash)", "Hot Hands (molly)", "Run It Back (respawn ult)"],
    playstyle: "Self-sustaining entry fragger with flashes and healing fire abilities.",
    bestMaps: ["Ascent", "Bind", "Split", "Haven"],
  },
  yoru: {
    name: "Yoru",
    role: "Duelist",
    difficulty: "Hard",
    origin: "Japan",
    abilities: ["Fakeout (decoy)", "Blindside (flash)", "Gatecrash (teleport)", "Dimensional Drift (stealth ult)"],
    playstyle: "Deception-based duelist. Uses teleports and fakes to confuse enemies.",
    bestMaps: ["Bind", "Split", "Icebox"],
  },
  neon: {
    name: "Neon",
    role: "Duelist",
    difficulty: "Hard",
    origin: "Philippines",
    abilities: ["Fast Lane (walls)", "Relay Bolt (stun)", "High Gear (sprint)", "Overdrive (lightning ult)"],
    playstyle: "Speed-based entry. Sprint into sites and overwhelm defenders with pace.",
    bestMaps: ["Fracture", "Breeze", "Lotus"],
  },
  iso: {
    name: "Iso",
    role: "Duelist",
    difficulty: "Medium",
    origin: "China",
    abilities: ["Undercut (debuff)", "Double Tap (shield)", "Contingency (wall)", "Kill Contract (1v1 ult)"],
    playstyle: "Methodical duelist who isolates and wins individual fights.",
    bestMaps: ["Ascent", "Haven", "Lotus"],
  },
  waylay: {
    name: "Waylay",
    role: "Duelist",
    difficulty: "Hard",
    origin: "Thailand",
    abilities: ["Saturate (AOE hinder slow)", "Light Speed (double dash + vertical)", "Refract (teleport back to beacon)", "Convergent Paths (ult with speed boost + expanding AOE hinder beam)"],
    playstyle: "High-mobility entry duelist with built-in escape. Excels at taking space, disrupting enemies, and safely disengaging after fights.",
    bestMaps: ["Ascent", "Split", "Haven", "Sunset"]
  },
  omen: {
    name: "Omen",
    role: "Controller",
    difficulty: "Medium",
    origin: "Unknown",
    abilities: ["Shrouded Step (teleport)", "Paranoia (blind)", "Dark Cover (smoke)", "From the Shadows (global TP ult)"],
    playstyle: "Versatile controller with teleports for flanking and repositioning.",
    bestMaps: ["Ascent", "Haven", "Icebox", "Split"],
  },
  brimstone: {
    name: "Brimstone",
    role: "Controller",
    difficulty: "Easy",
    origin: "USA",
    abilities: ["Stim Beacon (speed boost)", "Incendiary (molly)", "Sky Smoke (smokes)", "Orbital Strike (ult)"],
    playstyle: "Reliable smoker with strong post-plant potential. Simple and effective.",
    bestMaps: ["Bind", "Fracture", "Lotus", "Sunset"],
  },
  viper: {
    name: "Viper",
    role: "Controller",
    difficulty: "Hard",
    origin: "USA",
    abilities: ["Snake Bite (molly)", "Poison Cloud (smoke)", "Toxic Screen (wall)", "Viper's Pit (zone ult)"],
    playstyle: "Area denial specialist. Controls large portions of the map with toxic abilities.",
    bestMaps: ["Breeze", "Icebox", "Lotus", "Bind"],
  },
  astra: {
    name: "Astra",
    role: "Controller",
    difficulty: "Hard",
    origin: "Ghana",
    abilities: ["Gravity Well (pull)", "Nova Pulse (stun)", "Nebula (smoke)", "Cosmic Divide (wall ult)"],
    playstyle: "Global controller who places stars across the map for smokes, stuns, and pulls.",
    bestMaps: ["Ascent", "Haven", "Breeze"],
  },
  harbor: {
    name: "Harbor",
    role: "Controller",
    difficulty: "Medium",
    origin: "India",
    abilities: ["Cascade (wave wall)", "Cove (shield orb)", "High Tide (long wall)", "Reckoning (geyser ult)"],
    playstyle: "Water-based controller who creates moving walls for team pushes.",
    bestMaps: ["Lotus", "Haven", "Breeze"],
  },
  clove: {
    name: "Clove",
    role: "Controller",
    difficulty: "Easy",
    origin: "Scotland",
    abilities: ["Pick-Me-Up (speed on kill)", "Meddle (decay)", "Ruse (smoke — even when dead)", "Not Dead Yet (self-revive ult)"],
    playstyle: "Aggressive controller who can smoke even after dying. Great for entry support.",
    bestMaps: ["Ascent", "Split", "Haven"],
  },
  miks: {
    name: "Miks",
    role: "Controller",
    difficulty: "Medium",
    origin: "Croatia",
    abilities: ["M-Pulse (heal/concuss AOE)", "Harmonize (ally buff link)", "Waveform (smokes)", "Bassquake (soundwave ult with knockback & slow)"],
    playstyle: "Team-oriented controller who supports with healing, concuss, buffs, and fast smokes. Best in coordinated pushes, not ideal for solo aggression.",
    bestMaps: ["Ascent", "Bind", "Split", "Lotus"]
  },
  sova: {
    name: "Sova",
    role: "Initiator",
    difficulty: "Medium",
    origin: "Russia",
    abilities: ["Owl Drone (recon drone)", "Shock Bolt (damage dart)", "Recon Bolt (scan arrow)", "Hunter's Fury (wall-pierce ult)"],
    playstyle: "Intel-based initiator. Reveals enemy positions with recon abilities.",
    bestMaps: ["Ascent", "Bind", "Haven", "Breeze"],
  },
  breach: {
    name: "Breach",
    role: "Initiator",
    difficulty: "Medium",
    origin: "Sweden",
    abilities: ["Aftershock (charge)", "Flashpoint (flash)", "Fault Line (stun)", "Rolling Thunder (ult)"],
    playstyle: "Aggressive initiator who uses wall-penetrating abilities to clear angles.",
    bestMaps: ["Fracture", "Lotus", "Split", "Haven"],
  },
  skye: {
    name: "Skye",
    role: "Initiator",
    difficulty: "Medium",
    origin: "Australia",
    abilities: ["Regrowth (heal)", "Trailblazer (dog scout)", "Guiding Light (flash)", "Seekers (tracking ult)"],
    playstyle: "Versatile initiator with flashes, info gathering, and team healing.",
    bestMaps: ["Ascent", "Bind", "Haven", "Icebox"],
  },
  kayo: {
    name: "KAY/O",
    role: "Initiator",
    difficulty: "Easy",
    origin: "Alternate Timeline Earth",
    abilities: ["FRAG/ment (molly)", "FLASH/drive (flash)", "ZERO/point (suppress knife)", "NULL/cmd (suppress ult)"],
    playstyle: "Anti-ability initiator. Suppresses enemy abilities with knife and ult.",
    bestMaps: ["Ascent", "Bind", "Split", "Icebox"],
  },
  fade: {
    name: "Fade",
    role: "Initiator",
    difficulty: "Medium",
    origin: "Türkiye",
    abilities: ["Prowler (tracking creature)", "Seize (tether)", "Haunt (reveal eye)", "Nightfall (wave ult)"],
    playstyle: "Fear-based initiator who reveals and debuffs enemies through walls.",
    bestMaps: ["Lotus", "Split", "Bind", "Icebox"],
  },
  gekko: {
    name: "Gekko",
    role: "Initiator",
    difficulty: "Easy",
    origin: "USA",
    abilities: ["Mosh Pit (molly)", "Wingman (plant/defuse buddy)", "Dizzy (flash)", "Thrash (stun ult)"],
    playstyle: "Creature-based initiator whose abilities can be picked up and reused.",
    bestMaps: ["Lotus", "Bind", "Split", "Sunset"],
  },
  tejo: {
    name: "Tejo",
    role: "Initiator",
    difficulty: "Medium",
    origin: "Colombia",
    abilities: ["Stealth Drone (recon drone)", "Guided Salvo (precision missile strike to concuss enemies)", "Special Delivery (utility projectile)", "Armageddon (area suppression ult)"],
    playstyle: "Strategic initiator focused on recon and precise utility damage. Excels at setting up teammates and disrupting enemy positions from a distance.",
    bestMaps: ["Ascent", "Breeze", "Haven"]
  },
  killjoy: {
    name: "Killjoy",
    role: "Sentinel",
    difficulty: "Easy",
    origin: "German",
    abilities: ["Nanoswarm (molly)", "Alarmbot (detect)", "Turret (auto-fire)", "Lockdown (detain ult)"],
    playstyle: "Tech-based sentinel who locks down sites with turrets and traps.",
    bestMaps: ["Ascent", "Bind", "Haven", "Split"],
  },
  cypher: {
    name: "Cypher",
    role: "Sentinel",
    difficulty: "Medium",
    origin: "Morocco",
    abilities: ["Trapwire (trip)", "Cyber Cage (slow cage)", "Spycam (camera)", "Neural Theft (reveal ult)"],
    playstyle: "Information sentinel who watches flanks with traps and camera.",
    bestMaps: ["Bind", "Haven", "Ascent", "Split"],
  },
  sage: {
    name: "Sage",
    role: "Sentinel",
    difficulty: "Easy",
    origin: "China",
    abilities: ["Barrier Orb (wall)", "Slow Orb (slow field)", "Healing Orb (heal)", "Resurrection (revive ult)"],
    playstyle: "Team healer and site anchor. Walls off choke points and heals and revives teammates.",
    bestMaps: ["Icebox", "Split", "Bind", "Ascent"],
  },
  chamber: {
    name: "Chamber",
    role: "Sentinel",
    difficulty: "Medium",
    origin: "France",
    abilities: ["Trademark (trap)", "Headhunter (sherrif like pistol with scope)", "Rendezvous (teleport anchor)", "Tour De Force (sniper ult)"],
    playstyle: "Weapon-focused sentinel with a sniper ult and quick escape teleport.",
    bestMaps: ["Breeze", "Icebox", "Ascent"],
  },
  deadlock: {
    name: "Deadlock",
    role: "Sentinel",
    difficulty: "Medium",
    origin: "Norway",
    abilities: ["GravNet (slow trap)", "Sonic Sensor (stun)", "Barrier Mesh (wall)", "Annihilation (cocoon ult)"],
    playstyle: "Lockdown sentinel who traps and immobilizes enemies with barriers.",
    bestMaps: ["Lotus", "Haven", "Split"],
  },
  vyse: {
    name: "Vyse",
    role: "Sentinel",
    difficulty: "Medium",
    origin: "Unknown",
    abilities: ["Arc Rose (trap)", "Shear (wall)", "Razorvine (damage zone)", "Steel Garden (suppress ult, enemies can't equip guns)"],
    playstyle: "Metallic sentinel who creates dangerous zones and suppresses enemies.",
    bestMaps: ["Ascent", "Bind", "Haven"],
  },
  veto: {
    name: "Veto",
    role: "Sentinel",
    difficulty: "Hard",
    origin: "Senegal",
    abilities: ["Interceptor (ability cancel field)", "Crosscut (teleport anchor reposition)", "Chokehold (slow + damage trap)", "Evolution (enhanced form, immune to abilities)"],
    playstyle: "Defensive sentinel who shuts down enemy utility and forces gunfights. Best for anchoring sites and disrupting executes with precise timings.",
    bestMaps: ["Split", "Bind", "Lotus", "Sunset"]
  }
};

/* ─── Map Data ───────────────────────────────────────────────────────────── */
export const MAPS: Record<string, MapInfo> = {
  abyss: {
    name: "Abyss",
    type: "Standard",
    sites: 2,
    bestAgents: [
      { agent: "Omen", reason: "Teleport plays around the open map edges" },
      { agent: "Jett", reason: "Dash allows aggressive plays near the void" },
      { agent: "Sova", reason: "Recon bolt lineups cover large open areas" },
      { agent: "Killjoy", reason: "Turret and traps lock down key chokes" },
    ],
    tips: ["Watch for fall zones — agents with mobility have a big advantage", "Control mid to rotate quickly between sites"],
  },
  ascent: {
    name: "Ascent",
    type: "Standard",
    sites: 2,
    bestAgents: [
      { agent: "Sova", reason: "Excellent recon bolt lineups for both sites" },
      { agent: "Killjoy", reason: "Strong site lockdown with turret on B" },
      { agent: "Omen", reason: "Great smoke spots and teleport flanks through mid" },
      { agent: "Jett", reason: "Strong OPing angles on mid and A site" },
    ],
    tips: ["Mid control is crucial — it connects both sites", "Use catwalk for fast A rotations"],
  },
  bind: {
    name: "Bind",
    type: "Standard",
    sites: 2,
    bestAgents: [
      { agent: "Raze", reason: "Blast packs and grenades clear tight corridors" },
      { agent: "Skye", reason: "Dog and flashes clear hookah and showers" },
      { agent: "Brimstone", reason: "Quick smokes for fast executes" },
      { agent: "Cypher", reason: "Tripwires catch teleporter flanks" },
    ],
    tips: ["No mid — use teleporters for fast rotations", "Hookah and showers are key contested areas"],
  },
  breeze: {
    name: "Breeze",
    type: "Standard",
    sites: 2,
    bestAgents: [
      { agent: "Viper", reason: "Wall and smoke cover massive sightlines" },
      { agent: "Sova", reason: "Long sightlines perfect for recon bolts" },
      { agent: "Chamber", reason: "Sniper ult dominates open areas" },
      { agent: "Jett", reason: "Dash repositions on wide-open sites" },
    ],
    tips: ["Long range engagements are common — use Vandal or OP", "Viper wall is almost essential on this map"],
  },
  corrode: {
    name: "Corrode",
    type: "Standard",
    sites: 2,
    bestAgents: [
      { agent: "Viper", reason: "Toxic abilities thrive in this environment" },
      { agent: "Omen", reason: "Smokes and TPs for rotations" },
      { agent: "Killjoy", reason: "Traps lock down tight chokepoints" },
      { agent: "Fade", reason: "Reveal abilities clear dangerous corners" },
    ],
    tips: ["Map has tight corridors — utility heavy agents shine", "Control mid for rotation flexibility"],
  },
  haven: {
    name: "Haven",
    type: "Standard",
    sites: 3,
    bestAgents: [
      { agent: "Breach", reason: "Flashes and stuns clear multiple tight sites" },
      { agent: "Omen", reason: "3 sites need flexible smoke placement" },
      { agent: "Killjoy", reason: "Lockdown ult is crucial for 3-site defense" },
      { agent: "Sova", reason: "Recon covers C long and A site effectively" },
    ],
    tips: ["3 sites means defenders are spread thin — use fast executes", "C site is often least defended — exploit it"],
  },
  icebox: {
    name: "Icebox",
    type: "Standard",
    sites: 2,
    bestAgents: [
      { agent: "Viper", reason: "Wall and orb control the large B site" },
      { agent: "Sage", reason: "Wall creates new angles on A site" },
      { agent: "Sova", reason: "Recon darts reveal enemies on vertical positions" },
      { agent: "Jett", reason: "Updraft exploits the vertical map design" },
    ],
    tips: ["Vertical gameplay is crucial — use high ground", "B site is massive — coordinate utility usage"],
  },
  lotus: {
    name: "Lotus",
    type: "Standard",
    sites: 3,
    bestAgents: [
      { agent: "Fade", reason: "Prowlers clear rotating doors and tight angles" },
      { agent: "Viper", reason: "Wall cuts off large site areas" },
      { agent: "Breach", reason: "Stuns and flashes clear through doors" },
      { agent: "Killjoy", reason: "Lockdown controls 3-site rotations" },
    ],
    tips: ["Rotating doors create unique flanking opportunities", "3 sites — communication is essential"],
  },
  split: {
    name: "Split",
    type: "Standard",
    sites: 2,
    bestAgents: [
      { agent: "Raze", reason: "Blast packs clear tight corners on both sites" },
      { agent: "Sage", reason: "Wall blocks ramps and mid for strong holds" },
      { agent: "Omen", reason: "Teleport plays through vents and mid" },
      { agent: "Cypher", reason: "Tripwires cover tight corridors" },
    ],
    tips: ["Mid control wins rounds — fight for it", "Ramps are a death trap if not cleared properly"],
  },
  sunset: {
    name: "Sunset",
    type: "Standard",
    sites: 2,
    bestAgents: [
      { agent: "Brimstone", reason: "Quick smokes for mid control" },
      { agent: "Gekko", reason: "Wingman can plant while you hold angles" },
      { agent: "Reyna", reason: "Dismiss is strong in tight mid fights" },
      { agent: "Cypher", reason: "Tripwires cover market and elbow" },
    ],
    tips: ["Mid is the backbone of the map", "Market control gives huge advantages for site takes"],
  },
};

/* ─── Counter Tips ───────────────────────────────────────────────────────── */
export const COUNTER_TIPS: Record<string, CounterTip> = {
  jett: {
    agent: "Jett",
    counters: [
      { agent: "Cypher", tip: "Tripwires catch Jett after she dashes, and cages slow her movement" },
      { agent: "KAY/O", tip: "Suppress knife removes Jett's dash — she can't escape" },
      { agent: "Fade", tip: "Tether prevents Jett from dashing away after a pick" },
    ],
    generalTips: ["Play crossfires — Jett can only dash one direction", "Trade quickly after she gets a pick", "Save utility for after her dash to punish her landing"],
  },
  reyna: {
    agent: "Reyna",
    counters: [
      { agent: "KAY/O", tip: "Suppress stops Reyna's dismiss and devour — she's a sitting duck" },
      { agent: "Fade", tip: "Haunt reveals Reyna even during dismiss" },
      { agent: "Killjoy", tip: "Turret tracks Reyna during her dismiss making repositioning harder" },
    ],
    generalTips: ["Shoot her Leer (flash eye) immediately — it's destructible", "Don't peek her alone — always fight with a teammate to trade", "She's weak if she can't get kills — pressure as a team"],
  },
  raze: {
    agent: "Raze",
    counters: [
      { agent: "Cypher", tip: "Tripwires stop Raze from blast packing into site unseen" },
      { agent: "KAY/O", tip: "Suppress removes Raze's satchels and grenade spam" },
      { agent: "Killjoy", tip: "Alarmbot detects Raze's aggression early" },
    ],
    generalTips: ["Listen for Boom Bot and shoot it immediately", "Spread out to minimize grenade damage", "Don't stack in corners — her utility punishes it hard"],
  },
  omen: {
    agent: "Omen",
    counters: [
      { agent: "Sova", tip: "Recon dart reveals Omen's teleport position" },
      { agent: "Fade", tip: "Haunt tracks Omen after he teleports" },
      { agent: "Cypher", tip: "Tripwires and camera catch flanking TPs" },
    ],
    generalTips: ["Listen for his teleport audio cue to track position", "When he ults, check common behind-you spots", "Clear smokes with utility before pushing through"],
  },
  viper: {
    agent: "Viper",
    counters: [
      { agent: "Breach", tip: "Fault Line stuns through Viper's wall and smoke" },
      { agent: "Sova", tip: "Recon bolt scans through Viper's toxic screen" },
      { agent: "KAY/O", tip: "Suppress knife forces Viper to drop her utility" },
    ],
    generalTips: ["Push through her wall together — don't trickle in one by one", "Her fuel is limited — wait it out if possible", "Destroy her smoke orb if you can to deny re-use"],
  },
  sage: {
    agent: "Sage",
    counters: [
      { agent: "Raze", tip: "Blast packs and grenades destroy Sage's wall quickly" },
      { agent: "Breach", tip: "Aftershock breaks the wall and clears behind it" },
      { agent: "Sova", tip: "Shock bolt destroys the wall and reveals her position" },
    ],
    generalTips: ["Focus fire her wall to break it fast before she rotates", "If she has ult, call out the body she's going to resurrect and watch it", "Slow orbs can be jumped over or avoided with mobility"],
  },
  killjoy: {
    agent: "Killjoy",
    counters: [
      { agent: "Raze", tip: "Boom Bot and grenades clear Killjoy setups without risk" },
      { agent: "Sova", tip: "Recon bolt reveals turret and trap positions" },
      { agent: "Breach", tip: "Aftershock destroys traps through walls" },
    ],
    generalTips: ["Her utility deactivates if she's far away — force rotations", "Shoot the turret immediately — it gives away your position", "Rush through her Lockdown zone before it activates (7 seconds)"],
  },
  sova: {
    agent: "Sova",
    counters: [
      { agent: "Omen", tip: "Paranoia blinds Sova while he's droning or scanning" },
      { agent: "Cypher", tip: "Tripwires catch Sova's drone path" },
      { agent: "Jett", tip: "Dash repositions out of recon dart scan range" },
    ],
    generalTips: ["Shoot the recon bolt immediately — it only gets 2 pulses", "Shoot the drone before it tags you", "Learn common recon bolt lineups and avoid those spots"],
  },
  chamber: {
    agent: "Chamber",
    counters: [
      { agent: "Raze", tip: "Blast pack forces Chamber off his anchor point and away from TP" },
      { agent: "Breach", tip: "Stun goes through walls and disrupts Chamber's aim" },
      { agent: "Fade", tip: "Tether prevents Chamber from teleporting away" },
    ],
    generalTips: ["Destroy his Trademark (trap) to remove his flank watch", "Push him aggressively — his TP has a limited range", "Don't wide peek if he has Tour De Force — play utility"],
  },
};

/* ─── Beginner Recommendations ───────────────────────────────────────────── */
export const BEGINNER_AGENTS = [
  { agent: "Reyna", role: "Duelist", reason: "Simple flash + self-heal. Great for learning to entry frag." },
  { agent: "Phoenix", role: "Duelist", reason: "Self-healing fire walls and a forgiving ult that lets you retry." },
  { agent: "Sage", role: "Sentinel", reason: "Simple kit — heal, wall, slow, revive. Always useful." },
  { agent: "Brimstone", role: "Controller", reason: "Easy smoke placement from the sky. Strong post-plant molly." },
  { agent: "Killjoy", role: "Sentinel", reason: "Set and forget turret + traps. Great for holding sites solo." },
  { agent: "Gekko", role: "Initiator", reason: "Reusable abilities and Wingman can plant/defuse for you." },
  { agent: "Clove", role: "Controller", reason: "Can smoke even after dying. Forgiving for beginners." },
];

/* ─── Weapon Info ─────────────────────────────────────────────────────────── */
export const WEAPONS: Record<string, { type: string; cost: number; tip: string }> = {
  // SIDEARMS
  classic: { type: "Sidearm", cost: 0, tip: "Free pistol. Right-click burst is deadly at close range." },
  shorty: { type: "Sidearm", cost: 300, tip: "Cheap shotgun pistol. Best for close corners and eco plays." },
  frenzy: { type: "Sidearm", cost: 450, tip: "Full-auto pistol. Strong for aggressive pistol rounds." },
  ghost: { type: "Sidearm", cost: 500, tip: "Accurate, affordable sidearm for pistol rounds." },
  bandit: { type: "Sidearm", cost: 600, tip: "Precision semi-auto pistol with one-tap headshot potential. Best for controlled aim and eco rounds." },
  sheriff: { type: "Sidearm", cost: 800, tip: "High damage revolver. One-tap headshot at most ranges." },

  // SMGs
  stinger: { type: "SMG", cost: 1100, tip: "Fast fire rate. Strong in close-range force buys." },
  spectre: { type: "SMG", cost: 1600, tip: "Balanced SMG. Great for run-and-gun at close to mid range." },

  // SHOTGUNS
  bucky: { type: "Shotgun", cost: 850, tip: "Strong at close range. Great for close-range surprise." },
  judge: { type: "Shotgun", cost: 1850, tip: "Automatic shotgun. Dominates tight spaces." },

  // RIFLES
  bulldog: { type: "Rifle", cost: 2050, tip: "Budget rifle. Burst fire is strong when ADS." },
  guardian: { type: "Rifle", cost: 2250, tip: "Semi-auto rifle. One-shot headshot at any range. High damage, rewards precision." },
  phantom: { type: "Rifle", cost: 2900, tip: "No tracers, faster fire rate. Best for spraying through smokes." },
  vandal: { type: "Rifle", cost: 2900, tip: "One-tap headshot at any range. Best for precise aimers." },

  // SNIPER RIFLES
  marshal: { type: "Sniper", cost: 950, tip: "Cheap sniper. One-shot headshot, great for eco rounds." },
  outlaw: { type: "Sniper", cost: 2400, tip: "Double-barrel sniper. Good against light armor enemies." },
  operator: { type: "Sniper", cost: 4700, tip: "One-shot body kill. Best for holding long angles and anti-eco rounds." },

  // MACHINE GUNS
  ares: { type: "Machine Gun", cost: 1600, tip: "High fire rate LMG. Great for spamming through smokes and holding angles." },
  odin: { type: "Machine Gun", cost: 3200, tip: "Heavy LMG. Devastating for wall bangs and holding chokepoints." }
};

/* ─── Ability Costs ──────────────────────────────────────────────────────── */
// For each ability's maximum usage per round, see their individual ability pages for more information.
export const ABILITIES: Record<string, Record<string, number | string>> = {
  astra: { stars: 150 },
  breach: { aftershock: 200, flashpoint: 250 },
  brimstone: { stimBeacon: 200, incendiary: 250, skySmoke: 100 },
  clove: { pickMeUp: 200, meddle: 250, ruse: 150 },
  chamber: { trademark: 200, headhunter: 100 },
  cypher: { trapwire: 200, cyberCage: 100 },
  deadlock: { barrierMesh: 400, sonicSensor: 200 },
  fade: { prowler: 250, seize: 200 },
  gekko: { moshPit: 250, wingman: 300 },
  harbor: { highTide: 300, stormSurge: "TBD" },
  iso: { contingency: 200, undercut: 200 },
  jett: { cloudburst: 200, updraft: 150 },
  kayo: { frag: 200, flash: 250 },
  killjoy: { nanoswarm: 200, alarmbot: 200 },
  miks: { mPulse: 250, harmonize: 200, waveform: 100 },
  neon: { fastLane: 300, relayBolt: 200 },
  omen: { shroudedStep: 100, paranoia: 250, darkCover: 150 },
  phoenix: { blaze: 150, hotHands: 200, curveball: 250 },
  raze: { boomBot: 300, blastPack: 200 },
  reyna: { leer: 250, devourDismiss: 200 },
  sage: { barrierOrb: 400, slowOrb: 200 },
  skye: { regrowth: 150, trailblazer: 300, guidingLight: 250 },
  sova: { owlDrone: 400, shockBolt: 150 },
  tejo: { stealthDrone: 400, specialDelivery: 200, guidedSalvo: 150 },
  veto: { crosscut: 200, chokehold: 200 },
  viper: { snakeBite: 300, poisonCloud: 200 },
  vyse: { razorvine: 150, shear: 200 },
  yoru: { fakeout: 100, blindside: 250, gatecrash: 150 },
};

/* ─── Defense (Shields) ──────────────────────────────────────────────────── */
export const DEFENSE: Record<string, { cost: number }> = {
  lightArmor: { cost: 400 },
  regenShield: { cost: 650 },
  heavyArmor: { cost: 1000 },
};

/* ─── Economy ────────────────────────────────────────────────────────────── */
// A player can only hold a maximum of 9,000 credits.
export const ECONOMY = {
  maxCredits: 9000,

  startingCredits: {
    standard: 800,
    overtime: 5000,
  },

  rewards: {
    kill: 200,
    spikePlant: 300,
    roundWin: 3000,
    roundLoss: 1900,
    secondLossStreak: 2400,
    thirdLossStreakPlus: 2900,
  },

  specialCases: {
    reducedLossBonus: {
      credits: 1000,
      conditions: [
        "Attackers survive without planting the Spike",
        "Attackers plant but fail to detonate before time expires",
        "Defenders survive after Spike detonation",
      ],
    },
  },
};

/* ─── Strategy Tips ──────────────────────────────────────────────────────── */
export const STRATEGY_TIPS = {
  attack: [
    "Default spread before executing — gather info first",
    "Use smokes to block common defender positions before pushing",
    "Trade kills immediately — never let a teammate die for free",
    "Plant for the position you intend to hold post-plant",
    "Save ultimates for clutch rounds or eco rounds",
  ],
  defense: [
    "Don't over-peek — hold angles and let them come to you",
    "Play retake on at least one site — stack the other",
    "Use utility to delay pushes, not just to get kills",
    "Rotate on confirmed info, not on sound alone",
    "Save an ability for post-plant clutch situations",
  ],
  general: [
    "Crosshair placement at head level saves milliseconds in fights",
    "Learn 2-3 agents per role for flexibility in team comps",
    "Economy management: full save after a loss, force-buy only when close to match point",
    "Always communicate enemy positions and your utility usage",
    "Review your deaths — most come from the same few mistakes",
  ],
};
