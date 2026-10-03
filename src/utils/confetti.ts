import confetti from 'canvas-confetti';

const CONFETTI_KEY = 'quizme_confetti_enabled_v1';

export function isConfettiAllowed(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(CONFETTI_KEY);
  return saved !== 'false';
}

/**
 * Triggers a massive, multi-stage celebratory confetti explosion
 * tailored for 100% perfect quiz scores.
 */
export function triggerPerfectScoreConfetti() {
  if (!isConfettiAllowed()) return;
  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;

  // Primary center explosion
  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#ffd700', '#f59e0b', '#6366f1', '#ec4899', '#10b981', '#06b6d4'],
    startVelocity: 45,
  });

  // Secondary star and circle bursts from left and right edges
  const colors = ['#f59e0b', '#eab308', '#6366f1', '#ec4899', '#10b981', '#38bdf8', '#a855f7'];

  const frame = () => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return;

    // Left cannon
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: colors,
      startVelocity: 50,
      gravity: 1.1,
      scalar: 1.2,
      ticks: 200,
    });

    // Right cannon
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: colors,
      startVelocity: 50,
      gravity: 1.1,
      scalar: 1.2,
      ticks: 200,
    });

    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);

  // Big finale blast after 1.2 seconds
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#ffd700', '#fbbf24', '#f43f5e', '#8b5cf6', '#06b6d4'],
      shapes: ['star', 'circle'],
      scalar: 1.3,
    });
  }, 1200);
}

/**
 * Standard celebratory confetti burst for general completion
 */
export function triggerStandardConfetti() {
  if (!isConfettiAllowed()) return;
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.65 },
    colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'],
  });
}

/**
 * Click-triggered confetti limiter (User Request: "A limit to the confetti effect when clicked which should be 3 times")
 */
export const MAX_CLICK_CONFETTI = 3;
let globalClickConfettiCount = 0;

export function getClickConfettiCount(): number {
  return globalClickConfettiCount;
}

export function getClickConfettiRemaining(): number {
  return Math.max(0, MAX_CLICK_CONFETTI - globalClickConfettiCount);
}

export function resetClickConfettiCount(): void {
  globalClickConfettiCount = 0;
}

/**
 * Safely triggers clicked celebratory confetti capped at exactly 3 times.
 * Returns true if confetti fired, or false if the 3-click limit was reached.
 */
export function triggerClickConfetti(type: 'perfect' | 'standard' = 'perfect'): {
  success: boolean;
  remaining: number;
  count: number;
} {
  if (globalClickConfettiCount >= MAX_CLICK_CONFETTI) {
    return { success: false, remaining: 0, count: globalClickConfettiCount };
  }

  globalClickConfettiCount++;
  if (type === 'perfect') {
    triggerPerfectScoreConfetti();
  } else {
    triggerStandardConfetti();
  }

  return {
    success: true,
    remaining: Math.max(0, MAX_CLICK_CONFETTI - globalClickConfettiCount),
    count: globalClickConfettiCount,
  };
}
