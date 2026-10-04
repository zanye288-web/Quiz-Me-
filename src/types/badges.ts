import { UserStats } from './quiz';

export type BadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Mythic';
export type BadgeCategory =
  | 'streak'
  | 'mastery'
  | 'volume'
  | 'speed'
  | 'arena'
  | 'wealth'
  | 'scholar'
  | 'special';

export type BadgeIconName =
  | 'Flame'
  | 'Award'
  | 'Crown'
  | 'Zap'
  | 'Target'
  | 'BookOpen'
  | 'Sparkles'
  | 'Shield'
  | 'Compass'
  | 'Trophy'
  | 'Star'
  | 'CheckCircle2'
  | 'Layers'
  | 'GraduationCap';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  requirementText: string;
  tier: BadgeTier;
  category: BadgeCategory;
  iconName: BadgeIconName;
  xpBonus: number;
  checkUnlocked: (stats: UserStats) => boolean;
  getProgress: (stats: UserStats) => { current: number; target: number; percent: number };
}

export const BADGE_CATEGORY_META: Record<
  BadgeCategory,
  { label: string; shortLabel: string; description: string; emoji: string }
> = {
  streak: {
    label: 'Daily Streaks & Consistency',
    shortLabel: 'Streaks',
    description: 'Ignite and sustain unbroken daily study chains across the calendar.',
    emoji: '🔥',
  },
  mastery: {
    label: 'Accuracy & Precision',
    shortLabel: 'Mastery',
    description: 'Demonstrate high-accuracy recall and surgical correctness.',
    emoji: '🎯',
  },
  volume: {
    label: 'Volume & Endurance',
    shortLabel: 'Endurance',
    description: 'Conquer assessments and answer thousands of rigorous questions.',
    emoji: '📚',
  },
  speed: {
    label: 'XP & Scholar Levels',
    shortLabel: 'XP & Levels',
    description: 'Ascend through Scholar Levels and accumulate massive experience.',
    emoji: '⚡',
  },
  arena: {
    label: 'Kahoot! Live Battle Arena',
    shortLabel: 'Live Arena',
    description: 'Dominate synchronous multiplayer battles, podiums, and speed rounds.',
    emoji: '👑',
  },
  wealth: {
    label: 'Gem Treasury & Economy',
    shortLabel: 'Treasury',
    description: 'Build your scholar vault with earned gems, bonuses, and multipliers.',
    emoji: '💎',
  },
  scholar: {
    label: 'Polymath & Domain Mastery',
    shortLabel: 'Polymath',
    description: 'Master cognitive taxonomies, STEM, humanities, and analytical logic.',
    emoji: '🎓',
  },
  special: {
    label: 'Special & Secret Honours',
    shortLabel: 'Special',
    description: 'Rare combination feats, synergy milestones, and legendary accolades.',
    emoji: '✨',
  },
};

