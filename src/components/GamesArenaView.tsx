import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Gamepad2,
  Sparkles,
  Flame,
  Heart,
  Timer,
  Pause,
  Trophy,
  Play,
  RotateCcw,
  BookOpen,
  Calculator,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Zap,
  Users,
  Bot,
  Award,
  HelpCircle,
  X,
  Shield,
  Snowflake,
  RefreshCw,
  Lightbulb,
  Crown,
  Swords,
  Layers,
  FileText,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import { PersonaType, QuizResponse, DifficultyType, UserStats, Question } from '../types/quiz';
import { SavedQuizDocument } from '../services/firestore';
import { soundFx } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { recordOneByOneConceptsToGoal } from './DailyLearningGoalTracker';
import { verifyArenaItemXp } from '../utils/xpIntegrity';

export type GameModeTab = 'one_by_one' | 'math_quiz' | 'spelling_bee';

export type OneByOneVariant =
  | 'subject'
  | 'classic'
  | 'topic'
  | 'survival'
  | 'speed'
  | 'ai_battle'
  | 'double_letter';

export type OneByOneDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface OneByOnePlayer {
  id: string;
  name: string;
  avatarEmoji: string;
  colorClass: string;
  isAi: boolean;
  score: number;
  lives: number;
  maxLives: number;
  streak: number;
  bestStreak: number;
  wordsSubmitted: number;
  correctWords: number;
  eliminated: boolean;
  shieldActive?: boolean;
}

export interface WordChainEntry {
  word: string;
  playerId: string;
  playerName: string;
  definition: string;
  detailedExplanation: string;
  subject: string;
  points: number;
  xpEarned: number;
  breakdown: {
    base: number;
    categoryBonus: number;
    speedBonus: number;
    lengthBonus: number;
    streakMultiplier: number;
  };
}

export interface GamesArenaViewProps {
  persona: PersonaType;
  stats?: UserStats;
  onUpdateStats?: (
    xpEarned: number,
    correctCount: number,
    totalCount: number,
    domain?: string,
    extraUpdates?: Partial<UserStats>
  ) => void;
  onAwardGameXp?: (xp: number, correctCount: number, totalCount: number, domain?: string) => void;
  onReviewConceptsAsQuiz?: (
    subject: string,
    concepts: Array<{ word: string; definition: string }>
  ) => void;
  onStartQuiz?: (quiz: QuizResponse) => void;
  onGenerateNotesForTopic?: (topic: string) => void;
  customQuizzes?: SavedQuizDocument[];
}

const SUBJECT_STARTING_WORDS: Record<string, string[]> = {
  Biology: ['CELL', 'MITOSIS', 'ENZYME', 'GENOME', 'ORGANISM', 'PROTEIN', 'CHLOROPLAST', 'NEURON', 'SYNAPSE'],
  Mathematics: ['ALGEBRA', 'MATRIX', 'INTEGRAL', 'POLYGON', 'THEOREM', 'VECTOR', 'FRACTION', 'TANGENT', 'CALCULUS'],
  Chemistry: ['ATOM', 'MOLECULE', 'ELECTRON', 'CATALYST', 'ISOTOPE', 'POLYMER', 'VALENCE', 'SOLVENT', 'PROTON'],
  Physics: ['ENERGY', 'PHOTON', 'GRAVITY', 'MOMENTUM', 'QUANTUM', 'VELOCITY', 'INERTIA', 'CIRCUIT', 'THERMODYNAMICS'],
  History: ['EMPIRE', 'REVOLUTION', 'DYNASTY', 'REPUBLIC', 'TREATY', 'MONARCHY', 'COLONY', 'SENATE', 'RENAISSANCE'],
  Geography: ['CONTINENT', 'GLACIER', 'PENINSULA', 'EQUATOR', 'TUNDRA', 'ARCHIPELAGO', 'DELTA', 'PLATEAU', 'MERIDIAN'],
  English: ['METAPHOR', 'SYNTAX', 'SONNET', 'ALLEGORY', 'PROTAGONIST', 'STANZA', 'HYPERBOLE', 'NARRATIVE', 'RHETORIC'],
  'Computer Science': ['ALGORITHM', 'COMPILER', 'DATABASE', 'PROTOCOL', 'RECURSION', 'VARIABLE', 'NETWORK', 'BINARY'],
  'General Knowledge': ['PLANET', 'SCIENCE', 'GALAXY', 'OCEAN', 'COMPASS', 'PYRAMID', 'HARMONY', 'VOLCANO', 'ECLIPSE'],
};

const CURATED_CONCEPT_HINTS: Record<string, Record<string, { word: string; def: string }>> = {
  Biology: {
    A: { word: 'ADENOSINE', def: 'Nucleoside building block of ATP energy transfer in cells.' },
    C: { word: 'CYTOPLASM', def: 'Gel-like fluid filling the cell interior around organelles.' },
    E: { word: 'ECOSYSTEM', def: 'Biological community of interacting organisms and their environment.' },
    G: { word: 'GENETICS', def: 'Study of heredity, genes, and genetic variation in organisms.' },
    L: { word: 'LYSOSOME', def: 'Membrane-bound organelle containing digestive enzymes.' },
    M: { word: 'MITOCHONDRIA', def: 'Powerhouse organelle generating ATP via cellular respiration.' },
    N: { word: 'NUCLEOTIDE', def: 'Monomer unit of DNA and RNA consisting of sugar, phosphate, and base.' },
    O: { word: 'OSMOSIS', def: 'Diffusion of water across a selectively permeable membrane.' },
    P: { word: 'PHOTOSYNTHESIS', def: 'Process converting light energy into chemical glucose in plants.' },
    R: { word: 'RIBOSOME', def: 'Cellular structure responsible for protein synthesis (translation).' },
    S: { word: 'SYMBIOSIS', def: 'Close ecological relationship between two different species.' },
    T: { word: 'TRANSCRIPTION', def: 'Synthesis of RNA from a DNA template strand.' },
  },
  DEFAULT: {
    A: { word: 'ANALYSIS', def: 'Detailed examination of the elements or structure of a concept.' },
    C: { word: 'CATALYST', def: 'Substance or factor that accelerates a reaction or change.' },
    D: { word: 'DEDUCTION', def: 'Logical reasoning from general principles to specific conclusions.' },
    E: { word: 'EQUILIBRIUM', def: 'State of balanced opposing forces or rates.' },
    F: { word: 'FREQUENCY', def: 'Number of wave cycles or occurrences per unit of time.' },
    G: { word: 'GRADIENT', def: 'Rate of change of a physical quantity with respect to distance.' },
    H: { word: 'HYPOTHESIS', def: 'Testable scientific explanation proposed for a phenomenon.' },
    I: { word: 'INERTIA', def: 'Resistance of any physical object to a change in velocity.' },
    K: { word: 'KINETICS', def: 'Branch of science studying rates of reactions or motion forces.' },
    L: { word: 'LOGARITHM', def: 'Inverse operation to exponentiation in mathematics.' },
    M: { word: 'MOMENTUM', def: 'Product of the mass and velocity of an object.' },
    N: { word: 'NEUTRON', def: 'Subatomic particle with neutral charge in the atomic nucleus.' },
    O: { word: 'OXIDATION', def: 'Loss of electrons during a chemical reaction.' },
    P: { word: 'PARADIGM', def: 'Foundational framework of concepts and theories in a discipline.' },
    Q: { word: 'QUANTUM', def: 'Discrete minimum packet of energy or physical property.' },
    R: { word: 'RESONANCE', def: 'Amplification of wave amplitude at a natural frequency.' },
    S: { word: 'SPECTRUM', def: 'Continuous band of electromagnetic wavelengths or concepts.' },
    T: { word: 'THEOREM', def: 'Mathematical statement proven from axioms and logic.' },
    V: { word: 'VELOCITY', def: 'Vector rate of change of an object’s position.' },
  },
};

const SPELLING_BEE_CHAMPIONSHIP_WORDS: Array<{
  word: string;
  difficulty: OneByOneDifficulty;
  definition: string;
  origin: string;
  syllables: string;
  sentence: string;
  subject: string;
}> = [
  {
    word: 'PHOTOSYNTHESIS',
    difficulty: 'Medium',
    definition: 'The biochemical process by which green plants synthesize nutrients from CO2 and water using light.',
    origin: 'Greek: phōs (light) + synthesis (putting together)',
    syllables: 'pho · to · syn · the · sis',
    sentence: 'Chloroplasts inside plant leaves carry out photosynthesis every day.',
    subject: 'Biology',
  },
  {
    word: 'STOICHIOMETRY',
    difficulty: 'Hard',
    definition: 'Calculation of quantitative relationships between reactants and products in chemical reactions.',
    origin: 'Greek: stoikheion (element) + metria (measure)',
    syllables: 'stoi · chi · om · e · try',
    sentence: 'Accurate stoichiometry ensures no excess reagent is wasted in the lab.',
    subject: 'Chemistry',
  },
  {
    word: 'HYPOTENUSE',
    difficulty: 'Easy',
    definition: 'The longest side of a right-angled triangle, directly opposite the 90-degree right angle.',
    origin: 'Greek: hypoteinousa (stretching under)',
    syllables: 'hy · pot · e · nuse',
    sentence: 'Using the Pythagorean theorem, we calculated the length of the hypotenuse.',
    subject: 'Mathematics',
  },
  {
    word: 'POLYMORPHISM',
    difficulty: 'Hard',
    definition: 'The capability of an object, function, or organism to occur in several distinct forms.',
    origin: 'Greek: poly (many) + morphē (form)',
    syllables: 'pol · y · mor · phism',
    sentence: 'Object-oriented programming relies on polymorphism to share interfaces across classes.',
    subject: 'Computer Science',
  },
  {
    word: 'RENAISSANCE',
    difficulty: 'Medium',
    definition: 'The European cultural, artistic, and scientific rebirth spanning the 14th to 17th centuries.',
    origin: 'French: re- (again) + naître (to be born)',
    syllables: 'ren · ais · sance',
    sentence: 'Leonardo da Vinci exemplified the intellectual curiosity of the Renaissance.',
    subject: 'History',
  },
  {
    word: 'THERMODYNAMICS',
    difficulty: 'Expert',
    definition: 'Physical science dealing with heat, work, temperature, entropy, and energy transformations.',
    origin: 'Greek: thermē (heat) + dynamis (power)',
    syllables: 'ther · mo · dy · nam · ics',
    sentence: 'The second law of thermodynamics states that total entropy of an isolated system increases.',
    subject: 'Physics',
  },
  {
    word: 'ARCHIPELAGO',
    difficulty: 'Medium',
    definition: 'An extensive group or chain of islands clustered together in a sea or ocean.',
    origin: 'Italian: arcipelago (chief sea)',
    syllables: 'ar · chi · pel · a · go',
    sentence: 'Indonesia is the largest archipelago nation in the world.',
    subject: 'Geography',
  },
  {
    word: 'ONOMATOPOEIA',
    difficulty: 'Expert',
    definition: 'Formation of a word from a sound associated with what is named (e.g., sizzle, murmur).',
    origin: 'Greek: onoma (name) + poiein (to make)',
    syllables: 'on · o · mat · o · poe · ia',
    sentence: 'Poets frequently use onomatopoeia to bring sensory vividness to their verses.',
    subject: 'English',
  },
];

interface MathBoss {
  name: string;
  title: string;
  emoji: string;
  maxHp: number;
  topic: string;
  accent: string;
}

const MATH_BOSSES: MathBoss[] = [
  {
    name: 'Baron Linearis',
    title: 'Guardian of Linear Equations & Order of Operations',
    emoji: '⚔️',
    maxHp: 100,
    topic: 'Linear Algebra & Arithmetic',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Countess Quadratix',
    title: 'Sovereign of Polynomials, Exponents & Roots',
    emoji: '🔮',
    maxHp: 150,
    topic: 'Polynomials & Functions',
    accent: 'from-indigo-500 to-purple-600',
  },
  {
    name: 'Archmage Calculus',
    title: 'Overlord of Derivatives, Sequences & Rates of Change',
    emoji: '⚡',
    maxHp: 220,
    topic: 'Calculus & Advanced Sequences',
    accent: 'from-rose-500 to-amber-500',
  },
];

