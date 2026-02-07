import { useState, useCallback } from 'react';

const STORAGE_KEY = 'guest_tarot_sessions';

export const useGuestTarot = () => {
      const [guestSessions, setGuestSessions] = useState<number[]>(() => {
            try {
                  const stored = localStorage.getItem(STORAGE_KEY);
                  return stored ? JSON.parse(stored) : [];
            } catch (e) {
                  console.error('Failed to parse guest sessions', e);
                  return [];
            }
      });

      const saveGuestSession = useCallback((sessionId: number) => {
            try {
                  const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                  if (!current.includes(sessionId)) {
                        const updated = [...current, sessionId];
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                        setGuestSessions(updated);
                  }
            } catch (e) {
                  console.error('Failed to save guest session', e);
            }
      }, []);

      const clearGuestSessions = useCallback(() => {
            localStorage.removeItem(STORAGE_KEY);
            setGuestSessions([]);
      }, []);

      return {
            guestSessions,
            saveGuestSession,
            clearGuestSessions,
            hasGuestSessions: guestSessions.length > 0
      };
};
