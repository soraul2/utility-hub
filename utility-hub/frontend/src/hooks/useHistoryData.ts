import { useState, useCallback, useEffect } from 'react';
import { getHistory, deleteReading } from '../lib/api/tarotApi';
import type { HistoryResponse, PageResponse, SpreadType } from '../lib/tarot';
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS, ERROR_MESSAGES } from '../lib/constants/tarot';

export interface UseHistoryDataReturn {
      history: PageResponse<HistoryResponse> | null;
      loading: boolean;
      error: string | null;
      page: number;
      selectedSpread: SpreadType | undefined;
      sortOrder: 'DESC' | 'ASC';
      searchTerm: string;
      debouncedSearchTerm: string;
      setPage: (page: number) => void;
      setSelectedSpread: (spread: SpreadType | undefined) => void;
      setSortOrder: (order: 'DESC' | 'ASC') => void;
      setSearchTerm: (term: string) => void;
      fetchHistory: () => Promise<void>;
      deleteItem: (sessionId: number) => Promise<boolean>;
      refresh: () => void;
}

export const useHistoryData = (): UseHistoryDataReturn => {
      const [history, setHistory] = useState<PageResponse<HistoryResponse> | null>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [page, setPage] = useState(0);
      const [selectedSpread, setSelectedSpread] = useState<SpreadType | undefined>(undefined);
      const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');
      const [searchTerm, setSearchTerm] = useState('');
      const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

      // Debounce logic
      useEffect(() => {
            const timer = setTimeout(() => {
                  setDebouncedSearchTerm(searchTerm);
            }, SEARCH_DEBOUNCE_MS);
            return () => clearTimeout(timer);
      }, [searchTerm]);

      const fetchHistory = useCallback(async () => {
            setLoading(true);
            setError(null);
            try {
                  const sortParam = `createdAt,${sortOrder.toLowerCase()}`;
                  const data = await getHistory(page, DEFAULT_PAGE_SIZE, selectedSpread, sortParam, debouncedSearchTerm || undefined);
                  setHistory(data);
            } catch (err) {
                  setError(err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN);
            } finally {
                  setLoading(false);
            }
      }, [page, selectedSpread, sortOrder, debouncedSearchTerm]);

      const deleteItem = useCallback(async (sessionId: number): Promise<boolean> => {
            try {
                  await deleteReading(sessionId);
                  return true;
            } catch {
                  return false;
            }
      }, []);

      const refresh = useCallback(() => {
            fetchHistory();
      }, [fetchHistory]);

      return {
            history,
            loading,
            error,
            page,
            selectedSpread,
            sortOrder,
            searchTerm,
            debouncedSearchTerm,
            setPage,
            setSelectedSpread,
            setSortOrder,
            setSearchTerm,
            fetchHistory,
            deleteItem,
            refresh,
      };
};
