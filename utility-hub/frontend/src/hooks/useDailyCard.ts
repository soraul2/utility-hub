import { useState, useCallback } from 'react';
import { fetchDailyCard } from '../lib/api/tarotApi';
import type { DailyCardResponse } from '../lib/tarot';
import { ERROR_MESSAGES } from '../lib/constants/tarot';

interface UseDailyCardReturn {
      data: DailyCardResponse | null;
      loading: boolean;
      error: string | null;
      loadDailyCard: (userName?: string) => Promise<void>;
      reset: () => void;
}

export const useDailyCard = (): UseDailyCardReturn => {
      const [data, setData] = useState<DailyCardResponse | null>(null);
      const [loading, setLoading] = useState<boolean>(false);
      const [error, setError] = useState<string | null>(null);

      const loadDailyCard = useCallback(async (userName?: string) => {
            setLoading(true);
            setError(null);
            try {
                  const response = await fetchDailyCard(userName);
                  setData(response);
            } catch (err) {
                  setError(err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN);
            } finally {
                  setLoading(false);
            }
      }, []);

      const reset = useCallback(() => {
            setData(null);
            setError(null);
            setLoading(false);
      }, []);

      return {
            data,
            loading,
            error,
            loadDailyCard,
            reset,
      };
};
