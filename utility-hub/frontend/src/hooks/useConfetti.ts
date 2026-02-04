import { useCallback, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';

export const useConfetti = () => {
      const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

      // cleanup on unmount
      useEffect(() => {
            return () => {
                  if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                  }
            };
      }, []);

      const triggerFortunaEffect = useCallback(() => {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            intervalRef.current = setInterval(() => {
                  const timeLeft = animationEnd - Date.now();

                  if (timeLeft <= 0) {
                        if (intervalRef.current) {
                              clearInterval(intervalRef.current);
                              intervalRef.current = null;
                        }
                        return;
                  }

                  const particleCount = 50 * (timeLeft / duration);
                  confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                  confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
      }, []);

      return { triggerFortunaEffect };
};
