import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
      Star,
      Save,
      BookOpen,
      AlertCircle,
      CheckCircle2,
      Circle,
      TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Category } from '../../types/routine';
import Toast from '../../components/common/Toast';
import { MOODS, CATEGORY_CONFIG } from '../../lib/constants/routine';

const ReflectionPage = () => {
      const { today, loadToday, saveReflection, isLoading } = useRoutineStore();

      // Form State
      const [rating, setRating] = useState(3);
      const [mood, setMood] = useState('NORMAL');
      const [whatWentWell, setWhatWentWell] = useState('');
      const [whatDidntGoWell, setWhatDidntGoWell] = useState('');
      const [tomorrowFocus, setTomorrowFocus] = useState('');
      const [isSaving, setIsSaving] = useState(false);
      const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

      useEffect(() => {
            if (!today) {
                  loadToday();
            }
      }, [loadToday, today]);

      useEffect(() => {
            if (today?.reflection) {
                  setRating(today.reflection.rating);
                  setMood(today.reflection.mood);
                  setWhatWentWell(today.reflection.whatWentWell || '');
                  setWhatDidntGoWell(today.reflection.whatDidntGoWell || '');
                  setTomorrowFocus(today.reflection.tomorrowFocus || '');
            }
      }, [today?.reflection]);

      // Task statistics
      const taskStats = useMemo(() => {
            if (!today?.keyTasks) return null;

            const tasks = today.keyTasks;
            const total = tasks.length;
            const completed = tasks.filter(t => t.completed).length;
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

            // Category-wise statistics
            const categoryStats: Record<Category, { total: number; completed: number }> = {
                  WORK: { total: 0, completed: 0 },
                  HEALTH: { total: 0, completed: 0 },
                  STUDY: { total: 0, completed: 0 },
                  PERSONAL: { total: 0, completed: 0 },
            };

            tasks.forEach(task => {
                  const cat = task.category || 'PERSONAL';
                  categoryStats[cat].total++;
                  if (task.completed) {
                        categoryStats[cat].completed++;
                  }
            });

            return {
                  total,
                  completed,
                  completionRate,
                  categoryStats,
                  completedTasks: tasks.filter(t => t.completed),
                  incompleteTasks: tasks.filter(t => !t.completed),
            };
      }, [today?.keyTasks]);

      const handleCloseToast = useCallback(() => {
            setSaveMessage(null);
      }, []);

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!today) return;

            setIsSaving(true);
            setSaveMessage(null);
            try {
                  await saveReflection({
                        planId: today.id,
                        rating,
                        mood,
                        whatWentWell,
                        whatDidntGoWell,
                        tomorrowFocus
                  });
                  setSaveMessage({ type: 'success', text: '하루 회고가 저장되었습니다!' });
            } catch (error) {
                  console.error('Failed to save reflection:', error);
                  setSaveMessage({ type: 'error', text: '저장에 실패했습니다. 다시 시도해주세요.' });
            } finally {
                  setIsSaving(false);
            }
      };

      if (isLoading && !today) {
            return (
                  <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
            );
      }

      if (!today) {
            return (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">오늘의 계획이 없습니다</h2>
                        <p className="text-gray-500 dark:text-gray-400">먼저 오늘의 계획을 세우고 하루를 시작해보세요.</p>
                        <Link
                              to="/routine/daily-plan"
                              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                              계획 세우러 가기
                        </Link>
                  </div>
            );
      }

      return (
            <div className="min-h-screen bg-mystic-bg space-y-6 md:space-y-8 animate-fade-in max-w-4xl mx-auto px-4 py-6 md:py-8">
                  {/* Header */}
                  <div className="bg-mystic-bg-secondary rounded-2xl p-4 md:p-6 shadow-sm border border-mystic-border flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                    하루 회고
                                    {today?.planDate && (
                                          <span className="ml-2 text-base md:text-lg font-bold text-purple-500 dark:text-purple-400">
                                                {format(new Date(today.planDate), 'M월 d일 (E)', { locale: ko })}
                                          </span>
                                    )}
                              </h1>
                              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">오늘 하루를 돌아보고 내일을 준비하세요.</p>
                        </div>
                  </div>

                  {/* Today's Summary Section */}
                  {taskStats && taskStats.total > 0 && (
                        <div className="bg-mystic-bg-secondary rounded-2xl p-6 shadow-sm border border-mystic-border space-y-6">
                              <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl mystic-gradient-br flex items-center justify-center shadow-lg">
                                          <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">오늘의 성과</h2>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {taskStats.completed}/{taskStats.total} 태스크 완료
                                          </p>
                                    </div>
                                    <div className="ml-auto">
                                          <div className={`text-3xl font-black ${taskStats.completionRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                                taskStats.completionRate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                                                }`}>
                                                {taskStats.completionRate}%
                                          </div>
                                    </div>
                              </div>

                              {/* Overall Progress Bar */}
                              <div>
                                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                          <div
                                                className={`h-full rounded-full transition-all duration-500 ${taskStats.completionRate >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                                                      taskStats.completionRate >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                                            'bg-gradient-to-r from-rose-500 to-red-500'
                                                      }`}
                                                style={{ width: `${taskStats.completionRate}%` }}
                                          />
                                    </div>
                              </div>

                              {/* Category-wise Stats */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {(Object.keys(taskStats.categoryStats) as Category[]).map(cat => {
                                          const stats = taskStats.categoryStats[cat];
                                          if (stats.total === 0) return null;
                                          const config = CATEGORY_CONFIG[cat];
                                          const Icon = config.icon;
                                          const rate = Math.round((stats.completed / stats.total) * 100);

                                          return (
                                                <div key={cat} className={`${config.bgColor} rounded-xl p-4`}>
                                                      <div className="flex items-center gap-2 mb-2">
                                                            <Icon className={`w-4 h-4 ${config.color}`} />
                                                            <span className={`text-xs font-bold ${config.color}`}>
                                                                  {config.label}
                                                            </span>
                                                      </div>
                                                      <div className="flex items-end justify-between">
                                                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                                                  {rate}%
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                  {stats.completed}/{stats.total}
                                                            </span>
                                                      </div>
                                                      <div className="h-1.5 bg-white/60 dark:bg-black/20 rounded-full mt-2 overflow-hidden">
                                                            <div
                                                                  className={`h-full rounded-full ${config.color.split(' ')[0].replace('text-', 'bg-')}`}
                                                                  style={{ width: `${rate}%` }}
                                                            />
                                                      </div>
                                                </div>
                                          );
                                    })}
                              </div>

                              {/* Task Lists */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Completed Tasks */}
                                    {taskStats.completedTasks.length > 0 && (
                                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                                                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                                                      <CheckCircle2 className="w-4 h-4" />
                                                      완료한 태스크
                                                </h3>
                                                <ul className="space-y-2">
                                                      {taskStats.completedTasks.map(task => (
                                                            <li key={task.id} className="flex items-center gap-2 text-sm">
                                                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                                                                  <span className="text-emerald-800 dark:text-emerald-300 line-through opacity-80">
                                                                        {task.title}
                                                                  </span>
                                                            </li>
                                                      ))}
                                                </ul>
                                          </div>
                                    )}

                                    {/* Incomplete Tasks */}
                                    {taskStats.incompleteTasks.length > 0 && (
                                          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4">
                                                <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
                                                      <Circle className="w-4 h-4" />
                                                      미완료 태스크
                                                </h3>
                                                <ul className="space-y-2">
                                                      {taskStats.incompleteTasks.map(task => (
                                                            <li key={task.id} className="flex items-center gap-2 text-sm">
                                                                  <Circle className="w-4 h-4 text-rose-400 dark:text-rose-500 flex-shrink-0" />
                                                                  <span className="text-rose-800 dark:text-rose-300">
                                                                        {task.title}
                                                                  </span>
                                                            </li>
                                                      ))}
                                                </ul>
                                          </div>
                                    )}
                              </div>
                        </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Rating Section */}
                              <div className="bg-mystic-bg-secondary rounded-2xl p-6 shadow-sm border border-mystic-border">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                          오늘 하루 만족도
                                    </label>
                                    <div className="flex justify-between items-center px-4">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                      key={star}
                                                      type="button"
                                                      onClick={() => setRating(star)}
                                                      className="transition-transform hover:scale-110 focus:outline-none"
                                                >
                                                      <Star
                                                            className={`w-8 h-8 ${star <= rating
                                                                  ? 'fill-yellow-400 text-yellow-400'
                                                                  : 'text-gray-200 dark:text-gray-700'
                                                                  }`}
                                                      />
                                                </button>
                                          ))}
                                    </div>
                              </div>

                              {/* Mood Section */}
                              <div className="bg-mystic-bg-secondary rounded-2xl p-6 shadow-sm border border-mystic-border">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                          오늘의 기분
                                    </label>
                                    <div className="flex justify-around items-center">
                                          {MOODS.map((m) => {
                                                const Icon = m.icon;
                                                const isSelected = mood === m.value;
                                                return (
                                                      <button
                                                            key={m.value}
                                                            type="button"
                                                            onClick={() => setMood(m.value)}
                                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${isSelected
                                                                  ? 'bg-gray-50 dark:bg-gray-700/50 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800'
                                                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                                                  }`}
                                                      >
                                                            <Icon className={`w-8 h-8 ${isSelected ? m.color : 'text-gray-400 dark:text-gray-600'}`} />
                                                            <span className={`text-xs font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                                                                  }`}>
                                                                  {m.label}
                                                            </span>
                                                      </button>
                                                );
                                          })}
                                    </div>
                              </div>
                        </div>

                        {/* Text Inputs */}
                        <div className="bg-mystic-bg-secondary rounded-2xl p-6 shadow-sm border border-mystic-border space-y-6">
                              <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                          잘한 점 (Keep)
                                    </label>
                                    <textarea
                                          value={whatWentWell}
                                          onChange={(e) => setWhatWentWell(e.target.value)}
                                          placeholder="오늘 성취한 것, 칭찬하고 싶은 점을 기록해보세요."
                                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 transition-all outline-none resize-none h-32 text-gray-900 dark:text-white"
                                    />
                              </div>

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                          아쉬운 점 (Problem)
                                    </label>
                                    <textarea
                                          value={whatDidntGoWell}
                                          onChange={(e) => setWhatDidntGoWell(e.target.value)}
                                          placeholder="부족했던 점, 개선이 필요한 부분을 솔직하게 적어보세요."
                                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 transition-all outline-none resize-none h-32 text-gray-900 dark:text-white"
                                    />
                              </div>

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                          내일의 다짐 (Try)
                                    </label>
                                    <textarea
                                          value={tomorrowFocus}
                                          onChange={(e) => setTomorrowFocus(e.target.value)}
                                          placeholder="내일 꼭 집중하고 싶은 한 가지는 무엇인가요?"
                                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 transition-all outline-none resize-none h-32 text-gray-900 dark:text-white"
                                    />
                              </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end">
                              <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-8 py-3 mystic-solid text-white font-medium rounded-xl mystic-solid-hover disabled:opacity-50 transition-colors shadow-lg"
                              >
                                    <Save className="w-5 h-5" />
                                    {isSaving ? '저장 중...' : '회고 저장하기'}
                              </button>
                        </div>
                  </form>

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

export default ReflectionPage;
