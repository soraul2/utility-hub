import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
      Star,
      Calendar,
      Smile,
      Meh,
      Frown,
      ArrowRight,
      Battery,
      Target,
      Zap,
      Search,
      ChevronDown,
      TrendingUp,
      Heart,
      X,
      Flame,
      BarChart3,
      ArrowUpDown,
      SlidersHorizontal,
      ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Reflection } from '../../types/routine';

// Mood config
const MOOD_CONFIG: Record<string, { icon: typeof Smile; label: string; color: string; bgColor: string; chartColor: string }> = {
      'BAD': { icon: Frown, label: '힘든 날', color: 'text-rose-500', bgColor: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/30', chartColor: '#f43f5e' },
      'NORMAL': { icon: Meh, label: '보통', color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30', chartColor: '#f59e0b' },
      'GOOD': { icon: Smile, label: '좋은 날', color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/30', chartColor: '#10b981' }
};

const RATING_LABELS: Record<number, string> = {
      1: '아쉬움',
      2: '노력 필요',
      3: '보통',
      4: '잘했음',
      5: '완벽!'
};

type SortOption = 'newest' | 'oldest' | 'rating-high' | 'rating-low';

const ArchivePage = () => {
      const { reflections, loadArchive, isLoading, error } = useRoutineStore();
      const [searchTerm, setSearchTerm] = useState('');
      const [moodFilter, setMoodFilter] = useState<string | null>(null);
      const [ratingFilter, setRatingFilter] = useState<number | null>(null);
      const [sortBy, setSortBy] = useState<SortOption>('newest');
      const [currentPage, setCurrentPage] = useState(0);
      const [hasMore, setHasMore] = useState(true);
      const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
      const [showFilters, setShowFilters] = useState(false);
      const pageSize = 20;

      useEffect(() => {
            loadArchive(0, pageSize);
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const loadMore = async () => {
            const nextPage = currentPage + 1;
            await loadArchive(nextPage, pageSize);
            setCurrentPage(nextPage);
            if (reflections.length < pageSize * (nextPage + 1)) {
                  setHasMore(false);
            }
      };

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
                  const monthKey = format(new Date(dateStr), 'yyyy년 M월', { locale: ko });
                  if (!groups[monthKey]) groups[monthKey] = [];
                  groups[monthKey].push(ref);
            });
            return groups;
      }, [filteredReflections]);

      // Summary stats
      const stats = useMemo(() => {
            if (reflections.length === 0) {
                  return { totalCount: 0, avgRating: 0, mostCommonMood: null as string | null, goodDays: 0, streak: 0, avgCompletion: 0 };
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
      const trendData = useMemo(() => {
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

      const hasActiveFilters = searchTerm || moodFilter || ratingFilter || sortBy !== 'newest';

      // Sparkline chart - responsive, fills container
      const MiniSparkline = ({ data }: { data: { rating: number; mood: string; date: string }[] }) => {
            if (data.length < 2) return null;
            const labelW = 22;
            const padR = 8;
            const padY = 6;
            const viewW = 400, viewH = 120;
            const maxR = 5, minR = 1;
            const chartW = viewW - labelW - padR;
            const chartH = viewH - padY * 2;

            const points = data.map((d, i) => ({
                  x: labelW + (i / (data.length - 1)) * chartW,
                  y: padY + chartH - ((d.rating - minR) / (maxR - minR)) * chartH
            }));
            const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            const areaD = pathD + ` L${points[points.length - 1].x},${viewH - padY} L${labelW},${viewH - padY} Z`;

            const yLines = [1, 2, 3, 4, 5].map(r => ({
                  rating: r,
                  y: padY + chartH - ((r - minR) / (maxR - minR)) * chartH
            }));

            return (
                  <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                        <defs>
                              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
                              </linearGradient>
                        </defs>
                        {/* Y-axis grid + labels */}
                        {yLines.map(({ rating, y }) => (
                              <g key={rating}>
                                    <line x1={labelW} y1={y} x2={viewW - padR} y2={y}
                                          stroke="currentColor" strokeOpacity={rating % 2 === 1 ? 0.12 : 0.06} strokeWidth="1" strokeDasharray="4,4" />
                                    <text x={labelW - 5} y={y + 4} textAnchor="end"
                                          className="fill-gray-400 dark:fill-gray-500" fontSize="11" fontWeight="700">
                                          {rating}
                                    </text>
                              </g>
                        ))}
                        {/* Area + Line */}
                        <path d={areaD} fill="url(#sparkGrad)" />
                        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Data points + labels */}
                        {points.map((p, i) => (
                              <g key={i}>
                                    <circle cx={p.x} cy={p.y} r="5"
                                          fill={MOOD_CONFIG[data[i].mood]?.chartColor || '#6366f1'}
                                          stroke="white" strokeWidth="2" />
                                    <text x={p.x} y={viewH - padY + 13} textAnchor="middle"
                                          className="fill-gray-400 dark:fill-gray-500" fontSize="10" fontWeight="600">
                                          {data[i].date ? format(new Date(data[i].date), 'M/d') : ''}
                                    </text>
                              </g>
                        ))}
                  </svg>
            );
      };

      if (error) {
            return (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-600 dark:text-red-400">
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                              <Frown className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">기록을 불러오는데 실패했습니다</h3>
                        <p className="text-sm text-red-500 dark:text-red-400 mb-6">{error}</p>
                        <button onClick={() => window.location.reload()}
                              className="px-6 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/70 text-red-700 dark:text-red-200 rounded-xl font-medium transition-colors">
                              다시 시도
                        </button>
                  </div>
            );
      }

      if (isLoading && reflections.length === 0) {
            return (
                  <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
            );
      }

      return (
            <div className="min-h-screen bg-white dark:bg-gray-950 space-y-6 animate-in fade-in duration-500 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
                  {/* Header */}
                  <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-indigo-100/20 dark:shadow-none border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-100/50 to-purple-100/50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10">
                              {/* Title */}
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                    <div>
                                          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                                                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                                      <Calendar className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold tracking-wide uppercase">기록 보관소</span>
                                          </div>
                                          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
                                                나의 회고 아카이브
                                          </h1>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                                매일의 작은 회고가 모여 당신의 성장 이야기가 됩니다.
                                          </p>
                                    </div>

                                    {/* Streak Badge */}
                                    {stats.streak > 0 && (
                                          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-orange-200 dark:shadow-none">
                                                <Flame className="w-5 h-5" />
                                                <div>
                                                      <div className="text-lg font-black leading-tight">{stats.streak}일</div>
                                                      <div className="text-[10px] font-bold text-white/70 uppercase">연속 기록</div>
                                                </div>
                                          </div>
                                    )}
                              </div>

                              {/* Stats Grid */}
                              {stats.totalCount > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                          {/* Total Records */}
                                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                      <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">총 기록</span>
                                                </div>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalCount}<span className="text-sm text-gray-400 ml-0.5">일</span></p>
                                          </div>

                                          {/* Avg Rating */}
                                          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                      <Star className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">평균 평점</span>
                                                </div>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.avgRating.toFixed(1)}<span className="text-sm text-gray-400 ml-0.5">/5</span></p>
                                          </div>

                                          {/* Good Days */}
                                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                      <Heart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">좋은 날</span>
                                                </div>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.goodDays}<span className="text-sm text-gray-400 ml-0.5">일</span></p>
                                          </div>

                                          {/* Avg Completion */}
                                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                      <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">평균 달성률</span>
                                                </div>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.avgCompletion}<span className="text-sm text-gray-400 ml-0.5">%</span></p>
                                          </div>

                                          {/* Mood */}
                                          <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                      <TrendingUp className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">주요 기분</span>
                                                </div>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">
                                                      {stats.mostCommonMood ? MOOD_CONFIG[stats.mostCommonMood]?.label || '-' : '-'}
                                                </p>
                                          </div>
                                    </div>
                              )}

                              {/* Trend & Mood Distribution */}
                              {stats.totalCount >= 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                          {/* Rating Trend */}
                                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-2 mb-2">
                                                      <BarChart3 className="w-4 h-4 text-indigo-500" />
                                                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">최근 평점 추이</span>
                                                      <span className="text-[10px] text-gray-400 ml-auto">1~5점</span>
                                                </div>
                                                <div className="h-32">
                                                      <MiniSparkline data={trendData} />
                                                </div>
                                          </div>

                                          {/* Mood Distribution */}
                                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-2 mb-3">
                                                      <Smile className="w-4 h-4 text-emerald-500" />
                                                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">기분 분포</span>
                                                </div>
                                                <div className="space-y-2.5">
                                                      {(['GOOD', 'NORMAL', 'BAD'] as const).map(mood => {
                                                            const config = MOOD_CONFIG[mood];
                                                            const dist = moodDistribution[mood];
                                                            const Icon = config.icon;
                                                            return (
                                                                  <div key={mood} className="flex items-center gap-2.5">
                                                                        <Icon className={`w-4 h-4 ${config.color} shrink-0`} />
                                                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-12 shrink-0">{config.label}</span>
                                                                        <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                              <div
                                                                                    className="h-full rounded-full transition-all duration-500"
                                                                                    style={{ width: `${dist.pct}%`, backgroundColor: config.chartColor }}
                                                                              />
                                                                        </div>
                                                                        <span className="text-xs font-black text-gray-700 dark:text-gray-300 w-12 text-right">{dist.count}일 <span className="text-gray-400 font-bold">({dist.pct}%)</span></span>
                                                                  </div>
                                                            );
                                                      })}
                                                </div>
                                          </div>
                                    </div>
                              )}
                        </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                        <div className="flex flex-col md:flex-row gap-3">
                              {/* Search */}
                              <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                          type="text"
                                          placeholder="키워드로 기록 검색..."
                                          value={searchTerm}
                                          onChange={(e) => setSearchTerm(e.target.value)}
                                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-900 dark:text-white placeholder:text-gray-500"
                                    />
                              </div>

                              {/* Filter Toggle + Sort */}
                              <div className="flex gap-2">
                                    <button
                                          onClick={() => setShowFilters(!showFilters)}
                                          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                                                showFilters || moodFilter || ratingFilter
                                                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                                                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                          }`}
                                    >
                                          <SlidersHorizontal className="w-4 h-4" />
                                          <span className="hidden sm:inline">필터</span>
                                          {(moodFilter || ratingFilter) && (
                                                <span className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                                      {(moodFilter ? 1 : 0) + (ratingFilter ? 1 : 0)}
                                                </span>
                                          )}
                                          {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>

                                    {/* Sort */}
                                    <div className="relative">
                                          <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                                className="appearance-none pl-8 pr-8 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all text-sm font-bold text-gray-700 dark:text-gray-300"
                                          >
                                                <option value="newest">최신순</option>
                                                <option value="oldest">오래된순</option>
                                                <option value="rating-high">평점 높은순</option>
                                                <option value="rating-low">평점 낮은순</option>
                                          </select>
                                          <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                    </div>

                                    {hasActiveFilters && (
                                          <button onClick={clearFilters}
                                                className="px-3 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
                                                초기화
                                          </button>
                                    )}
                              </div>
                        </div>

                        {/* Expandable Filters */}
                        {showFilters && (
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
                                    {/* Mood Filter */}
                                    <div className="flex gap-2">
                                          {Object.entries(MOOD_CONFIG).map(([mood, config]) => {
                                                const Icon = config.icon;
                                                const isActive = moodFilter === mood;
                                                return (
                                                      <button key={mood}
                                                            onClick={() => setMoodFilter(isActive ? null : mood)}
                                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-sm font-medium ${isActive
                                                                  ? `${config.bgColor} ${config.color} border-current`
                                                                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                            }`}>
                                                            <Icon className="w-4 h-4" />
                                                            <span>{config.label}</span>
                                                      </button>
                                                );
                                          })}
                                    </div>

                                    {/* Rating Filter */}
                                    <div className="relative">
                                          <select
                                                value={ratingFilter || ''}
                                                onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
                                                className="appearance-none px-3 py-2 pr-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all text-sm font-medium text-gray-700 dark:text-gray-300">
                                                <option value="">평점 전체</option>
                                                {[5, 4, 3, 2, 1].map(rating => (
                                                      <option key={rating} value={rating}>{'★'.repeat(rating)} {RATING_LABELS[rating]}</option>
                                                ))}
                                          </select>
                                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                    </div>
                              </div>
                        )}

                        {/* Filter Result Count */}
                        {hasActiveFilters && (
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{filteredReflections.length}개</span>의 기록이 검색되었습니다.
                                    </p>
                              </div>
                        )}
                  </div>

                  {/* Content */}
                  {filteredReflections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                                    {hasActiveFilters ? '검색 결과가 없습니다.' : '아직 기록된 회고가 없습니다.'}
                              </p>
                              <p className="text-sm text-gray-400 dark:text-gray-500">
                                    {hasActiveFilters ? '다른 검색어나 필터를 시도해보세요.' : '오늘 하루를 회고해보세요!'}
                              </p>
                              {hasActiveFilters && (
                                    <button onClick={clearFilters}
                                          className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                                          필터 초기화
                                    </button>
                              )}
                        </div>
                  ) : (
                        <div className="space-y-8">
                              {Object.entries(groupedByMonth).map(([month, monthReflections]) => (
                                    <div key={month}>
                                          {/* Month Header */}
                                          <div className="flex items-center gap-3 mb-4">
                                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{month}</h2>
                                                <span className="text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                      {monthReflections.length}개
                                                </span>
                                          </div>

                                          {/* Cards Grid */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {monthReflections.map((ref) => {
                                                      const moodConfig = MOOD_CONFIG[ref.mood] || MOOD_CONFIG['NORMAL'];
                                                      const MoodIcon = moodConfig.icon;
                                                      const dateStr = ref.planDate || ref.createdAt;
                                                      const completionRate = ref.totalTasks && ref.totalTasks > 0
                                                            ? Math.round((ref.completedTasks || 0) / ref.totalTasks * 100)
                                                            : null;

                                                      return (
                                                            <button
                                                                  key={ref.id}
                                                                  onClick={() => setSelectedReflection(ref)}
                                                                  className="group relative text-left bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-indigo-100/30 dark:hover:shadow-black/50 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                                                            >
                                                                  {/* Card Header */}
                                                                  <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex items-center gap-2">
                                                                              <span className="text-sm font-black text-gray-900 dark:text-white">
                                                                                    {dateStr ? format(new Date(dateStr), 'M월 d일', { locale: ko }) : '-'}
                                                                              </span>
                                                                              <span className="text-xs text-gray-400">
                                                                                    {dateStr ? format(new Date(dateStr), 'EEEE', { locale: ko }) : ''}
                                                                              </span>
                                                                        </div>
                                                                        <div className={`p-1.5 rounded-lg border ${moodConfig.bgColor}`}>
                                                                              <MoodIcon className={`w-4 h-4 ${moodConfig.color}`} />
                                                                        </div>
                                                                  </div>

                                                                  {/* Stats Row */}
                                                                  <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                                                                        <div className="flex items-center gap-1">
                                                                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                                              <span className="text-sm font-black text-gray-900 dark:text-gray-100">{ref.rating}</span>
                                                                              <span className="text-xs text-gray-400">/5</span>
                                                                        </div>
                                                                        {ref.energyLevel && (
                                                                              <div className="flex items-center gap-1">
                                                                                    <Battery className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                                                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{ref.energyLevel}</span>
                                                                              </div>
                                                                        )}
                                                                        {completionRate !== null && (
                                                                              <div className="flex items-center gap-1">
                                                                                    <Target className="w-3.5 h-3.5 text-blue-500" />
                                                                                    <span className={`text-sm font-bold ${
                                                                                          completionRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                                                                          completionRate >= 50 ? 'text-amber-600 dark:text-amber-400' :
                                                                                          'text-rose-600 dark:text-rose-400'
                                                                                    }`}>{completionRate}%</span>
                                                                              </div>
                                                                        )}
                                                                  </div>

                                                                  {/* Completion Bar */}
                                                                  {completionRate !== null && (
                                                                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
                                                                              <div
                                                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                                                          completionRate >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-400' :
                                                                                          completionRate >= 50 ? 'bg-gradient-to-r from-amber-400 to-yellow-400' :
                                                                                          'bg-gradient-to-r from-rose-400 to-red-400'
                                                                                    }`}
                                                                                    style={{ width: `${completionRate}%` }}
                                                                              />
                                                                        </div>
                                                                  )}

                                                                  {/* Content Preview */}
                                                                  <div className="flex-1 space-y-2">
                                                                        {ref.whatWentWell && (
                                                                              <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                                                                                    <div className="flex items-center gap-1 mb-0.5">
                                                                                          <Zap className="w-3 h-3 text-emerald-500" />
                                                                                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">잘한 점</span>
                                                                                    </div>
                                                                                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{ref.whatWentWell}</p>
                                                                              </div>
                                                                        )}
                                                                        {ref.whatDidntGoWell && (
                                                                              <div className="bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-lg">
                                                                                    <div className="flex items-center gap-1 mb-0.5">
                                                                                          <TrendingUp className="w-3 h-3 text-rose-500" />
                                                                                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">개선할 점</span>
                                                                                    </div>
                                                                                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{ref.whatDidntGoWell}</p>
                                                                              </div>
                                                                        )}
                                                                        {ref.tomorrowFocus && (
                                                                              <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg">
                                                                                    <div className="flex items-center gap-1 mb-0.5">
                                                                                          <Target className="w-3 h-3 text-indigo-500" />
                                                                                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">내일의 다짐</span>
                                                                                    </div>
                                                                                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1">{ref.tomorrowFocus}</p>
                                                                              </div>
                                                                        )}
                                                                  </div>

                                                                  {/* Footer */}
                                                                  <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                                                        {ref.totalTasks != null && ref.totalTasks > 0 && (
                                                                              <span className="text-[10px] font-bold text-gray-400">
                                                                                    {ref.completedTasks}/{ref.totalTasks} 태스크 완료
                                                                              </span>
                                                                        )}
                                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ml-auto">
                                                                              상세 보기
                                                                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                                        </span>
                                                                  </div>
                                                            </button>
                                                      );
                                                })}
                                          </div>
                                    </div>
                              ))}

                              {/* Load More */}
                              {hasMore && !hasActiveFilters && (
                                    <div className="flex justify-center pt-4">
                                          <button onClick={loadMore} disabled={isLoading}
                                                className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50">
                                                {isLoading ? '로딩 중...' : '더 많은 기록 보기'}
                                          </button>
                                    </div>
                              )}
                        </div>
                  )}

                  {/* Detail Modal */}
                  {selectedReflection && (
                        <ReflectionDetailModal
                              reflection={selectedReflection}
                              onClose={() => setSelectedReflection(null)}
                        />
                  )}
            </div>
      );
};

// Detail Modal Component
const ReflectionDetailModal = ({ reflection, onClose }: { reflection: Reflection; onClose: () => void }) => {
      const moodConfig = MOOD_CONFIG[reflection.mood] || MOOD_CONFIG['NORMAL'];
      const MoodIcon = moodConfig.icon;
      const dateStr = reflection.planDate || reflection.createdAt;
      const completionRate = reflection.totalTasks && reflection.totalTasks > 0
            ? Math.round((reflection.completedTasks || 0) / reflection.totalTasks * 100)
            : null;

      return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
                  <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Gradient Header */}
                        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white">
                              <button onClick={onClose}
                                    className="absolute top-4 right-4 p-1.5 text-white/50 hover:text-white hover:bg-white/20 rounded-lg transition-colors z-10">
                                    <X className="w-5 h-5" />
                              </button>

                              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">하루 회고</div>
                              <h2 className="text-xl font-black mb-4">
                                    {dateStr ? format(new Date(dateStr), 'yyyy년 M월 d일 (EEEE)', { locale: ko }) : '-'}
                              </h2>

                              {/* Stats Row */}
                              <div className="grid grid-cols-4 gap-2">
                                    <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                                          <MoodIcon className="w-5 h-5 mx-auto mb-0.5" />
                                          <div className="text-[9px] font-bold text-white/60 uppercase">{moodConfig.label}</div>
                                    </div>
                                    <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                                          <div className="flex items-center justify-center gap-0.5">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-lg font-black leading-tight">{reflection.rating}</span>
                                          </div>
                                          <div className="text-[9px] font-bold text-white/60 uppercase mt-0.5">평점</div>
                                    </div>
                                    {reflection.energyLevel && (
                                          <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                                                <div className="flex items-center justify-center gap-0.5">
                                                      <Battery className="w-4 h-4" />
                                                      <span className="text-lg font-black leading-tight">{reflection.energyLevel}</span>
                                                </div>
                                                <div className="text-[9px] font-bold text-white/60 uppercase mt-0.5">에너지</div>
                                          </div>
                                    )}
                                    {completionRate !== null && (
                                          <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                                                <div className="text-lg font-black leading-tight">{completionRate}%</div>
                                                <div className="text-[9px] font-bold text-white/60 uppercase mt-0.5">달성률</div>
                                          </div>
                                    )}
                              </div>
                        </div>

                        {/* Task Stats */}
                        {completionRate !== null && (
                              <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                          <span className="font-bold text-gray-600 dark:text-gray-400">태스크 달성률</span>
                                          <span className="font-black text-gray-900 dark:text-white">{reflection.completedTasks}/{reflection.totalTasks} 완료</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                          <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                      completionRate >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                                                      completionRate >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                                                      'bg-gradient-to-r from-rose-500 to-red-400'
                                                }`}
                                                style={{ width: `${completionRate}%` }}
                                          />
                                    </div>
                              </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                              {reflection.morningGoal && (
                                    <div>
                                          <div className="flex items-center gap-1.5 mb-2">
                                                <Target className="w-4 h-4 text-indigo-500" />
                                                <span className="text-sm font-black text-gray-900 dark:text-white">오늘의 목표</span>
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 rounded-xl">{reflection.morningGoal}</p>
                                    </div>
                              )}

                              {reflection.whatWentWell && (
                                    <div>
                                          <div className="flex items-center gap-1.5 mb-2">
                                                <Zap className="w-4 h-4 text-emerald-500" />
                                                <span className="text-sm font-black text-gray-900 dark:text-white">잘한 점 (Keep)</span>
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-xl whitespace-pre-wrap">{reflection.whatWentWell}</p>
                                    </div>
                              )}

                              {reflection.whatDidntGoWell && (
                                    <div>
                                          <div className="flex items-center gap-1.5 mb-2">
                                                <TrendingUp className="w-4 h-4 text-rose-500" />
                                                <span className="text-sm font-black text-gray-900 dark:text-white">아쉬운 점 (Problem)</span>
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-rose-50 dark:bg-rose-900/20 px-4 py-3 rounded-xl whitespace-pre-wrap">{reflection.whatDidntGoWell}</p>
                                    </div>
                              )}

                              {reflection.tomorrowFocus && (
                                    <div>
                                          <div className="flex items-center gap-1.5 mb-2">
                                                <Target className="w-4 h-4 text-purple-500" />
                                                <span className="text-sm font-black text-gray-900 dark:text-white">내일의 다짐 (Try)</span>
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-purple-50 dark:bg-purple-900/20 px-4 py-3 rounded-xl whitespace-pre-wrap">{reflection.tomorrowFocus}</p>
                                    </div>
                              )}

                              {!reflection.whatWentWell && !reflection.whatDidntGoWell && !reflection.tomorrowFocus && !reflection.morningGoal && (
                                    <div className="text-center py-8 text-gray-400">
                                          <p className="text-sm">작성된 회고 내용이 없습니다.</p>
                                    </div>
                              )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex gap-3">
                              <button onClick={onClose}
                                    className="flex-1 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-black transition-colors">
                                    닫기
                              </button>
                              <Link
                                    to={`/routine/daily-plan/${dateStr ? format(new Date(dateStr), 'yyyy-MM-dd') : ''}`}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-1.5"
                              >
                                    해당 날 계획 보기
                                    <ArrowRight className="w-4 h-4" />
                              </Link>
                        </div>
                  </div>
            </div>
      );
};

export default ArchivePage;
