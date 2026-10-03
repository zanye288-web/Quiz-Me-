import { QuizResponse, Question } from './quiz';

export type LiveSessionStatus = 'lobby' | 'countdown' | 'in_progress' | 'question_review' | 'finished';

export interface ParticipantAnswer {
  selectedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  responseTimeMs: number;
  answeredAt: number;
}

export interface LiveParticipant {
  id: string;
  name: string;
  avatarSeed: string;
  avatarColor: string;
  role: 'student' | 'teacher' | 'guest';
  score: number;
  streak: number;
  answers: Record<number, ParticipantAnswer>;
  hasAnsweredCurrent: boolean;
  isReady: boolean;
  joinedAt: number;
  lastActive: number;
}

export interface LiveSessionSettings {
  timePerQuestion: number; // in seconds (e.g. 15, 20, 30, 0 = untimed)
  showLeaderboardAfterEach: boolean;
  streakBonusesEnabled: boolean;
  allowLateJoin: boolean;
}

export interface LiveSessionData {
  id: string; // Room Code (e.g. "849201")
  roomCode: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  quiz: QuizResponse;
  status: LiveSessionStatus;
  currentQuestionIndex: number;
  questionStartTime: number; // timestamp in ms
  settings: LiveSessionSettings;
  participants: Record<string, LiveParticipant>;
  createdAt: number;
  updatedAt: number;
}
