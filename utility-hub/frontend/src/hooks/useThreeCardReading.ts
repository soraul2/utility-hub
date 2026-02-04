import { useState, useCallback } from 'react';
import { createThreeCardReading } from '../lib/api/tarotApi';
import type { ThreeCardRequest, ThreeCardResponse } from '../lib/tarot';
import { ERROR_MESSAGES } from '../lib/constants/tarot';

interface UseThreeCardReadingReturn {
      data: ThreeCardResponse | null;
      loading: boolean;
      error: string | null;
      createReading: (payload: ThreeCardRequest) => Promise<void>;
      reset: () => void;
}

export const useThreeCardReading = (): UseThreeCardReadingReturn => {
      const [data, setData] = useState<ThreeCardResponse | null>(null);
      const [loading, setLoading] = useState<boolean>(false);
      const [error, setError] = useState<string | null>(null);

      const createReading = useCallback(async (payload: ThreeCardRequest) => {
            setLoading(true);
            setError(null);
            try {
                  const response = await createThreeCardReading(payload);
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
            createReading,
            reset,
      };
};
