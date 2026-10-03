import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  limit,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QuizResponse, Question } from '../types/quiz';
import {
  LiveSessionData,
  LiveSessionStatus,
  LiveParticipant,
  LiveSessionSettings,
  ParticipantAnswer,
} from '../types/liveSession';

const COLLECTION_NAME = 'live_sessions';
const STORAGE_PREFIX = 'quizme_live_session_';
const CHANNEL_NAME = 'quizme_live_battle_sync';

// In-memory listener registry & cross-tab BroadcastChannel for instant 0ms UI updates
type SessionListener = (session: LiveSessionData) => void;
const localListeners = new Map<string, Set<SessionListener>>();

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      const data = event.data as { roomCode?: string; session?: LiveSessionData };
      if (data?.roomCode && data?.session) {
        saveLocalSessionCache(data.roomCode, data.session, false);
        notifyLocalListeners(data.roomCode, data.session);
      }
    };
  } catch {
    // ignore BroadcastChannel errors in restricted environments
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith(STORAGE_PREFIX) && e.newValue) {
      try {
        const roomCode = e.key.replace(STORAGE_PREFIX, '');
        const session = JSON.parse(e.newValue) as LiveSessionData;
        notifyLocalListeners(roomCode, session);
      } catch {
        // ignore parse errors
      }
    }
  });
}

function stripUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function withTimeout<T>(promise: Promise<T>, ms = 1200): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function fetchJsonWithTimeout(url: string, options?: RequestInit, timeoutMs = 2000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function notifyLocalListeners(roomCode: string, session: LiveSessionData) {
  const cleanCode = roomCode.trim().toUpperCase();
  const listeners = localListeners.get(cleanCode);
  if (listeners) {
    listeners.forEach((cb) => {
      try {
        cb(session);
      } catch {
        // ignore listener error
      }
    });
  }
}

function saveLocalSessionCache(roomCode: string, session: LiveSessionData, broadcast = true) {
  const cleanCode = roomCode.trim().toUpperCase();
  const cleanSession = stripUndefined(session);
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${cleanCode}`, JSON.stringify(cleanSession));
    sessionStorage.setItem(`quizme_live_fallback_${cleanCode}`, JSON.stringify(cleanSession));
  } catch {
    // ignore storage quota errors
  }
  notifyLocalListeners(cleanCode, cleanSession);
  if (broadcast && broadcastChannel) {
    try {
      broadcastChannel.postMessage({ roomCode: cleanCode, session: cleanSession });
    } catch {
      // ignore broadcast error
    }
  }
}

export function getLocalSessionCache(roomCode: string): LiveSessionData | null {
  const cleanCode = roomCode.trim().toUpperCase();
  try {
    const localStr =
      localStorage.getItem(`${STORAGE_PREFIX}${cleanCode}`) ||
      sessionStorage.getItem(`quizme_live_fallback_${cleanCode}`);
    if (localStr) {
      return JSON.parse(localStr) as LiveSessionData;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Ensure every question in a Live Battle has 4 valid multiple-choice options
 * including the exact correct_answer so players can always answer and score points.
 */
export function normalizeQuizForLiveBattle(quiz: QuizResponse): QuizResponse {
  const allCorrectAnswers = (quiz.questions || [])
    .map((q) => q.correct_answer?.trim())
    .filter((a): a is string => Boolean(a));

  const fallbackDistractors = [
    'All of the above principles apply equally',
    'None of the listed mechanisms',
    'Inversely proportional relationship',
    'Constant equilibrium state',
    'Asynchronous parallel execution',
    'Secondary metabolic pathway',
  ];

  const normalizedQuestions: Question[] = (quiz.questions || []).map((q, idx) => {
    const correct = (q.correct_answer || 'Correct Option').trim();
    let opts = Array.isArray(q.options)
      ? q.options.map((o) => String(o).trim()).filter(Boolean)
      : [];

    // Also pull from blank_context.word_bank if available
    if (opts.length < 2 && Array.isArray(q.blank_context?.word_bank)) {
      opts = q.blank_context!.word_bank.map((o) => String(o).trim()).filter(Boolean);
    }

    // Ensure correct_answer is present in options
    const hasCorrect = opts.some((o) => o.toLowerCase() === correct.toLowerCase());
    if (!hasCorrect && opts.length > 0) {
      opts = [correct, ...opts.slice(0, 3)];
    }

    // If question was fill_in_blank or open_explanation without options, synthesize 4 options
    if (opts.length < 2) {
      const pool = [
        ...allCorrectAnswers.filter((a) => a.toLowerCase() !== correct.toLowerCase()),
        ...fallbackDistractors,
      ];
      const uniqueDistractors: string[] = [];
      for (const item of pool) {
        if (
          item.toLowerCase() !== correct.toLowerCase() &&
          !uniqueDistractors.some((d) => d.toLowerCase() === item.toLowerCase())
        ) {
          uniqueDistractors.push(item.length > 90 ? `${item.slice(0, 87)}...` : item);
        }
        if (uniqueDistractors.length >= 3) break;
      }

      // Deterministic rotation based on question index
      const combined = [correct, ...uniqueDistractors.slice(0, 3)];
      const rotated = combined.map((_, i) => combined[(i + idx) % combined.length]);
      opts = rotated;
    }

    return {
      ...q,
      options: opts,
      correct_answer: correct,
    };
  });

  return stripUndefined({
    ...quiz,
    questions: normalizedQuestions,
  });
}

/**
 * Generate a clean 6-digit numeric room code
 */
export function generateRoomCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return num.toString();
}

/**
 * Calculate dynamic score based on answer correctness, speed, and streak
 */
export function calculateAnswerPoints(
  isCorrect: boolean,
  responseTimeMs: number,
  timeLimitSeconds: number,
  currentStreak: number,
  streakBonusEnabled = true
): number {
  if (!isCorrect) return 0;

  const basePoints = 1000;
  const timeLimitMs = (timeLimitSeconds > 0 ? timeLimitSeconds : 20) * 1000;

  // Speed ratio: 1.0 (instant) down to 0.0 (at time limit)
  const ratio = Math.max(0, Math.min(1, responseTimeMs / timeLimitMs));
  const speedBonus = Math.round((1 - ratio) * 500); // 0 to 500 points

  // Streak bonus: +50 per streak up to 300
  const streakBonus = streakBonusEnabled ? Math.min(300, currentStreak * 50) : 0;

  return basePoints + speedBonus + streakBonus;
}

export interface ActiveLiveRoomSummary {
  roomCode: string;
  hostName: string;
  quizTitle: string;
  questionCount: number;
  participantCount: number;
  status: LiveSessionStatus;
  createdAt: number;
}

/**
 * Fetch open/active live rooms from server store, localStorage, and Firestore (bounded timeout)
 */
export async function fetchActiveLiveRooms(): Promise<ActiveLiveRoomSummary[]> {
  const roomMap = new Map<string, ActiveLiveRoomSummary>();

  // 1. Check localStorage first for instant results
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const d = JSON.parse(raw) as LiveSessionData;
            if (d?.roomCode && d.status !== 'finished') {
              roomMap.set(d.roomCode, {
                roomCode: d.roomCode,
                hostName: d.hostName || 'Quiz Host',
                quizTitle: d.quiz?.quiz_title || 'Live Quiz Battle',
                questionCount: d.quiz?.questions?.length || 5,
                participantCount: Object.keys(d.participants || {}).length,
                status: d.status,
                createdAt: d.createdAt || Date.now(),
              });
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Check authoritative server store
  const serverRes = await fetchJsonWithTimeout('/api/live/rooms', undefined, 1500);
  if (serverRes?.ok && Array.isArray(serverRes.data?.rooms)) {
    for (const r of serverRes.data.rooms) {
      if (r?.roomCode && r.status !== 'finished') {
        roomMap.set(r.roomCode, r);
      }
    }
  }

  // 3. Check Firestore live_sessions with strict 1200ms timeout so it never hangs
  try {
    const q = query(collection(db, COLLECTION_NAME), limit(15));
    const snap = await withTimeout(getDocs(q), 1200);
    snap.forEach((docSnap) => {
      const d = docSnap.data() as LiveSessionData;
      if (d?.roomCode && d.status !== 'finished') {
        roomMap.set(d.roomCode, {
          roomCode: d.roomCode,
          hostName: d.hostName || 'Quiz Host',
          quizTitle: d.quiz?.quiz_title || 'Live Quiz Battle',
          questionCount: d.quiz?.questions?.length || 5,
          participantCount: Object.keys(d.participants || {}).length,
          status: d.status,
          createdAt: d.createdAt || Date.now(),
        });
      }
    });
  } catch {
    // ignore firestore timeout/error
  }

  return Array.from(roomMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function createInitialBotsMap(now: number): Record<string, LiveParticipant> {
  const simulatedNames = [
    { name: 'Alex Rivera', color: 'rose', seed: 'alex' },
    { name: 'Sophia Chen', color: 'emerald', seed: 'sophia' },
    { name: 'Marcus Vance', color: 'amber', seed: 'marcus' },
  ];
  const bots: Record<string, LiveParticipant> = {};
  for (const profile of simulatedNames) {
    const botId = `bot_${profile.seed}_${Math.random().toString(36).substring(2, 6)}`;
    bots[botId] = {
      id: botId,
      name: profile.name,
      avatarSeed: profile.seed,
      avatarColor: profile.color,
      role: 'student',
      score: 0,
      streak: 0,
      answers: {},
      hasAnsweredCurrent: false,
      isReady: true,
      joinedAt: now,
      lastActive: now,
    };
  }
  return bots;
}

/**
 * Host creates a new live quiz session room
 */
export async function createLiveSession(
  quiz: QuizResponse,
  host: { id: string; name: string; avatar?: string },
  settings?: Partial<LiveSessionSettings>,
  options?: { customRoomCode?: string; includeAiClassmates?: boolean }
): Promise<{ roomCode: string; session: LiveSessionData }> {
  const roomCode = (options?.customRoomCode || generateRoomCode()).trim().toUpperCase();
  const normalizedQuiz = normalizeQuizForLiveBattle(quiz);
  const now = Date.now();

  const defaultSettings: LiveSessionSettings = {
    timePerQuestion: 20,
    showLeaderboardAfterEach: true,
    streakBonusesEnabled: true,
    allowLateJoin: true,
    ...settings,
  };

  const initialParticipants: Record<string, LiveParticipant> = {
    [host.id]: {
      id: host.id,
      name: `${host.name || 'Host'} (Host)`,
      avatarSeed: 'host-crown',
      avatarColor: 'indigo',
      role: 'teacher',
      score: 0,
      streak: 0,
      answers: {},
      hasAnsweredCurrent: false,
      isReady: true,
      joinedAt: now,
      lastActive: now,
    },
    ...(options?.includeAiClassmates ? createInitialBotsMap(now) : {}),
  };

  const initialData: LiveSessionData = stripUndefined({
    id: roomCode,
    roomCode,
    hostId: host.id,
    hostName: host.name || 'Quiz Master',
    ...(host.avatar ? { hostAvatar: host.avatar } : {}),
    quiz: normalizedQuiz,
    status: 'lobby',
    currentQuestionIndex: 0,
    questionStartTime: now,
    settings: defaultSettings,
    participants: initialParticipants,
    createdAt: now,
    updatedAt: now,
  });

  // 1. Save to local cache & broadcast immediately (0ms)
  saveLocalSessionCache(roomCode, initialData);

  // 2. Save to authoritative Express server store (bounded timeout)
  await fetchJsonWithTimeout(
    '/api/live/create',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: initialData }),
    },
    1800
  );

  // 3. Save to Firestore asynchronously in background so it NEVER hangs room creation
  try {
    const sessionRef = doc(db, COLLECTION_NAME, roomCode);
    setDoc(sessionRef, initialData, { merge: true }).catch(() => {});
  } catch {
    // ignore
  }

  return { roomCode, session: initialData };
}

/**
 * Student joins an existing live quiz session
 */
export async function joinLiveSession(
  roomCode: string,
  participant: {
    id: string;
    name: string;
    avatarSeed?: string;
    avatarColor?: string;
    role?: 'student' | 'guest';
  }
): Promise<{ success: boolean; session?: LiveSessionData; error?: string }> {
  const cleanCode = roomCode.trim().toUpperCase();
  const now = Date.now();

  const newParticipant: LiveParticipant = stripUndefined({
    id: participant.id,
    name: participant.name,
    avatarSeed: participant.avatarSeed || 'scholar-spark',
    avatarColor: participant.avatarColor || 'violet',
    role: participant.role || 'student',
    score: 0,
    streak: 0,
    answers: {},
    hasAnsweredCurrent: false,
    isReady: true,
    joinedAt: now,
    lastActive: now,
  });

  const cached = getLocalSessionCache(cleanCode);

  // 1. Try joining via authoritative server store first (passing cached fallback if server restarted)
  const serverRes = await fetchJsonWithTimeout(
    '/api/live/join',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode: cleanCode,
        participant: newParticipant,
        fallbackSession: cached || undefined,
      }),
    },
    1800
  );

  if (serverRes?.ok && serverRes.data?.success && serverRes.data?.session) {
    const joinedSession = serverRes.data.session as LiveSessionData;
    saveLocalSessionCache(cleanCode, joinedSession);
    // Sync to Firestore in background
    try {
      const sessionRef = doc(db, COLLECTION_NAME, cleanCode);
      setDoc(
        sessionRef,
        {
          participants: { [participant.id]: newParticipant },
          updatedAt: now,
        },
        { merge: true }
      ).catch(() => {});
    } catch {
      // ignore
    }
    return { success: true, session: joinedSession };
  }

  // 2. Check local / cross-tab cache
  if (cached) {
    if (cached.status === 'finished') {
      return { success: false, error: 'This live session has already ended.' };
    }
    const updatedSession: LiveSessionData = stripUndefined({
      ...cached,
      quiz: normalizeQuizForLiveBattle(cached.quiz),
      participants: {
        ...(cached.participants || {}),
        [participant.id]: newParticipant,
      },
      updatedAt: now,
    });
    saveLocalSessionCache(cleanCode, updatedSession);
    fetchJsonWithTimeout('/api/live/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: updatedSession }),
    }).catch(() => {});
    return { success: true, session: updatedSession };
  }

  // 3. Try Firestore with bounded 1500ms timeout
  try {
    const sessionRef = doc(db, COLLECTION_NAME, cleanCode);
    const snap = await withTimeout(getDoc(sessionRef), 1500);
    if (snap.exists()) {
      const session = snap.data() as LiveSessionData;
      if (session.status === 'finished') {
        return { success: false, error: 'This live session has already ended.' };
      }
      if (session.status !== 'lobby' && !session.settings?.allowLateJoin) {
        return {
          success: false,
          error: 'Assessment is already in progress and does not allow late join.',
        };
      }

      const updatedSession: LiveSessionData = stripUndefined({
        ...session,
        quiz: normalizeQuizForLiveBattle(session.quiz),
        participants: {
          ...(session.participants || {}),
          [participant.id]: newParticipant,
        },
        updatedAt: now,
      });

      saveLocalSessionCache(cleanCode, updatedSession);
      setDoc(sessionRef, updatedSession, { merge: true }).catch(() => {});
      fetchJsonWithTimeout('/api/live/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: updatedSession }),
      }).catch(() => {});

      return { success: true, session: updatedSession };
    }
  } catch {
    // ignore firestore timeout/error
  }

  return {
    success: false,
    error: 'Room not found. Verify the 6-digit PIN, or click below to launch this room yourself!',
  };
}

/**
 * Subscribe to real-time updates for a live session across BroadcastChannel, Server, and Firestore
 */
export function subscribeLiveSession(
  roomCode: string,
  onUpdate: (session: LiveSessionData | null) => void,
  onError?: (err: Error) => void
): () => void {
  const cleanCode = roomCode.trim().toUpperCase();

  // Register local in-memory listener
  if (!localListeners.has(cleanCode)) {
    localListeners.set(cleanCode, new Set());
  }
  const listenerSet = localListeners.get(cleanCode)!;
  listenerSet.add(onUpdate);

  // Immediately emit cached session if available
  const initialCached = getLocalSessionCache(cleanCode);
  if (initialCached) {
    onUpdate(initialCached);
  }

  // 1. Firestore real-time snapshot listener
  let unsubscribeFirestore: (() => void) | null = null;
  try {
    const sessionRef = doc(db, COLLECTION_NAME, cleanCode);
    unsubscribeFirestore = onSnapshot(
      sessionRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const firestoreData = docSnap.data() as LiveSessionData;
          const currentLocal = getLocalSessionCache(cleanCode);
          if (!currentLocal || (firestoreData.updatedAt || 0) > (currentLocal.updatedAt || 0)) {
            saveLocalSessionCache(cleanCode, firestoreData, false);
            onUpdate(firestoreData);
          }
        }
      },
      (error) => {
        onError?.(error);
      }
    );
  } catch {
    // ignore
  }

  // 2. Authoritative Server store polling (every 1.0s) for multi-device resilience
  const pollInterval = setInterval(async () => {
    const res = await fetchJsonWithTimeout(`/api/live/room/${cleanCode}`, undefined, 1200);
    if (res?.ok && res.data?.success && res.data?.session) {
      const serverSession = res.data.session as LiveSessionData;
      const currentLocal = getLocalSessionCache(cleanCode);
      if (!currentLocal || (serverSession.updatedAt || 0) > (currentLocal.updatedAt || 0)) {
        saveLocalSessionCache(cleanCode, serverSession, false);
        onUpdate(serverSession);
      }
    }
  }, 1000);

  return () => {
    listenerSet.delete(onUpdate);
    if (listenerSet.size === 0) {
      localListeners.delete(cleanCode);
    }
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
    clearInterval(pollInterval);
  };
}

/**
 * Host updates session state (e.g., starts countdown, advances to review/finished)
 */
export async function updateSessionStatus(
  roomCode: string,
  status: LiveSessionStatus,
  extraUpdates?: Partial<LiveSessionData>
): Promise<void> {
  const cleanCode = roomCode.trim().toUpperCase();
  const now = Date.now();
  const updates = stripUndefined({
    status,
    updatedAt: now,
    ...(extraUpdates || {}),
  });

  // 1. Optimistically update local cache & broadcast immediately (0ms UI update!)
  const cached = getLocalSessionCache(cleanCode);
  let merged: LiveSessionData | null = null;
  if (cached) {
    merged = {
      ...cached,
      ...updates,
    };
    saveLocalSessionCache(cleanCode, merged);
  }

  // 2. Update server store
  const res = await fetchJsonWithTimeout(
    '/api/live/update',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode: cleanCode,
        updates,
        fallbackSession: merged || cached || undefined,
      }),
    },
    1500
  );
  if (res?.ok && res.data?.session) {
    saveLocalSessionCache(cleanCode, res.data.session);
  }

  // 3. Update Firestore asynchronously in background
  try {
    const sessionRef = doc(db, COLLECTION_NAME, cleanCode);
    setDoc(sessionRef, updates, { merge: true }).catch(() => {});
  } catch {
    // ignore
  }
}

/**
 * Submit an answer for a participant
 */
export async function submitLiveAnswer(
  roomCode: string,
  participantId: string,
  questionIndex: number,
  answer: {
    selectedAnswer: string;
    isCorrect: boolean;
    responseTimeMs: number;
    pointsEarned: number;
  },
  newScore: number,
  newStreak: number
): Promise<void> {
  if (!participantId) return;
  const cleanCode = roomCode.trim().toUpperCase();
  const now = Date.now();
  const participantAnswer: ParticipantAnswer = {
    ...answer,
    answeredAt: now,
  };

  // 1. Optimistically update local cache & notify listeners immediately
  const cached = getLocalSessionCache(cleanCode);
  let updatedSession: LiveSessionData | null = null;
  if (cached) {
    const existingParticipant = cached.participants?.[participantId] || {
      id: participantId,
      name: 'Scholar',
      avatarSeed: 'scholar',
      avatarColor: 'indigo',
      role: 'student' as const,
      score: 0,
      streak: 0,
      answers: {},
      hasAnsweredCurrent: false,
      isReady: true,
      joinedAt: now,
      lastActive: now,
    };

    const updatedParticipant: LiveParticipant = {
      ...existingParticipant,
      score: newScore,
      streak: newStreak,
      hasAnsweredCurrent: true,
      lastActive: now,
      answers: {
        ...(existingParticipant.answers || {}),
        [questionIndex]: participantAnswer,
      },
    };

    updatedSession = {
      ...cached,
      participants: {
        ...(cached.participants || {}),
        [participantId]: updatedParticipant,
      },
      updatedAt: now,
    };

    saveLocalSessionCache(cleanCode, updatedSession);
  }

  // 2. Update server store
  const res = await fetchJsonWithTimeout(
    '/api/live/answer',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode: cleanCode,
        participantId,
        questionIndex,
        answer: participantAnswer,
        newScore,
        newStreak,
        fallbackSession: updatedSession || cached || undefined,
      }),
    },
    1500
  );
  if (res?.ok && res.data?.session) {
    saveLocalSessionCache(cleanCode, res.data.session);
  }

  // 3. Update Firestore in background
  try {
    const sessionRef = doc(db, COLLECTION_NAME, cleanCode);
    updateDoc(sessionRef, {
      [`participants.${participantId}.answers.${questionIndex}`]: participantAnswer,
      [`participants.${participantId}.score`]: newScore,
      [`participants.${participantId}.streak`]: newStreak,
      [`participants.${participantId}.hasAnsweredCurrent`]: true,
      [`participants.${participantId}.lastActive`]: now,
      updatedAt: now,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

/**
 * Host advances to next question, resetting question flags
 */
export async function advanceToNextQuestion(
  roomCode: string,
  nextIndex: number,
  participants: Record<string, LiveParticipant>
): Promise<void> {
  const cleanCode = roomCode.trim().toUpperCase();
  const now = Date.now();

  // 1. Optimistically update local cache & notify immediately
  const cached = getLocalSessionCache(cleanCode);
  let updatedSession: LiveSessionData | null = null;
  if (cached) {
    const resetParticipants: Record<string, LiveParticipant> = {};
    Object.entries(cached.participants || participants || {}).forEach(([pid, p]) => {
      resetParticipants[pid] = {
        ...p,
        hasAnsweredCurrent: false,
      };
    });

    updatedSession = {
      ...cached,
      status: 'in_progress',
      currentQuestionIndex: nextIndex,
      questionStartTime: now,
      participants: resetParticipants,
      updatedAt: now,
    };
    saveLocalSessionCache(cleanCode, updatedSession);
  }

  // 2. Update server store
  const res = await fetchJsonWithTimeout(
    '/api/live/update',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode: cleanCode,
        updates: {
          status: 'in_progress',
          currentQuestionIndex: nextIndex,
          questionStartTime: now,
        },
        resetAnsweredFlags: true,
        fallbackSession: updatedSession || cached || undefined,
      }),
    },
    1500
  );
  if (res?.ok && res.data?.session) {
    saveLocalSessionCache(cleanCode, res.data.session);
  }

  // 3. Update Firestore in background
  try {
    const sessionRef = doc(db, COLLECTION_NAME, cleanCode);
    const participantUpdates: Record<string, any> = {};
    Object.keys(participants || {}).forEach((pid) => {
      participantUpdates[`participants.${pid}.hasAnsweredCurrent`] = false;
    });
    updateDoc(sessionRef, {
      status: 'in_progress',
      currentQuestionIndex: nextIndex,
      questionStartTime: now,
      updatedAt: now,
      ...participantUpdates,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

/**
 * Add AI challenger scholars to a room for solo host practice or competitive warm-up
 */
export async function addSimulatedParticipants(
  roomCode: string,
  existingCount = 0
): Promise<void> {
  const cleanCode = roomCode.trim().toUpperCase();
  const simulatedNames = [
    { name: 'Alex Rivera', color: 'rose', seed: 'alex' },
    { name: 'Sophia Chen', color: 'indigo', seed: 'sophia' },
    { name: 'Marcus Vance', color: 'amber', seed: 'marcus' },
    { name: 'Elena Rostova', color: 'teal', seed: 'elena' },
    { name: 'Devon King', color: 'emerald', seed: 'devon' },
  ];

  const newBots: Record<string, LiveParticipant> = {};
  const now = Date.now();

  for (let i = 0; i < 3; i++) {
    const profile = simulatedNames[(existingCount + i) % simulatedNames.length];
    const botId = `bot_${profile.seed}_${Math.random().toString(36).substring(2, 6)}`;
    newBots[botId] = {
      id: botId,
      name: profile.name,
      avatarSeed: profile.seed,
      avatarColor: profile.color,
      role: 'student',
      score: 0,
      streak: 0,
      answers: {},
      hasAnsweredCurrent: false,
      isReady: true,
      joinedAt: now,
      lastActive: now,
    };
  }

  // 1. Update local cache immediately
  const cached = getLocalSessionCache(cleanCode);
  let updatedSession: LiveSessionData | null = null;
  if (cached) {
    updatedSession = {
      ...cached,
      participants: {
        ...(cached.participants || {}),
        ...newBots,
      },
      updatedAt: now,
    };
    saveLocalSessionCache(cleanCode, updatedSession);
  }

  // 2. Update server store
  const res = await fetchJsonWithTimeout(
    '/api/live/update',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode: cleanCode,
        updates: { participants: newBots },
        fallbackSession: updatedSession || cached || undefined,
      }),
    },
    1500
  );
  if (res?.ok && res.data?.session) {
    saveLocalSessionCache(cleanCode, res.data.session);
  }

  // 3. Update Firestore in background
  try {
    const sessionRef = doc(db, COLLECTION_NAME, cleanCode);
    const firestoreUpdates: Record<string, any> = { updatedAt: now };
    Object.entries(newBots).forEach(([botId, botData]) => {
      firestoreUpdates[`participants.${botId}`] = botData;
    });
    updateDoc(sessionRef, firestoreUpdates).catch(() => {});
  } catch {
    // ignore
  }
}