// Core Signature Achievements (Preserving original IDs + expanding to 1,050+ total achievements)
const SIGNATURE_BADGES: BadgeDefinition[] = [
  // --- STREAK BADGES ---
  {
    id: 'streak_3',
    title: 'Spark Ignited',
    description: 'Maintained a 3-day learning streak. Consistency is the secret to retention!',
    requirementText: 'Reach a 3-day study streak',
    tier: 'Bronze',
    category: 'streak',
    iconName: 'Flame',
    xpBonus: 50,
    checkUnlocked: (stats) => stats.streak >= 3,
    getProgress: (stats) => ({
      current: Math.min(stats.streak, 3),
      target: 3,
      percent: Math.min(100, Math.round((stats.streak / 3) * 100)),
    }),
  },
  {
    id: 'streak_7',
    title: 'Week-Long Warrior',
    description: '7 consecutive days of active recall and mastery practice.',
    requirementText: 'Reach a 7-day study streak',
    tier: 'Silver',
    category: 'streak',
    iconName: 'Flame',
    xpBonus: 150,
    checkUnlocked: (stats) => stats.streak >= 7,
    getProgress: (stats) => ({
      current: Math.min(stats.streak, 7),
      target: 7,
      percent: Math.min(100, Math.round((stats.streak / 7) * 100)),
    }),
  },
  {
    id: 'streak_14',
    title: 'Fortnight Flame',
    description: 'Two full weeks of unbroken scholarly dedication.',
    requirementText: 'Reach a 14-day study streak',
    tier: 'Gold',
    category: 'streak',
    iconName: 'Flame',
    xpBonus: 300,
    checkUnlocked: (stats) => stats.streak >= 14,
    getProgress: (stats) => ({
      current: Math.min(stats.streak, 14),
      target: 14,
      percent: Math.min(100, Math.round((stats.streak / 14) * 100)),
    }),
  },
  {
    id: 'streak_30',
    title: 'Unstoppable Scholar',
    description: '30 days of continuous intellectual growth. You are in the top 1% of learners.',
    requirementText: 'Reach a 30-day study streak',
    tier: 'Diamond',
    category: 'streak',
    iconName: 'Crown',
    xpBonus: 750,
    checkUnlocked: (stats) => stats.streak >= 30,
    getProgress: (stats) => ({
      current: Math.min(stats.streak, 30),
      target: 30,
      percent: Math.min(100, Math.round((stats.streak / 30) * 100)),
    }),
  },

  // --- VOLUME & ENDURANCE BADGES ---
  {
    id: 'quiz_1',
    title: 'First Steps',
    description: 'Completed your very first AI-generated assessment.',
    requirementText: 'Complete 1 assessment',
    tier: 'Bronze',
    category: 'volume',
    iconName: 'BookOpen',
    xpBonus: 50,
    checkUnlocked: (stats) => stats.quizzesCompleted >= 1,
    getProgress: (stats) => ({
      current: Math.min(stats.quizzesCompleted, 1),
      target: 1,
      percent: Math.min(100, Math.round((stats.quizzesCompleted / 1) * 100)),
    }),
  },
  {
    id: 'quiz_5',
    title: 'Dedicated Assessor',
    description: 'Completed 5 full assessments across your study sessions.',
    requirementText: 'Complete 5 assessments',
    tier: 'Silver',
    category: 'volume',
    iconName: 'BookOpen',
    xpBonus: 150,
    checkUnlocked: (stats) => stats.quizzesCompleted >= 5,
    getProgress: (stats) => ({
      current: Math.min(stats.quizzesCompleted, 5),
      target: 5,
      percent: Math.min(100, Math.round((stats.quizzesCompleted / 5) * 100)),
    }),
  },
  {
    id: 'quiz_15',
    title: 'Knowledge Architect',
    description: 'Conquered 15 assessments, building a formidable neural network of concepts.',
    requirementText: 'Complete 15 assessments',
    tier: 'Gold',
    category: 'volume',
    iconName: 'Layers',
    xpBonus: 350,
    checkUnlocked: (stats) => stats.quizzesCompleted >= 15,
    getProgress: (stats) => ({
      current: Math.min(stats.quizzesCompleted, 15),
      target: 15,
      percent: Math.min(100, Math.round((stats.quizzesCompleted / 15) * 100)),
    }),
  },
  {
    id: 'quiz_30',
    title: 'Grandmaster of Inquiry',
    description: '30 completed assessments! Your mastery over diverse topics is legendary.',
    requirementText: 'Complete 30 assessments',
    tier: 'Diamond',
    category: 'volume',
    iconName: 'Trophy',
    xpBonus: 800,
    checkUnlocked: (stats) => stats.quizzesCompleted >= 30,
    getProgress: (stats) => ({
      current: Math.min(stats.quizzesCompleted, 30),
      target: 30,
      percent: Math.min(100, Math.round((stats.quizzesCompleted / 30) * 100)),
    }),
  },

  // --- MASTERY & PRECISION BADGES ---
  {
    id: 'correct_10',
    title: 'Sharp Mind',
    description: 'Answered 10 assessment questions accurately.',
    requirementText: 'Get 10 correct answers',
    tier: 'Bronze',
    category: 'mastery',
    iconName: 'CheckCircle2',
    xpBonus: 75,
    checkUnlocked: (stats) => stats.totalCorrect >= 10,
    getProgress: (stats) => ({
      current: Math.min(stats.totalCorrect, 10),
      target: 10,
      percent: Math.min(100, Math.round((stats.totalCorrect / 10) * 100)),
    }),
  },
  {
    id: 'correct_50',
    title: 'Precision Tactician',
    description: 'Demonstrated deep comprehension across 50 verified correct answers.',
    requirementText: 'Get 50 correct answers',
    tier: 'Silver',
    category: 'mastery',
    iconName: 'Target',
    xpBonus: 200,
    checkUnlocked: (stats) => stats.totalCorrect >= 50,
    getProgress: (stats) => ({
      current: Math.min(stats.totalCorrect, 50),
      target: 50,
      percent: Math.min(100, Math.round((stats.totalCorrect / 50) * 100)),
    }),
  },
  {
    id: 'correct_100',
    title: 'Centurion of Truth',
    description: '100 accurate solutions! You dissect complex problems with surgical precision.',
    requirementText: 'Get 100 correct answers',
    tier: 'Gold',
    category: 'mastery',
    iconName: 'Award',
    xpBonus: 450,
    checkUnlocked: (stats) => stats.totalCorrect >= 100,
    getProgress: (stats) => ({
      current: Math.min(stats.totalCorrect, 100),
      target: 100,
      percent: Math.min(100, Math.round((stats.totalCorrect / 100) * 100)),
    }),
  },
  {
    id: 'accuracy_90',
    title: 'Virtuoso Precision',
    description: 'Maintained a 90%+ global accuracy rate with at least 20 questions answered.',
    requirementText: '90%+ accuracy (min 20 questions)',
    tier: 'Diamond',
    category: 'mastery',
    iconName: 'GraduationCap',
    xpBonus: 600,
    checkUnlocked: (stats) => {
      if (stats.totalQuestions < 20) return false;
      const acc = (stats.totalCorrect / stats.totalQuestions) * 100;
      return acc >= 90;
    },
    getProgress: (stats) => {
      if (stats.totalQuestions < 20) {
        return {
          current: stats.totalQuestions,
          target: 20,
          percent: Math.min(99, Math.round((stats.totalQuestions / 20) * 100)),
        };
      }
      const acc = Math.round((stats.totalCorrect / stats.totalQuestions) * 100);
      return {
        current: Math.min(acc, 90),
        target: 90,
        percent: Math.min(100, Math.round((acc / 90) * 100)),
      };
    },
  },

  // --- XP & LEVEL BADGES ---
  {
    id: 'xp_500',
    title: 'Rising Star',
    description: 'Earned 500 Experience Points through active study and quizzes.',
    requirementText: 'Earn 500 Total XP',
    tier: 'Bronze',
    category: 'speed',
    iconName: 'Zap',
    xpBonus: 100,
    checkUnlocked: (stats) => stats.xp >= 500,
    getProgress: (stats) => ({
      current: Math.min(stats.xp, 500),
      target: 500,
      percent: Math.min(100, Math.round((stats.xp / 500) * 100)),
    }),
  },
  {
    id: 'xp_1500',
    title: 'Kinetic Dynamo',
    description: 'Surpassed 1,500 XP! Your momentum is accelerating rapidly.',
    requirementText: 'Earn 1,500 Total XP',
    tier: 'Silver',
    category: 'speed',
    iconName: 'Zap',
    xpBonus: 250,
    checkUnlocked: (stats) => stats.xp >= 1500,
    getProgress: (stats) => ({
      current: Math.min(stats.xp, 1500),
      target: 1500,
      percent: Math.min(100, Math.round((stats.xp / 1500) * 100)),
    }),
  },
  {
    id: 'xp_3000',
    title: 'Apex Luminary',
    description: '3,000+ XP amassed! You radiate scholarly excellence.',
    requirementText: 'Earn 3,000 Total XP',
    tier: 'Gold',
    category: 'speed',
    iconName: 'Sparkles',
    xpBonus: 500,
    checkUnlocked: (stats) => stats.xp >= 3000,
    getProgress: (stats) => ({
      current: Math.min(stats.xp, 3000),
      target: 3000,
      percent: Math.min(100, Math.round((stats.xp / 3000) * 100)),
    }),
  },
  {
    id: 'level_10',
    title: 'Decagon Sage',
    description: 'Reached Scholar Level 10 through relentless dedication and high scores.',
    requirementText: 'Reach Scholar Level 10',
    tier: 'Diamond',
    category: 'special',
    iconName: 'Crown',
    xpBonus: 1000,
    checkUnlocked: (stats) => stats.level >= 10,
    getProgress: (stats) => ({
      current: Math.min(stats.level, 10),
      target: 10,
      percent: Math.min(100, Math.round((stats.level / 10) * 100)),
    }),
  },
  {
    id: 'gems_250',
    title: 'Treasure Hoarder',
    description: 'Accumulated 250 Gems from flawless streaks and quiz completions.',
    requirementText: 'Collect 250 Gems',
    tier: 'Silver',
    category: 'wealth',
    iconName: 'Sparkles',
    xpBonus: 200,
    checkUnlocked: (stats) => stats.gems >= 250,
    getProgress: (stats) => ({
      current: Math.min(stats.gems, 250),
      target: 250,
      percent: Math.min(100, Math.round((stats.gems / 250) * 100)),
    }),
  },
  {
    id: 'gems_500',
    title: ' Sovereign Vault',
    description: 'Amassed 500+ Gems in your personal scholar treasury.',
    requirementText: 'Collect 500 Gems',
    tier: 'Gold',
    category: 'wealth',
    iconName: 'Trophy',
    xpBonus: 450,
    checkUnlocked: (stats) => stats.gems >= 500,
    getProgress: (stats) => ({
      current: Math.min(stats.gems, 500),
      target: 500,
      percent: Math.min(100, Math.round((stats.gems / 500) * 100)),
    }),
  },
];

