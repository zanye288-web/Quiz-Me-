import { QuizResponse } from '../types/quiz';

/**
 * Encodes a QuizResponse object into a compact, URL-safe Base64 string
 * with full UTF-8 Unicode character support.
 */
export function encodeQuizData(quiz: QuizResponse): string {
  try {
    const minified = {
      app_name: quiz.app_name || 'Quiz Me!',
      persona: quiz.persona || 'Student',
      quiz_title: quiz.quiz_title || 'Shared Quiz',
      summary: quiz.summary || '',
      difficulty: quiz.difficulty || 'Intermediate',
      language: quiz.language,
      language_name: quiz.language_name,
      questions: quiz.questions || [],
      tags: quiz.tags || [],
      study_guide: quiz.study_guide || undefined,
    };
    const jsonStr = JSON.stringify(minified);
    // Encode UTF-8 characters safely to base64
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return base64;
  } catch (err) {
    console.error('Failed to encode quiz data to Base64:', err);
    throw new Error('Unable to serialize quiz for sharing.');
  }
}

/**
 * Decodes a URL-safe Base64 string back into a verified QuizResponse.
 */
export function decodeQuizData(encoded: string): QuizResponse | null {
  try {
    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    const parsed = JSON.parse(jsonStr) as QuizResponse;
    if (parsed && parsed.quiz_title && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('Could not decode quiz from payload:', err);
    return null;
  }
}

/**
 * Generates a full, standalone, shareable URL that embeds the complete quiz data
 * so peers can open and play it immediately without needing a specific database account.
 */
export function buildQuizShareUrl(quiz: QuizResponse, originUrl?: string): string {
  const base = originUrl || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '');
  const encoded = encodeQuizData(quiz);
  return `${base}?sharedQuiz=${encodeURIComponent(encoded)}`;
}

/**
 * Generates a shareable URL pointing to a cloud-saved quiz ID in Firestore.
 */
export function buildCloudQuizShareUrl(quizId: string, originUrl?: string): string {
  const base = originUrl || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '');
  return `${base}?quizId=${encodeURIComponent(quizId)}`;
}

export type DetectedSharedQuiz =
  | { type: 'data'; quiz: QuizResponse }
  | { type: 'cloudId'; quizId: string };

/**
 * Inspects window.location.search to see if a peer has sent a shared quiz link.
 */
export function detectSharedQuizInUrl(): DetectedSharedQuiz | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    
    // Check for self-contained direct payload
    const sharedDataParam = params.get('sharedQuiz');
    if (sharedDataParam) {
      const decodedQuiz = decodeQuizData(sharedDataParam);
      if (decodedQuiz) {
        return { type: 'data', quiz: decodedQuiz };
      }
    }

    // Check for cloud quizId
    const cloudIdParam = params.get('quizId');
    if (cloudIdParam) {
      return { type: 'cloudId', quizId: cloudIdParam };
    }
  } catch (err) {
    console.warn('Error detecting shared quiz in URL params:', err);
  }

  return null;
}

/**
 * Removes the share parameters from browser address bar without triggering a reload.
 */
export function clearSharedQuizParamsFromUrl() {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('sharedQuiz');
    url.searchParams.delete('quizId');
    window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ''));
  } catch (err) {
    console.warn('Error clearing URL share params:', err);
  }
}
