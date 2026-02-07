import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, CheckCircle2, Circle, Target, Zap, ListTodo, BarChart3, Timer } from 'lucide-react';
import type { DailyPlan } from '../../../types/routine';
import { ExecutionTimeline } from './ExecutionTimeline';
import { FocusCard } from './FocusCard';

interface ConfirmedPlanViewProps {
      plan: DailyPlan;
      onToggleTask: (taskId: number) => Promise<void>;
}

export const ConfirmedPlanView: React.FC<ConfirmedPlanViewProps> = ({ plan, onToggleTask }) => {
      const [timelineRange, setTimelineRange] = useState({ startHour: 9, endHour: 18 });

      const scheduledTasks = plan.keyTasks.filter(t => t.startTime).sort((a, b) => {
            const timeA = a.startTime || '00:00:00';
            const timeB = b.startTime || '00:00:00';
            return timeA.localeCompare(timeB);
      });

      const unscheduledTasks = plan.keyTasks.filter(t => !t.startTime);

      const completedCount = plan.keyTasks.filter(t => t.completed).length;
      const totalCount = plan.keyTasks.length;
      const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      // Calculate total remaining time
      const getRemainingWorkTime = () => {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            let remainingMinutes = 0;
            scheduledTasks.forEach(task => {
                  if (task.completed) return;
                  const [h, m] = (task.startTime || '00:00').split(':').map(Number);
                  const taskStart = h * 60 + m;
                  const taskEnd = taskStart + (task.durationMinutes || 60);

                  if (taskEnd > currentMinutes) {
                        // Task is in the future or ongoing
                        const effectiveStart = Math.max(taskStart, currentMinutes);
                        remainingMinutes += taskEnd - effectiveStart;
                  }
            });

            if (remainingMinutes <= 0) return '완료';
            const hours = Math.floor(remainingMinutes / 60);
            const mins = remainingMinutes % 60;
            if (hours > 0) return `${hours}시간 ${mins > 0 ? `${mins}분` : ''}`;
            return `${mins}분`;
      };

      // Auto-detect timeline range from tasks
      useEffect(() => {
            if (scheduledTasks.length > 0) {
                  const times = scheduledTasks.map(t => {
                        const [h] = (t.startTime || '09:00').split(':').map(Number);
                        return h;
                  });
                  const endTimes = scheduledTasks.map(t => {
                        const [h, m] = (t.startTime || '09:00').split(':').map(Number);
                        const duration = t.durationMinutes || 60;
                        return Math.ceil((h * 60 + m + duration) / 60);
                  });

                  const minHour = Math.max(0, Math.min(...times) - 1);
                  const maxHour = Math.min(24, Math.max(...endTimes) + 1);

                  setTimelineRange({ startHour: minHour, endHour: maxHour });
            }
      }, [scheduledTasks.length]);

      return (
            <div className="h-full overflow-y-auto custom-scrollbar bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/20">
                  <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
                        {/* Header with Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                              {/* Main Progress Card */}
                              <div className="lg:col-span-2 relative overflow-hidden mystic-gradient-br rounded-2xl p-6 text-white shadow-xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                    <div className="relative z-10">
                                          <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                                      <Target className="w-6 h-6" />
                                                </div>
                                                <div>
                                                      <div className="text-white/70 text-xs font-bold uppercase tracking-wider">Execution Mode</div>
                                                      <h1 className="text-2xl font-black">
                                                            {format(new Date(plan.planDate), 'M월 d일 (E)', { locale: ko })}
                                                      </h1>
                                                </div>
                                          </div>

                                          <div className="flex items-end justify-between">
                                                <div>
                                                      <div className="text-4xl font-black">{progress}%</div>
                                                      <div className="text-sm text-white/80 mt-1">
                                                            {completedCount} / {totalCount} 완료
                                                      </div>
                                                </div>
                                                <div className="text-right">
                                                      <div className="h-2 w-32 bg-white/20 rounded-full overflow-hidden">
                                                            <div
                                                                  className="h-full bg-white rounded-full transition-all duration-500"
                                                                  style={{ width: `${progress}%` }}
                                                            />
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                              </div>

                              {/* Stats Cards */}
                              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-2">
                                          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                          </div>
                                          <div>
                                                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</div>
                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</div>
                                          </div>
                                    </div>
                              </div>

                              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-2">
                                          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                                                <Timer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                          </div>
                                          <div>
                                                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{getRemainingWorkTime()}</div>
                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Remaining</div>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Focus Zone - Left Side */}
                              <div className="lg:col-span-1 space-y-3">
                                    <div className="flex items-center gap-2">
                                          <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                          <h2 className="text-lg font-black text-gray-900 dark:text-white">Focus Zone</h2>
                                    </div>
                                    <FocusCard tasks={plan.keyTasks} onToggleTask={onToggleTask} />
                              </div>

                              {/* Timeline - Right Side */}
                              <div className="lg:col-span-2 space-y-3">
                                    <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                                <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                <h2 className="text-lg font-black text-gray-900 dark:text-white">Timeline</h2>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs">
                                                <span className="text-gray-500">Range:</span>
                                                <input
                                                      type="number"
                                                      min="0" max="23"
                                                      value={timelineRange.startHour}
                                                      onChange={(e) => setTimelineRange(prev => ({ ...prev, startHour: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) }))}
                                                      className="w-10 px-1 py-0.5 text-center bg-gray-100 dark:bg-gray-800 rounded font-bold text-gray-700 dark:text-gray-300"
                                                />
                                                <span className="text-gray-400">~</span>
                                                <input
                                                      type="number"
                                                      min="0" max="24"
                                                      value={timelineRange.endHour}
                                                      onChange={(e) => setTimelineRange(prev => ({ ...prev, endHour: Math.max(0, Math.min(24, parseInt(e.target.value) || 0)) }))}
                                                      className="w-10 px-1 py-0.5 text-center bg-gray-100 dark:bg-gray-800 rounded font-bold text-gray-700 dark:text-gray-300"
                                                />
                                          </div>
                                    </div>
                                    <div className="h-[340px]">
                                          <ExecutionTimeline
                                                tasks={plan.keyTasks}
                                                startHour={timelineRange.startHour}
                                                endHour={timelineRange.endHour}
                                                onToggleTask={onToggleTask}
                                          />
                                    </div>
                              </div>
                        </div>

                        {/* Scheduled Tasks List */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                              <div className="mystic-gradient-muted px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                <h2 className="text-base font-black text-gray-900 dark:text-white">오늘의 일정</h2>
                                          </div>
                                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                                                {scheduledTasks.length}개
                                          </span>
                                    </div>
                              </div>

                              <div className="p-4">
                                    {scheduledTasks.length === 0 ? (
                                          <div className="text-center py-8 text-gray-400">
                                                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">예정된 일정이 없습니다</p>
                                          </div>
                                    ) : (
                                          <div className="space-y-2">
                                                {scheduledTasks.map((task) => (
                                                      <div
                                                            key={task.id}
                                                            className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                                                                  task.completed
                                                                        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                                                                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indigo-300'
                                                            }`}
                                                            onClick={() => onToggleTask(task.id)}
                                                      >
                                                            <button
                                                                  className={`flex-shrink-0 p-1 rounded-full transition-all duration-200 hover:scale-110 ${
                                                                        task.completed
                                                                              ? 'text-green-600 dark:text-green-400'
                                                                              : 'text-gray-300 group-hover:text-indigo-600'
                                                                  }`}
                                                            >
                                                                  {task.completed ? (
                                                                        <CheckCircle2 className="w-6 h-6" />
                                                                  ) : (
                                                                        <Circle className="w-6 h-6" />
                                                                  )}
                                                            </button>

                                                            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                                                  task.completed
                                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                                  {task.startTime?.substring(0, 5)}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                  <h3 className={`font-bold text-sm ${
                                                                        task.completed
                                                                              ? 'text-gray-400 line-through'
                                                                              : 'text-gray-900 dark:text-white'
                                                                  }`}>
                                                                        {task.title}
                                                                  </h3>
                                                                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                                                        <span>{task.durationMinutes || 60}분</span>
                                                                        <span>•</span>
                                                                        <span className={
                                                                              task.priority === 'HIGH' ? 'text-red-500' :
                                                                                    task.priority === 'MEDIUM' ? 'text-amber-500' : 'text-blue-500'
                                                                        }>
                                                                              {task.priority}
                                                                        </span>
                                                                  </div>
                                                            </div>

                                                            <div className={`w-1.5 h-10 rounded-full ${
                                                                  task.completed ? 'bg-green-500' :
                                                                        task.priority === 'HIGH' ? 'bg-red-500' :
                                                                              task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                                                            }`} />
                                                      </div>
                                                ))}
                                          </div>
                                    )}
                              </div>
                        </div>

                        {/* Unscheduled Tasks */}
                        {unscheduledTasks.length > 0 && (
                              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                                          <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                      <ListTodo className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                      <h2 className="text-base font-black text-gray-900 dark:text-white">시간 미배정</h2>
                                                </div>
                                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                                                      {unscheduledTasks.length}개
                                                </span>
                                          </div>
                                    </div>

                                    <div className="p-4">
                                          <div className="space-y-2">
                                                {unscheduledTasks.map((task) => (
                                                      <div
                                                            key={task.id}
                                                            className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                                                                  task.completed
                                                                        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                                                                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:shadow-md'
                                                            }`}
                                                            onClick={() => onToggleTask(task.id)}
                                                      >
                                                            <button
                                                                  className={`flex-shrink-0 p-1 rounded-full transition-all duration-200 hover:scale-110 ${
                                                                        task.completed
                                                                              ? 'text-green-600 dark:text-green-400'
                                                                              : 'text-gray-300 group-hover:text-indigo-600'
                                                                  }`}
                                                            >
                                                                  {task.completed ? (
                                                                        <CheckCircle2 className="w-6 h-6" />
                                                                  ) : (
                                                                        <Circle className="w-6 h-6" />
                                                                  )}
                                                            </button>

                                                            <div className="flex-1 min-w-0">
                                                                  <h3 className={`font-bold text-sm ${
                                                                        task.completed
                                                                              ? 'text-gray-400 line-through'
                                                                              : 'text-gray-900 dark:text-white'
                                                                  }`}>
                                                                        {task.title}
                                                                  </h3>
                                                                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                                                        <span>
                                                                              {task.category === 'WORK' ? '💼 Work' :
                                                                                    task.category === 'HEALTH' ? '💪 Health' :
                                                                                          task.category === 'STUDY' ? '📚 Study' :
                                                                                                task.category === 'PERSONAL' ? '🏠 Personal' : '🏷️ General'}
                                                                        </span>
                                                                        {task.durationMinutes && (
                                                                              <>
                                                                                    <span>•</span>
                                                                                    <span>{task.durationMinutes}분</span>
                                                                              </>
                                                                        )}
                                                                  </div>
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              </div>
                        )}
                  </div>
            </div>
      );
};