// ============================================================================
// PROCEDURAL 1,050+ ACHIEVEMENTS GENERATOR
// Creates rich, distinct, pedagogically & competitively themed achievements
// ============================================================================

function getTierForProgress(ratio: number): BadgeTier {
  if (ratio < 0.22) return 'Bronze';
  if (ratio < 0.48) return 'Silver';
  if (ratio < 0.75) return 'Gold';
  if (ratio < 0.92) return 'Diamond';
  return 'Mythic';
}

function build1000PlusAchievements(): BadgeDefinition[] {
  const catalog: BadgeDefinition[] = [...SIGNATURE_BADGES];
  const existingIds = new Set(catalog.map((b) => b.id));

  const addBadge = (badge: BadgeDefinition) => {
    if (!existingIds.has(badge.id)) {
      existingIds.add(badge.id);
      catalog.push(badge);
    }
  };

  // 1. DAILY STREAK CHRONICLES (Days 1 to 180 -> 160 achievements)
  const streakPrefixes = [
    'Ember',
    'Torch',
    'Beacon',
    'Solar',
    'Supernova',
    'Phoenix',
    'Starlight',
    'Hyperion',
    'Chronos',
    'Eternal',
  ];
  const streakNouns = [
    'Initiate',
    'Keeper',
    'Vanguard',
    'Sentinel',
    'Pathfinder',
    'Voyager',
    'Luminary',
    'Commander',
    'Archon',
    'Immortal',
  ];

  for (let day = 1; day <= 165; day++) {
    if ([3, 7, 14, 30].includes(day)) continue;
    const ratio = day / 165;
    const tier = getTierForProgress(ratio);
    const prefix = streakPrefixes[(day - 1) % streakPrefixes.length];
    const noun = streakNouns[Math.floor((day - 1) / 17) % streakNouns.length];
    const targetDay = day;

    addBadge({
      id: `streak_milestone_${targetDay}`,
      title: `${prefix} ${noun} • Day ${targetDay}`,
      description: `Sustained an unbroken ${targetDay}-day active learning streak through disciplined daily recall.`,
      requirementText: `Reach a ${targetDay}-day study streak`,
      tier,
      category: 'streak',
      iconName: day % 5 === 0 ? 'Crown' : 'Flame',
      xpBonus: Math.round(25 + targetDay * 15),
      checkUnlocked: (stats) => stats.streak >= targetDay,
      getProgress: (stats) => ({
        current: Math.min(stats.streak, targetDay),
        target: targetDay,
        percent: Math.min(100, Math.round((stats.streak / targetDay) * 100)),
      }),
    });
  }

  // 2. ASSESSMENT EXPEDITION VOLUME (Quizzes Completed: 2 to 200 -> 185 achievements)
  const volumeAdjectives = [
    'Curious',
    'Relentless',
    'Methodical',
    'Intrepid',
    'Vigilant',
    'Eminent',
    'Sovereign',
    'Apex',
    'Transcendent',
    'Omniscient',
  ];
  const volumeRoles = [
    'Explorer',
    'Cartographer',
    'Investigator',
    'Scholar',
    'Synthesizer',
    'Strategist',
    'Academician',
    'Chancellor',
    'Oracle',
    'Titan',
  ];

  for (let qCount = 2; qCount <= 190; qCount++) {
    if ([1, 5, 15, 30].includes(qCount)) continue;
    const ratio = qCount / 190;
    const tier = getTierForProgress(ratio);
    const adj = volumeAdjectives[(qCount - 1) % volumeAdjectives.length];
    const role = volumeRoles[Math.floor((qCount - 1) / 19) % volumeRoles.length];
    const targetQuizzes = qCount;

    addBadge({
      id: `volume_quiz_${targetQuizzes}`,
      title: `${adj} ${role} (${targetQuizzes} Quizzes)`,
      description: `Completed ${targetQuizzes} full assessments across the AI Quiz Studio and Curated Tracks.`,
      requirementText: `Complete ${targetQuizzes} assessments`,
      tier,
      category: 'volume',
      iconName: qCount % 4 === 0 ? 'Trophy' : qCount % 2 === 0 ? 'Layers' : 'BookOpen',
      xpBonus: Math.round(40 + targetQuizzes * 12),
      checkUnlocked: (stats) => stats.quizzesCompleted >= targetQuizzes,
      getProgress: (stats) => ({
        current: Math.min(stats.quizzesCompleted, targetQuizzes),
        target: targetQuizzes,
        percent: Math.min(100, Math.round((stats.quizzesCompleted / targetQuizzes) * 100)),
      }),
    });
  }

  // 3. PRECISION & VERIFIED CORRECT ANSWERS (5 to 1,800 correct answers -> 180 achievements)
  const masteryTitles = [
    'Sharp Resolver',
    'Logic Weaver',
    'Concept Sniper',
    'Truth Seeker',
    'Axiom Breaker',
    'Proof Master',
    'Neural Architect',
    'Cognition Virtuoso',
    'Grand Arbiter',
    'Prime Savant',
  ];

  for (let i = 1; i <= 180; i++) {
    const targetCorrect = i <= 40 ? i * 5 : 200 + (i - 40) * 10;
    if ([10, 50, 100].includes(targetCorrect)) continue;
    const ratio = i / 180;
    const tier = getTierForProgress(ratio);
    const titleBase = masteryTitles[(i - 1) % masteryTitles.length];
    const numeral = Math.floor((i - 1) / 10) + 1;

    addBadge({
      id: `mastery_correct_${targetCorrect}`,
      title: `${titleBase} Tier ${numeral} (${targetCorrect}✓)`,
      description: `Solved ${targetCorrect.toLocaleString()} questions accurately with verified conceptual understanding.`,
      requirementText: `Get ${targetCorrect.toLocaleString()} correct answers`,
      tier,
      category: 'mastery',
      iconName: i % 3 === 0 ? 'Target' : i % 2 === 0 ? 'CheckCircle2' : 'Award',
      xpBonus: Math.round(30 + i * 10),
      checkUnlocked: (stats) => stats.totalCorrect >= targetCorrect,
      getProgress: (stats) => ({
        current: Math.min(stats.totalCorrect, targetCorrect),
        target: targetCorrect,
        percent: Math.min(100, Math.round((stats.totalCorrect / targetCorrect) * 100)),
      }),
    });
  }

  // 4. XP VELOCITY & ASCENSION MILESTONES (100 XP to 100,000 XP -> 160 achievements)
  const xpRanks = [
    'Kinetic Spark',
    'Pulse Runner',
    'Momentum Surge',
    'Velocity Striker',
    'Warp Scholar',
    'Quantum Sprinter',
    'Astral Voyager',
    'Celestial Engine',
    'Hyperdrive Savant',
    'Galactic Apex',
  ];

  for (let i = 1; i <= 160; i++) {
    const targetXp = i <= 30 ? i * 100 : 3000 + (i - 30) * 450;
    if ([500, 1500, 3000].includes(targetXp)) continue;
    const ratio = i / 160;
    const tier = getTierForProgress(ratio);
    const rankName = xpRanks[(i - 1) % xpRanks.length];

    addBadge({
      id: `xp_milestone_${targetXp}`,
      title: `${rankName} • ${targetXp.toLocaleString()} XP`,
      description: `Accumulated ${targetXp.toLocaleString()} total Experience Points through high-speed recall and mastery.`,
      requirementText: `Earn ${targetXp.toLocaleString()} Total XP`,
      tier,
      category: 'speed',
      iconName: i % 4 === 0 ? 'Sparkles' : 'Zap',
      xpBonus: Math.round(50 + i * 8),
      checkUnlocked: (stats) => stats.xp >= targetXp,
      getProgress: (stats) => ({
        current: Math.min(stats.xp, targetXp),
        target: targetXp,
        percent: Math.min(100, Math.round((stats.xp / targetXp) * 100)),
      }),
    });
  }

  // 5. SCHOLAR LEVEL PRESTIGE RANKS (Level 2 to Level 125 -> 122 achievements)
  const levelOrders = [
    'Novice of the Lyceum',
    'Acolyte of Reason',
    'Fellow of Inquiry',
    'Dean of Synthesis',
    'Provost of Logic',
    'Magister of Sciences',
    'Archmage of Pedagogy',
    'Grand Luminary',
    'Supreme Polymath',
    'Astral Paragon',
  ];

  for (let lvl = 2; lvl <= 125; lvl++) {
    if (lvl === 10) continue;
    const ratio = lvl / 125;
    const tier = getTierForProgress(ratio);
    const orderName = levelOrders[(lvl - 2) % levelOrders.length];

    addBadge({
      id: `scholar_level_${lvl}`,
      title: `Level ${lvl}: ${orderName}`,
      description: `Ascended to Scholar Level ${lvl} by demonstrating sustained excellence across assessments.`,
      requirementText: `Reach Scholar Level ${lvl}`,
      tier,
      category: 'speed',
      iconName: lvl % 5 === 0 ? 'Crown' : 'GraduationCap',
      xpBonus: lvl * 25,
      checkUnlocked: (stats) => stats.level >= lvl,
      getProgress: (stats) => ({
        current: Math.min(stats.level, lvl),
        target: lvl,
        percent: Math.min(100, Math.round((stats.level / lvl) * 100)),
      }),
    });
  }

  // 6. GEM TREASURY & ECONOMY HONOURS (10 Gems to 12,000 Gems -> 100 achievements)
  const gemTitles = [
    'Crystal Collector',
    'Sapphire Keeper',
    'Emerald Curator',
    'Ruby Sovereign',
    'Amethyst Baron',
    'Topaz Chancellor',
    'Opal Magnate',
    'Obsidian Banker',
    'Celestial Jeweler',
    'Imperial Treasurer',
  ];

  for (let i = 1; i <= 100; i++) {
    const targetGems = i <= 25 ? i * 20 : 500 + (i - 25) * 100;
    if ([250, 500].includes(targetGems)) continue;
    const ratio = i / 100;
    const tier = getTierForProgress(ratio);
    const gemTitle = gemTitles[(i - 1) % gemTitles.length];

    addBadge({
      id: `treasury_gems_${targetGems}`,
      title: `${gemTitle} (${targetGems.toLocaleString()} Gems)`,
      description: `Stored ${targetGems.toLocaleString()} shimmering Gems in your scholar vault from quiz victories.`,
      requirementText: `Collect ${targetGems.toLocaleString()} Gems`,
      tier,
      category: 'wealth',
      iconName: i % 3 === 0 ? 'Crown' : 'Sparkles',
      xpBonus: Math.round(40 + i * 10),
      checkUnlocked: (stats) => stats.gems >= targetGems,
      getProgress: (stats) => ({
        current: Math.min(stats.gems, targetGems),
        target: targetGems,
        percent: Math.min(100, Math.round((stats.gems / targetGems) * 100)),
      }),
    });
  }

  // 7. KAHOOT! LIVE ARENA & COMPETITIVE BATTLES (75 achievements)
  const arenaTitles = [
    'Triangle Tactician ▲',
    'Diamond Striker ◆',
    'Circle Virtuoso ●',
    'Square Guardian ■',
    'Podium Climber',
    'Arena Speedster',
    'Lobby Hype Master',
    'Double Points Ace',
    'Streak Shield Hero',
    'Grand Kahoot! Champion',
  ];

  for (let i = 1; i <= 75; i++) {
    const ratio = i / 75;
    const tier = getTierForProgress(ratio);
    const arenaTitle = arenaTitles[(i - 1) % arenaTitles.length];
    const reqQuizzes = Math.max(1, Math.ceil(i * 1.5));
    const reqXp = i * 120;

    addBadge({
      id: `arena_champion_${i}`,
      title: `${arenaTitle} #${i}`,
      description: `Mastered fast-paced Kahoot!-style geometric reflex challenges with ${reqXp.toLocaleString()}+ XP and ${reqQuizzes}+ completed sessions.`,
      requirementText: `Complete ${reqQuizzes} quizzes & earn ${reqXp.toLocaleString()} XP`,
      tier,
      category: 'arena',
      iconName: i % 3 === 0 ? 'Crown' : i % 2 === 0 ? 'Trophy' : 'Zap',
      xpBonus: 75 + i * 15,
      checkUnlocked: (stats) => stats.quizzesCompleted >= reqQuizzes && stats.xp >= reqXp,
      getProgress: (stats) => {
        const qPct = Math.min(1, stats.quizzesCompleted / reqQuizzes);
        const xPct = Math.min(1, stats.xp / reqXp);
        const combined = Math.round(((qPct + xPct) / 2) * 100);
        return {
          current: Math.min(stats.quizzesCompleted, reqQuizzes),
          target: reqQuizzes,
          percent: Math.min(100, combined),
        };
      },
    });
  }

  // 8. POLYMATH COGNITIVE & PRECISION SYNERGY (65 achievements)
  const cognitiveDomains = [
    'Foundational Recall',
    'Applied Logic',
    'Syntax & Execution',
    'Analytical Reasoning',
    'Edge Case Synthesis',
    'Socratic Inquiry',
    'Bloom Taxonomy Mastery',
    'Empirical Deduction',
    'Algorithmic Thinking',
    'Cross-Disciplinary Genius',
  ];

  for (let i = 1; i <= 65; i++) {
    const ratio = i / 65;
    const tier = getTierForProgress(ratio);
    const domainName = cognitiveDomains[(i - 1) % cognitiveDomains.length];
    const minQuestions = i * 8;
    const minAccuracy = Math.min(96, 65 + Math.floor(i / 2));

    addBadge({
      id: `polymath_synergy_${i}`,
      title: `${domainName} Laureate ${ RomanNumeral(Math.ceil(i / 10)) }`,
      description: `Sustained ${minAccuracy}%+ accuracy across at least ${minQuestions} total assessment questions.`,
      requirementText: `${minAccuracy}%+ accuracy over ${minQuestions} questions`,
      tier,
      category: 'scholar',
      iconName: i % 2 === 0 ? 'GraduationCap' : 'Target',
      xpBonus: 90 + i * 15,
      checkUnlocked: (stats) => {
        if (stats.totalQuestions < minQuestions) return false;
        const acc = (stats.totalCorrect / stats.totalQuestions) * 100;
        return acc >= minAccuracy;
      },
      getProgress: (stats) => {
        if (stats.totalQuestions < minQuestions) {
          return {
            current: stats.totalQuestions,
            target: minQuestions,
            percent: Math.min(99, Math.round((stats.totalQuestions / minQuestions) * 100)),
          };
        }
        const acc = Math.round((stats.totalCorrect / stats.totalQuestions) * 100);
        return {
          current: Math.min(acc, minAccuracy),
          target: minAccuracy,
          percent: Math.min(100, Math.round((acc / minAccuracy) * 100)),
        };
      },
    });
  }

  // 9. SPECIAL & SECRET SYNERGY HONOURS (45 achievements)
  const specialSynergies = [
    'Midnight Oil Scholar',
    'Golden Ratio Perfectionist',
    'Triad of Mastery',
    'Renaissance Visionary',
    'Nexus Architect',
    'Infinite Curiosity',
    'Quantum Leap',
    'Zenith Philosopher',
    'Starforge Mentor',
  ];

  for (let i = 1; i <= 45; i++) {
    const ratio = i / 45;
    const tier = getTierForProgress(ratio);
    const synName = specialSynergies[(i - 1) % specialSynergies.length];
    const reqStreak = Math.max(1, Math.ceil(i / 3));
    const reqCorrect = i * 12;
    const reqGems = i * 15;

    addBadge({
      id: `special_synergy_${i}`,
      title: `${synName} • Opus ${i}`,
      description: `Achieved a rare scholarly trifecta: ${reqStreak}d streak, ${reqCorrect} correct answers, and ${reqGems} Gems.`,
      requirementText: `${reqStreak}d streak + ${reqCorrect}✓ + ${reqGems} Gems`,
      tier,
      category: 'special',
      iconName: i % 3 === 0 ? 'Crown' : 'Sparkles',
      xpBonus: 120 + i * 20,
      checkUnlocked: (stats) =>
        stats.streak >= reqStreak && stats.totalCorrect >= reqCorrect && stats.gems >= reqGems,
      getProgress: (stats) => {
        const p1 = Math.min(1, stats.streak / reqStreak);
        const p2 = Math.min(1, stats.totalCorrect / reqCorrect);
        const p3 = Math.min(1, stats.gems / reqGems);
        return {
          current: Math.min(stats.totalCorrect, reqCorrect),
          target: reqCorrect,
          percent: Math.min(100, Math.round(((p1 + p2 + p3) / 3) * 100)),
        };
      },
    });
  }

  return catalog;
}

