'use client';

import confetti from 'canvas-confetti';

export function fireQuestConfetti(originX = 0.5, originY = 0.5) {
  try {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: originX, y: originY },
      colors: ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
      ticks: 120,
      gravity: 1.2,
      scalar: 0.9,
    });
  } catch {
    // Canvas confetti not supported or window not ready
  }
}

export function fireLevelUpConfetti() {
  try {
    const end = Date.now() + 1500;
    const colors = ['#F59E0B', '#FBBF24', '#D97706', '#8B5CF6', '#10B981'];

    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // Canvas confetti fallback
  }
}
