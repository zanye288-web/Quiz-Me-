import { QuizResponse, DifficultyType, PersonaType } from '../types/quiz';

export interface CommunitySeedQuiz extends QuizResponse {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorRole: PersonaType;
  creatorAvatarColor: string;
  category: string;
  difficulty: DifficultyType;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  createdAtLabel: string;
  isPublic: boolean;
}

export const COMMUNITY_SEED_QUIZZES: CommunitySeedQuiz[] = [];