function RomanNumeral(num: number): string {
  const map: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let n = Math.max(1, num);
  let res = '';
  for (const [val, sym] of map) {
    while (n >= val) {
      res += sym;
      n -= val;
    }
  }
  return res;
}

export const BADGE_CATALOG: BadgeDefinition[] = build1000PlusAchievements();

export const BADGE_TIER_CONFIG: Record<
  BadgeTier,
  {
    gradient: string;
    border: string;
    badgeBg: string;
    text: string;
    glow: string;
    glowColor: string;
  }
> = {
  Bronze: {
    gradient: 'from-amber-600 via-orange-500 to-amber-700',
    border: 'border-amber-500/40 dark:border-amber-500/30',
    badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-amber-500/20',
    glowColor: 'rgba(245, 158, 11, 0.45)',
  },
  Silver: {
    gradient: 'from-slate-300 via-slate-400 to-slate-500',
    border: 'border-slate-400/50 dark:border-slate-500/40',
    badgeBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-400/30',
    text: 'text-slate-600 dark:text-slate-300',
    glow: 'shadow-slate-400/25',
    glowColor: 'rgba(148, 163, 184, 0.45)',
  },
  Gold: {
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    border: 'border-yellow-400/60 dark:border-amber-400/40',
    badgeBg: 'bg-yellow-500/15 text-amber-800 dark:text-yellow-300 border-yellow-500/40',
    text: 'text-amber-500 dark:text-yellow-400',
    glow: 'shadow-yellow-500/30',
    glowColor: 'rgba(234, 179, 8, 0.55)',
  },
  Diamond: {
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    border: 'border-indigo-400/60 dark:border-purple-400/50',
    badgeBg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40',
    text: 'text-indigo-600 dark:text-indigo-400',
    glow: 'shadow-indigo-500/35',
    glowColor: 'rgba(99, 102, 241, 0.6)',
  },
  Mythic: {
    gradient: 'from-rose-500 via-fuchsia-500 to-cyan-400',
    border: 'border-fuchsia-400/70 dark:border-cyan-400/60',
    badgeBg: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-cyan-300 border-fuchsia-500/40',
    text: 'text-fuchsia-600 dark:text-cyan-400',
    glow: 'shadow-fuchsia-500/40',
    glowColor: 'rgba(217, 70, 239, 0.65)',
  },
};
