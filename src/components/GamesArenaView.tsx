import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Gamepad2,
  Sparkles,
  Flame,
  Heart,
  Timer,
  Trophy,
  Play,
  RotateCcw,
  BookOpen,
  Calculator,
  Volume2,
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
} from 'lucide-react';
import { PersonaType, QuizResponse, DifficultyType } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { recordOneByOneConceptsToGoal } from './DailyLearningGoalTracker';
import { StudyToolsWidget } from './StudyToolsWidget';

export type GameModeTab = 'one_by_one' | 'math_quiz' | 'spelling_bee';

export type OneByOneVariant =
  | 'subject'
  | 'classic'
  | 'topic'
  | 'survival'
  | 'speed'
  | 'team'
  | 'ai_battle';

export type OneByOneDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface OneByOnePlayer {
  id: string;
  name: string;
  isAi: boolean;
  score: number;
  lives: number;
  maxLives: number;
  streak: number;
  bestStreak: number;
  wordsSubmitted: number;
  correctWords: number;
  eliminated: boolean;
}

export interface WordChainEntry {
  word: string;
  playerId: string;
  playerName: string;
  definition: string;
  detailedExplanation: string;
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

interface GamesArenaViewProps {
  persona: PersonaType;
  onAwardGameXp: (xp: number, correctCount: number, totalCount: number, domain?: string) => void;
  onReviewConceptsAsQuiz: (subject: string, concepts: Array<{ word: string; definition: string }>) => void;
}

const SUBJECT_STARTING_WORDS: Record<string, string[]> = {
  Biology: ['CELL', 'MITOSIS', 'ENZYME', 'GENOME', 'ORGANISM', 'PROTEIN', 'CHLOROPLAST', 'NEURON'],
  Mathematics: ['ALGEBRA', 'MATRIX', 'INTEGRAL', 'POLYGON', 'THEOREM', 'VECTOR', 'FRACTION', 'TANGENT'],
  Chemistry: ['ATOM', 'MOLECULE', 'ELECTRON', 'CATALYST', 'ISOTOPE', 'POLYMER', 'VALENCE', 'SOLVENT'],
  Physics: ['ENERGY', 'PHOTON', 'GRAVITY', 'MOMENTUM', 'QUANTUM', 'VELOCITY', 'INERTIA', 'CIRCUIT'],
  History: ['EMPIRE', 'REVOLUTION', 'DYNASTY', 'REPUBLIC', 'TREATY', 'MONARCHY', 'COLONY', 'SENATE'],
  Geography: ['CONTINENT', 'GLACIER', 'PENINSULA', 'EQUATOR', 'TUNDRA', 'ARCHIPELAGO', 'DELTA', 'PLATEAU'],
  English: ['METAPHOR', 'SYNTAX', 'SONNET', 'ALLEGORY', 'PROTAGONIST', 'STANZA', 'HYPERBOLE', 'NARRATIVE'],
  'Computer Science': ['ALGORITHM', 'COMPILER', 'DATABASE', 'PROTOCOL', 'RECURSION', 'VARIABLE', 'NETWORK', 'BINARY'],
  'General Knowledge': ['PLANET', 'SCIENCE', 'GALAXY', 'OCEAN', 'COMPASS', 'PYRAMID', 'HARMONY', 'VOLCANO'],
};

const SPELLING_BEE_WORDS: Array<{
  word: string;
  difficulty: OneByOneDifficulty;
  definition: string;
  origin: string;
  sentence: string;
  subject: string;
}> = [
  {
    word: 'PHOTOSYNTHESIS',
    difficulty: 'Medium',
    definition: 'The process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water.',
    origin: 'Greek: phōs (light) + synthesis (putting together)',
    sentence: 'Chloroplasts inside plant leaves carry out photosynthesis every day.',
    subject: 'Biology',
  },
  {
    word: 'STOICHIOMETRY',
    difficulty: 'Hard',
    definition: 'The calculation of reactants and products in chemical reactions based on conservation of mass.',
    origin: 'Greek: stoikheion (element) + metria (measure)',
    sentence: 'Accurate stoichiometry ensures no excess reagent is wasted in the lab.',
    subject: 'Chemistry',
  },
  {
    word: 'HYPOTENUSE',
    difficulty: 'Easy',
    definition: 'The longest side of a right-angled triangle, opposite the right angle.',
    origin: 'Greek: hypoteinousa (stretching under)',
    sentence: 'Using the Pythagorean theorem, we calculated the length of the hypotenuse.',
    subject: 'Mathematics',
  },
  {
    word: 'POLYMORPHISM',
    difficulty: 'Hard',
    definition: 'The ability of an object, function, or organism to take on multiple distinct forms.',
    origin: 'Greek: poly (many) + morphē (form)',
    sentence: 'Object-oriented programming relies on polymorphism to share interfaces across classes.',
    subject: 'Computer Science',
  },
  {
    word: 'RENAISSANCE',
    difficulty: 'Medium',
    definition: 'The revival of European art, architecture, science, and literature in the 14th–17th centuries.',
    origin: 'French: re- (again) + naître (be born)',
    sentence: 'Leonardo da Vinci exemplified the intellectual curiosity of the Renaissance.',
    subject: 'History',
  },
  {
    word: 'THERMODYNAMICS',
    difficulty: 'Expert',
    definition: 'The branch of physical science that deals with the relations between heat and other forms of energy.',
    origin: 'Greek: thermē (heat) + dynamis (power)',
    sentence: 'The second law of thermodynamics states that total entropy of an isolated system always increases.',
    subject: 'Physics',
  },
  {
    word: 'ARCHIPELAGO',
    difficulty: 'Medium',
    definition: 'An extensive group or chain of islands clustered in a sea or ocean.',
    origin: 'Italian: arcipelago (chief sea)',
    sentence: 'Indonesia is the largest archipelago nation in the world.',
    subject: 'Geography',
  },
  {
    word: 'ONOMATOPOEIA',
    difficulty: 'Expert',
    definition: 'The formation of a word from a sound associated with what is named (e.g., buzz, sizzle).',
    origin: 'Greek: onoma (name) + poiein (to make)',
    sentence: 'Poets frequently use onomatopoeia to bring sensory vividness to their verses.',
    subject: 'English',
  },
];

export const GamesArenaView: React.FC<GamesArenaViewProps> = ({
  persona,
  onAwardGameXp,
  onReviewConceptsAsQuiz,
}) => {
  const [activeGameTab, setActiveGameTab] = useState<GameModeTab>('one_by_one');

  // =========================================================================
  // 1. ONE BY ONE WORD-CHAIN STATE
  // =========================================================================
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [variant, setVariant] = useState<OneByOneVariant>('subject');
  const [subject, setSubject] = useState<string>('Biology');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<OneByOneDifficulty>('Medium');
  const [playerMode, setPlayerMode] = useState<'solo_ai' | '2p' | '3p' | '4p'>('solo_ai');
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  const [startingLives, setStartingLives] = useState<number>(3);

  const [players, setPlayers] = useState<OneByOnePlayer[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [currentWord, setCurrentWord] = useState<string>('CELL');
  const [requiredLetter, setRequiredLetter] = useState<string>('L');
  const [usedWords, setUsedWords] = useState<string[]>(['CELL']);
  const [chainHistory, setChainHistory] = useState<WordChainEntry[]>([]);
  const [inputWord, setInputWord] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Feedback & Learning Reward Banner
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'valid' | 'wrong_letter' | 'not_relevant' | 'duplicate' | 'timeout' | 'invalid_word';
    title: string;
    subtitle: string;
    xpText?: string;
  } | null>(null);

  const [latestLearnedConcept, setLatestLearnedConcept] = useState<WordChainEntry | null>(null);
  const [learnMoreModalEntry, setLearnMoreModalEntry] = useState<WordChainEntry | null>(null);

  // Client-side validation cache to prevent redundant AI requests
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

  // Start One by One Game
  const handleStartOneByOne = () => {
    soundFx.playClick();
    const effectiveTimer = variant === 'speed' ? 5 : timerSeconds;
    const effectiveLives = variant === 'survival' ? 1 : startingLives;

    const initialPlayers: OneByOnePlayer[] = [];
    if (playerMode === 'solo_ai' || variant === 'ai_battle') {
      initialPlayers.push(
        {
          id: 'p1',
          name: 'Player 1 (You)',
          isAi: false,
          score: 0,
          lives: effectiveLives,
          maxLives: effectiveLives,
          streak: 0,
          bestStreak: 0,
          wordsSubmitted: 0,
          correctWords: 0,
          eliminated: false,
        },
        {
          id: 'ai_1',
          name: `AI Opponent (${difficulty})`,
          isAi: true,
          score: 0,
          lives: effectiveLives,
          maxLives: effectiveLives,
          streak: 0,
          bestStreak: 0,
          wordsSubmitted: 0,
          correctWords: 0,
          eliminated: false,
        }
      );
    } else {
      const count = playerMode === '2p' ? 2 : playerMode === '3p' ? 3 : 4;
      for (let i = 1; i <= count; i++) {
        initialPlayers.push({
          id: `p${i}`,
          name: `Player ${i}`,
          isAi: false,
          score: 0,
          lives: effectiveLives,
          maxLives: effectiveLives,
          streak: 0,
          bestStreak: 0,
          wordsSubmitted: 0,
          correctWords: 0,
          eliminated: false,
        });
      }
    }

    const pool = SUBJECT_STARTING_WORDS[subject] || SUBJECT_STARTING_WORDS['General Knowledge'];
    const starter = pool[Math.floor(Math.random() * pool.length)].toUpperCase();
    const lastChar = starter.charAt(starter.length - 1);

    setPlayers(initialPlayers);
    setCurrentTurnIndex(0);
    setRoundNumber(1);
    setCurrentWord(starter);
    setRequiredLetter(lastChar);
    setUsedWords([starter]);
    setChainHistory([]);
    setInputWord('');
    setTimeLeft(effectiveTimer);
    setFeedbackBanner(null);
    setLatestLearnedConcept(null);
    setGameState('playing');
    turnStartTimeRef.current = Date.now();
  };

  // Advance to next active player or end game
  const advanceToNextPlayer = useCallback(
    (updatedPlayers: OneByOnePlayer[], nextReqLetter: string, nextWordVal: string) => {
      const alivePlayers = updatedPlayers.filter((p) => !p.eliminated);
      if (alivePlayers.length === 0 || (updatedPlayers.length > 1 && alivePlayers.length <= 1)) {
        // Game Over!
        soundFx.playComplete();
        setGameState('finished');

        // Calculate human player XP & update learning goals
        const humanPlayer = updatedPlayers[0];
        if (humanPlayer) {
          const earnedXp = Math.max(25, Math.round(humanPlayer.score * 0.45));
          onAwardGameXp(
            earnedXp,
            humanPlayer.correctWords,
            Math.max(1, humanPlayer.wordsSubmitted),
            effectiveSubject
          );
          recordOneByOneConceptsToGoal(effectiveSubject, humanPlayer.correctWords, earnedXp);
        }
        return;
      }

      let nextIdx = (currentTurnIndex + 1) % updatedPlayers.length;
      let safety = 0;
      while (updatedPlayers[nextIdx].eliminated && safety < updatedPlayers.length) {
        nextIdx = (nextIdx + 1) % updatedPlayers.length;
        safety++;
      }

      if (nextIdx <= currentTurnIndex) {
        setRoundNumber((r) => r + 1);
      }

      setCurrentTurnIndex(nextIdx);
      setCurrentWord(nextWordVal);
      setRequiredLetter(nextReqLetter);
      setInputWord('');
      setTimeLeft(variant === 'speed' ? 5 : timerSeconds);
      turnStartTimeRef.current = Date.now();
    },
    [currentTurnIndex, timerSeconds, variant, effectiveSubject, onAwardGameXp]
  );

  // Penalize current player for mistake or timeout
  const applyPlayerPenalty = useCallback(
    (
      reasonType: 'wrong_letter' | 'not_relevant' | 'duplicate' | 'timeout' | 'invalid_word',
      title: string,
      subtitle: string
    ) => {
      soundFx.playIncorrect();
      setFeedbackBanner({ type: reasonType, title, subtitle });

      const updated = players.map((p, idx) => {
        if (idx !== currentTurnIndex) return p;
        const nextLives = Math.max(0, p.lives - 1);
        return {
          ...p,
          lives: nextLives,
          streak: 0,
          wordsSubmitted: p.wordsSubmitted + 1,
          eliminated: nextLives <= 0,
        };
      });

      setPlayers(updated);
      setTimeout(() => {
        advanceToNextPlayer(updated, requiredLetter, currentWord);
      }, 1100);
    },
    [players, currentTurnIndex, requiredLetter, currentWord, advanceToNextPlayer]
  );

  // Countdown timer effect during active gameplay
  useEffect(() => {
    if (gameState !== 'playing' || isValidating) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          applyPlayerPenalty('timeout', "⏰ TIME'S UP", 'You ran out of time and lost one life.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, isValidating, currentTurnIndex, applyPlayerPenalty]);

  // Submit & Validate a Word (Human or AI)
  const submitWordTurn = useCallback(
    async (rawSubmittedWord: string) => {
      const cleaned = rawSubmittedWord.trim().replace(/[^a-zA-Z\s-]/g, '').toUpperCase();
      if (!cleaned || isValidating || gameState !== 'playing') return;

      const activePlayer = players[currentTurnIndex];
      if (!activePlayer) return;

      // 1. DETERMINISTIC CHECK: Required Starting Letter
      const firstChar = cleaned.charAt(0);
      if (firstChar !== requiredLetter.toUpperCase()) {
        applyPlayerPenalty(
          'wrong_letter',
          '❌ WRONG LETTER',
          `Your answer must start with: ${requiredLetter.toUpperCase()}`
        );
        return;
      }

      // 2. DETERMINISTIC CHECK: Duplicate Word
      if (usedWords.some((w) => w.toUpperCase() === cleaned)) {
        applyPlayerPenalty(
          'duplicate',
          '⚠️ ALREADY USED',
          `"${cleaned}" has already been used in this chain. Choose another concept.`
        );
        return;
      }

      // 3. DETERMINISTIC CHECK: Minimum Length
      if (cleaned.length < 2) {
        applyPlayerPenalty('invalid_word', '❌ INVALID WORD', 'Word must be at least 2 letters long.');
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
              requiredLetter,
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
            '❌ INVALID WORD',
            validationData?.reason || `"${cleaned}" was not recognized as a valid concept.`
          );
          return;
        }

        if (variant !== 'classic' && !validationData.categoryRelevant) {
          setIsValidating(false);
          applyPlayerPenalty(
            'not_relevant',
            '❌ NOT RELEVANT',
            validationData.reason ||
              `"${cleaned}" is a valid word, but it isn't sufficiently relevant to the selected ${effectiveSubject} category.`
          );
          return;
        }

        // VALID CONCEPT! Calculate Scoring & Streak Multiplier
        soundFx.playCorrect();
        const newStreak = activePlayer.streak + 1;
        const streakMultiplier = newStreak >= 10 ? 3 : newStreak >= 5 ? 2 : newStreak >= 3 ? 1.5 : 1;
        const basePoints = 10;
        const categoryBonus = variant === 'classic' ? 2 : 5;
        const speedBonus = elapsedSeconds <= 4 ? 5 : elapsedSeconds <= 8 ? 3 : 1;
        const lengthBonus = cleaned.length >= 9 ? 5 : cleaned.length >= 6 ? 3 : 0;
        const totalPoints = Math.round(
          (basePoints + categoryBonus + speedBonus + lengthBonus) * streakMultiplier
        );

        const entry: WordChainEntry = {
          word: cleaned,
          playerId: activePlayer.id,
          playerName: activePlayer.name,
          definition:
            validationData.definition ||
            `Core concept in ${effectiveSubject} connected to the active word chain.`,
          detailedExplanation:
            validationData.detailedExplanation ||
            `${cleaned} is an essential ${effectiveSubject} concept that builds conceptual mastery.`,
          points: totalPoints,
          xpEarned: totalPoints,
          breakdown: {
            base: basePoints,
            categoryBonus,
            speedBonus,
            lengthBonus,
            streakMultiplier,
          },
        };

        const nextReq = cleaned.replace(/[^A-Z]/g, '').slice(-1) || 'E';

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
          title: `✅ VALID CONCEPT · ${cleaned}`,
          subtitle: `+${basePoints} Base · +${categoryBonus} ${effectiveSubject} · +${speedBonus} Speed${
            streakMultiplier > 1 ? ` · 🔥 ×${streakMultiplier} Streak` : ''
          }`,
          xpText: `+${totalPoints} XP`,
        });

        setIsValidating(false);
        setTimeout(() => {
          advanceToNextPlayer(updatedPlayers, nextReq, cleaned);
        }, 900);
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
      applyPlayerPenalty,
      advanceToNextPlayer,
    ]
  );

  // Trigger AI Opponent Turn automatically when it is an AI player's turn
  useEffect(() => {
    if (gameState !== 'playing' || isValidating) return;
    const currentPlayer = players[currentTurnIndex];
    if (!currentPlayer || !currentPlayer.isAi || currentPlayer.eliminated) return;

    const aiTimer = setTimeout(async () => {
      try {
        const res = await fetch('/api/word-chain/ai-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requiredLetter,
            subject: effectiveSubject,
            difficulty,
            usedWords,
            roundNumber,
          }),
        });
        const data = await res.json();
        if (data.turn?.word) {
          submitWordTurn(data.turn.word);
        }
      } catch {
        submitWordTurn(`${requiredLetter}LEMENT`);
      }
    }, 1400);