export const GamesArenaView: React.FC<GamesArenaViewProps> = ({
  persona,
  stats,
  onUpdateStats,
  onAwardGameXp,
  onReviewConceptsAsQuiz,
  onStartQuiz,
  onGenerateNotesForTopic,
  customQuizzes = [],
}) => {
  const [activeGameTab, setActiveGameTab] = useState<GameModeTab>('one_by_one');
  const [voiceCalloutsOn, setVoiceCalloutsOn] = useState<boolean>(soundFx.voiceCalloutsEnabled);

  // Unified XP award helper that supports both App.tsx (onUpdateStats) and legacy (onAwardGameXp)
  const awardArenaXp = useCallback(
    (xp: number, correctCount: number, totalCount: number, domain?: string) => {
      if (onUpdateStats) {
        onUpdateStats(xp, correctCount, totalCount, domain || 'Applied Logic');
      } else if (onAwardGameXp) {
        onAwardGameXp(xp, correctCount, totalCount, domain || 'Applied Logic');
      }
    },
    [onUpdateStats, onAwardGameXp]
  );

  // Convert learned concepts into a playable QuizResponse and launch QuizRunner!
  const handleLaunchQuizFromConcepts = useCallback(
    (subjectTitle: string, concepts: Array<{ word: string; definition: string; detailed?: string }>) => {
      if (concepts.length === 0) return;
      soundFx.playPowerUp('Quiz Generated!');

      if (onReviewConceptsAsQuiz && !onStartQuiz) {
        onReviewConceptsAsQuiz(subjectTitle, concepts);
        return;
      }

      if (onStartQuiz) {
        const allWords = concepts.map((c) => c.word);
        const fallbackDistractors = [
          'HOMEOSYNTHESIS',
          'THERMOSTATICS',
          'ELECTROVALENCE',
          'POLARIZATION',
          'ISOCHROMATIC',
          'PARALLELOGRAM',
        ];

        const generatedQuestions: Question[] = concepts.slice(0, 10).map((item, idx) => {
          const otherWords = allWords.filter((w) => w !== item.word);
          const pool = [...otherWords, ...fallbackDistractors].slice(0, 8);
          const distractors: string[] = [];
          for (const candidate of pool) {
            if (distractors.length < 3 && candidate !== item.word && !distractors.includes(candidate)) {
              distractors.push(candidate);
            }
          }
          const options = [item.word, ...distractors].sort(() => Math.random() - 0.5);

          return {
            id: idx + 1,
            type: 'multiple_choice',
            domain: 'Foundations',
            question: `Which ${subjectTitle} concept is defined as: "${item.definition}"?`,
            options,
            correct_answer: item.word,
            explanation: item.detailed || `${item.word}: ${item.definition}`,
            gamified_feedback: {
              success_quote: `Awesome! You mastered ${item.word}!`,
              hint: `Starts with the letter "${item.word.charAt(0)}" and has ${item.word.length} letters.`,
            },
          };
        });

        const builtQuiz: QuizResponse = {
          app_name: 'Quiz Me!',
          quiz_title: `${subjectTitle} Mastery Challenge (From Games Arena)`,
          target_audience: persona,
          difficulty: 'Intermediate',
          persona,
          summary: `Active-recall mastery quiz generated directly from ${concepts.length} concepts discovered during your Games Arena session.`,
          questions: generatedQuestions,
          tags: [subjectTitle, 'Games Arena', 'Active Recall'],
        };

        onStartQuiz(builtQuiz);
      }
    },
    [onReviewConceptsAsQuiz, onStartQuiz, persona]
  );

  const toggleVoiceCallouts = () => {
    const next = !voiceCalloutsOn;
    setVoiceCalloutsOn(next);
    soundFx.setVoiceCalloutsEnabled(next);
    if (next) {
      soundFx.playCorrect(1);
    } else {
      soundFx.playClick();
    }
  };

  // =========================================================================
  // 1. ROBLOX "LAST LETTER" / ONE BY ONE WORD-CHAIN ARENA STATE
  // =========================================================================
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [variant, setVariant] = useState<OneByOneVariant>('subject');
  const [subject, setSubject] = useState<string>('Biology');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<OneByOneDifficulty>('Medium');
  const [playerMode, setPlayerMode] = useState<'solo_ai' | 'bot_royale' | '2p' | '3p' | '4p'>('bot_royale');
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  const [startingLives, setStartingLives] = useState<number>(3);

  const [players, setPlayers] = useState<OneByOnePlayer[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [currentWord, setCurrentWord] = useState<string>('CELL');
  const [requiredLetter, setRequiredLetter] = useState<string>('L');
  const [bonusLetter, setBonusLetter] = useState<string>('S');
  const [usedWords, setUsedWords] = useState<string[]>(['CELL']);
  const [chainHistory, setChainHistory] = useState<WordChainEntry[]>([]);
  const [inputWord, setInputWord] = useState<string>('');
  const [aiTypingPreview, setAiTypingPreview] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [maxTurnTime, setMaxTurnTime] = useState<number>(15);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [bombExploding, setBombExploding] = useState<boolean>(false);

  // Roblox Last Letter Tactical Power-Ups Inventory
  const [powerUps, setPowerUps] = useState<{
    freezeFuse: number;
    rerollLetter: number;
    conceptHint: number;
    strikeShield: number;
  }>({
    freezeFuse: 2,
    rerollLetter: 2,
    conceptHint: 2,
    strikeShield: 1,
  });

  const [activeHintText, setActiveHintText] = useState<string | null>(null);

  // Feedback & Learning Reward Banner
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'valid' | 'wrong_letter' | 'not_relevant' | 'duplicate' | 'timeout' | 'invalid_word';
    title: string;
    subtitle: string;
    xpText?: string;
  } | null>(null);

  const [latestLearnedConcept, setLatestLearnedConcept] = useState<WordChainEntry | null>(null);
  const [learnMoreModalEntry, setLearnMoreModalEntry] = useState<WordChainEntry | null>(null);

  const validationCacheRef = useRef<Map<string, any>>(new Map());
  const turnStartTimeRef = useRef<number>(Date.now());
  const wordInputRef = useRef<HTMLInputElement>(null);

  const effectiveSubject = useMemo(() => {
    if (variant === 'classic') return 'General Knowledge';
    if (subject === 'Custom Topic' || variant === 'topic') {
      return customTopic.trim() || 'General Knowledge';
    }
    return subject;
  }, [variant, subject, customTopic]);

  // Compute required prefix (1-letter or 2-letter in Double-Letter / Escalation rounds)
  const computeRequiredPrefix = useCallback(
    (word: string, nextRound: number) => {
      const cleanAlpha = word.replace(/[^A-Z]/gi, '').toUpperCase();
      if (!cleanAlpha) return 'E';
      if (variant === 'double_letter' || (nextRound >= 6 && cleanAlpha.length >= 4)) {
        const lastTwo = cleanAlpha.slice(-2);
        // Only use 2-letter prefix if it's a common pronounceable pair
        const validPairs = ['TH', 'CH', 'SH', 'ST', 'TR', 'PR', 'CR', 'AN', 'IN', 'ON', 'EN', 'RE', 'DE', 'CO', 'PRO', 'NE', 'CE', 'TE', 'ME', 'SE', 'LE', 'AL', 'OR', 'AR', 'ER', 'IC', 'AT', 'IT'];
        if (validPairs.includes(lastTwo)) {
          return lastTwo;
        }
      }
      return cleanAlpha.slice(-1);
    },
    [variant]
  );

  // Start Roblox Last Letter / One by One Table Match
  const handleStartOneByOne = () => {
    soundFx.playClick();
    soundFx.announceCallout('Get ready! Bomb fuse lit!', 1.08, 1.05);

    const effectiveTimer = variant === 'speed' ? 6 : timerSeconds;
    const effectiveLives = variant === 'survival' ? 1 : startingLives;

    const initialPlayers: OneByOnePlayer[] = [];
    if (playerMode === 'solo_ai' || variant === 'ai_battle') {
      initialPlayers.push(
        {
          id: 'p1',
          name: 'You (Scholar)',
          avatarEmoji: '😎',
          colorClass: 'from-indigo-500 to-violet-600',
          isAi: false,
          score: 0,
          lives: effectiveLives,
          maxLives: effectiveLives,
          streak: 0,
          bestStreak: 0,
          wordsSubmitted: 0,
          correctWords: 0,
          eliminated: false,
          shieldActive: false,
        },
        {
          id: 'ai_1',
          name: `CyberBot (${difficulty})`,
          avatarEmoji: '🤖',
          colorClass: 'from-cyan-500 to-blue-600',
          isAi: true,
          score: 0,
          lives: effectiveLives,
          maxLives: effectiveLives,
          streak: 0,
          bestStreak: 0,
          wordsSubmitted: 0,
          correctWords: 0,
          eliminated: false,
          shieldActive: false,
        }
      );
    } else if (playerMode === 'bot_royale') {
      // 4-Seat Roblox Last Letter Table: You + 3 AI Challengers around the Bomb Table!
      initialPlayers.push(
        {
          id: 'p1',
          name: 'You (Scholar)',
          avatarEmoji: '⚡',
          colorClass: 'from-indigo-500 to-violet-600',
          isAi: false,
          score: 0,
          lives: effectiveLives,
          maxLives: effectiveLives,
          streak: 0,
          bestStreak: 0,
          wordsSubmitted: 0,
          correctWords: 0,
          eliminated: false,
          shieldActive: false,
        },
        {
          id: 'ai_1',
          name: 'NovaBot',
          avatarEmoji: '🤖',
          colorClass: 'from-cyan-500 to-blue-600',
          isAi: true,
          score: 0,
          lives: effectiveLives,
          maxLives: effectiveLives,
          streak: 0,
          bestStreak: 0,
          wordsSubmitted: 0,
          correctWords: 0,
          eliminated: false,
          shieldActive: false,
        },
        {
          id: 'ai_2',
          name: 'Prof. Helix',
          avatarEmoji: '🧬',
          colorClass: 'from-emerald-500 to-teal-600',
          isAi: true,
          score: 0,
          lives: effectiveLives,
          maxLives: effectiveLives,
          streak: 0,
          bestStreak: 0,
          wordsSubmitted: 0,
          correctWords: 0,
          eliminated: false,
          shieldActive: false,
        },
        {
          id: 'ai_3',
          name: 'Vortex AI',
          avatarEmoji: '🔥',
          colorClass: 'from-amber-500 to-rose-600',
          isAi: true,
          score: 0,
          lives: effectiveLives,
          maxLives: effectiveLives,
          streak: 0,
          bestStreak: 0,
          wordsSubmitted: 0,
          correctWords: 0,
          eliminated: false,
          shieldActive: false,
        }
      );
    } else {
      const count = playerMode === '2p' ? 2 : playerMode === '3p' ? 3 : 4;
      const emojis = ['⚡', '🔥', '💎', '👑'];
      const colors = [
        'from-indigo-500 to-violet-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
        'from-rose-500 to-pink-600',
      ];
      for (let i = 1; i <= count; i++) {
        initialPlayers.push({
          id: `p${i}`,
          name: `Player ${i}`,
          avatarEmoji: emojis[(i - 1) % emojis.length],
          colorClass: colors[(i - 1) % colors.length],
          isAi: false,
          score: 0,
          lives: effectiveLives,
          maxLives: effectiveLives,
          streak: 0,
          bestStreak: 0,
          wordsSubmitted: 0,
          correctWords: 0,
          eliminated: false,
          shieldActive: false,
        });
      }
    }

    const pool = SUBJECT_STARTING_WORDS[subject] || SUBJECT_STARTING_WORDS['General Knowledge'];
    const starter = pool[Math.floor(Math.random() * pool.length)].toUpperCase();
    const initPrefix = computeRequiredPrefix(starter, 1);
    const bonusPool = 'ABCDEFGHLMNOPRSTV';
    const randBonus = bonusPool.charAt(Math.floor(Math.random() * bonusPool.length));

    setPlayers(initialPlayers);
    setCurrentTurnIndex(0);
    setRoundNumber(1);
    setCurrentWord(starter);
    setRequiredLetter(initPrefix);
    setBonusLetter(randBonus);
    setUsedWords([starter]);
    setChainHistory([]);
    setInputWord('');
    setAiTypingPreview('');
    setActiveHintText(null);
    setTimeLeft(effectiveTimer);
    setMaxTurnTime(effectiveTimer);
    setPowerUps({
      freezeFuse: 2,
      rerollLetter: 2,
      conceptHint: 2,
      strikeShield: 1,
    });
    setFeedbackBanner(null);
    setLatestLearnedConcept(null);
    setBombExploding(false);
    setGameState('playing');
    turnStartTimeRef.current = Date.now();
  };

  // Advance to next active player around the circular bomb table
  const advanceToNextPlayer = useCallback(
    (updatedPlayers: OneByOnePlayer[], nextReqLetter: string, nextWordVal: string) => {
      const alivePlayers = updatedPlayers.filter((p) => !p.eliminated);
      if (alivePlayers.length === 0 || (updatedPlayers.length > 1 && alivePlayers.length <= 1)) {
        soundFx.playRoundClear();
        setGameState('finished');

        const humanPlayer = updatedPlayers[0];
        if (humanPlayer && humanPlayer.correctWords > 0) {
          const rawXp = Math.round(humanPlayer.score * 0.5);
          const sessionSignature = `chain_${humanPlayer.correctWords}_${chainHistory
            .slice(0, 4)
            .map((c) => c.word)
            .join('_')}`;
          const verified = verifyArenaItemXp('one_by_one', sessionSignature, rawXp);
          if (verified.xpAwarded > 0) {
            awardArenaXp(
              verified.xpAwarded,
              humanPlayer.correctWords,
              Math.max(1, humanPlayer.wordsSubmitted),
              effectiveSubject
            );
          }
          recordOneByOneConceptsToGoal(chainHistory.map((c) => c.word));
        }
        return;
      }

      let nextIdx = (currentTurnIndex + 1) % updatedPlayers.length;
      let safety = 0;
      while (updatedPlayers[nextIdx].eliminated && safety < updatedPlayers.length) {
        nextIdx = (nextIdx + 1) % updatedPlayers.length;
        safety++;
      }

      let nextRound = roundNumber;
      if (nextIdx <= currentTurnIndex) {
        nextRound = roundNumber + 1;
        setRoundNumber(nextRound);
        const bonusPool = 'ABCDEFGHLMNOPRSTV';
        setBonusLetter(bonusPool.charAt(Math.floor(Math.random() * bonusPool.length)));
      }

      // Dynamic Roblox Last Letter fuse tightening as rounds increase!
      const baseTime = variant === 'speed' ? 6 : timerSeconds;
      const tightenedTime = Math.max(5, baseTime - Math.floor((nextRound - 1) / 3));

      setCurrentTurnIndex(nextIdx);
      setCurrentWord(nextWordVal);
      setRequiredLetter(nextReqLetter);
      setInputWord('');
      setAiTypingPreview('');
      setActiveHintText(null);
      setTimeLeft(tightenedTime);
      setMaxTurnTime(tightenedTime);
      turnStartTimeRef.current = Date.now();
    },
    [currentTurnIndex, roundNumber, timerSeconds, variant, effectiveSubject, awardArenaXp]
  );

  // Penalize current player when bomb explodes or word is rejected
  const applyPlayerPenalty = useCallback(
    (
      reasonType: 'wrong_letter' | 'not_relevant' | 'duplicate' | 'timeout' | 'invalid_word',
      title: string,
      subtitle: string
    ) => {
      const activePlayer = players[currentTurnIndex];

      // Check if player has an active Strike Shield!
      if (activePlayer?.shieldActive) {
        soundFx.playPowerUp('Shield Blocked Strike!');
        setFeedbackBanner({
          type: 'valid',
          title: '🛡️ STRIKE SHIELD BLOCKED DAMAGE!',
          subtitle: `${activePlayer.name}'s shield absorbed the mistake! Passing bomb...`,
        });
        const shieldedPlayers = players.map((p, idx) =>
          idx === currentTurnIndex ? { ...p, shieldActive: false } : p
        );
        setPlayers(shieldedPlayers);
        setTimeout(() => {
          advanceToNextPlayer(shieldedPlayers, requiredLetter, currentWord);
        }, 1100);
        return;
      }

      if (reasonType === 'timeout') {
        setBombExploding(true);
        soundFx.playBombExplode();
        setTimeout(() => setBombExploding(false), 900);
      } else {
        soundFx.playIncorrect(activePlayer?.streak || 0);
      }

      setFeedbackBanner({ type: reasonType, title, subtitle });

      let someoneEliminated = false;
      const updated = players.map((p, idx) => {
        if (idx !== currentTurnIndex) return p;
        const nextLives = Math.max(0, p.lives - 1);
        if (nextLives <= 0 && !p.eliminated) {
          someoneEliminated = true;
        }
        return {
          ...p,
          lives: nextLives,
          streak: 0,
          wordsSubmitted: p.wordsSubmitted + 1,
          eliminated: nextLives <= 0,
        };
      });

      if (someoneEliminated) {
        setTimeout(() => soundFx.playEliminated(), 350);
      }

      setPlayers(updated);
      setTimeout(() => {
        advanceToNextPlayer(updated, requiredLetter, currentWord);
      }, 1200);
    },
    [players, currentTurnIndex, requiredLetter, currentWord, advanceToNextPlayer]
  );

  // Countdown bomb fuse effect with rising tick audio!
  useEffect(() => {
    if (gameState !== 'playing' || isValidating) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          applyPlayerPenalty(
            'timeout',
            '💥 BOOM! TIME RAN OUT!',
            'The Last Letter bomb exploded before a valid concept was locked in!'
          );
          return 0;
        }
        const nextVal = prev - 1;
        const urgency = Math.min(1, Math.max(0, 1 - nextVal / Math.max(1, maxTurnTime)));
        if (nextVal <= 6 || nextVal % 2 === 0) {
          soundFx.playFuseTick(urgency);
        }
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, isValidating, currentTurnIndex, maxTurnTime, applyPlayerPenalty]);

  // Power-Up Handlers for Human Player
  const handleUseFreezeFuse = () => {
    if (powerUps.freezeFuse <= 0 || gameState !== 'playing') return;
    soundFx.playPowerUp('Freeze Fuse! +5 Seconds!');
    setPowerUps((p) => ({ ...p, freezeFuse: p.freezeFuse - 1 }));
    setTimeLeft((t) => t + 5);
    setMaxTurnTime((m) => Math.max(m, timeLeft + 5));
  };

  const handleUseRerollLetter = () => {
    if (powerUps.rerollLetter <= 0 || gameState !== 'playing') return;
    const pool = 'ABCDEFGHLMNOPRSTV';
    const candidates = pool.split('').filter((c) => c !== requiredLetter);
    const nextChar = candidates[Math.floor(Math.random() * candidates.length)] || 'S';
    soundFx.playPowerUp(`New Letter: ${nextChar}!`);
    setPowerUps((p) => ({ ...p, rerollLetter: p.rerollLetter - 1 }));
    setRequiredLetter(nextChar);
    setActiveHintText(null);
  };

  const handleUseConceptHint = () => {
    if (powerUps.conceptHint <= 0 || gameState !== 'playing') return;
    soundFx.playPowerUp('Concept Hint Unlocked!');
    setPowerUps((p) => ({ ...p, conceptHint: p.conceptHint - 1 }));
    const firstLet = requiredLetter.charAt(0).toUpperCase();
    const subjHints = CURATED_CONCEPT_HINTS[effectiveSubject] || CURATED_CONCEPT_HINTS.DEFAULT;
    const found = subjHints[firstLet] || CURATED_CONCEPT_HINTS.DEFAULT[firstLet];
    if (found && !usedWords.includes(found.word)) {
      setActiveHintText(
        `💡 Hint: Try a ${found.word.length}-letter concept starting with "${found.word.slice(0, 3)}..." — ${found.def}`
      );
    } else {
      setActiveHintText(
        `💡 Hint: Think of any ${effectiveSubject} term starting with "${requiredLetter}" (e.g., ${requiredLetter}EACTION, ${requiredLetter}YSTEM, ${requiredLetter}LEMENT).`
      );
    }
  };

  const handleUseStrikeShield = () => {
    const activePlayer = players[currentTurnIndex];
    if (powerUps.strikeShield <= 0 || !activePlayer || activePlayer.shieldActive) return;
    soundFx.playPowerUp('Strike Shield Activated!');
    setPowerUps((p) => ({ ...p, strikeShield: p.strikeShield - 1 }));
    setPlayers((prev) =>
      prev.map((pl, idx) => (idx === currentTurnIndex ? { ...pl, shieldActive: true } : pl))
    );
  };

  // Submit & Validate a Word (Human or AI)
  const submitWordTurn = useCallback(
    async (rawSubmittedWord: string) => {
      const cleaned = rawSubmittedWord.trim().replace(/[^a-zA-Z\s-]/g, '').toUpperCase();
      if (!cleaned || isValidating || gameState !== 'playing') return;

      const activePlayer = players[currentTurnIndex];
      if (!activePlayer) return;

      // 1. DETERMINISTIC CHECK: Required Starting Letter(s)
      const reqUpper = requiredLetter.toUpperCase();
      if (!cleaned.startsWith(reqUpper)) {
        applyPlayerPenalty(
          'wrong_letter',
          `❌ MUST START WITH "${reqUpper}"`,
          `"${cleaned}" starts with "${cleaned.slice(0, reqUpper.length)}", not "${reqUpper}"!`
        );
        return;
      }

      // 2. DETERMINISTIC CHECK: Duplicate Word
      if (usedWords.some((w) => w.toUpperCase() === cleaned)) {
        applyPlayerPenalty(
          'duplicate',
          '⚠️ ALREADY USED IN CHAIN',
          `"${cleaned}" was already played at the table! No repeats allowed.`
        );
        return;
      }

      // 3. DETERMINISTIC CHECK: Minimum Length
      if (cleaned.length < 2) {
        applyPlayerPenalty('invalid_word', '❌ TOO SHORT', 'Words must be at least 2 letters long.');
        return;
      }

      setIsValidating(true);
      const elapsedSeconds = (Date.now() - turnStartTimeRef.current) / 1000;
      const cacheKey = `${cleaned}_${effectiveSubject}_${difficulty}_${variant}`;

      try {
        let validationData = validationCacheRef.current.get(cacheKey);
        if (!validationData) {
          const response = await fetch('/api/word-chain/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              word: cleaned,
              requiredLetter: reqUpper.charAt(0),
              subject: effectiveSubject,
              difficulty,
              usedWords,
              modeVariant: variant === 'classic' ? 'classic' : 'subject',
            }),
          });
          const json = await response.json();
          validationData = json.validation;
          if (validationData) {
            validationCacheRef.current.set(cacheKey, validationData);
          }
        }

        if (!validationData?.validWord) {
          setIsValidating(false);
          applyPlayerPenalty(
            'invalid_word',
            '❌ UNRECOGNIZED WORD',
            validationData?.reason || `"${cleaned}" was not recognized as a valid concept.`
          );
          return;
        }

        if (variant !== 'classic' && !validationData.categoryRelevant) {
          setIsValidating(false);
          applyPlayerPenalty(
            'not_relevant',
            `❌ OFF-TOPIC FOR ${effectiveSubject.toUpperCase()}`,
            validationData.reason ||
              `"${cleaned}" is a real word, but it doesn't connect to ${effectiveSubject}.`
          );
          return;
        }

        // VALID CONCEPT! Play rich sound & voice callout!
        const newStreak = activePlayer.streak + 1;
        soundFx.playWordAccepted(cleaned.length, newStreak);

        const streakMultiplier = newStreak >= 10 ? 3 : newStreak >= 5 ? 2 : newStreak >= 3 ? 1.5 : 1;
        const basePoints = 10;
        const categoryBonus = variant === 'classic' ? 3 : 6;
        const speedBonus = elapsedSeconds <= 4 ? 6 : elapsedSeconds <= 8 ? 3 : 1;
        const lengthBonus = cleaned.length >= 10 ? 8 : cleaned.length >= 7 ? 4 : 0;
        const hitBonusLetter = cleaned.includes(bonusLetter) ? 5 : 0;

        const totalPoints = Math.round(
          (basePoints + categoryBonus + speedBonus + lengthBonus + hitBonusLetter) * streakMultiplier
        );

        // Reward human player with a random power-up every 3 streak or 9+ letter word!
        if (!activePlayer.isAi && (newStreak % 3 === 0 || cleaned.length >= 9)) {
          setPowerUps((p) => ({
            ...p,
            freezeFuse: p.freezeFuse + 1,
            conceptHint: p.conceptHint + (cleaned.length >= 9 ? 1 : 0),
          }));
        }

        const entry: WordChainEntry = {
          word: cleaned,
          playerId: activePlayer.id,
          playerName: activePlayer.name,
          subject: effectiveSubject,
          definition:
            validationData.definition ||
            `Key concept in ${effectiveSubject} linked to "${currentWord}".`,
          detailedExplanation:
            validationData.detailedExplanation ||
            `${cleaned} is an essential ${effectiveSubject} concept that deepens domain fluency.`,
          points: totalPoints,
          xpEarned: totalPoints,
          breakdown: {
            base: basePoints,
            categoryBonus,
            speedBonus,
            lengthBonus: lengthBonus + hitBonusLetter,
            streakMultiplier,
          },
        };

        const nextReq = computeRequiredPrefix(cleaned, roundNumber);

        const updatedPlayers = players.map((p, idx) => {
          if (idx !== currentTurnIndex) return p;
          return {
            ...p,
            score: p.score + totalPoints,
            streak: newStreak,
            bestStreak: Math.max(p.bestStreak, newStreak),
            wordsSubmitted: p.wordsSubmitted + 1,
            correctWords: p.correctWords + 1,
          };
        });

        setPlayers(updatedPlayers);
        setUsedWords((prev) => [...prev, cleaned]);
        setChainHistory((prev) => [entry, ...prev]);
        setLatestLearnedConcept(entry);
        setFeedbackBanner({
          type: 'valid',
          title: `🔥 ${cleaned} LOCKED IN! (${activePlayer.name})`,
          subtitle: `+${basePoints} Base · +${categoryBonus} ${effectiveSubject} · +${speedBonus} Speed${
            lengthBonus > 0 ? ` · +${lengthBonus} Long Word` : ''
          }${streakMultiplier > 1 ? ` · ⚡ ×${streakMultiplier} Streak!` : ''}`,
          xpText: `+${totalPoints} PTS`,
        });

        setIsValidating(false);
        setTimeout(() => {
          advanceToNextPlayer(updatedPlayers, nextReq, cleaned);
        }, 850);
      } catch (err) {
        setIsValidating(false);
        console.warn('Validation error:', err);
      }
    },
    [
      isValidating,
      gameState,
      players,
      currentTurnIndex,
      requiredLetter,
      usedWords,
      effectiveSubject,
      difficulty,
      variant,
      bonusLetter,
      currentWord,
      roundNumber,
      computeRequiredPrefix,
      applyPlayerPenalty,
      advanceToNextPlayer,
    ]
  );

  // Trigger AI Opponent Turn with realistic Roblox Last Letter live letter-by-letter typing!
  useEffect(() => {
    if (gameState !== 'playing' || isValidating) return;
    const currentPlayer = players[currentTurnIndex];
    if (!currentPlayer || !currentPlayer.isAi || currentPlayer.eliminated) return;

    let isCancelled = false;
    let typingInterval: ReturnType<typeof setInterval> | null = null;

    const aiTimer = setTimeout(async () => {
      try {
        const res = await fetch('/api/word-chain/ai-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requiredLetter: requiredLetter.charAt(0),
            subject: effectiveSubject,
            difficulty,
            usedWords,
            roundNumber,
          }),
        });
        const data = await res.json();
        if (isCancelled) return;

        let chosenWord = (data.turn?.word || data.aiMove?.word || `${requiredLetter}LEMENT`).toUpperCase();
        if (!chosenWord.startsWith(requiredLetter.toUpperCase())) {
          chosenWord = `${requiredLetter.toUpperCase()}${chosenWord.slice(1)}`;
        }

        // Animate letter-by-letter typing at the bomb table!
        let charIdx = 0;
        typingInterval = setInterval(() => {
          if (isCancelled) {
            if (typingInterval) clearInterval(typingInterval);
            return;
          }
          charIdx++;
          soundFx.playKeystroke();
          setAiTypingPreview(chosenWord.slice(0, charIdx));
          if (charIdx >= chosenWord.length) {
            if (typingInterval) clearInterval(typingInterval);
            setTimeout(() => {
              if (!isCancelled) {
                submitWordTurn(chosenWord);
              }
            }, 220);
          }
        }, 110);
      } catch {
        if (!isCancelled) {
          submitWordTurn(`${requiredLetter}YSTEM`);
        }
      }
    }, 950);

    return () => {
      isCancelled = true;
      clearTimeout(aiTimer);
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [
    gameState,
    isValidating,
    players,
    currentTurnIndex,
    requiredLetter,
    effectiveSubject,
    difficulty,
    usedWords,
    roundNumber,
    submitWordTurn,
  ]);

  // Focus input on human turn
  useEffect(() => {
    if (gameState === 'playing' && !players[currentTurnIndex]?.isAi) {
      wordInputRef.current?.focus();
    }
  }, [gameState, currentTurnIndex, players]);

  // =========================================================================
  // 2. MATH BOSS RUSH & TACTICAL ARENA STATE (WITH COUNTDOWN TIMER)
  // =========================================================================
  const [mathDifficulty, setMathDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [mathScore, setMathScore] = useState(0);
  const [mathStreak, setMathStreak] = useState(0);
  const [mathBossIdx, setMathBossIdx] = useState(0);
  const [mathBossHp, setMathBossHp] = useState(MATH_BOSSES[0].maxHp);
  const [mathPlayerHp, setMathPlayerHp] = useState(3);
  const [mathDoubleCritArmed, setMathDoubleCritArmed] = useState(false);
  const [showMathStepHint, setShowMathStepHint] = useState(false);
  const [mathAnswerInput, setMathAnswerInput] = useState('');
  const [mathTimerPreset, setMathTimerPreset] = useState<number>(20); // 12s Blitz, 20s Standard, 30s Relaxed, 0 Untimed
  const [mathTimeLeft, setMathTimeLeft] = useState<number>(20);
  const [mathTimerPaused, setMathTimerPaused] = useState<boolean>(false);
  const [mathPausedThisTurn, setMathPausedThisTurn] = useState<boolean>(false);
  const [mathProblemResolved, setMathProblemResolved] = useState<boolean>(false);
  const [mathFreezeUsed, setMathFreezeUsed] = useState<boolean>(false);
  const mathLastTickSecondRef = useRef<number | null>(null);
  const mathAutoNextTimeoutRef = useRef<number | null>(null);

  const [mathSolvedHistory, setMathSolvedHistory] = useState<
    Array<{ question: string; answer: number; explanation: string; correct: boolean }>
  >([]);
  const [mathFeedback, setMathFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [mathProblem, setMathProblem] = useState<{
    question: string;
    answer: number;
    formulaHint: string;
    explanation: string;
  }>({
    question: 'Solve for x: 3x + 14 = 35',
    answer: 7,
    formulaHint: 'Isolate the variable term 3x by subtracting the constant 14 from both sides.',
    explanation: 'Subtract 14 from both sides (3x = 21), then divide by 3 to get x = 7.',
  });

  const currentMathBoss = MATH_BOSSES[mathBossIdx % MATH_BOSSES.length];

  const getMathMaxTime = useCallback(
    (preset: number, diff: 'Easy' | 'Medium' | 'Hard') => {
      if (preset <= 0) return 0;
      const diffBonus = diff === 'Hard' ? 5 : diff === 'Medium' ? 2 : 0;
      return preset + diffBonus;
    },
    []
  );

  const generateNewMathProblem = useCallback(
    (diff: 'Easy' | 'Medium' | 'Hard', customPreset?: number) => {
      if (mathAutoNextTimeoutRef.current) {
        window.clearTimeout(mathAutoNextTimeoutRef.current);
        mathAutoNextTimeoutRef.current = null;
      }
      setMathAnswerInput('');
      setMathFeedback(null);
      setShowMathStepHint(false);
      setMathTimerPaused(false);
      setMathPausedThisTurn(false);
      setMathProblemResolved(false);
      setMathFreezeUsed(false);
      const activePreset = customPreset !== undefined ? customPreset : mathTimerPreset;
      const maxT = getMathMaxTime(activePreset, diff);
      setMathTimeLeft(maxT);
      mathLastTickSecondRef.current = null;

      const variant = Math.floor(Math.random() * 3);

      if (diff === 'Easy') {
        if (variant === 0) {
          const a = Math.floor(Math.random() * 14) + 4;
          const b = Math.floor(Math.random() * 11) + 3;
          const c = Math.floor(Math.random() * 25) + 5;
          setMathProblem({
            question: `Calculate: (${a} × ${b}) + ${c}`,
            answer: a * b + c,
            formulaHint: `PEMDAS Order of Operations: Multiply (${a} × ${b}) first before adding ${c}.`,
            explanation: `First multiply ${a} × ${b} = ${a * b}, then add ${c} to get ${a * b + c}.`,
          });
        } else if (variant === 1) {
          const pct = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
          const base = (Math.floor(Math.random() * 12) + 2) * 20;
          const ans = (pct / 100) * base;
          setMathProblem({
            question: `Find ${pct}% of ${base}`,
            answer: ans,
            formulaHint: `Convert ${pct}% to a decimal (${pct / 100}) and multiply by ${base}.`,
            explanation: `${pct}% of ${base} = (${pct} / 100) × ${base} = ${ans}.`,
          });
        } else {
          const a = Math.floor(Math.random() * 15) + 6;
          const b = Math.floor(Math.random() * 12) + 4;
          const prod = a * b;
          setMathProblem({
            question: `Solve for n: ${a} × n = ${prod}`,
            answer: b,
            formulaHint: `Divide the product ${prod} by ${a} to isolate n.`,
            explanation: `n = ${prod} ÷ ${a} = ${b}.`,
          });
        }
      } else if (diff === 'Medium') {
        if (variant === 0) {
          const x = Math.floor(Math.random() * 12) + 2;
          const m = Math.floor(Math.random() * 8) + 2;
          const b = Math.floor(Math.random() * 20) + 4;
          const total = m * x + b;
          setMathProblem({
            question: `Solve for x: ${m}x + ${b} = ${total}`,
            answer: x,
            formulaHint: `Linear Equation mx + b = c → x = (c - b) / m. Subtract ${b} from ${total} first.`,
            explanation: `Subtract ${b} from ${total} (${m}x = ${total - b}), then divide by ${m} to get x = ${x}.`,
          });
        } else if (variant === 1) {
          const root = Math.floor(Math.random() * 11) + 4;
          const addend = Math.floor(Math.random() * 18) + 5;
          const sq = root * root;
          setMathProblem({
            question: `Evaluate: √${sq} + ${addend} × 2`,
            answer: root + addend * 2,
            formulaHint: `Compute the principal square root √${sq} and the product (${addend} × 2), then sum them.`,
            explanation: `√${sq} = ${root} and ${addend} × 2 = ${addend * 2}; ${root} + ${addend * 2} = ${root + addend * 2}.`,
          });
        } else {
          const x = Math.floor(Math.random() * 10) + 3;
          const k = Math.floor(Math.random() * 6) + 2;
          const rhs = k * (x + 4);
          setMathProblem({
            question: `Solve for x: ${k}(x + 4) = ${rhs}`,
            answer: x,
            formulaHint: `Divide both sides by ${k} first, then subtract 4.`,
            explanation: `Divide by ${k} to get x + 4 = ${rhs / k}, then subtract 4 to get x = ${x}.`,
          });
        }
      } else {
        if (variant === 0) {
          const base = Math.floor(Math.random() * 9) + 3;
          const lin = Math.floor(Math.random() * 10) + 2;
          const val = base * base + 4 * lin;
          setMathProblem({
            question: `Evaluate f(${base}) if f(x) = x² + 4(${lin})`,
            answer: val,
            formulaHint: `Substitute x = ${base}: compute ${base}² = ${base * base}, then add 4 × ${lin}.`,
            explanation: `Square ${base} (${base * base}) and add 4 × ${lin} (${4 * lin}) = ${val}.`,
          });
        } else if (variant === 1) {
          const a = Math.floor(Math.random() * 5) + 2;
          const x0 = Math.floor(Math.random() * 6) + 2;
          const b = Math.floor(Math.random() * 9) + 3;
          const deriv = 2 * a * x0 + b;
          setMathProblem({
            question: `Find f'(${x0}) if f(x) = ${a}x² + ${b}x - 7`,
            answer: deriv,
            formulaHint: `Power Rule: d/dx(${a}x² + ${b}x - 7) = ${2 * a}x + ${b}. Then substitute x = ${x0}.`,
            explanation: `f'(x) = ${2 * a}x + ${b}. Evaluating at x = ${x0} gives ${2 * a}(${x0}) + ${b} = ${deriv}.`,
          });
        } else {
          const exp = Math.floor(Math.random() * 5) + 2;
          const offset = Math.floor(Math.random() * 12) + 3;
          const target = Math.pow(2, exp) + offset;
          setMathProblem({
            question: `Solve for x: 2ˣ + ${offset} = ${target}`,
            answer: exp,
            formulaHint: `Subtract ${offset} from ${target} to get 2ˣ = ${target - offset}, then take log₂.`,
            explanation: `2ˣ = ${target - offset} = 2^${exp}, so x = ${exp}.`,
          });
        }
      }
    },
    [getMathMaxTime, mathTimerPreset]
  );

  // Math Boss Rush Countdown Effect
  useEffect(() => {
    if (
      activeGameTab !== 'math_quiz' ||
      mathTimerPreset <= 0 ||
      mathTimerPaused ||
      mathProblemResolved
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setMathTimeLeft((prev) => {
        const next = Math.max(0, Number((prev - 0.1).toFixed(1)));
        const ceilSec = Math.ceil(next);
        if (next > 0 && ceilSec <= 5 && mathLastTickSecondRef.current !== ceilSec) {
          mathLastTickSecondRef.current = ceilSec;
          soundFx.playUrgentTick(ceilSec);
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [activeGameTab, mathTimerPreset, mathTimerPaused, mathProblemResolved]);

  // Handle Math Timeout when mathTimeLeft hits 0
  useEffect(() => {
    if (
      activeGameTab !== 'math_quiz' ||
      mathTimerPreset <= 0 ||
      mathProblemResolved ||
      mathTimeLeft > 0
    ) {
      return;
    }

    setMathProblemResolved(true);
    soundFx.playBuzzer();
    setMathStreak(0);
    setMathDoubleCritArmed(false);
    setMathPlayerHp((hp) => (hp <= 1 ? 3 : hp - 1));
    setMathSolvedHistory((prev) => [
      {
        question: mathProblem.question,
        answer: mathProblem.answer,
        explanation: `[TIME EXPIRED] ${mathProblem.explanation}`,
        correct: false,
      },
      ...prev,
    ]);
    setMathFeedback({
      correct: false,
      message: `⏰ TIME'S UP! ${currentMathBoss.name} counter-attacked (-1 ❤️)! Answer: ${mathProblem.answer} · ${mathProblem.explanation}`,
    });

    mathAutoNextTimeoutRef.current = window.setTimeout(() => {
      generateNewMathProblem(mathDifficulty);
    }, 2400);
  }, [
    activeGameTab,
    mathTimerPreset,
    mathProblemResolved,
    mathTimeLeft,
    mathProblem,
    currentMathBoss.name,
    mathDifficulty,
    generateNewMathProblem,
  ]);

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mathProblemResolved) {
      generateNewMathProblem(mathDifficulty);
      return;
    }
    const numeric = parseFloat(mathAnswerInput.trim());
    if (Number.isNaN(numeric)) return;

    setMathProblemResolved(true);

    if (Math.abs(numeric - mathProblem.answer) < 0.01) {
      const nextStreak = mathStreak + 1;
      const isCrit = mathDoubleCritArmed || nextStreak >= 3;
      soundFx.playCorrect(nextStreak);
      soundFx.playBossHit(isCrit);

      const usedAssistance = showMathStepHint || mathPausedThisTurn || mathFreezeUsed;
      const speedBonusDamage =
        mathTimerPreset > 0 && !usedAssistance ? Math.round(mathTimeLeft * 1.2) : 0;
      const speedBonusXp =
        mathTimerPreset > 0 && !usedAssistance ? Math.round(mathTimeLeft * 1.5) : 0;
      const damage = (25 + nextStreak * 5 + speedBonusDamage) * (mathDoubleCritArmed ? 2 : 1);
      const rawBaseXp = 20 + nextStreak * 5 + speedBonusXp;
      const postHintXp = showMathStepHint ? Math.max(8, Math.round(rawBaseXp * 0.65)) : rawBaseXp;
      setMathDoubleCritArmed(false);
      setMathStreak(nextStreak);
      setMathSolvedHistory((prev) => [
        {
          question: mathProblem.question,
          answer: mathProblem.answer,
          explanation: mathProblem.explanation,
          correct: true,
        },
        ...prev,
      ]);

      const remainingHp = Math.max(0, mathBossHp - damage);
      if (remainingHp === 0) {
        soundFx.playRoundClear();
        const nextBoss = (mathBossIdx + 1) % MATH_BOSSES.length;
        setMathBossIdx(nextBoss);
        setMathBossHp(MATH_BOSSES[nextBoss].maxHp);
        const verified = verifyArenaItemXp('math_boss', mathProblem.question, postHintXp + 50);
        setMathScore((s) => s + verified.xpAwarded);
        setMathFeedback({
          correct: true,
          message: `💥 BOSS DEFEATED! ${currentMathBoss.name} vanquished! +${verified.xpAwarded} Verified XP${
            speedBonusXp > 0 ? ` (includes +${speedBonusXp} Speed Bonus!)` : ''
          }${verified.reason ? ` · [${verified.reason}]` : ''} · ${mathProblem.explanation}`,
        });
        if (verified.xpAwarded > 0) {
          awardArenaXp(verified.xpAwarded, 1, 1, 'Applied Logic');
        }
      } else {
        setMathBossHp(remainingHp);
        const verified = verifyArenaItemXp('math_boss', mathProblem.question, postHintXp);
        setMathScore((s) => s + verified.xpAwarded);
        setMathFeedback({
          correct: true,
          message: `⚡ Direct Hit (-${damage} Boss HP)! +${verified.xpAwarded} Verified XP${
            speedBonusXp > 0 ? ` (⏱️ +${speedBonusXp} Speed Bonus)` : ''
          }${showMathStepHint ? ' (Formula Hint -35% XP)' : ''}${
            verified.reason ? ` · [${verified.reason}]` : ''
          } · ${mathProblem.explanation}`,
        });
        if (verified.xpAwarded > 0) {
          awardArenaXp(verified.xpAwarded, 1, 1, 'Applied Logic');
        }
      }

      mathAutoNextTimeoutRef.current = window.setTimeout(() => {
        generateNewMathProblem(mathDifficulty);
      }, 1700);
    } else {
      soundFx.playIncorrect(mathStreak);
      setMathStreak(0);
      setMathDoubleCritArmed(false);
      setMathPlayerHp((hp) => (hp <= 1 ? 3 : hp - 1));
      setMathSolvedHistory((prev) => [
        {
          question: mathProblem.question,
          answer: mathProblem.answer,
          explanation: mathProblem.explanation,
          correct: false,
        },
        ...prev,
      ]);
      setMathFeedback({
        correct: false,
        message: `Aw man! Correct answer: ${mathProblem.answer}. Step-by-Step: ${mathProblem.explanation}`,
      });

      mathAutoNextTimeoutRef.current = window.setTimeout(() => {
        generateNewMathProblem(mathDifficulty);
      }, 2400);
    }
  };

  // =========================================================================
  // 3. SPELLING BEE CHAMPIONSHIP STATE (WITH STAGE COUNTDOWN CLOCK)
  // =========================================================================
  const [beeIndex, setBeeIndex] = useState(0);
  const [beeInput, setBeeInput] = useState('');
  const [beeScore, setBeeScore] = useState(0);
  const [beeStreak, setBeeStreak] = useState(0);
  const [beeLives, setBeeLives] = useState(3);
  const [beeRevealedCount, setBeeRevealedCount] = useState(1);
  const [beeTimerPreset, setBeeTimerPreset] = useState<number>(25); // 15s Speed Bee, 25s Championship, 40s Scholar, 0 Untimed
  const [beeTimeLeft, setBeeTimeLeft] = useState<number>(25);
  const [beeTimerPaused, setBeeTimerPaused] = useState<boolean>(false);
  const [beePausedThisTurn, setBeePausedThisTurn] = useState<boolean>(false);
  const [beeWordResolved, setBeeWordResolved] = useState<boolean>(false);
  const [beeExtensionUsed, setBeeExtensionUsed] = useState<boolean>(false);
  const beeLastTickSecondRef = useRef<number | null>(null);
  const beeAutoNextTimeoutRef = useRef<number | null>(null);
  const [beeMasteredWords, setBeeMasteredWords] = useState<
    Array<{ word: string; definition: string; subject: string }>
  >([]);
  const [beeFeedback, setBeeFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  // Merge user's real customQuiz vocabulary terms if available!
  const allBeeWords = useMemo(() => {
    const customExtracted: typeof SPELLING_BEE_CHAMPIONSHIP_WORDS = [];
    customQuizzes.forEach((cq) => {
      (cq.questions || []).forEach((q: any) => {
        const ans = String(q.correct_answer || '')
          .trim()
          .toUpperCase();
        if (/^[A-Z]{5,16}$/.test(ans) && !customExtracted.some((w) => w.word === ans)) {
          customExtracted.push({
            word: ans,
            difficulty: 'Medium',
            definition: q.explanation || q.question || `Key term from ${cq.quiz_title}`,
            origin: `From Custom Quiz: ${cq.quiz_title}`,
            syllables: ans.split('').join(' · ').toLowerCase(),
            sentence: q.question || `Master the term ${ans} in ${cq.quiz_title}.`,
            subject: cq.pedagogical_topic || 'Custom Quiz',
          });
        }
      });
    });
    return [...customExtracted, ...SPELLING_BEE_CHAMPIONSHIP_WORDS];
  }, [customQuizzes]);

  const currentBeeWord = allBeeWords[beeIndex % allBeeWords.length];

  const getBeeMaxTime = useCallback(
    (preset: number, wordLength: number) => {
      if (preset <= 0) return 0;
      const lengthBonus = wordLength >= 11 ? 4 : wordLength >= 8 ? 2 : 0;
      return preset + lengthBonus;
    },
    []
  );

  const advanceToNextBeeWord = useCallback(
    (customPreset?: number) => {
      if (beeAutoNextTimeoutRef.current) {
        window.clearTimeout(beeAutoNextTimeoutRef.current);
        beeAutoNextTimeoutRef.current = null;
      }
      const nextIdx = beeIndex + 1;
      const nextWordObj = allBeeWords[nextIdx % allBeeWords.length];
      setBeeIndex(nextIdx);
      setBeeInput('');
      setBeeRevealedCount(1);
      setBeeFeedback(null);
      setBeeTimerPaused(false);
      setBeePausedThisTurn(false);
      setBeeWordResolved(false);
      setBeeExtensionUsed(false);
      const activePreset = customPreset !== undefined ? customPreset : beeTimerPreset;
      setBeeTimeLeft(getBeeMaxTime(activePreset, nextWordObj.word.length));
      beeLastTickSecondRef.current = null;
    },
    [beeIndex, allBeeWords, beeTimerPreset, getBeeMaxTime]
  );

  // Spelling Bee Stage Countdown Effect
  useEffect(() => {
    if (
      activeGameTab !== 'spelling_bee' ||
      beeTimerPreset <= 0 ||
      beeTimerPaused ||
      beeWordResolved
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setBeeTimeLeft((prev) => {
        const next = Math.max(0, Number((prev - 0.1).toFixed(1)));
        const ceilSec = Math.ceil(next);
        if (next > 0 && ceilSec <= 5 && beeLastTickSecondRef.current !== ceilSec) {
          beeLastTickSecondRef.current = ceilSec;
          soundFx.playUrgentTick(ceilSec);
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [activeGameTab, beeTimerPreset, beeTimerPaused, beeWordResolved]);

  // Handle Spelling Bee Timeout when beeTimeLeft hits 0
  useEffect(() => {
    if (
      activeGameTab !== 'spelling_bee' ||
      beeTimerPreset <= 0 ||
      beeWordResolved ||
      beeTimeLeft > 0
    ) {
      return;
    }

    setBeeWordResolved(true);
    soundFx.playBuzzer();
    setBeeStreak(0);
    setBeeLives((l) => (l <= 1 ? 3 : l - 1));
    setBeeRevealedCount(currentBeeWord.word.length);
    setBeeFeedback({
      correct: false,
      message: `⏰ STAGE CLOCK EXPIRED (-1 ❤️)! The correct spelling is ${currentBeeWord.word} (${currentBeeWord.syllables}).`,
    });

    beeAutoNextTimeoutRef.current = window.setTimeout(() => {
      advanceToNextBeeWord();
    }, 2600);
  }, [
    activeGameTab,
    beeTimerPreset,
    beeWordResolved,
    beeTimeLeft,
    currentBeeWord,
    advanceToNextBeeWord,
  ]);

  const handleSpeakBeeWord = (mode: 'full' | 'word_only' | 'sentence' = 'full') => {
    soundFx.playClick();
    if (mode === 'word_only') {
      speechEngine.speak(currentBeeWord.word);
    } else if (mode === 'sentence') {
      speechEngine.speak(`Used in a sentence: ${currentBeeWord.sentence}`);
    } else {
      speechEngine.speak(
        `${currentBeeWord.word}. Definition: ${currentBeeWord.definition}. Used in a sentence: ${currentBeeWord.sentence}`
      );
    }
  };

  const maxAllowedBeeReveals = Math.max(2, Math.ceil(currentBeeWord.word.length * 0.35));

  const handleRevealNextBeeLetter = () => {
    if (beeRevealedCount >= maxAllowedBeeReveals) {
      soundFx.playBuzzer();
      return;
    }
    soundFx.playPowerUp('Letter Revealed! (-2.5s Clock Penalty)');
    const nextReveal = Math.min(maxAllowedBeeReveals, beeRevealedCount + 1);
    setBeeRevealedCount(nextReveal);
    setBeeInput(currentBeeWord.word.slice(0, nextReveal));
    if (beeTimerPreset > 0 && !beeWordResolved) {
      setBeeTimeLeft((prev) => Math.max(1.5, Number((prev - 2.5).toFixed(1))));
    }
  };

  const handleBeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (beeWordResolved) {
      advanceToNextBeeWord();
      return;
    }
    const cleaned = beeInput.trim().toUpperCase();
    if (!cleaned) return;

    setBeeWordResolved(true);

    if (cleaned === currentBeeWord.word.toUpperCase()) {
      const nextStreak = beeStreak + 1;
      soundFx.playWordAccepted(cleaned.length, nextStreak);
      const usedAssist = beePausedThisTurn || beeExtensionUsed || beeRevealedCount > 1;
      const speedBonusXp =
        beeTimerPreset > 0 && !usedAssist ? Math.round(beeTimeLeft * 1.2) : 0;
      const rawXp = Math.max(
        10,
        30 + nextStreak * 5 - (beeRevealedCount - 1) * 8 + speedBonusXp
      );
      const verified = verifyArenaItemXp('spelling_bee', currentBeeWord.word, rawXp);
      setBeeStreak(nextStreak);
      setBeeScore((s) => s + verified.xpAwarded);
      setBeeMasteredWords((prev) =>
        prev.some((w) => w.word === currentBeeWord.word)
          ? prev
          : [
              {
                word: currentBeeWord.word,
                definition: currentBeeWord.definition,
                subject: currentBeeWord.subject,
              },
              ...prev,
            ]
      );
      setBeeFeedback({
        correct: true,
        message: `🏆 Championship Spelling! "${currentBeeWord.word}" (+${verified.xpAwarded} Verified XP${
          speedBonusXp > 0 ? ` · ⏱️ +${speedBonusXp} Speed Bonus` : ''
        }${verified.reason ? ` · [${verified.reason}]` : ''}) — ${currentBeeWord.origin}`,
      });
      if (verified.xpAwarded > 0) {
        awardArenaXp(verified.xpAwarded, 1, 1, 'Foundations');
      }

      beeAutoNextTimeoutRef.current = window.setTimeout(() => {
        advanceToNextBeeWord();
      }, 1900);
    } else {
      soundFx.playIncorrect(beeStreak);
      setBeeStreak(0);
      setBeeLives((l) => (l <= 1 ? 3 : l - 1));
      setBeeFeedback({
        correct: false,
        message: `Aw man! You typed "${cleaned}". The correct spelling is ${currentBeeWord.word} (${currentBeeWord.syllables}).`,
      });

      beeAutoNextTimeoutRef.current = window.setTimeout(() => {
        advanceToNextBeeWord();
      }, 2500);
    }
  };

  const currentPlayer = players[currentTurnIndex];
  const winnerPlayer = useMemo(() => {
    if (players.length === 0) return null;
    const alive = players.filter((p) => !p.eliminated);
    if (alive.length === 1) return alive[0];
    return [...players].sort((a, b) => b.score - a.score)[0];
  }, [players]);

  const activeDisplayedWord = currentPlayer?.isAi
    ? aiTypingPreview
    : inputWord.toUpperCase();

  return (
    <div className="space-y-6 pb-16">
      {/* ===================================================================== */}
      {/* TOP ARCADE HEADER & SOUND / VOICE ANNOUNCER CONTROLS                  */}
      {/* ===================================================================== */}
      <div className="rounded-3xl border-2 border-indigo-400/60 border-b-[6px] border-b-indigo-950 command-deck-hero command-deck-grid holo-shimmer-bar p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-slate-950/35 text-white border border-white/25 shadow-2xs">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Official Arcade Study Arena</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 border-b-2 border-emerald-700 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                <span>Anti-Cheese Shield Active · Verified XP</span>
              </span>

              {/* Voice Callout Announcer Toggle ("Correct!", "Aw man!", "You're on a roll!") */}
              <button
                type="button"
                onClick={toggleVoiceCallouts}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  voiceCalloutsOn
                    ? 'bg-white text-slate-950 border-white shadow-2xs'
                    : 'bg-slate-950/40 text-white border-white/25'
                }`}
                title="Toggle Arcade Voice Callouts ('Correct!', 'Aw man!', 'You're on a roll!')"
              >
                {voiceCalloutsOn ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-white/80" />
                )}
                <span>Voice Callouts: {voiceCalloutsOn ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => soundFx.playCorrect(3)}
                className="px-3 py-1 rounded-xl text-[11px] font-black bg-amber-300 hover:bg-amber-200 text-slate-950 border-b-2 border-amber-600 cursor-pointer transition-all shadow-2xs"
                title="Test 'You're on a roll!' Streak Sound"
              >
                🔊 Test "On a Roll!"
              </button>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Interactive Educational Games Arena
            </h1>
            <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed">
              Survive the ticking bomb table in <strong>Last Letter: One by One</strong>, defeat algebra &amp; calculus bosses under the clock in <strong>Math Boss Rush</strong>, or conquer roots on the <strong>Spelling Bee Championship</strong> stage — backed by anti-pause shields and verified-effort XP.
            </p>
          </div>

          {/* Game Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/45 p-1.5 rounded-2xl border-2 border-white/25 self-start">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveGameTab('one_by_one');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeGameTab === 'one_by_one'
                  ? 'bg-white text-slate-950 border-b-3 border-slate-300 shadow-md'
                  : 'text-white hover:bg-white/15'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Last Letter (One by One)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveGameTab('math_quiz');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeGameTab === 'math_quiz'
                  ? 'bg-emerald-400 text-slate-950 border-b-3 border-emerald-700 shadow-md'
                  : 'text-white hover:bg-white/15'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Math Boss Rush</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveGameTab('spelling_bee');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeGameTab === 'spelling_bee'
                  ? 'bg-amber-300 text-slate-950 border-b-3 border-amber-600 shadow-md'
                  : 'text-white hover:bg-white/15'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Spelling Bee</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODE 1: ROBLOX "LAST LETTER" / ONE BY ONE BOMB TABLE ARENA            */}
      {/* ===================================================================== */}
      {activeGameTab === 'one_by_one' && (
        <>
          {/* 1A. SETUP SCREEN */}
          {gameState === 'setup' && (
            <div className="comic-pop-card rounded-3xl border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden space-y-6">
              <div className="pattern-halftone bg-indigo-50/70 dark:bg-indigo-950/30 border-b-2 border-slate-900 dark:border-slate-800 px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    <span className="comic-badge comic-badge-tilt-left px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-black">
                      BOMB TABLE!
                    </span>
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>Inspired by Roblox Last Letter · Academic Bomb Table</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    Configure Your Last Letter Bomb Table Match
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                    Sit around the circular bomb table! Type a valid concept starting with the ending letter(s) of the previous word before the bomb fuse runs out. Every concept you play unlocks definitions &amp; builds a custom study quiz!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartOneByOne}
                  className="px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-slate-900 border-b-4 text-sm font-black flex items-center gap-2.5 shadow-lg cursor-pointer self-start shrink-0 transition-transform active:translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Enter Bomb Table Arena</span>
                </button>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Subject Selection */}
                <div className="space-y-2.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    1. Select Academic Subject / Domain
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Biology',
                      'Mathematics',
                      'Chemistry',
                      'Physics',
                      'History',
                      'Geography',
                      'English',
                      'Computer Science',
                      'General Knowledge',
                      'Custom Topic',
                    ].map((subj) => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => {
                          soundFx.playSelect();
                          setSubject(subj);
                        }}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                          subject === subj
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black shadow-2xs'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>

                  {(subject === 'Custom Topic' || variant === 'topic') && (
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Enter custom topic (e.g., Neuroscience, Macroeconomics, Space)..."
                      className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  )}
                </div>

                {/* 2. Difficulty & Table Seating Mode */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      2. AI Challenger Intelligence
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Easy', 'Medium', 'Hard', 'Expert'] as OneByOneDifficulty[]).map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => {
                            soundFx.playSelect();
                            setDifficulty(diff);
                          }}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            difficulty === diff
                              ? 'border-indigo-600 bg-indigo-600 text-white font-black'
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      3. Bomb Table Seating
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'bot_royale', label: '🔥 4-Seat Bot Royale' },
                        { id: 'solo_ai', label: '🤖 1v1 Duel vs AI' },
                        { id: '2p', label: '👥 2P Pass & Play' },
                        { id: '4p', label: '🎉 4P Party Table' },
                      ].map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => {
                            soundFx.playSelect();
                            setPlayerMode(pm.id as any);
                          }}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            playerMode === pm.id
                              ? 'border-emerald-600 bg-emerald-600 text-white font-black'
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {pm.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Fuse Timer, Hearts & Rule Variant */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      4. Starting Bomb Fuse Timer
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[8, 12, 15, 20].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            soundFx.playSelect();
                            setTimerSeconds(sec);
                          }}
                          className={`py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            timerSeconds === sec
                              ? 'border-amber-500 bg-amber-500 text-slate-950'
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      5. Player Hearts (Lives)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 3, 5].map((lv) => (
                        <button
                          key={lv}
                          type="button"
                          onClick={() => {
                            soundFx.playSelect();
                            setStartingLives(lv);
                          }}
                          className={`py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            startingLives === lv
                              ? 'border-rose-500 bg-rose-600 text-white'
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {'❤️'.repeat(Math.min(3, lv))} {lv} {lv === 1 ? 'Life' : 'Lives'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      6. Last Letter Rule Variant
                    </label>
                    <select
                      value={variant}
                      onChange={(e) => setVariant(e.target.value as OneByOneVariant)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="subject">Subject Mastery (Words must fit Subject + Escalating Fuse)</option>
                      <option value="classic">Roblox Classic Freeplay (Any valid word allowed)</option>
                      <option value="double_letter">Double-Letter Hardcore (Last 1–2 letters required!)</option>
                      <option value="survival">Sudden Death Survival (1 Heart — No Mistakes!)</option>
                      <option value="speed">Hyper Blitz (6-Second Bomb Fuse)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1B. ACTIVE ROBLOX LAST LETTER BOMB TABLE ARENA */}
          {gameState === 'playing' && currentPlayer && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT 8 COLS: CIRCULAR BOMB TABLE & LIVE LETTER SLOTS */}
              <div className="lg:col-span-8 space-y-4">
                <div
                  className={`rounded-3xl border-2 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-transform ${
                    bombExploding
                      ? 'border-rose-500 scale-[0.99] ring-4 ring-rose-500/40'
                      : 'border-indigo-500/40'
                  }`}
                >
                  {/* Top Arena Telemetry Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-black">
                        📚 {effectiveSubject}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-white/5 text-slate-300 border border-white/10">
                        Round {roundNumber}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        ⭐ Bonus Letter: "{bonusLetter}" (+5 pts)
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        🔗 {usedWords.length} Words Chained
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGameState('finished')}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 text-xs font-bold cursor-pointer transition-colors"
                    >
                      Finish &amp; Review Concepts
                    </button>
                  </div>

                  {/* ROBLOX LAST LETTER CIRCULAR BOMB TABLE SEATING */}
                  <div className="my-6 relative">
                    {/* Player Seats Grid Around the Central Bomb */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {players.map((p, idx) => {
                        const isTurn = idx === currentTurnIndex;
                        return (
                          <div
                            key={p.id}
                            className={`relative p-3.5 rounded-2xl border-2 transition-all ${
                              p.eliminated
                                ? 'border-slate-800 bg-slate-900/40 opacity-45 grayscale'
                                : isTurn
                                ? 'border-amber-400 bg-gradient-to-br from-indigo-900/80 to-violet-900/80 shadow-lg shadow-amber-500/20 scale-[1.03]'
                                : 'border-white/10 bg-white/5'
                            }`}
                          >
                            {isTurn && !p.eliminated && (
                              <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                                💣 Holding Bomb
                              </span>
                            )}
                            {p.shieldActive && (
                              <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-400 text-slate-950">
                                🛡️ Shielded
                              </span>
                            )}

                            <div className="flex items-center justify-between gap-2 mt-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${p.colorClass} flex items-center justify-center text-base shadow-xs shrink-0`}
                                >
                                  {p.avatarEmoji}
                                </span>
                                <div className="min-w-0">
                                  <div className="text-xs font-black text-white truncate">
                                    {p.name}
                                  </div>
                                  <div className="text-[10px] font-bold text-indigo-300">
                                    {p.score} PTS
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10 text-[11px]">
                              {p.eliminated ? (
                                <span className="font-black text-rose-400 uppercase tracking-wider text-[10px]">
                                  💀 ELIMINATED
                                </span>
                              ) : (
                                <span className="tracking-tight">
                                  {'❤️'.repeat(p.lives)}
                                  {'🖤'.repeat(Math.max(0, p.maxLives - p.lives))}
                                </span>
                              )}
                              {p.streak >= 2 && !p.eliminated && (
                                <span className="font-black text-amber-400 text-[10px]">
                                  🔥 {p.streak}x
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* CENTER TABLE: TICKING TIME BOMB + PREVIOUS WORD -> REQUIRED LETTER */}
                    <div className="rounded-3xl border border-white/15 bg-slate-950/90 p-6 text-center space-y-5 shadow-inner relative overflow-hidden">
                      {/* Bomb Fuse Progress Bar */}
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            timeLeft <= 4
                              ? 'bg-gradient-to-r from-rose-600 to-amber-500 animate-pulse'
                              : timeLeft <= 8
                              ? 'bg-amber-400'
                              : 'bg-gradient-to-r from-emerald-400 to-indigo-500'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.round((timeLeft / Math.max(1, maxTurnTime)) * 100))}%`,
                          }}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
                        {/* Previous Chained Word */}
                        <div className="px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 min-w-[175px]">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Previous Word
                          </div>
                          <div className="text-xl sm:text-2xl font-black tracking-wider text-white mt-1">
                            {currentWord.slice(0, currentWord.length - requiredLetter.length)}
                            <span className="text-amber-400 underline decoration-2 underline-offset-4">
                              {currentWord.slice(currentWord.length - requiredLetter.length)}
                            </span>
                          </div>
                        </div>

                        {/* Central Ticking Bomb Visualizer */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all shadow-2xl ${
                              bombExploding
                                ? 'bg-rose-600 border-amber-300 scale-125'
                                : timeLeft <= 4
                                ? 'bg-rose-950/90 border-rose-500 shadow-rose-500/40 animate-bounce'
                                : 'bg-indigo-950/90 border-indigo-400 shadow-indigo-500/30'
                            }`}
                          >
                            <span className="text-2xl">
                              {bombExploding ? '💥' : timeLeft <= 4 ? '🧨' : '💣'}
                            </span>
                            <span
                              className={`text-xl font-black font-mono ${
                                timeLeft <= 4 ? 'text-rose-300' : 'text-white'
                              }`}
                            >
                              {timeLeft}s
                            </span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1.5">
                            {currentPlayer.isAi
                              ? `${currentPlayer.name} is typing...`
                              : 'Your Turn! Pass the Bomb!'}
                          </span>
                        </div>

                        {/* Required Starting Letter(s) Badge */}
                        <div className="px-6 py-3.5 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-slate-950 shadow-xl shadow-orange-500/25 min-w-[175px]">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-950/80">
                            Must Start With
                          </div>
                          <div className="text-3xl sm:text-4xl font-black tracking-widest mt-0.5">
                            {requiredLetter}
                          </div>
                        </div>
                      </div>

                      {/* LIVE ROBLOX LAST LETTER 3D TILE PREVIEW */}
                      <div className="py-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">
                          Live Table Letter Tiles
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-1.5 min-h-[52px]">
                          {(activeDisplayedWord || requiredLetter).split('').map((ch, idx) => {
                            const isPrefixChar = idx < requiredLetter.length;
                            const isBonusChar = ch === bonusLetter;
                            return (
                              <span
                                key={idx}
                                className={`w-10 h-12 sm:w-11 sm:h-13 rounded-xl font-black text-lg sm:text-xl flex items-center justify-center border-b-4 transition-all transform ${
                                  isPrefixChar
                                    ? 'bg-amber-400 text-slate-950 border-amber-600 shadow-md shadow-amber-500/20 scale-105'
                                    : isBonusChar
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-700 shadow-md'
                                    : 'bg-slate-800 text-white border-slate-950'
                                }`}
                              >
                                {ch}
                              </span>
                            );
                          })}
                          <span className="w-3 h-8 bg-indigo-400 animate-pulse rounded-xs ml-1" />
                        </div>
                      </div>

                      {/* Word Input Form for Human Player */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!currentPlayer.isAi) {
                            submitWordTurn(inputWord);
                          }
                        }}
                        className="max-w-xl mx-auto space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <input
                            ref={wordInputRef}
                            type="text"
                            disabled={currentPlayer.isAi || isValidating}
                            value={inputWord}
                            onChange={(e) => {
                              soundFx.playKeystroke();
                              setInputWord(e.target.value);
                            }}
                            placeholder={
                              currentPlayer.isAi
                                ? `${currentPlayer.name} is thinking of a "${requiredLetter}..." concept...`
                                : `Type a ${effectiveSubject} word starting with "${requiredLetter}"...`
                            }
                            className="flex-1 px-5 py-4 rounded-2xl border-2 border-indigo-500/50 bg-slate-900 text-base sm:text-lg font-black text-white uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-400 placeholder:text-sm focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="submit"
                            disabled={currentPlayer.isAi || isValidating || !inputWord.trim()}
                            className="px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-black text-sm uppercase tracking-wider cursor-pointer shrink-0 shadow-lg shadow-amber-500/25"
                          >
                            {isValidating ? 'Verifying...' : 'Lock Word →'}
                          </button>
                        </div>
                      </form>

                      {/* Tactical Power-Ups Bar (Earned via streaks & long words) */}
                      {!currentPlayer.isAi && (
                        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            disabled={powerUps.freezeFuse <= 0}
                            onClick={handleUseFreezeFuse}
                            className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 disabled:opacity-35 border border-cyan-400/30 text-cyan-300 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Snowflake className="w-3.5 h-3.5" />
                            <span>+5s Freeze ({powerUps.freezeFuse})</span>
                          </button>

                          <button
                            type="button"
                            disabled={powerUps.rerollLetter <= 0}
                            onClick={handleUseRerollLetter}
                            className="px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 disabled:opacity-35 border border-purple-400/30 text-purple-300 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reroll Letter ({powerUps.rerollLetter})</span>
                          </button>

                          <button
                            type="button"
                            disabled={powerUps.conceptHint <= 0}
                            onClick={handleUseConceptHint}
                            className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 disabled:opacity-35 border border-amber-400/30 text-amber-300 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Concept Hint ({powerUps.conceptHint})</span>
                          </button>

                          <button
                            type="button"
                            disabled={powerUps.strikeShield <= 0 || Boolean(currentPlayer.shieldActive)}
                            onClick={handleUseStrikeShield}
                            className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-35 border border-emerald-400/30 text-emerald-300 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            <span>Strike Shield ({powerUps.strikeShield})</span>
                          </button>
                        </div>
                      )}

                      {/* Active Hint Banner */}
                      {activeHintText && (
                        <div className="max-w-xl mx-auto p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-bold text-left">
                          {activeHintText}
                        </div>
                      )}

                      {/* Instant Feedback Banner */}
                      {feedbackBanner && (
                        <div
                          className={`max-w-xl mx-auto p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-4 ${
                            feedbackBanner.type === 'valid'
                              ? 'border-emerald-400/80 bg-emerald-950/70 text-emerald-100'
                              : 'border-rose-500/80 bg-rose-950/70 text-rose-100'
                          }`}
                        >
                          <div>
                            <div className="text-sm font-black">{feedbackBanner.title}</div>
                            <div className="text-xs font-semibold opacity-90 mt-0.5">
                              {feedbackBanner.subtitle}
                            </div>
                          </div>
                          {feedbackBanner.xpText && (
                            <div className="text-base font-black text-amber-300 shrink-0">
                              {feedbackBanner.xpText}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT 4 COLS: LIVE CONCEPT MASTERY CODEX (DEEP EDUCATIONAL VALUE!) */}
              <div className="lg:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Live Learning Codex
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Unlocked Concepts ({chainHistory.length})
                    </h3>
                  </div>

                  {chainHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleLaunchQuizFromConcepts(
                          effectiveSubject,
                          chainHistory.map((c) => ({
                            word: c.word,
                            definition: c.definition,
                            detailed: c.detailedExplanation,
                          }))
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black cursor-pointer shadow-xs"
                    >
                      ⚡ Quiz Me on Chain
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Every valid word played at the bomb table unlocks its academic definition here. Click any word to inspect or convert the chain into a playable quiz!
                </p>

                {chainHistory.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <BookOpen className="w-7 h-7 text-indigo-500 mx-auto" />
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                      Chain Your First Concept!
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Submit a word starting with "{requiredLetter}" to unlock its definition &amp; XP breakdown.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {chainHistory.map((item, idx) => (
                      <div
                        key={`${item.word}_${idx}`}
                        onClick={() => setLearnMoreModalEntry(item)}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/70 dark:bg-slate-800/50 cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black text-xs">
                              {item.word}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">
                              by {item.playerName}
                            </span>
                          </div>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            +{item.points} pts
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {item.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 1C. POST-GAME SUMMARY & ONE-CLICK QUIZ / NOTES GENERATOR */}
          {gameState === 'finished' && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-500">
                    <Trophy className="w-4 h-4" />
                    <span>Last Letter Bomb Table Complete</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {winnerPlayer ? `🏆 Winner: ${winnerPlayer.name}` : 'Session Complete'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Subject: <strong>{effectiveSubject}</strong> · {chainHistory.length} Concepts Mastered · {roundNumber} Rounds Survived
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {chainHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleLaunchQuizFromConcepts(
                          effectiveSubject,
                          chainHistory.map((c) => ({
                            word: c.word,
                            definition: c.definition,
                            detailed: c.detailedExplanation,
                          }))
                        )
                      }
                      className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Launch Playable Quiz from These {chainHistory.length} Concepts</span>
                    </button>
                  )}

                  {onGenerateNotesForTopic && (
                    <button
                      type="button"
                      onClick={() => onGenerateNotesForTopic(effectiveSubject)}
                      className="px-4 py-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-black flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Open Study Notes</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleStartOneByOne}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGameState('setup')}
                    className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Change Setup
                  </button>
                </div>
              </div>

              {/* Concept Mastery Review Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Concepts Discovered &amp; Definitions ({chainHistory.length})
                </h3>
                {chainHistory.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No concepts were chained in this match. Jump back in and lock in your first word!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {chainHistory.map((entry, idx) => (
                      <div
                        key={`${entry.word}_${idx}`}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                              {idx + 1}. {entry.word}
                            </span>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              +{entry.points} XP ({entry.playerName})
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                            {entry.definition}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          {entry.detailedExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ===================================================================== */}
      {/* MODE 2: MATH BOSS RUSH & STEP-BY-STEP CALCULATION ARENA               */}
      {/* ===================================================================== */}
      {activeGameTab === 'math_quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Cols: Active Math Boss Battle */}
          <div className="lg:col-span-8 comic-pop-card pattern-blueprint-grid rounded-3xl border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
            {/* Boss Header Banner */}
            <div
              className={`rounded-2xl p-5 bg-gradient-to-r ${currentMathBoss.accent} text-white border-2 border-slate-900 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-950/40 backdrop-blur-xs flex items-center justify-center text-3xl border-2 border-white/30 shadow-md">
                  {currentMathBoss.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="comic-badge comic-badge-tilt-left px-2 py-0.5 rounded-md bg-amber-300 text-slate-950 text-[10px] font-black uppercase">
                      VS BOSS!
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                      Active Math Boss · {currentMathBoss.topic}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black mt-0.5">{currentMathBoss.name}</h2>
                  <p className="text-xs text-white/95 font-medium">{currentMathBoss.title}</p>
                </div>
              </div>

              <div className="min-w-[180px] space-y-1.5 bg-slate-950/30 p-3 rounded-xl border border-white/15">
                <div className="flex items-center justify-between text-xs font-black">
                  <span>BOSS HP</span>
                  <span>
                    {mathBossHp} / {currentMathBoss.maxHp}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-300 transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.round((mathBossHp / currentMathBoss.maxHp) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Difficulty, Strike Timer Controls & Telemetry Bar */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setMathDifficulty(diff);
                        generateNewMathProblem(diff);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        mathDifficulty === diff
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>

                {/* Timer Challenge Selector */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-emerald-500" />
                    Clock:
                  </span>
                  {[
                    { label: '⚡ Blitz 12s', sec: 12 },
                    { label: '⏱️ Standard 20s', sec: 20 },
                    { label: '🛡️ Relaxed 30s', sec: 30 },
                    { label: '∞ Untimed', sec: 0 },
                  ].map((preset) => (
                    <button
                      key={preset.sec}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setMathTimerPreset(preset.sec);
                        setMathTimerPaused(false);
                        generateNewMathProblem(mathDifficulty, preset.sec);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                        mathTimerPreset === preset.sec
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2.5 text-xs font-black">
                  <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                    {'❤️'.repeat(mathPlayerHp)}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                    Score: {mathScore} XP
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                    🔥 Streak: {mathStreak}
                  </span>
                </div>
              </div>

              {/* Active Strike Countdown Bar */}
              {mathTimerPreset > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black">
                    <div className="flex items-center gap-2">
                      <Timer
                        className={`w-4 h-4 ${
                          mathTimeLeft <= 5
                            ? 'text-rose-500 animate-bounce'
                            : mathTimeLeft <= 10
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      />
                      <span className="uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Boss Counter-Attack Timer
                      </span>
                      {mathTimeLeft <= 5 && !mathProblemResolved && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] uppercase animate-pulse">
                          Hurry!
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-sm px-2.5 py-0.5 rounded-lg border ${
                          mathTimeLeft <= 5
                            ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-400 text-rose-600 dark:text-rose-300'
                            : mathTimeLeft <= 10
                            ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-400 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {mathTimeLeft.toFixed(1)}s
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setMathTimerPaused((p) => {
                            const next = !p;
                            if (next) setMathPausedThisTurn(true);
                            return next;
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                        title="Pausing activates the Anti-Cheese Shield (cloaks equation & disables Speed Bonus)"
                      >
                        {mathTimerPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                        <span>{mathTimerPaused ? 'Resume' : 'Pause'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-100 rounded-full ${
                        mathTimeLeft <= 5
                          ? 'bg-rose-500'
                          : mathTimeLeft <= 10
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (mathTimeLeft / getMathMaxTime(mathTimerPreset, mathDifficulty)) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Active Math Problem Display with Anti-Cheese Pause Shield */}
            <div className="relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 text-center space-y-5 overflow-hidden">
              {mathTimerPaused && !mathProblemResolved && (
                <div className="absolute inset-0 z-20 pause-shield-overlay flex flex-col items-center justify-center p-6 text-center">
                  <ShieldCheck className="w-9 h-9 text-amber-400 mb-2 animate-bounce" />
                  <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300">
                    Anti-Cheese Pause Shield Active
                  </p>
                  <p className="text-xs text-slate-300 max-w-md mt-1">
                    Active math equations are cloaked while the battle clock is paused so solutions cannot be farmed offline.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMathTimerPaused(false)}
                    className="mt-3.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer transition-all shadow-md"
                  >
                    ▶ Resume Battle Clock
                  </button>
                </div>
              )}
              <div className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Solve to Strike {currentMathBoss.name}
              </div>
              <div
                className={`text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono transition-all ${
                  mathTimerPaused && !mathProblemResolved ? 'blur-xl select-none' : ''
                }`}
              >
                {mathProblem.question}
              </div>

              {/* Tactical Math Lifelines */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPowerUp('Formula Hint!');
                    setShowMathStepHint(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-black cursor-pointer flex items-center gap-1.5"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Show Method &amp; Formula Hint</span>
                </button>

                <button
                  type="button"
                  disabled={mathDoubleCritArmed}
                  onClick={() => {
                    soundFx.playPowerUp('2x Critical Strike Armed!');
                    setMathDoubleCritArmed(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-black cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{mathDoubleCritArmed ? '⚡ 2x Crit Armed!' : 'Arm 2x Critical Damage'}</span>
                </button>

                {mathTimerPreset > 0 && (
                  <button
                    type="button"
                    disabled={mathFreezeUsed || mathProblemResolved}
                    onClick={() => {
                      soundFx.playPowerUp('+10s Chrono Boost!');
                      setMathFreezeUsed(true);
                      setMathTimeLeft((t) => t + 10);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-black cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>{mathFreezeUsed ? '❄️ +10s Used' : '❄️ +10s Time Boost'}</span>
                  </button>
                )}
              </div>

              {showMathStepHint && (
                <div className="max-w-lg mx-auto p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  📐 {mathProblem.formulaHint}
                </div>
              )}

              <form onSubmit={handleMathSubmit} className="max-w-md mx-auto flex gap-2.5">
                <input
                  type="number"
                  step="any"
                  value={mathAnswerInput}
                  onChange={(e) => setMathAnswerInput(e.target.value)}
                  placeholder="Enter numerical value..."
                  className="flex-1 px-4 py-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-lg font-black text-center text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Attack Boss
                </button>
                <button
                  type="button"
                  onClick={() => generateNewMathProblem(mathDifficulty)}
                  className="px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Next
                </button>
              </form>

              {mathFeedback && (
                <div
                  className={`max-w-lg mx-auto p-4 rounded-2xl border text-xs font-bold text-left ${
                    mathFeedback.correct
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {mathFeedback.message}
                </div>
              )}
            </div>
          </div>

          {/* Right 4 Cols: Step-by-Step Solutions Log & Convert to Quiz */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  Step-by-Step Solution Log
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Solved Problems ({mathSolvedHistory.length})
                </h3>
              </div>
              {mathSolvedHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    handleLaunchQuizFromConcepts(
                      'Mathematics & Algebra',
                      mathSolvedHistory.map((m) => ({
                        word: String(m.answer),
                        definition: m.question,
                        detailed: m.explanation,
                      }))
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black cursor-pointer"
                >
                  Practice as Quiz
                </button>
              )}
            </div>

            {mathSolvedHistory.length === 0 ? (
              <p className="text-xs text-slate-500">
                Solve your first problem against {currentMathBoss.name} to record step-by-step derivations here!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {mathSolvedHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-black">
                      <span className="text-slate-900 dark:text-white">{item.question}</span>
                      <span className={item.correct ? 'text-emerald-600' : 'text-rose-500'}>
                        = {item.answer}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 3: SPELLING BEE CHAMPIONSHIP TOURNAMENT                          */}
      {/* ===================================================================== */}
      {activeGameTab === 'spelling_bee' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Cols: Interactive Letter-Slot Stage */}
          <div className="lg:col-span-8 comic-pop-card pattern-stripes-amber rounded-3xl border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col gap-4 border-b-2 border-slate-200 dark:border-slate-800 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="comic-badge comic-badge-tilt-left px-2 py-0.5 rounded-md bg-amber-300 text-slate-950 text-[10px] font-black uppercase">
                      SPELL IT!
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Academic Spelling &amp; Etymology Championship
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    Master Scientific &amp; Literary Terminology
                  </h2>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-black">
                  <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                    {'❤️'.repeat(beeLives)}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                    🏆 {beeScore} XP
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                    🔥 Streak: {beeStreak}
                  </span>
                </div>
              </div>

              {/* Spelling Bee Stage Timer Controls & Progress Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-amber-500" />
                    Stage Clock:
                  </span>
                  {[
                    { label: '⚡ Speed Bee 15s', sec: 15 },
                    { label: '🏆 Championship 25s', sec: 25 },
                    { label: '🎓 Scholar 40s', sec: 40 },
                    { label: '∞ Untimed', sec: 0 },
                  ].map((preset) => (
                    <button
                      key={preset.sec}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setBeeTimerPreset(preset.sec);
                        setBeeTimerPaused(false);
                        setBeeWordResolved(false);
                        setBeeTimeLeft(getBeeMaxTime(preset.sec, currentBeeWord.word.length));
                        beeLastTickSecondRef.current = null;
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                        beeTimerPreset === preset.sec
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {beeTimerPreset > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={beeExtensionUsed || beeWordResolved}
                      onClick={() => {
                        soundFx.playPowerUp("+12s Judge's Extension!");
                        setBeeExtensionUsed(true);
                        setBeeTimeLeft((t) => t + 12);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-black cursor-pointer disabled:opacity-40 flex items-center gap-1"
                    >
                      <Snowflake className="w-3.5 h-3.5" />
                      <span>{beeExtensionUsed ? '+12s Used' : '+12s Extra Time'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setBeeTimerPaused((p) => {
                          const next = !p;
                          if (next) setBeePausedThisTurn(true);
                          return next;
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                      title="Pausing activates the Anti-Cheese Shield (cloaks clues & disables Speed Bonus)"
                    >
                      {beeTimerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      <span>{beeTimerPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                  </div>
                )}
              </div>

              {beeTimerPreset > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black">
                    <div className="flex items-center gap-2">
                      <Timer
                        className={`w-4 h-4 ${
                          beeTimeLeft <= 5
                            ? 'text-rose-500 animate-bounce'
                            : beeTimeLeft <= 10
                            ? 'text-amber-500'
                            : 'text-indigo-500'
                        }`}
                      />
                      <span className="uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Official Championship Stage Clock
                      </span>
                      {beeTimeLeft <= 5 && !beeWordResolved && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] uppercase animate-pulse">
                          Final Seconds!
                        </span>
                      )}
                    </div>

                    <span
                      className={`font-mono text-sm px-2.5 py-0.5 rounded-lg border ${
                        beeTimeLeft <= 5
                          ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-400 text-rose-600 dark:text-rose-300'
                          : beeTimeLeft <= 10
                          ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-400 text-amber-700 dark:text-amber-300'
                          : 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {beeTimeLeft.toFixed(1)}s
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-100 rounded-full ${
                        beeTimeLeft <= 5
                          ? 'bg-rose-500'
                          : beeTimeLeft <= 10
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (beeTimeLeft / getBeeMaxTime(beeTimerPreset, currentBeeWord.word.length)) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-6 text-center overflow-hidden">
              {beeTimerPaused && !beeWordResolved && (
                <div className="absolute inset-0 z-20 pause-shield-overlay flex flex-col items-center justify-center p-6 text-center">
                  <ShieldCheck className="w-9 h-9 text-amber-400 mb-2 animate-bounce" />
                  <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300">
                    Stage Clock Paused · Clues &amp; Tiles Cloaked
                  </p>
                  <p className="text-xs text-slate-300 max-w-md mt-1">
                    Definitions, roots, and letter slots are cloaked while paused to prevent external lookup farming.
                  </p>
                  <button
                    type="button"
                    onClick={() => setBeeTimerPaused(false)}
                    className="mt-3.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer transition-all shadow-md"
                  >
                    ▶ Resume Stage Clock
                  </button>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-black">
                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Subject: {currentBeeWord.subject}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Difficulty: {currentBeeWord.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {currentBeeWord.word.length} Letters
                </span>
              </div>

              {/* Pronunciation & Lifeline Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSpeakBeeWord('full')}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Hear Word + Definition</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSpeakBeeWord('sentence')}
                  className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs cursor-pointer"
                >
                  🔊 Hear in Sentence
                </button>

                <button
                  type="button"
                  disabled={beeRevealedCount >= maxAllowedBeeReveals}
                  onClick={handleRevealNextBeeLetter}
                  className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-black text-xs cursor-pointer"
                  title="Reveals up to 35% of the word (-8 XP & -2.5s Stage Clock per reveal)"
                >
                  🔤 Reveal Letter ({beeRevealedCount}/{maxAllowedBeeReveals} Max · -8 XP)
                </button>
              </div>

              {/* Interactive Letter-Slot Visualizer */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
                {currentBeeWord.word.split('').map((targetChar, idx) => {
                  const typedChar = beeInput.toUpperCase()[idx];
                  const isRevealed = idx < beeRevealedCount;
                  const displayChar = typedChar || (isRevealed ? targetChar : '_');
                  return (
                    <span
                      key={idx}
                      className={`w-9 h-11 sm:w-10 sm:h-12 rounded-xl font-mono font-black text-base sm:text-lg flex items-center justify-center border-2 transition-all ${
                        typedChar
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
                          : isRevealed
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400'
                      }`}
                    >
                      {displayChar}
                    </span>
                  );
                })}
              </div>

              {/* Clues Card */}
              <div className="max-w-xl mx-auto text-left space-y-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="font-black text-slate-500 uppercase">Definition: </span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {currentBeeWord.definition}
                  </span>
                </div>
                <div>
                  <span className="font-black text-slate-500 uppercase">Etymology / Root: </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {currentBeeWord.origin}
                  </span>
                </div>
              </div>

              <form onSubmit={handleBeeSubmit} className="max-w-lg mx-auto flex gap-2.5">
                <input
                  type="text"
                  value={beeInput}
                  onChange={(e) => {
                    soundFx.playKeystroke();
                    setBeeInput(e.target.value);
                  }}
                  placeholder="Type exact spelling..."
                  className="flex-1 px-4 py-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base font-black uppercase text-center text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => advanceToNextBeeWord()}
                  className="px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Next Word
                </button>
              </form>

              {beeFeedback && (
                <div
                  className={`max-w-lg mx-auto p-3.5 rounded-2xl border text-xs font-bold ${
                    beeFeedback.correct
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {beeFeedback.message}
                </div>
              )}
            </div>
          </div>

          {/* Right 4 Cols: Mastered Spelling Bee Bank & Quiz Launcher */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                  Vocabulary Mastery Bank
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Mastered Words ({beeMasteredWords.length})
                </h3>
              </div>
              {beeMasteredWords.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleLaunchQuizFromConcepts('Academic Vocabulary', beeMasteredWords)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black cursor-pointer"
                >
                  Quiz Me
                </button>
              )}
            </div>

            {beeMasteredWords.length === 0 ? (
              <p className="text-xs text-slate-500">
                Spell words correctly in the championship stage to add them to your Vocabulary Mastery Bank!
              </p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {beeMasteredWords.map((w, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-indigo-600 dark:text-indigo-400">
                        {w.word}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{w.subject}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">{w.definition}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* LEARN MORE MODAL FOR DISCOVERED WORD-CHAIN CONCEPT                    */}
      {/* ===================================================================== */}
      {learnMoreModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {learnMoreModalEntry.subject} Concept Card
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {learnMoreModalEntry.word}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLearnMoreModalEntry(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-black text-slate-900 dark:text-white">Core Definition:</div>
              <p className="leading-relaxed">{learnMoreModalEntry.definition}</p>
              <div className="font-black text-slate-900 dark:text-white pt-2">
                Academic Context &amp; Significance:
              </div>
              <p className="leading-relaxed">{learnMoreModalEntry.detailedExplanation}</p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Played by: {learnMoreModalEntry.playerName}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">
                +{learnMoreModalEntry.xpEarned} XP Earned
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLearnMoreModalEntry(null)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
