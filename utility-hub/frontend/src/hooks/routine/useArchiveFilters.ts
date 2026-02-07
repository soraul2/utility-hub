import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Reflection } from '../../types/routine';

export type SortOption = 'newest' | 'oldest' | 'rating-high' | 'rating-low';

export interface ArchiveStats {
      totalCount: number;
      avgRating: number;
      mostCommonMood: string | null;
      goodDays: number;
      streak: number;
      avgCompletion: number;
}

export interface TrendDataPoint {
      rating: number;
      date: string;
      mood: string;
}

export interface UseArchiveFiltersReturn {
      searchTerm: string;
      setSearchTerm: (v: string) => void;
      moodFilter: string | null;
      setMoodFilter: (v: string | null) => void;
      ratingFilter: number | null;
      setRatingFilter: (v: number | null) => void;
      sortBy: SortOption;
      setSortBy: (v: SortOption) => void;
      showFilters: boolean;
      setShowFilters: (v: boolean) => void;
      filteredReflections: Reflection[];
      groupedByMonth: Record<string, Reflection[]>;
      stats: ArchiveStats;
      trendData: TrendDataPoint[];
      moodDistribution: Record<string, { count: number; pct: number }>;
      clearFilters: () => void;
      hasActiveFilters: boolean;
}

export function useArchiveFilters(reflections: Reflection[]): UseArchiveFiltersReturn {
      const [searchTerm, setSearchTerm] = useState('');
      const [moodFilter, setMoodFilter] = useState<string | null>(null);
      const [ratingFilter, setRatingFilter] = useState<number | null>(null);
      const [sortBy, setSortBy] = useState<SortOption>('newest');
      const [showFilters, setShowFilters] = useState(false);

      // Filtered + sorted reflections
      const filteredReflections = useMemo(() => {
            let result = reflections.filter(ref => {
                  const matchesSearch = !searchTerm ||
                        ref.whatWentWell?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ref.whatDidntGoWell?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ref.tomorrowFocus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ref.morningGoal?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesMood = !moodFilter || ref.mood === moodFilter;
                  const matchesRating = !ratingFilter || ref.rating === ratingFilter;
                  return matchesSearch && matchesMood && matchesRating;
            });

            // Sort
            result = [...result].sort((a, b) => {
                  const dateA = a.planDate || a.createdAt || '';
                  const dateB = b.planDate || b.createdAt || '';
                  switch (sortBy) {
                        case 'oldest': return dateA.localeCompare(dateB);
                        case 'rating-high': return b.rating - a.rating || dateB.localeCompare(dateA);
                        case 'rating-low': return a.rating - b.rating || dateB.localeCompare(dateA);
                        default: return dateB.localeCompare(dateA);
                  }
            });

            return result;
      }, [reflections, searchTerm, moodFilter, ratingFilter, sortBy]);

      // Monthly grouping
      const groupedByMonth = useMemo(() => {
            const groups: Record<string, Reflection[]> = {};
            filteredReflections.forEach(ref => {
                  const dateStr = ref.planDate || ref.createdAt;
                  if (!dateStr) return;
                  const monthKey = format(new Date(dateStr), 'yyyy\ub144 M\uc6d4', { locale: ko });
                  if (!groups[monthKey]) groups[monthKey] = [];
                  groups[monthKey].push(ref);
            });
            return groups;
      }, [filteredReflections]);

      // Summary stats
      const stats = useMemo<ArchiveStats>(() => {
            if (reflections.length === 0) {
                  return { totalCount: 0, avgRating: 0, mostCommonMood: null, goodDays: 0, streak: 0, avgCompletion: 0 };
            }

            const totalRating = reflections.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = totalRating / reflections.length;

            const moodCounts: Record<string, number> = {};
            reflections.forEach(r => { moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1; });
            const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

            const goodDays = reflections.filter(r => r.mood === 'GOOD').length;

            // Streak calculation
            const sortedDates = reflections
                  .map(r => r.planDate || r.createdAt || '')
                  .filter(Boolean)
                  .map(d => format(new Date(d), 'yyyy-MM-dd'))
                  .sort((a, b) => b.localeCompare(a));

            let streak = 0;
            if (sortedDates.length > 0) {
                  const today = new Date();
                  let checkDate = new Date(today);
                  for (let i = 0; i < 365; i++) {
                        const dateStr = format(checkDate, 'yyyy-MM-dd');
                        if (sortedDates.includes(dateStr)) {
                              streak++;
                              checkDate.setDate(checkDate.getDate() - 1);
                        } else {
                              break;
                        }
                  }
            }

            // Average completion rate
            const withTasks = reflections.filter(r => r.totalTasks && r.totalTasks > 0);
            const avgCompletion = withTasks.length > 0
                  ? Math.round(withTasks.reduce((sum, r) => sum + ((r.completedTasks || 0) / (r.totalTasks || 1)) * 100, 0) / withTasks.length)
                  : 0;

            return { totalCount: reflections.length, avgRating, mostCommonMood, goodDays, streak, avgCompletion };
      }, [reflections]);

      // Trend data (last 7 entries for mini chart)
      const trendData = useMemo<TrendDataPoint[]>(() => {
            const sorted = [...reflections]
                  .sort((a, b) => (a.planDate || a.createdAt || '').localeCompare(b.planDate || b.createdAt || ''))
                  .slice(-7);
            return sorted.map(r => ({
                  rating: r.rating,
                  date: r.planDate || r.createdAt || '',
                  mood: r.mood
            }));
      }, [reflections]);

      // Mood distribution
      const moodDistribution = useMemo(() => {
            const counts = { BAD: 0, NORMAL: 0, GOOD: 0 };
            reflections.forEach(r => {
                  if (r.mood in counts) counts[r.mood as keyof typeof counts]++;
            });
            const total = reflections.length || 1;
            return {
                  BAD: { count: counts.BAD, pct: Math.round((counts.BAD / total) * 100) },
                  NORMAL: { count: counts.NORMAL, pct: Math.round((counts.NORMAL / total) * 100) },
                  GOOD: { count: counts.GOOD, pct: Math.round((counts.GOOD / total) * 100) }
            };
      }, [reflections]);

      const clearFilters = useCallback(() => {
            setSearchTerm('');
            setMoodFilter(null);
            setRatingFilter(null);
            setSortBy('newest');
      }, []);

      const hasActiveFilters = !!(searchTerm || moodFilter || ratingFilter || sortBy !== 'newest');

      return {
            searchTerm,
            setSearchTerm,
            moodFilter,
            setMoodFilter,
            ratingFilter,
            setRatingFilter,
            sortBy,
            setSortBy,
            showFilters,
            setShowFilters,
            filteredReflections,
            groupedByMonth,
            stats,
            trendData,
            moodDistribution,
            clearFilters,
            hasActiveFilters,
      };
}
