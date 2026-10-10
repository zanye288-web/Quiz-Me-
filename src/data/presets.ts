import { QuestionType, QuizResponse } from '../types/quiz';

export interface PresetTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  inputText: string;
  icon?: string;
  mediaUrl?: string;
  pedagogical_topic?: string;
  pedagogical_subtopic?: string;
  tags?: string[];
  suggestedTypes: QuestionType[];
  prebuiltStudentQuiz: QuizResponse;
  prebuiltTeacherQuiz: QuizResponse;
}

export const PRESET_TOPICS: PresetTopic[] = [];