    return () => clearTimeout(aiTimer);
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
  // 2. MATH QUIZ ARENA STATE
  // =========================================================================
  const [mathDifficulty, setMathDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [mathScore, setMathScore] = useState(0);
  const [mathStreak, setMathStreak] = useState(0);
  const [mathAnswerInput, setMathAnswerInput] = useState('');
  const [mathFeedback, setMathFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [mathProblem, setMathProblem] = useState<{
    question: string;
    answer: number;
    explanation: string;
  }>({
    question: 'Solve for x: 3x + 14 = 35',
    answer: 7,
    explanation: 'Subtract 14 from both sides (3x = 21), then divide by 3 to get x = 7.',
  });

  const generateNewMathProblem = useCallback((diff: 'Easy' | 'Medium' | 'Hard') => {
    setMathAnswerInput('');
    setMathFeedback(null);
    if (diff === 'Easy') {
      const a = Math.floor(Math.random() * 15) + 4;
      const b = Math.floor(Math.random() * 12) + 3;
      const c = Math.floor(Math.random() * 20) + 5;
      setMathProblem({
        question: `Calculate: (${a} × ${b}) + ${c}`,
        answer: a * b + c,
        explanation: `First multiply ${a} × ${b} = ${a * b}, then add ${c} to get ${a * b + c}.`,
      });
    } else if (diff === 'Medium') {
      const x = Math.floor(Math.random() * 11) + 2;
      const m = Math.floor(Math.random() * 7) + 2;
      const b = Math.floor(Math.random() * 18) + 4;
      const total = m * x + b;
      setMathProblem({
        question: `Solve for x: ${m}x + ${b} = ${total}`,
        answer: x,
        explanation: `Subtract ${b} from ${total} (${m}x = ${total - b}), then divide by ${m} to get x = ${x}.`,
      });
    } else {
      const base = Math.floor(Math.random() * 8) + 3;
      const lin = Math.floor(Math.random() * 10) + 2;
      const val = base * base + 4 * lin;
      setMathProblem({
        question: `Evaluate f(${base}) if f(x) = x² + 4(${lin})`,
        answer: val,
        explanation: `Square ${base} (${base * base}) and add 4 × ${lin} (${4 * lin}) = ${val}.`,
      });
    }
  }, []);

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseFloat(mathAnswerInput.trim());
    if (Number.isNaN(numeric)) return;

    if (Math.abs(numeric - mathProblem.answer) < 0.01) {
      soundFx.playCorrect();
      const nextStreak = mathStreak + 1;
      const xpGain = 20 + nextStreak * 5;
      setMathStreak(nextStreak);
      setMathScore((s) => s + xpGain);
      setMathFeedback({
        correct: true,
        message: `Correct! +${xpGain} XP · ${mathProblem.explanation}`,
      });
      onAwardGameXp(xpGain, 1, 1, 'Applied Logic');
    } else {
      soundFx.playIncorrect();
      setMathStreak(0);
      setMathFeedback({
        correct: false,
        message: `Not quite! Correct answer: ${mathProblem.answer}. ${mathProblem.explanation}`,
      });
    }
  };

  // =========================================================================
  // 3. SPELLING BEE CHAMPIONSHIP STATE
  // =========================================================================
  const [beeIndex, setBeeIndex] = useState(0);
  const [beeInput, setBeeInput] = useState('');
  const [beeScore, setBeeScore] = useState(0);
  const [beeStreak, setBeeStreak] = useState(0);
  const [beeFeedback, setBeeFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  const currentBeeWord = SPELLING_BEE_WORDS[beeIndex % SPELLING_BEE_WORDS.length];

  const handleSpeakBeeWord = () => {
    soundFx.playClick();
    speechEngine.speak(
      `${currentBeeWord.word}. Definition: ${currentBeeWord.definition}. Used in a sentence: ${currentBeeWord.sentence}`
    );
  };

  const handleBeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = beeInput.trim().toUpperCase();
    if (!cleaned) return;

    if (cleaned === currentBeeWord.word.toUpperCase()) {
      soundFx.playCorrect();
      const nextStreak = beeStreak + 1;
      const xp = 25 + nextStreak * 5;
      setBeeStreak(nextStreak);
      setBeeScore((s) => s + xp);
      setBeeFeedback({
        correct: true,
        message: `Perfect Spelling! "${currentBeeWord.word}" (+${xp} XP)`,
      });
      onAwardGameXp(xp, 1, 1, 'Foundations');
    } else {
      soundFx.playIncorrect();
      setBeeStreak(0);
      setBeeFeedback({
        correct: false,
        message: `Incorrect spelling. The correct spelling is ${currentBeeWord.word}.`,
      });
    }
  };

  const currentPlayer = players[currentTurnIndex];
  const winnerPlayer = useMemo(() => {
    if (players.length === 0) return null;
    const alive = players.filter((p) => !p.eliminated);
    if (alive.length === 1) return alive[0];
    return [...players].sort((a, b) => b.score - a.score)[0];
  }, [players]);

  return (
    <div className="space-y-6 pb-14">
      {/* Top Game Mode Switcher Header */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Gamepad2 className="w-4 h-4" />
              <span>Learning Through Play · Competitive Study Modes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Interactive Educational Games Arena
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Compete in the fast-paced <strong>One by One Word-Chain Challenge</strong>, sharpen calculations in the <strong>Math Quiz Arena</strong>, or master academic vocabulary in the <strong>Spelling Bee Championship</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 self-start">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveGameTab('one_by_one');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeGameTab === 'one_by_one'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>One by One (Word-Chain)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveGameTab('math_quiz');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeGameTab === 'math_quiz'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Math Quiz</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveGameTab('spelling_bee');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeGameTab === 'spelling_bee'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Spelling Bee</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODE 1: ONE BY ONE WORD-CHAIN CHALLENGE                               */}
      {/* ===================================================================== */}
      {activeGameTab === 'one_by_one' && (
        <>
          {/* 1A. SETUP SCREEN */}
          {gameState === 'setup' && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Games → One by One Setup
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    Configure Your Educational Word-Chain Challenge
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Players take turns answering with a concept starting with the last letter of the previous word (e.g. CELL → LUNG → GENE → ENZYME).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartOneByOne}
                  className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black flex items-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer self-start"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start One by One</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Subject Selection */}
                <div className="space-y-2.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    1. Select Subject / Category
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
                        onClick={() => setSubject(subj)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                          subject === subj
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black'
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
                      placeholder="Enter custom topic (e.g., Astronomy, World War II, Genetics)..."
                      className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  )}
                </div>

                {/* 2. Difficulty & Players */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      2. Difficulty & AI Strength
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Easy', 'Medium', 'Hard', 'Expert'] as OneByOneDifficulty[]).map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setDifficulty(diff)}
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
                      3. Players & Turn Order
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'solo_ai', label: 'Solo vs AI' },
                        { id: '2p', label: '2 Players' },
                        { id: '3p', label: '3 Players' },
                        { id: '4p', label: '4 Players' },
                      ].map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPlayerMode(pm.id as any)}
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

                {/* 3. Timer, Lives & Game Variant */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      4. Turn Countdown Timer
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 15, 20].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setTimerSeconds(sec)}
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
                      5. Lives / Strikes Allowed
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 3, 5].map((lv) => (
                        <button
                          key={lv}
                          type="button"
                          onClick={() => setStartingLives(lv)}
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
                      6. Rule Variant
                    </label>
                    <select
                      value={variant}
                      onChange={(e) => setVariant(e.target.value as OneByOneVariant)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="subject">Subject Mode (Words must match Subject)</option>
                      <option value="classic">Classic Mode (Any valid word)</option>
                      <option value="topic">Topic Mode (Specific lesson/topic)</option>
                      <option value="survival">Survival Mode (1 Life sudden death)</option>
                      <option value="speed">Speed Blitz (5-second turns)</option>
                      <option value="ai_battle">AI Battle (1v1 vs Adaptive AI)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1B. ACTIVE ONE BY ONE GAMEPLAY ARENA */}
          {gameState === 'playing' && currentPlayer && (
            <div className="space-y-5">
              {/* TOP BAR: Subject, Difficulty, Round, Timer */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">
                    Subject: {effectiveSubject}
                  </span>
                  <span>·</span>
                  <span>Difficulty: {difficulty}</span>
                  <span>·</span>
                  <span>Round {roundNumber}</span>
                  <span>·</span>
                  <span>Chain: {usedWords.length} Words</span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`px-4 py-1.5 rounded-xl font-black text-sm flex items-center gap-1.5 ${
                      timeLeft <= 4
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                  >
                    <Timer className="w-4 h-4" />
                    <span>{timeLeft}s</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGameState('setup')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    End Game
                  </button>
                </div>
              </div>

              {/* CENTER ARENA: Current Player, Required Letter, Previous Word, Input */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 text-center space-y-6 shadow-sm">
                {/* Turn Indicator */}
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Current Turn
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    {currentPlayer.isAi ? <Bot className="w-6 h-6 text-indigo-500" /> : null}
                    <span>{currentPlayer.name}</span>
                    {currentPlayer.streak >= 3 && (
                      <span className="text-sm font-black text-amber-500">
                        🔥 {currentPlayer.streak} STREAK
                      </span>
                    )}
                  </div>
                </div>

                {/* Previous Word -> Required Letter */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                  <div className="px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 min-w-[180px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Previous Word
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide mt-1">
                      {currentWord.slice(0, -1)}
                      <span className="text-indigo-600 dark:text-indigo-400 underline decoration-2">
                        {currentWord.slice(-1)}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-6 h-6 text-slate-400 hidden sm:block" />

                  <div className="px-8 py-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 min-w-[180px]">
                    <div className="text-[11px] font-black uppercase tracking-wider text-indigo-200">
                      Required Letter
                    </div>
                    <div className="text-4xl sm:text-5xl font-black tracking-tight mt-0.5">
                      {requiredLetter}
                    </div>
                  </div>
                </div>

                {/* Word Submission Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!currentPlayer.isAi) {
                      submitWordTurn(inputWord);
                    }
                  }}
                  className="max-w-lg mx-auto space-y-3"
                >
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      ref={wordInputRef}
                      type="text"
                      disabled={currentPlayer.isAi || isValidating}
                      value={inputWord}
                      onChange={(e) => setInputWord(e.target.value)}
                      placeholder={
                        currentPlayer.isAi
                          ? `${currentPlayer.name} is selecting a ${effectiveSubject} concept...`
                          : `Enter a ${effectiveSubject} concept starting with "${requiredLetter}"...`
                      }
                      className="flex-1 px-5 py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase placeholder:normal-case placeholder:font-medium placeholder:text-sm focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="submit"
                      disabled={currentPlayer.isAi || isValidating || !inputWord.trim()}
                      className="px-7 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider cursor-pointer shrink-0 shadow-md"
                    >
                      {isValidating ? 'Checking...' : 'Submit'}
                    </button>
                  </div>
                </form>

                {/* Instant Feedback Banner */}
                {feedbackBanner && (
                  <div
                    className={`max-w-xl mx-auto p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-4 animate-fade-in ${
                      feedbackBanner.type === 'valid'
                        ? 'border-emerald-500/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-rose-500/80 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-black">{feedbackBanner.title}</div>
                      <div className="text-xs font-semibold opacity-90 mt-0.5">
                        {feedbackBanner.subtitle}
                      </div>
                    </div>
                    {feedbackBanner.xpText && (
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                        {feedbackBanner.xpText}
                      </div>
                    )}
                  </div>
                )}

                {/* Learning Reward Card for Latest Valid Concept */}
                {latestLearnedConcept && (
                  <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400">
                        <span>{latestLearnedConcept.word}</span>
                        <span>·</span>
                        <span>+{latestLearnedConcept.xpEarned} XP</span>
                        <span>·</span>
                        <span>{effectiveSubject}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        "{latestLearnedConcept.definition}"
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLearnMoreModalEntry(latestLearnedConcept)}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 shrink-0 cursor-pointer"
                    >
                      Learn More
                    </button>
                  </div>
                )}
              </div>

              {/* BOTTOM BAR: Players Score, Lives, Streak */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {players.map((p, idx) => {
                  const isTurn = idx === currentTurnIndex;
                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        p.eliminated
                          ? 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 opacity-60'
                          : isTurn
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {p.name}
                        </span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                          {p.score} pts
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2 text-xs">
                        {p.eliminated ? (
                          <span className="font-black text-rose-600 uppercase">
                            PLAYER ELIMINATED
                          </span>
                        ) : (
                          <span className="tracking-widest">
                            {'❤️'.repeat(p.lives)}
                            {'🖤'.repeat(Math.max(0, p.maxLives - p.lives))}
                          </span>
                        )}

                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          🔥 {p.streak} Streak
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 1C. POST-GAME LEARNING SUMMARY */}
          {gameState === 'finished' && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="text-center space-y-2 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="text-xs font-black uppercase tracking-widest text-amber-500">
                  GAME COMPLETE
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  🏆 Winner: {winnerPlayer?.name || 'Player 1'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Every concept you discovered has been credited to your XP and active learning goals!
                </p>
              </div>

              {/* Performance Metrics */}
              {players[0] && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
                    <div className="text-xs text-slate-500">Score</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      {players[0].score}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
                    <div className="text-xs text-slate-500">Words</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      {players[0].wordsSubmitted}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
                    <div className="text-xs text-slate-500">Correct</div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {players[0].correctWords}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
                    <div className="text-xs text-slate-500">Best Streak</div>
                    <div className="text-xl font-black text-amber-500 mt-0.5">
                      🔥 {players[0].bestStreak}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
                    <div className="text-xs text-slate-500">XP Earned</div>
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                      +{Math.max(25, Math.round(players[0].score * 0.45))} XP
                    </div>
                  </div>
                </div>
              )}

              {/* Concepts Encountered */}
              <div className="space-y-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Concepts You Encountered ({chainHistory.length})
                </h3>
                {chainHistory.length === 0 ? (
                  <p className="text-xs text-slate-500">No concepts recorded in this round.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {chainHistory.map((item, idx) => (
                      <div
                        key={`${item.word}_${idx}`}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {item.word}
                            </span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              +{item.xpEarned} XP
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {item.definition}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLearnMoreModalEntry(item)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer"
                        >
                          Learn More
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: REVIEW CONCEPTS & PLAY AGAIN */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    onReviewConceptsAsQuiz(
                      effectiveSubject,
                      chainHistory.map((c) => ({ word: c.word, definition: c.definition }))
                    )
                  }
                  className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>REVIEW CONCEPTS</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartOneByOne}
                  className="px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===================================================================== */}
      {/* MODE 2: MATH QUIZ ARENA (WITH SCIENTIFIC CALCULATOR)                  */}
      {/* ===================================================================== */}
      {activeGameTab === 'math_quiz' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Quantitative Speed & Accuracy Mode
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Math Quiz Arena (Calculator Enabled)
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setMathDifficulty(d);
                    generateNewMathProblem(d);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                    mathDifficulty === d
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm font-black">
              <span className="text-emerald-600 dark:text-emerald-400">Score: {mathScore} XP</span>
              <span>·</span>
              <span className="text-amber-500">🔥 {mathStreak} Streak</span>
            </div>
            <StudyToolsWidget calculatorEnabled={true} dictionaryEnabled={true} />
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-5">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {mathProblem.question}
            </div>

            <form onSubmit={handleMathSubmit} className="max-w-md mx-auto flex gap-2">
              <input
                type="number"
                step="any"
                value={mathAnswerInput}
                onChange={(e) => setMathAnswerInput(e.target.value)}
                placeholder="Enter numeric answer..."
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base font-black text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase cursor-pointer"
              >
                Check
              </button>
              <button
                type="button"
                onClick={() => generateNewMathProblem(mathDifficulty)}
                className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Next
              </button>
            </form>

            {mathFeedback && (
              <div
                className={`max-w-lg mx-auto p-4 rounded-2xl text-xs font-bold ${
                  mathFeedback.correct
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-100 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200'
                }`}
              >
                {mathFeedback.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 3: SPELLING BEE CHAMPIONSHIP                                     */}
      {/* ===================================================================== */}
      {activeGameTab === 'spelling_bee' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                Auditory & Orthographic Mastery
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Academic Spelling Bee Championship
              </h2>
            </div>

            <div className="flex items-center gap-4 text-sm font-black">
              <span className="text-amber-600 dark:text-amber-400">Score: {beeScore} XP</span>
              <span>·</span>
              <span className="text-indigo-600 dark:text-indigo-400">🔥 {beeStreak} Streak</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-5 text-center">
            <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-500">
              <span>Subject: {currentBeeWord.subject}</span>
              <span>·</span>
              <span>Difficulty: {currentBeeWord.difficulty}</span>
              <span>·</span>
              <span>{currentBeeWord.word.length} Letters</span>
            </div>

            <button
              type="button"
              onClick={handleSpeakBeeWord}
              className="mx-auto px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center gap-2.5 shadow-md cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
              <span>Pronounce Word & Sentence Aloud</span>
            </button>

            <div className="max-w-xl mx-auto space-y-2 text-left bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <strong>Definition:</strong> {currentBeeWord.definition}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <strong>Etymology / Origin:</strong> {currentBeeWord.origin}
              </div>
            </div>

            <form onSubmit={handleBeeSubmit} className="max-w-md mx-auto flex gap-2">
              <input
                type="text"
                value={beeInput}
                onChange={(e) => setBeeInput(e.target.value)}
                placeholder="Type the exact spelling..."
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base font-black uppercase text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase cursor-pointer"
              >
                Spell
              </button>
              <button
                type="button"
                onClick={() => {
                  setBeeIndex((i) => i + 1);
                  setBeeInput('');
                  setBeeFeedback(null);
                }}
                className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Next Word
              </button>
            </form>

            {beeFeedback && (
              <div
                className={`max-w-lg mx-auto p-4 rounded-2xl text-xs font-bold ${
                  beeFeedback.correct
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-100 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200'
                }`}
              >
                {beeFeedback.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEARN MORE CONCEPT MODAL */}
      {learnMoreModalEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setLearnMoreModalEntry(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Concept Deep-Dive · {effectiveSubject}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {learnMoreModalEntry.word}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLearnMoreModalEntry(null)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="font-bold">{learnMoreModalEntry.definition}</p>
              <p>{learnMoreModalEntry.detailedExplanation}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setLearnMoreModalEntry(null)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black cursor-pointer"
              >
                Continue Playing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
