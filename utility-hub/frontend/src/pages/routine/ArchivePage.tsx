import { useEffect, useState, useMemo } from 'react';
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
      Award,
      Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Reflection } from '../../types/routine';

// 기분 아이콘 매핑
const MOOD_CONFIG: Record<string, { icon: typeof Smile; label: string; color: string; bgColor: string }> = {
      'BAD': { icon: Frown, label: '힘든 날', color: 'text-rose-500', bgColor: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/30' },
      'NORMAL': { icon: Meh, label: '보통', color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30' },
      'GOOD': { icon: Smile, label: '좋은 날', color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/30' }
};

// 평점 라벨
const RATING_LABELS: Record<number, string> = {
      1: '아쉬움',
      2: '노력 필요',
      3: '보통',
      4: '잘했음',
      5: '완벽!'
};

const ArchivePage = () => {
      const { reflections, loadArchive, isLoading, error } = useRoutineStore();
      const [searchTerm, setSearchTerm] = useState('');
      const [moodFilter, setMoodFilter] = useState<string | null>(null);
      const [ratingFilter, setRatingFilter] = useState<number | null>(null);
      const [currentPage, setCurrentPage] = useState(0);
      const [hasMore, setHasMore] = useState(true);
      const pageSize = 20;

      useEffect(() => {
            loadArchive(0, pageSize);
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      // 더 많은 기록 불러오기
      const loadMore = async () => {
            const nextPage = currentPage + 1;
            await loadArchive(nextPage, pageSize);
            setCurrentPage(nextPage);
            // 실제로는 API 응답의 totalPages를 확인해야 하지만,
            // 현재 store 구조상 간단히 처리
            if (reflections.length < pageSize * (nextPage + 1)) {
                  setHasMore(false);
            }
      };

      // 필터링된 기록
      const filteredReflections = useMemo(() => {
            return reflections.filter(ref => {
                  // 텍스트 검색
                  const matchesSearch = !searchTerm ||
                        ref.whatWentWell?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ref.whatDidntGoWell?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ref.morningGoal?.toLowerCase().includes(searchTerm.toLowerCase());

                  // 기분 필터
                  const matchesMood = !moodFilter || ref.mood === moodFilter;

                  // 평점 필터
                  const matchesRating = !ratingFilter || ref.rating === ratingFilter;

                  return matchesSearch && matchesMood && matchesRating;
            });
      }, [reflections, searchTerm, moodFilter, ratingFilter]);

      // 월별 그룹핑
      const groupedByMonth = useMemo(() => {
            const groups: Record<string, Reflection[]> = {};

            filteredReflections.forEach(ref => {
                  if (!ref.createdAt) return;
                  const monthKey = format(new Date(ref.createdAt), 'yyyy년 M월', { locale: ko });
                  if (!groups[monthKey]) {
                        groups[monthKey] = [];
                  }
                  groups[monthKey].push(ref);
            });

            return groups;
      }, [filteredReflections]);

      // 요약 통계
      const stats = useMemo(() => {
            if (reflections.length === 0) {
                  return { totalCount: 0, avgRating: 0, mostCommonMood: null, goodDays: 0 };
            }

            const totalRating = reflections.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = totalRating / reflections.length;

            // 가장 많은 기분
            const moodCounts: Record<string, number> = {};
            reflections.forEach(r => {
                  moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
            });
            const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

            // 좋은 날 수 (GOOD mood)
            const goodDays = reflections.filter(r => r.mood === 'GOOD').length;

            return {
                  totalCount: reflections.length,
                  avgRating,
                  mostCommonMood,
                  goodDays
            };
      }, [reflections]);

      // 필터 초기화
      const clearFilters = () => {
            setSearchTerm('');
            setMoodFilter(null);
            setRatingFilter(null);
      };

      const hasActiveFilters = searchTerm || moodFilter || ratingFilter;

      if (error) {
            return (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-600 dark:text-red-400">
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                              <Frown className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">기록을 불러오는데 실패했습니다</h3>
                        <p className="text-sm text-red-500 dark:text-red-400 mb-6">{error}</p>
                        <button
                              onClick={() => window.location.reload()}
                              className="px-6 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/70 text-red-700 dark:text-red-200 rounded-xl font-medium transition-colors"
                        >
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
            <div className="min-h-screen bg-white dark:bg-gray-950 space-y-6 animate-in fade-in duration-500 pb-20 px-4 md:px-8">
                  {/* Header with Stats */}
                  <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl shadow-indigo-100/20 dark:shadow-none border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-100/50 to-purple-100/50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10">
                              {/* Title Section */}
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                    <div>
                                          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                                                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                                      <Calendar className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs md:text-sm font-bold tracking-wide uppercase">기록 보관소</span>
                                          </div>
                                          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                                                나의 회고 아카이브
                                          </h1>
                                          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                                                매일의 작은 회고가 모여 당신의 성장 이야기가 됩니다.
                                          </p>
                                    </div>
                              </div>

                              {/* Summary Stats */}
                              {stats.totalCount > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                          {/* 총 기록 */}
                                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                                                            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                      </div>
                                                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">총 기록</span>
                                                </div>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalCount}일</p>
                                          </div>

                                          {/* 평균 평점 */}
                                          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                      <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                                            <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                      </div>
                                                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">평균 평점</span>
                                                </div>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.avgRating.toFixed(1)}</p>
                                          </div>

                                          {/* 좋은 날 */}
                                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                                            <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                      </div>
                                                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">좋은 날</span>
                                                </div>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.goodDays}일</p>
                                          </div>

                                          {/* 주요 기분 */}
                                          <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                      <div className="p-1.5 bg-rose-100 dark:bg-rose-900/50 rounded-lg">
                                                            <TrendingUp className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                                      </div>
                                                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">주요 기분</span>
                                                </div>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">
                                                      {stats.mostCommonMood ? MOOD_CONFIG[stats.mostCommonMood]?.label || '-' : '-'}
                                                </p>
                                          </div>
                                    </div>
                              )}
                        </div>
                  </div>

                  {/* Search and Filter Section */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                        <div className="flex flex-col md:flex-row gap-4">
                              {/* Search */}
                              <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                          type="text"
                                          placeholder="키워드로 기록 검색..."
                                          value={searchTerm}
                                          onChange={(e) => setSearchTerm(e.target.value)}
                                          className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
                                    />
                              </div>

                              {/* Mood Filter */}
                              <div className="flex gap-2">
                                    {Object.entries(MOOD_CONFIG).map(([mood, config]) => {
                                          const Icon = config.icon;
                                          const isActive = moodFilter === mood;
                                          return (
                                                <button
                                                      key={mood}
                                                      onClick={() => setMoodFilter(isActive ? null : mood)}
                                                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${isActive
                                                            ? `${config.bgColor} ${config.color} border-current`
                                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                            }`}
                                                >
                                                      <Icon className="w-4 h-4" />
                                                      <span className="hidden sm:inline">{config.label}</span>
                                                </button>
                                          );
                                    })}
                              </div>

                              {/* Rating Filter */}
                              <div className="relative">
                                    <select
                                          value={ratingFilter || ''}
                                          onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
                                          className="appearance-none px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                          <option value="">평점 전체</option>
                                          {[5, 4, 3, 2, 1].map(rating => (
                                                <option key={rating} value={rating}>
                                                      {'⭐'.repeat(rating)} {RATING_LABELS[rating]}
                                                </option>
                                          ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>

                              {/* Clear Filters */}
                              {hasActiveFilters && (
                                    <button
                                          onClick={clearFilters}
                                          className="px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                                    >
                                          필터 초기화
                                    </button>
                              )}
                        </div>

                        {/* Active Filter Info */}
                        {hasActiveFilters && (
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                          <span className="font-medium text-indigo-600 dark:text-indigo-400">{filteredReflections.length}개</span>의 기록이 검색되었습니다.
                                    </p>
                              </div>
                        )}
                  </div>

                  {/* Content */}
                  {filteredReflections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
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
                                    <button
                                          onClick={clearFilters}
                                          className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                                    >
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

                                          {/* Reflection Cards Grid */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {monthReflections.map((ref) => {
                                                      const moodConfig = MOOD_CONFIG[ref.mood] || MOOD_CONFIG['NORMAL'];
                                                      const MoodIcon = moodConfig.icon;

                                                      return (
                                                            <Link
                                                                  key={ref.id}
                                                                  to={`/routine/daily-plan/${ref.createdAt ? format(new Date(ref.createdAt), 'yyyy-MM-dd') : ''}`}
                                                                  className="group relative bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-indigo-100/30 dark:hover:shadow-black/50 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                                                            >
                                                                  {/* Card Header */}
                                                                  <div className="flex items-center justify-between mb-4">
                                                                        <div className="flex items-center gap-2">
                                                                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                                    {ref.createdAt ? format(new Date(ref.createdAt), 'M월 d일', { locale: ko }) : '-'}
                                                                              </span>
                                                                              <span className="text-xs text-gray-400">
                                                                                    {ref.createdAt ? format(new Date(ref.createdAt), 'EEEE', { locale: ko }) : ''}
                                                                              </span>
                                                                        </div>
                                                                        <div className={`p-2 rounded-xl border ${moodConfig.bgColor}`}>
                                                                              <MoodIcon className={`w-4 h-4 ${moodConfig.color}`} />
                                                                        </div>
                                                                  </div>

                                                                  {/* Stats */}
                                                                  <div className="flex items-center gap-3 mb-4">
                                                                        <div className="flex items-center gap-1 text-sm">
                                                                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                                              <span className="font-bold text-gray-900 dark:text-gray-100">{ref.rating}</span>
                                                                              <span className="text-gray-400">/5</span>
                                                                        </div>
                                                                        {ref.energyLevel && (
                                                                              <div className="flex items-center gap-1 text-sm">
                                                                                    <Battery className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                                                    <span className="font-bold text-gray-900 dark:text-gray-100">{ref.energyLevel}</span>
                                                                              </div>
                                                                        )}
                                                                  </div>

                                                                  {/* Content Preview */}
                                                                  <div className="flex-1 space-y-3">
                                                                        {ref.morningGoal && (
                                                                              <div className="flex gap-2">
                                                                                    <Target className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                                                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-1">
                                                                                          {ref.morningGoal}
                                                                                    </p>
                                                                              </div>
                                                                        )}

                                                                        {ref.whatWentWell && (
                                                                              <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl">
                                                                                    <div className="flex items-center gap-1 mb-1">
                                                                                          <Zap className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                                                                                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">잘한 점</span>
                                                                                    </div>
                                                                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{ref.whatWentWell}</p>
                                                                              </div>
                                                                        )}

                                                                        {ref.whatDidntGoWell && (
                                                                              <div className="bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-xl">
                                                                                    <div className="flex items-center gap-1 mb-1">
                                                                                          <Award className="w-3 h-3 text-rose-500 dark:text-rose-400" />
                                                                                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">개선할 점</span>
                                                                                    </div>
                                                                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{ref.whatDidntGoWell}</p>
                                                                              </div>
                                                                        )}
                                                                  </div>

                                                                  {/* View Detail Button */}
                                                                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                                                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                              상세 보기
                                                                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                                        </span>
                                                                  </div>
                                                            </Link>
                                                      );
                                                })}
                                          </div>
                                    </div>
                              ))}

                              {/* Load More Button */}
                              {hasMore && !hasActiveFilters && (
                                    <div className="flex justify-center pt-4">
                                          <button
                                                onClick={loadMore}
                                                disabled={isLoading}
                                                className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                                          >
                                                {isLoading ? '로딩 중...' : '더 많은 기록 보기'}
                                          </button>
                                    </div>
                              )}
                        </div>
                  )}
            </div>
      );
};

export default ArchivePage;
