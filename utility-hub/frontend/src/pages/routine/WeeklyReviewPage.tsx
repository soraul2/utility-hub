import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { routineApi } from '../../services/routine/api';
import DailyReflectionModal from '../../components/routine/DailyReflectionModal';
import type { Reflection } from '../../types/routine';
import {
      Trophy,
      TrendingUp,
      TrendingDown,
      CalendarDays,
      CheckCircle2,
      BarChart3,
      Award,
      Flame,
      Save,
      Sparkles,
      ChevronLeft,
      ChevronRight,
      Zap,
      Search
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, isThisWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import Toast from '../../components/common/Toast';

const DAY_NAMES: Record<string, string> = {
      MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일'
};

const DAY_FULL_NAMES: Record<string, string> = {
      MON: '월요일', TUE: '화요일', WED: '수요일', THU: '목요일', FRI: '금요일', SAT: '토요일', SUN: '일요일'
};

export const WeeklyReviewPage = () => {
      const { loadWeeklyStats, loadWeeklyReview, saveWeeklyReview, weeklyStats, weeklyReview, isLoading } = useRoutineStore();
      const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
      const [isSaving, setIsSaving] = useState(false);
      const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

      // Daily Reflection Modal State
      const [reflectionModalOpen, setReflectionModalOpen] = useState(false);
      const [selectedDate, setSelectedDate] = useState<string | null>(null);
      const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);

      const [reflection, setReflection] = useState({
            achievement: '',
            improvement: '',
            nextGoal: ''
      });

      // 현재 선택된 주의 시작/끝 날짜 계산 (모두 메모이제이션)
      const { weekStart, weekEnd, weekStartStr, weekDays, isCurrentWeek } = useMemo(() => {
            const baseDate = currentWeekOffset === 0 ? new Date() : addWeeks(new Date(), currentWeekOffset);
            const start = startOfWeek(baseDate, { weekStartsOn: 1 });
            const end = endOfWeek(baseDate, { weekStartsOn: 1 });
            return {
                  weekStart: start,
                  weekEnd: end,
                  weekStartStr: format(start, 'yyyy-MM-dd'),
                  weekDays: eachDayOfInterval({ start, end }),
                  isCurrentWeek: isThisWeek(start, { weekStartsOn: 1 })
            };
      }, [currentWeekOffset]);

      // 주간 변경 시 데이터 로드
      useEffect(() => {
            // 주가 변경되면 폼 초기화
            setReflection({ achievement: '', improvement: '', nextGoal: '' });

            // 데이터 로드
            loadWeeklyStats(weekStartStr);
            loadWeeklyReview(weekStartStr);
      }, [weekStartStr]); // eslint-disable-line react-hooks/exhaustive-deps

      // weeklyReview 로드 완료 시 폼에 반영
      useEffect(() => {
            if (weeklyReview && weeklyReview.weekStart === weekStartStr) {
                  setReflection({
                        achievement: weeklyReview.achievement || '',
                        improvement: weeklyReview.improvement || '',
                        nextGoal: weeklyReview.nextGoal || ''
                  });
            }
      }, [weeklyReview, weekStartStr]);

      const handleCloseToast = useCallback(() => {
            setSaveMessage(null);
      }, []);

      const handleViewReflection = async (dateStr: string) => {
            try {
                  const res = await routineApi.getPlan(dateStr);
                  const plan = res.data.data;
                  if (plan && plan.reflection) {
                        setSelectedDate(dateStr);
                        setSelectedReflection(plan.reflection);
                        setReflectionModalOpen(true);
                  } else {
                        setSaveMessage({ type: 'error', text: '해당 날짜의 회고 기록이 없습니다.' });
                  }
            } catch (err) {
                  console.error(err);
                  setSaveMessage({ type: 'error', text: '데이터를 불러오는데 실패했습니다.' });
            }
      };

      const handleSaveReview = async () => {
            if (!reflection.achievement && !reflection.improvement && !reflection.nextGoal) {
                  setSaveMessage({ type: 'error', text: '최소 하나의 항목을 입력해주세요.' });
                  return;
            }

            setIsSaving(true);
            try {
                  await saveWeeklyReview({ weekStart: weekStartStr, ...reflection });
                  setSaveMessage({ type: 'success', text: '주간 회고가 저장되었습니다!' });
            } catch {
                  setSaveMessage({ type: 'error', text: '저장에 실패했습니다. 다시 시도해주세요.' });
            } finally {
                  setIsSaving(false);
            }
      };

      // 통계 계산
      const stats = useMemo(() => {
            if (!weeklyStats?.dailyCompletion) {
                  return { bestDay: null, worstDay: null, totalDays: 0, perfectDays: 0, avgRate: 0 };
            }

            const entries = Object.entries(weeklyStats.dailyCompletion).filter(([, rate]) => rate > 0);
            if (entries.length === 0) return { bestDay: null, worstDay: null, totalDays: 0, perfectDays: 0, avgRate: 0 };

            const sorted = [...entries].sort((a, b) => b[1] - a[1]);
            const bestDay = sorted[0];
            const worstDay = sorted[sorted.length - 1];
            const perfectDays = entries.filter(([, rate]) => rate === 100).length;
            const avgRate = entries.reduce((sum, [, rate]) => sum + rate, 0) / entries.length;

            const getDateStrForDay = (dayName: string) => {
                  const dayIndex = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].indexOf(dayName);
                  if (dayIndex === -1) return '';
                  const targetDate = weekDays[dayIndex]; // weekDays starts from MON because of weekStartsOn: 1
                  return format(targetDate, 'yyyy-MM-dd');
            };

            return {
                  bestDay: bestDay ? {
                        day: DAY_FULL_NAMES[bestDay[0]] || bestDay[0],
                        rate: bestDay[1],
                        dateStr: getDateStrForDay(bestDay[0])
                  } : null,
                  worstDay: worstDay ? {
                        day: DAY_FULL_NAMES[worstDay[0]] || worstDay[0],
                        rate: worstDay[1],
                        dateStr: getDateStrForDay(worstDay[0])
                  } : null,
                  totalDays: entries.length,
                  perfectDays,
                  avgRate: Math.round(avgRate)
            };
      }, [weeklyStats, weekDays]);

      // 주간 점수에 따른 메시지 및 색상
      const getScoreInfo = (rate: number) => {
            if (rate >= 90) return { message: '완벽한 한 주!', emoji: '🏆', color: 'from-amber-500 to-yellow-500', textColor: 'text-amber-600' };
            if (rate >= 80) return { message: '훌륭해요!', emoji: '🎉', color: 'from-emerald-500 to-green-500', textColor: 'text-emerald-600' };
            if (rate >= 60) return { message: '잘하고 있어요', emoji: '💪', color: 'from-indigo-500 to-purple-500', textColor: 'text-indigo-600' };
            if (rate >= 40) return { message: '조금 더 힘내봐요', emoji: '🌱', color: 'from-blue-500 to-cyan-500', textColor: 'text-blue-600' };
            return { message: '새로운 시작!', emoji: '✨', color: 'from-gray-400 to-gray-500', textColor: 'text-gray-600' };
      };

      const scoreInfo = getScoreInfo(weeklyStats?.weeklyRate || 0);

      if (isLoading && !weeklyStats) {
            return (
                  <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
            );
      }

      return (
            <div className="min-h-screen bg-white dark:bg-gray-950 max-w-5xl mx-auto px-4 py-6 space-y-6 pb-20">
                  {/* 헤더: 주 선택 네비게이션 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                                    <BarChart3 className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Weekly Report</span>
                              </div>
                              <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">주간 회고</h1>
                        </div>

                        <div className="flex items-center gap-2">
                              <button
                                    onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </button>
                              <div className="flex-1 sm:flex-none px-3 md:px-4 py-1.5 md:py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl min-w-[140px] md:min-w-[180px] text-center">
                                    <div className="flex items-center justify-center gap-2">
                                          <CalendarDays className="w-4 h-4 text-gray-400" />
                                          <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">
                                                {format(weekStart, 'M월 d일', { locale: ko })} - {format(weekEnd, 'd일', { locale: ko })}
                                          </span>
                                    </div>
                                    {isCurrentWeek && (
                                          <span className="text-[10px] font-bold text-indigo-600 uppercase">이번 주</span>
                                    )}
                              </div>
                              <button
                                    onClick={() => setCurrentWeekOffset(prev => Math.min(prev + 1, 0))}
                                    disabled={currentWeekOffset >= 0}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </button>
                        </div>
                  </div>

                  {/* 주간 점수 & 일별 차트 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* 주간 점수 카드 */}
                        <div className={`bg-gradient-to-br ${scoreInfo.color} rounded-2xl p-6 text-white relative overflow-hidden`}>
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                              <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                          <Award className="w-5 h-5" />
                                          <span className="text-sm font-bold opacity-90">주간 달성률</span>
                                    </div>
                                    <div className="text-5xl font-black mb-2">
                                          {weeklyStats?.weeklyRate || 0}
                                          <span className="text-2xl font-normal opacity-80">%</span>
                                    </div>
                                    <p className="text-sm opacity-90">
                                          {scoreInfo.emoji} {scoreInfo.message}
                                    </p>
                              </div>
                        </div>

                        {/* 일별 달성률 차트 */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                                    일별 달성률
                              </h3>
                              <div className="flex items-end justify-between gap-2 h-28">
                                    {weekDays.map((day) => {
                                          const dayStr = format(day, 'EEE').toUpperCase();
                                          const rate = weeklyStats?.dailyCompletion[dayStr] || 0;
                                          const isToday = format(new Date(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                                          const isPast = day < new Date() && !isToday;
                                          const isFuture = day > new Date();

                                          return (
                                                <div key={dayStr} className="flex-1 flex flex-col items-center gap-1 group relative">
                                                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {rate}%
                                                      </span>

                                                      {/* Search/View Button - Visible on Hover */}
                                                      <button
                                                            onClick={() => handleViewReflection(format(day, 'yyyy-MM-dd'))}
                                                            className="absolute -top-8 z-10 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-100 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 transform translate-y-2 group-hover:translate-y-0"
                                                            title="일간 회고 보기"
                                                      >
                                                            <Search className="w-3 h-3 text-indigo-500" />
                                                      </button>

                                                      <div className="w-full h-20 bg-gray-100 dark:bg-gray-700 rounded-lg relative overflow-hidden flex items-end cursor-pointer"
                                                            onClick={() => handleViewReflection(format(day, 'yyyy-MM-dd'))}
                                                      >
                                                            <div
                                                                  className={`w-full transition-all duration-500 rounded-t-md ${isFuture ? 'bg-gray-200' :
                                                                        isToday ? 'bg-indigo-500' :
                                                                              rate >= 80 ? 'bg-emerald-500' :
                                                                                    rate >= 50 ? 'bg-amber-400' :
                                                                                          rate > 0 ? 'bg-rose-400' : 'bg-gray-200'
                                                                        }`}
                                                                  style={{ height: `${Math.max(isFuture ? 10 : rate, 5)}%` }}
                                                            />
                                                            {isToday && (
                                                                  <div className="absolute inset-0 flex items-center justify-center">
                                                                        <Zap className="w-3 h-3 text-white" />
                                                                  </div>
                                                            )}
                                                      </div>
                                                      <span className={`text-xs font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' :
                                                            isPast ? 'text-gray-600 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'
                                                            }`}>
                                                            {DAY_NAMES[dayStr]}
                                                      </span>
                                                </div>
                                          );
                                    })}
                              </div>
                        </div>
                  </div>

                  {/* 주간 하이라이트 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* 최고의 날 */}
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 relative group">
                              <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                                <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                          </div>
                                    </div>
                                    {stats.bestDay && (
                                          <button
                                                onClick={() => handleViewReflection(stats.bestDay!.dateStr)}
                                                className="p-1.5 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                title="회고 보기"
                                          >
                                                <Search className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                          </button>
                                    )}
                              </div>
                              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">최고의 날</p>
                              {stats.bestDay ? (
                                    <>
                                          <p className="text-lg font-black text-gray-900 dark:text-white">{stats.bestDay.day}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">{stats.bestDay.rate}% 달성</p>
                                    </>
                              ) : (
                                    <p className="text-sm text-gray-400 dark:text-gray-600">데이터 없음</p>
                              )}
                        </div>

                        {/* 개선 필요 */}
                        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 relative group">
                              <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                                                <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                          </div>
                                    </div>
                                    {stats.worstDay && stats.worstDay.rate < 100 && (
                                          <button
                                                onClick={() => handleViewReflection(stats.worstDay!.dateStr)}
                                                className="p-1.5 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                title="회고 보기"
                                          >
                                                <Search className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                          </button>
                                    )}
                              </div>
                              <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mb-1">개선 필요</p>
                              {stats.worstDay && stats.worstDay.rate < 100 ? (
                                    <>
                                          <p className="text-lg font-black text-gray-900 dark:text-white">{stats.worstDay.day}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">{stats.worstDay.rate}% 달성</p>
                                    </>
                              ) : (
                                    <p className="text-sm text-gray-400 dark:text-gray-600">-</p>
                              )}
                        </div>

                        {/* 완벽한 날 */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                                          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                              </div>
                              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">완벽한 날</p>
                              <p className="text-lg font-black text-gray-900 dark:text-white">{stats.perfectDays}일</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">100% 달성</p>
                        </div>

                        {/* 활동 일수 */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                          <Flame className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                              </div>
                              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">활동 일수</p>
                              <p className="text-lg font-black text-gray-900 dark:text-white">{stats.totalDays}일</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">평균 {stats.avgRate}%</p>
                        </div>
                  </div>

                  {/* 주간 회고 작성 */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-gray-100 dark:border-gray-700">
                              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    주간 회고 작성
                              </h2>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">이번 주를 돌아보고 다음 주를 준비하세요</p>
                        </div>

                        <div className="p-6 space-y-5">
                              {/* 성취 */}
                              <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                          <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-md flex items-center justify-center text-emerald-600 dark:text-emerald-400">🏆</span>
                                          이번 주 가장 큰 성취
                                    </label>
                                    <textarea
                                          value={reflection.achievement}
                                          onChange={(e) => setReflection({ ...reflection, achievement: e.target.value })}
                                          placeholder="달성한 목표, 완료한 프로젝트, 배운 것 등을 기록하세요..."
                                          className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all outline-none resize-none h-24 text-sm text-gray-900 dark:text-white"
                                    />
                              </div>

                              {/* 개선점 */}
                              <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                          <span className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-md flex items-center justify-center text-amber-600 dark:text-amber-400">🔧</span>
                                          개선이 필요한 점
                                    </label>
                                    <textarea
                                          value={reflection.improvement}
                                          onChange={(e) => setReflection({ ...reflection, improvement: e.target.value })}
                                          placeholder="시간 관리, 집중력, 우선순위 등 개선할 점을 적어보세요..."
                                          className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all outline-none resize-none h-24 text-sm text-gray-900 dark:text-white"
                                    />
                              </div>

                              {/* 다음 주 목표 */}
                              <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                          <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-md flex items-center justify-center text-indigo-600 dark:text-indigo-400">🎯</span>
                                          다음 주 핵심 목표
                                    </label>
                                    <input
                                          type="text"
                                          value={reflection.nextGoal}
                                          onChange={(e) => setReflection({ ...reflection, nextGoal: e.target.value })}
                                          placeholder="다음 주에 집중할 한 가지 목표를 적어주세요"
                                          className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-300 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all outline-none text-sm text-gray-900 dark:text-white"
                                    />
                              </div>

                              {/* 저장 버튼 */}
                              <div className="flex items-center justify-end pt-2">
                                    <button
                                          onClick={handleSaveReview}
                                          disabled={isSaving}
                                          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200 dark:shadow-none"
                                    >
                                          <Save className="w-4 h-4" />
                                          {isSaving ? '저장 중...' : '회고 저장'}
                                    </button>
                              </div>
                        </div>
                  </div>

                  {/* 일간 회고 모달 */}
                  {selectedReflection && selectedDate && (
                        <DailyReflectionModal
                              isOpen={reflectionModalOpen}
                              onClose={() => setReflectionModalOpen(false)}
                              date={selectedDate}
                              data={selectedReflection}
                        />
                  )}

                  {/* Toast 알림 */}
                  {saveMessage && (
                        <Toast
                              message={saveMessage.text}
                              type={saveMessage.type}
                              onClose={handleCloseToast}
                        />
                  )}
            </div>
      );
};
