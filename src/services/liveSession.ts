import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QuizResponse } from '../types/quiz';
import {
  LiveSessionData,
  LiveSessionStatus,
  LiveParticipant,
  LiveSessionSettings,
  ParticipantAnswer,
} from '../types/liveSession';

const COLLECTION_NAME = 'live_sessions';

/**
 * Generate a clean 6-digit numeric or alphanumeric room code
 */
export function generateRoomCode(): string {
  // 6 digit number between 100000 and 999999
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
  const timeLimitMs = (timeLimitSeconds > 0 ? timeLimitSeconds : 30) * 1000;
  
  // Speed ratio: 1.0 (instant) down to 0.5 (at time limit)
  const ratio = Math.max(0, Math.min(1, responseTimeMs / timeLimitMs));
  const speedBonus = Math.round((1 - ratio) * 500); // 0 to 500 points
  
  // Streak multiplier: 0% to 30% extra
  const streakBonus = streakBonusEnabled
    ? Math.min(300, currentStreak * 50)
    : 0;

  return basePoints + speedBonus + streakBonus;
}

/**
 * Host creates a new live quiz session room
 */
export async function createLiveSession(
  quiz: QuizResponse,
  host: { id: string; name: string; avatar?: string },
  settings?: Partial<LiveSessionSettings>
): Promise<string> {
  const roomCode = generateRoomCode();
  const sessionRef = doc(db, COLLECTION_NAME, roomCode);

  const defaultSettings: LiveSessionSettings = {
    timePerQuestion: 20,
    showLeaderboardAfterEach: true,
    streakBonusesEnabled: true,
    allowLateJoin: true,
    ...settings,
  };

  const initialData: LiveSessionData = {
    id: roomCode,
    roomCode,
    hostId: host.id,
    hostName: host.name || 'Quiz Master',
    hostAvatar: host.avatar,
    quiz,
    status: 'lobby',
    currentQuestionIndex: 0,
    questionStartTime: Date.now(),
    settings: defaultSettings,
    participants: {
      [host.id]: {
        id: host.id,
        name: `${host.name} (Host)`,
        avatarSeed: 'host-crown',
        avatarColor: 'indigo',
        role: 'teacher',
        score: 0,
        streak: 0,
        answers: {},
        hasAnsweredCurrent: false,
        isReady: true,
        joinedAt: Date.now(),
        lastActive: Date.now(),
      },
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    await setDoc(sessionRef, initialData);
    return roomCode;
  } catch (err) {
    console.error('Failed to create live session in Firestore:', err);
    // Fallback: save to memory/sessionStorage for preview robustness
    sessionStorage.setItem(`quizme_live_fallback_${roomCode}`, JSON.stringify(initialData));
    return roomCode;
  }
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
  const sessionRef = doc(db, COLLECTION_NAME, cleanCode);

  try {
    const snap = await getDoc(sessionRef);
    if (!snap.exists()) {
      // Check fallback storage
      const fallbackStr = sessionStorage.getItem(`quizme_live_fallback_${cleanCode}`);
      if (fallbackStr) {
        const fallbackSession = JSON.parse(fallbackStr) as LiveSessionData;
        const updatedParticipants = {
          ...fallbackSession.participants,
          [participant.id]: {
            id: participant.id,
            name: participant.name,
            avatarSeed: participant.avatarSeed || 'student-gem',
            avatarColor: participant.avatarColor || 'emerald',
            role: participant.role || 'student',
            score: 0,
            streak: 0,
            answers: {},
            hasAnsweredCurrent: false,
            isReady: true,
            joinedAt: Date.now(),
            lastActive: Date.now(),
          },
        };
        fallbackSession.participants = updatedParticipants;
        sessionStorage.setItem(`quizme_live_fallback_${cleanCode}`, JSON.stringify(fallbackSession));
        return { success: true, session: fallbackSession };
      }
      return { success: false, error: 'Room not found. Please verify the 6-digit code.' };
    }

    const session = snap.data() as LiveSessionData;

    if (session.status === 'finished') {
      return { success: false, error: 'This live session has already ended.' };
    }

    if (session.status !== 'lobby' && !session.settings?.allowLateJoin) {
      return { success: false, error: 'Assessment is already in progress and does not allow late join.' };
    }

    const newParticipant: LiveParticipant = {
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
      joinedAt: Date.now(),
      lastActive: Date.now(),
    };

    // Update participants map in document
    await updateDoc(sessionRef, {
      [`participants.${participant.id}`]: newParticipant,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      session: {
        ...session,
        participants: {
          ...session.participants,
          [participant.id]: newParticipant,
        },
      },
    };
  } catch (err: any) {
    console.error('Error joining live session:', err);
    return { success: false, error: err?.message || 'Failed to join live session.' };
  }
}

/**
 * Subscribe to real-time updates for a live session
 */
export function subscribeLiveSession(
  roomCode: string,
  onUpdate: (session: LiveSessionData | null) => void,
  onError?: (err: Error) => void
): () => void {
  const cleanCode = roomCode.trim().toUpperCase();
  const sessionRef = doc(db, COLLECTION_NAME, cleanCode);

  try {
    const unsubscribe = onSnapshot(
      sessionRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as LiveSessionData);
        } else {
          // Check fallback
          const fallbackStr = sessionStorage.getItem(`quizme_live_fallback_${cleanCode}`);
          if (fallbackStr) {
            onUpdate(JSON.parse(fallbackStr));
          } else {
            onUpdate(null);
          }
        }
      },
      (error) => {
        console.warn('Firestore live session listener note:', error);
        // Polling fallback from sessionStorage if Firestore stream is blocked
        const fallbackStr = sessionStorage.getItem(`quizme_live_fallback_${cleanCode}`);
        if (fallbackStr) {
          onUpdate(JSON.parse(fallbackStr));
        }
        onError?.(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Subscribe live session exception:', err);
    return () => {};
  }
}

/**
 * Host updates session state (e.g., starts countdown, advances to next question)
 */
export async function updateSessionStatus(
  roomCode: string,
  status: LiveSessionStatus,
  extraUpdates?: Partial<LiveSessionData>
): Promise<void> {
  const sessionRef = doc(db, COLLECTION_NAME, roomCode);
  const payload: Record<string, any> = {
    status,
    updatedAt: Date.now(),
    ...extraUpdates,
  };

  try {
    await updateDoc(sessionRef, payload);
  } catch (err) {
    console.warn('Fallback updating status for room', roomCode, err);
    const fallbackStr = sessionStorage.getItem(`quizme_live_fallback_${roomCode}`);
    if (fallbackStr) {
      const parsed = JSON.parse(fallbackStr);
      Object.assign(parsed, payload);
      sessionStorage.setItem(`quizme_live_fallback_${roomCode}`, JSON.stringify(parsed));
    }
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
  const sessionRef = doc(db, COLLECTION_NAME, roomCode);
  const participantAnswer: ParticipantAnswer = {
    ...answer,
    answeredAt: Date.now(),
  };

  try {
    await updateDoc(sessionRef, {
      [`participants.${participantId}.answers.${questionIndex}`]: participantAnswer,
      [`participants.${participantId}.score`]: newScore,
      [`participants.${participantId}.streak`]: newStreak,
      [`participants.${participantId}.hasAnsweredCurrent`]: true,
      [`participants.${participantId}.lastActive`]: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('Fallback updating answer in room', roomCode, err);
    const fallbackStr = sessionStorage.getItem(`quizme_live_fallback_${roomCode}`);
    if (fallbackStr) {
      const parsed = JSON.parse(fallbackStr);
      if (parsed.participants?.[participantId]) {
        parsed.participants[participantId].answers = parsed.participants[participantId].answers || {};
        parsed.participants[participantId].answers[questionIndex] = participantAnswer;
        parsed.participants[participantId].score = newScore;
        parsed.participants[participantId].streak = newStreak;
        parsed.participants[participantId].hasAnsweredCurrent = true;
        sessionStorage.setItem(`quizme_live_fallback_${roomCode}`, JSON.stringify(parsed));
      }
    }
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
  const sessionRef = doc(db, COLLECTION_NAME, roomCode);
  
  // Reset hasAnsweredCurrent flag for all participants
  const participantUpdates: Record<string, any> = {};
  Object.keys(participants).forEach((pid) => {
    participantUpdates[`participants.${pid}.hasAnsweredCurrent`] = false;
  });

  const payload = {
    status: 'in_progress' as LiveSessionStatus,
    currentQuestionIndex: nextIndex,
    questionStartTime: Date.now(),
    updatedAt: Date.now(),
    ...participantUpdates,
  };

  try {
    await updateDoc(sessionRef, payload);
  } catch (err) {
    console.warn('Fallback advance question in room', roomCode, err);
    const fallbackStr = sessionStorage.getItem(`quizme_live_fallback_${roomCode}`);
    if (fallbackStr) {
      const parsed = JSON.parse(fallbackStr);
      parsed.status = 'in_progress';
      parsed.currentQuestionIndex = nextIndex;
      parsed.questionStartTime = Date.now();
      if (parsed.participants) {
        Object.keys(parsed.participants).forEach((pid) => {
          parsed.participants[pid].hasAnsweredCurrent = false;
        });
      }
      sessionStorage.setItem(`quizme_live_fallback_${roomCode}`, JSON.stringify(parsed));
    }
  }
}

/**
 * Add simulated bot scholars to a room for solo host practice/demo
 */
export async function addSimulatedParticipants(
  roomCode: string,
  existingCount = 0
): Promise<void> {
  const simulatedNames = [
    { name: 'Alex Rivera', color: 'rose', seed: 'alex' },
    { name: 'Sophia Chen', color: 'indigo', seed: 'sophia' },
    { name: 'Marcus Vance', color: 'amber', seed: 'marcus' },
    { name: 'Elena Rostova', color: 'teal', seed: 'elena' },
    { name: 'Devon King', color: 'emerald', seed: 'devon' },
  ];

  const sessionRef = doc(db, COLLECTION_NAME, roomCode);

  for (let i = 0; i < 3; i++) {
    const profile = simulatedNames[(existingCount + i) % simulatedNames.length];
    const botId = `bot_${profile.seed}_${Math.random().toString(36).substring(2, 7)}`;
    const botParticipant: LiveParticipant = {
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
      joinedAt: Date.now(),
      lastActive: Date.now(),
    };

    try {
      await updateDoc(sessionRef, {
        [`participants.${botId}`]: botParticipant,
        updatedAt: Date.now(),
      });
    } catch {
      // ignore
    }
  }
}
