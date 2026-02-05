import React, { useState, useEffect } from 'react';
import { Flame, SkipForward, Clock, CheckCircle2, Circle, Timer } from 'lucide-react';
import type { Task } from '../../../types/routine';

interface FocusCardProps {
      tasks: Task[];
      onToggleTask: (taskId: number) => Promise<void>;
}

export const FocusCard: React.FC<FocusCardProps> = ({ tasks, onToggleTask }) => {
      const [currentTime, setCurrentTime] = useState(new Date());
      const [isToggling, setIsToggling] = useState(false);

      useEffect(() => {
            const timer = setInterval(() => {
                  setCurrentTime(new Date());
            }, 1000); // Update every second for countdown
            return () => clearInterval(timer);
      }, []);

      const timeToMinutes = (timeStr?: string) => {
            if (!timeStr) return 0;
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
      };

      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      const currentSeconds = currentTime.getSeconds();

      // Find current and next tasks
      const scheduledTasks = tasks
            .filter(t => t.startTime && !t.completed)
            .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

      const currentTask = scheduledTasks.find(task => {
            const start = timeToMinutes(task.startTime);
            const end = start + (task.durationMinutes || 60);
            return currentMinutes >= start && currentMinutes < end;
      });

      const nextTask = scheduledTasks.find(task => {
            const start = timeToMinutes(task.startTime);
            return start > currentMinutes;
      });

      // Calculate remaining time for current task
      const getRemainingTime = () => {
            if (!currentTask) return null;
            const start = timeToMinutes(currentTask.startTime);
            const end = start + (currentTask.durationMinutes || 60);
            const remainingMinutes = end - currentMinutes;
            const remainingSeconds = 60 - currentSeconds;

            if (remainingMinutes <= 0) return null;

            const hours = Math.floor((remainingMinutes - 1) / 60);
            const mins = (remainingMinutes - 1) % 60;

            if (hours > 0) {
                  return `${hours}시간 ${mins}분`;
            }
            return `${mins}분 ${remainingSeconds}초`;
      };

      // Calculate progress for current task
      const getProgress = () => {
            if (!currentTask) return 0;
            const start = timeToMinutes(currentTask.startTime);
            const duration = currentTask.durationMinutes || 60;
            const elapsed = currentMinutes - start;
            return Math.min(100, Math.max(0, (elapsed / duration) * 100));
      };

      // Time until next task
      const getTimeUntilNext = () => {
            if (!nextTask) return null;
            const nextStart = timeToMinutes(nextTask.startTime);
            const diff = nextStart - currentMinutes;

            if (diff <= 0) return '곧 시작';
            if (diff < 60) return `${diff}분 후`;
            const hours = Math.floor(diff / 60);
            const mins = diff % 60;
            return `${hours}시간 ${mins > 0 ? `${mins}분` : ''} 후`;
      };

      const handleToggle = async (taskId: number) => {
            setIsToggling(true);
            try {
                  await onToggleTask(taskId);
            } finally {
                  setIsToggling(false);
            }
      };

      const remainingTime = getRemainingTime();
      const progress = getProgress();
      const timeUntilNext = getTimeUntilNext();

      // All tasks done or no scheduled tasks
      if (!currentTask && !nextTask) {
            const completedCount = tasks.filter(t => t.completed).length;
            const totalScheduled = tasks.filter(t => t.startTime).length;

            if (totalScheduled === 0) {
                  return (
                        <div className="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                              <div className="text-center py-4">
                                    <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">시간이 배정된 태스크가 없습니다</p>
                              </div>
                        </div>
                  );
            }

            return (
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-200 dark:shadow-none">
                        <div className="text-center py-4">
                              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                              </div>
                              <h3 className="text-xl font-black mb-2">오늘 일정 완료!</h3>
                              <p className="text-emerald-100">
                                    {completedCount}/{totalScheduled} 태스크를 완료했습니다
                              </p>
                        </div>
                  </div>
            );
      }

      return (
            <div className="space-y-4">
                  {/* Current Task - NOW */}
                  {currentTask ? (
                        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                              {/* Decorative background */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

                              <div className="relative z-10">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                          <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center animate-pulse">
                                                      <Flame className="w-4 h-4" />
                                                </div>
                                                <div>
                                                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">NOW</span>
                                                      <div className="text-xs text-white/80">
                                                            {currentTask.startTime?.substring(0, 5)} ~ {
                                                                  (() => {
                                                                        const start = timeToMinutes(currentTask.startTime);
                                                                        const end = start + (currentTask.durationMinutes || 60);
                                                                        return `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
                                                                  })()
                                                            }
                                                      </div>
                                                </div>
                                          </div>
                                          <div className="text-right">
                                                <div className="flex items-center gap-1 text-indigo-200">
                                                      <Timer className="w-3 h-3" />
                                                      <span className="text-[10px] font-bold uppercase">남은 시간</span>
                                                </div>
                                                <div className="text-lg font-black tabular-nums">
                                                      {remainingTime || '완료 임박'}
                                                </div>
                                          </div>
                                    </div>

                                    {/* Task Title */}
                                    <h3 className="text-xl font-black mb-3 leading-tight">
                                          {currentTask.title}
                                    </h3>

                                    {/* Meta */}
                                    <div className="flex items-center gap-3 mb-4 text-xs">
                                          <span className="bg-white/20 px-2 py-1 rounded-md font-bold">
                                                {currentTask.category === 'WORK' ? '💼 Work' :
                                                      currentTask.category === 'HEALTH' ? '💪 Health' :
                                                            currentTask.category === 'STUDY' ? '📚 Study' :
                                                                  currentTask.category === 'PERSONAL' ? '🏠 Personal' : '🏷️ General'}
                                          </span>
                                          <span className={`px-2 py-1 rounded-md font-bold ${
                                                currentTask.priority === 'HIGH' ? 'bg-red-500/30' :
                                                      currentTask.priority === 'MEDIUM' ? 'bg-amber-500/30' : 'bg-blue-500/30'
                                          }`}>
                                                {currentTask.priority}
                                          </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                          <div className="flex justify-between text-[10px] font-bold text-indigo-200 mb-1">
                                                <span>진행률</span>
                                                <span>{Math.round(progress)}%</span>
                                          </div>
                                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                                <div
                                                      className="h-full bg-white rounded-full transition-all duration-1000"
                                                      style={{ width: `${progress}%` }}
                                                />
                                          </div>
                                    </div>

                                    {/* Complete Button */}
                                    <button
                                          onClick={() => handleToggle(currentTask.id)}
                                          disabled={isToggling}
                                          className="w-full py-3 bg-white text-indigo-700 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors disabled:opacity-50 shadow-lg"
                                    >
                                          <CheckCircle2 className="w-5 h-5" />
                                          {isToggling ? '처리 중...' : '완료하기'}
                                    </button>
                              </div>
                        </div>
                  ) : (
                        /* No current task - show waiting state */
                        <div className="bg-gradient-to-br from-slate-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                          <Clock className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">대기 중</span>
                                          <p className="text-sm font-bold text-gray-600 dark:text-gray-300">현재 진행 중인 태스크 없음</p>
                                    </div>
                              </div>
                        </div>
                  )}

                  {/* Next Task */}
                  {nextTask && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                              <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                                                <SkipForward className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                          </div>
                                          <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">NEXT</span>
                                                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                            {timeUntilNext}
                                                      </span>
                                                </div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">{nextTask.title}</h4>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                      <span>{nextTask.startTime?.substring(0, 5)}</span>
                                                      <span>•</span>
                                                      <span>{nextTask.durationMinutes || 60}분</span>
                                                </div>
                                          </div>
                                    </div>
                                    <button
                                          onClick={() => handleToggle(nextTask.id)}
                                          disabled={isToggling}
                                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                          title="미리 완료"
                                    >
                                          <Circle className="w-6 h-6" />
                                    </button>
                              </div>
                        </div>
                  )}
            </div>
      );
};
