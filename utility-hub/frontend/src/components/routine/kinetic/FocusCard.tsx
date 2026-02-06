import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, SkipForward, Clock, CheckCircle2, Circle, Timer, Focus, X, Coffee, BookOpen } from 'lucide-react';
import type { Task } from '../../../types/routine';

interface FocusCardProps {
      tasks: Task[];
      onToggleTask: (taskId: number) => Promise<void>;
}

export const FocusCard: React.FC<FocusCardProps> = ({ tasks, onToggleTask }) => {
      const navigate = useNavigate();
      const [currentTime, setCurrentTime] = useState(new Date());
      const [isToggling, setIsToggling] = useState(false);
      const [isFocusMode, setIsFocusMode] = useState(false);

      useEffect(() => {
            const timer = setInterval(() => {
                  setCurrentTime(new Date());
            }, 1000); // Update every second for countdown
            return () => clearInterval(timer);
      }, []);

      // ESC key to close focus mode
      useEffect(() => {
            if (!isFocusMode) return;
            const handleKeyDown = (e: KeyboardEvent) => {
                  if (e.key === 'Escape') setIsFocusMode(false);
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
      }, [isFocusMode]);

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

      // Task after nextTask (for NEXT card in waiting mode)
      const taskAfterNext = nextTask ? scheduledTasks.find(task => {
            return timeToMinutes(task.startTime) > timeToMinutes(nextTask.startTime);
      }) : undefined;

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

      // Which task to display in NEXT card
      // NOW mode: show nextTask / Waiting mode: show taskAfterNext, fallback to nextTask
      const nextDisplayTask = currentTask ? nextTask : (taskAfterNext || nextTask);
      const getTimeUntilDisplay = () => {
            if (!nextDisplayTask) return null;
            const start = timeToMinutes(nextDisplayTask.startTime);
            const diff = start - currentMinutes;
            if (diff <= 0) return '곧 시작';
            if (diff < 60) return `${diff}분 후`;
            const h = Math.floor(diff / 60);
            const m = diff % 60;
            return m > 0 ? `${h}시간 ${m}분 후` : `${h}시간 후`;
      };

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
                  <div className="space-y-4">
                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-200 dark:shadow-none">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                              <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
                              <div className="relative z-10 text-center py-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">오늘 일정 완료!</h3>
                                    <p className="text-emerald-100 mb-1">
                                          {completedCount}/{totalScheduled} 태스크를 완료했습니다
                                    </p>
                                    <p className="text-emerald-200/70 text-sm font-medium">
                                          오늘 하루도 수고 많았어요
                                    </p>
                              </div>
                        </div>
                        <button
                              onClick={() => navigate('/routine/reflection')}
                              className="w-full flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-5 py-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group"
                        >
                              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                                    <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                              </div>
                              <div className="flex-1 text-left">
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white">하루 회고 작성하기</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">오늘을 돌아보며 내일을 준비해요</p>
                              </div>
                              <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                        </button>
                  </div>
            );
      }

      // Focus Mode Timer Overlay
      const focusTarget = currentTask || nextTask;
      if (isFocusMode && focusTarget) {
            const isWaitingFocus = !currentTask && !!nextTask;
            const focusStart = timeToMinutes(focusTarget.startTime);
            const focusEnd = focusStart + (focusTarget.durationMinutes || 60);

            // Waiting mode: countdown to next task start / Active mode: countdown to task end
            const focusRemainingTotal = isWaitingFocus
                  ? (focusStart - currentMinutes) * 60 - currentSeconds
                  : (focusEnd - currentMinutes) * 60 - currentSeconds;
            const focusHours = Math.floor(Math.max(0, focusRemainingTotal) / 3600);
            const focusMins = Math.floor((Math.max(0, focusRemainingTotal) % 3600) / 60);
            const focusSecs = Math.max(0, focusRemainingTotal) % 60;

            // Waiting mode: progress fills as time approaches / Active mode: progress by elapsed
            const focusProgress = isWaitingFocus
                  ? Math.min(100, Math.max(0, (1 - (focusStart - currentMinutes) / Math.max(1, focusStart - currentMinutes + 1)) * 100))
                  : Math.min(100, Math.max(0, ((currentMinutes - focusStart) / (focusTarget.durationMinutes || 60)) * 100));

            return (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center">
                        {/* Blur backdrop */}
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />

                        {/* Close button */}
                        <button
                              onClick={() => setIsFocusMode(false)}
                              className="absolute top-8 right-8 z-10 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                              <X className="w-6 h-6" />
                        </button>

                        {/* Timer Content */}
                        <div className="relative z-10 flex flex-col items-center gap-8 px-6">
                              {/* Task Info */}
                              <div className="text-center">
                                    <div className="flex items-center gap-2 justify-center mb-3">
                                          <div className={`w-3 h-3 rounded-full animate-pulse ${isWaitingFocus ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                                          <span className={`text-sm font-bold uppercase tracking-widest ${isWaitingFocus ? 'text-emerald-300' : 'text-indigo-300'}`}>
                                                {isWaitingFocus ? '쉬어가기' : '집중 모드'}
                                          </span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                                          {focusTarget.title}
                                    </h2>
                                    <p className="text-white/50 text-sm">
                                          {isWaitingFocus
                                                ? `${focusTarget.startTime?.substring(0, 5)} 시작 예정`
                                                : `${focusTarget.startTime?.substring(0, 5)} ~ ${String(Math.floor(focusEnd / 60)).padStart(2, '0')}:${String(focusEnd % 60).padStart(2, '0')}`
                                          }
                                    </p>
                              </div>

                              {/* Circular Timer */}
                              <div className="relative w-64 h-64 md:w-80 md:h-80">
                                    {/* Background circle */}
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                                          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                                          <circle
                                                cx="100" cy="100" r="90"
                                                fill="none"
                                                stroke={`url(#focusGradient)`}
                                                strokeWidth="6"
                                                strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 90}`}
                                                strokeDashoffset={`${2 * Math.PI * 90 * Math.max(0, Math.min(1, focusRemainingTotal / (isWaitingFocus ? (focusStart - currentMinutes + focusMins) * 60 || 1 : (focusTarget.durationMinutes || 60) * 60)))}`}
                                                className="transition-all duration-1000"
                                          />
                                          <defs>
                                                <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                      <stop offset="0%" stopColor={isWaitingFocus ? '#2dd4bf' : '#818cf8'} />
                                                      <stop offset="100%" stopColor={isWaitingFocus ? '#10b981' : '#c084fc'} />
                                                </linearGradient>
                                          </defs>
                                    </svg>
                                    {/* Timer text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                          <div className="text-5xl md:text-6xl font-black text-white tabular-nums tracking-tight">
                                                {focusHours > 0 && <span>{String(focusHours).padStart(2, '0')}:</span>}
                                                {String(focusMins).padStart(2, '0')}:{String(focusSecs).padStart(2, '0')}
                                          </div>
                                          <span className="text-white/40 text-xs font-bold mt-2 uppercase tracking-wider">
                                                {isWaitingFocus ? '시작까지' : '남은 시간'}
                                          </span>
                                    </div>
                              </div>

                              {/* Bottom Actions */}
                              <div className="flex items-center gap-4">
                                    {!isWaitingFocus && (
                                          <button
                                                onClick={() => {
                                                      handleToggle(focusTarget.id);
                                                      setIsFocusMode(false);
                                                }}
                                                disabled={isToggling}
                                                className="px-8 py-3.5 bg-white text-indigo-700 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-2xl disabled:opacity-50"
                                          >
                                                <CheckCircle2 className="w-5 h-5" />
                                                {isToggling ? '처리 중...' : '완료하기'}
                                          </button>
                                    )}
                                    <button
                                          onClick={() => setIsFocusMode(false)}
                                          className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 transition-colors shadow-2xl ${
                                                isWaitingFocus
                                                      ? 'bg-white text-emerald-700 hover:bg-emerald-50'
                                                      : 'bg-white/10 text-white hover:bg-white/20'
                                          }`}
                                    >
                                          <X className="w-5 h-5" />
                                          나가기
                                    </button>
                              </div>

                              {/* Progress info */}
                              <div className="text-white/30 text-xs font-bold">
                                    {isWaitingFocus
                                          ? `다음 일정까지 편히 쉬세요 · ESC 또는 X 버튼으로 나가기`
                                          : `진행률 ${Math.round(focusProgress)}% · ESC 또는 X 버튼으로 나가기`
                                    }
                              </div>
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
                                          <span className={`px-2 py-1 rounded-md font-bold ${currentTask.priority === 'HIGH' ? 'bg-red-500/30' :
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

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                          <button
                                                onClick={() => setIsFocusMode(true)}
                                                className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors backdrop-blur-sm"
                                          >
                                                <Focus className="w-5 h-5" />
                                                집중하기
                                          </button>
                                          <button
                                                onClick={() => handleToggle(currentTask.id)}
                                                disabled={isToggling}
                                                className="flex-1 py-3 bg-white text-indigo-700 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors disabled:opacity-50 shadow-lg"
                                          >
                                                <CheckCircle2 className="w-5 h-5" />
                                                {isToggling ? '처리 중...' : '완료하기'}
                                          </button>
                                    </div>
                              </div>
                        </div>
                  ) : nextTask ? (
                        /* No current task - rest/break mode */
                        (() => {
                              const restDiff = timeToMinutes(nextTask.startTime) - currentMinutes;
                              const restSecs = Math.max(0, restDiff * 60 - currentSeconds);
                              const restMins = Math.floor(restSecs / 60);
                              const restSecond = restSecs % 60;
                              // Completed tasks count
                              const completedCount = tasks.filter(t => t.completed).length;
                              const totalScheduled = tasks.filter(t => t.startTime).length;

                              return (
                                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/80 to-purple-50 dark:from-gray-800 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700 shadow-lg">
                                          {/* Decorative background */}
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

                                          <div className="relative z-10">
                                                {/* Header */}
                                                <div className="flex items-center justify-between mb-4">
                                                      <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
                                                                  <Clock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                            </div>
                                                            <div>
                                                                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">쉬는 시간</span>
                                                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        다음 일정 {nextTask.startTime?.substring(0, 5)}
                                                                  </div>
                                                            </div>
                                                      </div>
                                                      <div className="text-right">
                                                            <div className="flex items-center gap-1 text-gray-400">
                                                                  <Timer className="w-3 h-3" />
                                                                  <span className="text-[10px] font-bold uppercase">남은 시간</span>
                                                            </div>
                                                            <div className="text-lg font-black tabular-nums text-indigo-600 dark:text-indigo-400">
                                                                  {restDiff <= 0 ? '곧 시작' : restDiff < 60
                                                                        ? `${restMins}분 ${String(restSecond).padStart(2, '0')}초`
                                                                        : (() => {
                                                                              const h = Math.floor(restDiff / 60);
                                                                              const m = restDiff % 60;
                                                                              return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
                                                                        })()
                                                                  }
                                                            </div>
                                                      </div>
                                                </div>

                                                {/* Status message */}
                                                <h3 className="text-lg font-black mb-3 leading-tight text-gray-900 dark:text-white">
                                                      {restDiff <= 5 ? '곧 다음 일정이 시작됩니다'
                                                            : restDiff <= 15 ? '잠시 후 시작이에요, 준비하세요'
                                                            : restDiff <= 30 ? '여유있게 쉬어가세요'
                                                            : '충분히 쉬고 에너지를 충전하세요'}
                                                </h3>

                                                {/* Progress stats */}
                                                <div className="flex items-center gap-3 mb-4 text-xs">
                                                      <span className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-md font-bold text-indigo-600 dark:text-indigo-400">
                                                            {completedCount}/{totalScheduled} 완료
                                                      </span>
                                                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md font-bold text-gray-600 dark:text-gray-300">
                                                            {nextTask.durationMinutes || 60}분 예정
                                                      </span>
                                                      <span className={`px-2 py-1 rounded-md font-bold ${
                                                            nextTask.priority === 'HIGH' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                                            nextTask.priority === 'MEDIUM' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                                            'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                      }`}>
                                                            {nextTask.priority}
                                                      </span>
                                                </div>

                                                {/* Rest progress bar */}
                                                <div className="mb-4">
                                                      <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                                                            <span>휴식 진행</span>
                                                            <span>{restDiff <= 0 ? '완료' : `${nextTask.startTime?.substring(0, 5)} 시작`}</span>
                                                      </div>
                                                      <div className="h-2 bg-gray-200/60 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all duration-1000"
                                                                  style={{ width: `${Math.min(100, Math.max(2, (1 - restSecs / Math.max(1, restDiff * 60)) * 100))}%` }}
                                                            />
                                                      </div>
                                                </div>

                                                {/* Action Button */}
                                                <button
                                                      onClick={() => setIsFocusMode(true)}
                                                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-200 dark:shadow-none"
                                                >
                                                      <Coffee className="w-5 h-5" />
                                                      쉬어가기
                                                </button>
                                          </div>
                                    </div>
                              );
                        })()
                  ) : null}

                  {/* Next Task - compact card */}
                  {nextDisplayTask && (
                        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                              <SkipForward className="w-4 h-4 text-amber-500 shrink-0" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 shrink-0">NEXT</span>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate flex-1">{nextDisplayTask.title}</h4>
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 shrink-0">
                                    <span className="font-bold">{nextDisplayTask.startTime?.substring(0, 5)}</span>
                                    <span>·</span>
                                    <span>{getTimeUntilDisplay()}</span>
                              </div>
                              <button
                                    onClick={() => handleToggle(nextDisplayTask.id)}
                                    disabled={isToggling}
                                    className="p-1 text-gray-300 hover:text-green-500 rounded transition-colors shrink-0"
                                    title="미리 완료"
                              >
                                    <Circle className="w-5 h-5" />
                              </button>
                        </div>
                  )}
            </div>
      );
};
