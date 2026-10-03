import { PRESET_TOPICS } from '../data/presets';
import { QuizResponse } from '../types/quiz';

const OFFLINE_QUIZZES_KEY = 'quizme_offline_cached_quizzes_v1';

/**
 * Register Service Worker if supported by the browser
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  // Avoid registering service worker in local preview iframe if origin issues arise
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New service worker version available.');
          }
        });
      }
    });

    console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);
    return registration;
  } catch (err) {
    console.warn('[PWA] Service Worker registration failed (normal in cross-origin sandbox):', err);
    return null;
  }
}

/**
 * Ensure all core curriculum & starter quizzes are cached locally so students can study offline
 */
export function cacheCoreQuizDataOffline(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const cachedMap: Record<string, QuizResponse> = {};

    PRESET_TOPICS.forEach((topic) => {
      if (topic.prebuiltStudentQuiz) {
        cachedMap[`preset_${topic.id}_student`] = topic.prebuiltStudentQuiz;
      }
      if (topic.prebuiltTeacherQuiz) {
        cachedMap[`preset_${topic.id}_teacher`] = topic.prebuiltTeacherQuiz;
      }

      // Also send message to Service Worker if active
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_QUIZ_DATA',
          key: topic.id,
          payload: topic.prebuiltStudentQuiz,
        });
      }
    });

    localStorage.setItem(OFFLINE_QUIZZES_KEY, JSON.stringify(cachedMap));
    return Object.keys(cachedMap).length;
  } catch (err) {
    console.warn('Could not cache quizzes in local storage:', err);
    return 0;
  }
}

/**
 * Retrieve list of all cached offline quizzes
 */
export function getOfflineCachedQuizzes(): Array<{ id: string; quiz: QuizResponse }> {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(OFFLINE_QUIZZES_KEY);
    if (!raw) {
      cacheCoreQuizDataOffline();
      const updated = localStorage.getItem(OFFLINE_QUIZZES_KEY);
      if (!updated) return [];
      const map = JSON.parse(updated);
      return Object.entries(map).map(([id, quiz]) => ({ id, quiz: quiz as QuizResponse }));
    }
    const map = JSON.parse(raw);
    return Object.entries(map).map(([id, quiz]) => ({ id, quiz: quiz as QuizResponse }));
  } catch {
    return [];
  }
}

/**
 * Cache an arbitrary user-created or imported quiz for offline play
 */
export function cacheQuizForOffline(id: string, quiz: QuizResponse): void {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(OFFLINE_QUIZZES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[id] = quiz;
    localStorage.setItem(OFFLINE_QUIZZES_KEY, JSON.stringify(map));

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_QUIZ_DATA',
        key: id,
        payload: quiz,
      });
    }
  } catch (err) {
    console.warn('Error caching individual quiz offline:', err);
  }
}
