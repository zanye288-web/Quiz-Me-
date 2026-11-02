// ============================================================================
// QUIZ-ME! — DOMAIN VALIDATION ENGINE
// Validates educational entities, question schemas, and input boundaries.
// ============================================================================

import { DomainQuestion } from './entities';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateQuestion(q: unknown): ValidationResult {
  const errors: string[] = [];

  if (!q || typeof q !== 'object') {
    return { isValid: false, errors: ['Question must be a non-null object'] };
  }

  const question = q as Partial<DomainQuestion>;

  if (!question.prompt || typeof question.prompt !== 'string' || question.prompt.trim().length < 5) {
    errors.push('Question prompt must be at least 5 characters long');
  }

  if (!question.correctAnswer || typeof question.correctAnswer !== 'string' || !question.correctAnswer.trim()) {
    errors.push('Question must specify a valid correct answer');
  }

  if (question.type === 'multiple_choice') {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push('Multiple-choice questions must have at least 2 distinct options');
    } else {
      const trimmedOptions = question.options.map((o) => String(o).trim().toLowerCase());
      const uniqueCount = new Set(trimmedOptions).size;
      if (uniqueCount !== question.options.length) {
        errors.push('Multiple-choice options must be unique');
      }

      const hasCorrect = question.options.some(
        (opt) => String(opt).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase()
      );
      if (!hasCorrect) {
        errors.push('Correct answer must match one of the provided options');
      }
    }
  }

  if (question.explanation && typeof question.explanation !== 'string') {
    errors.push('Explanation must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateAssessmentSubmission(submission: {
  userId?: string;
  answers: Record<string, string>;
  totalQuestions: number;
}): ValidationResult {
  const errors: string[] = [];

  if (!submission.answers || typeof submission.answers !== 'object') {
    errors.push('Answers must be provided as key-value pairs');
  }

  if (submission.totalQuestions <= 0) {
    errors.push('Assessment must contain at least 1 question');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
