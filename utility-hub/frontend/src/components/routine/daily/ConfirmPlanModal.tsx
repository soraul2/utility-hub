import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Check, X, CalendarDays } from 'lucide-react';
import { CATEGORY_CONFIG } from '../../../lib/constants/routine';
import { getPriorityBarColor } from '../../../lib/utils/routine';
import type { DailyPlan, Category } from '../../../types/routine';

interface ConfirmPlanModalProps {
      plan: DailyPlan;
      onConfirm: () => void;
      onClose: () => void;
      gcalConnected?: boolean;
}

export const ConfirmPlanModal: React.FC<ConfirmPlanModalProps> = ({ plan, onConfirm, onClose, gcalConnected }) => {
      const tasks = plan.keyTasks || [];
      const totalMinutes = tasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
      const totalHours = Math.floor(totalMinutes / 60);
      const remainMins = totalMinutes % 60;
      const scheduledCount = tasks.filter(t => t.startTime).length;
      const categoryMap: Record<string, number> = {};
      tasks.forEach(t => { if (t.category) categoryMap[t.category] = (categoryMap[t.category] || 0) + 1; });

      return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
                  <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Gradient Header */}
                        <div className="relative mystic-gradient-br p-6 pb-5 text-white">
                              {/* Close */}
                              <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1.5 text-white/50 hover:text-white hover:bg-white/20 rounded-lg transition-colors z-10"
                              >
                                    <X className="w-5 h-5" />
                              </button>

                              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">계획 확정</div>
                              <h2 className="text-xl font-black mb-5">
                                    {plan.planDate ? format(new Date(plan.planDate), 'yyyy년 M월 d일 (EEEE)', { locale: ko }) : '오늘'}
                              </h2>

                              {/* Stats Row */}
                              <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                                          <div className="text-lg font-black leading-tight">{tasks.length}</div>
                                          <div className="text-[9px] font-bold text-white/60 uppercase tracking-wider mt-0.5">태스크</div>
                                    </div>
                                    <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                                          <div className="text-lg font-black leading-tight">
                                                {totalHours > 0 ? `${totalHours}h ` : ''}{remainMins > 0 ? `${remainMins}m` : totalHours > 0 ? '' : '0m'}
                                          </div>
                                          <div className="text-[9px] font-bold text-white/60 uppercase tracking-wider mt-0.5">총 시간</div>
                                    </div>
                                    <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                                          <div className="text-lg font-black leading-tight">{scheduledCount}<span className="text-white/50 text-sm">/{tasks.length}</span></div>
                                          <div className="text-[9px] font-bold text-white/60 uppercase tracking-wider mt-0.5">시간배정</div>
                                    </div>
                              </div>
                        </div>

                        {/* Category Chips */}
                        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 flex-wrap">
                              {Object.entries(categoryMap).map(([cat, count]) => {
                                    const config = CATEGORY_CONFIG[cat as Category];
                                    const emoji = config?.emoji ?? '🏷️';
                                    const label = config?.label ?? '기타';
                                    return (
                                          <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300">
                                                {emoji} {label} <span className="text-indigo-500 font-black">{count}</span>
                                          </span>
                                    );
                              })}
                        </div>

                        {/* Task List */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                              {tasks.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-8">등록된 태스크가 없습니다</p>
                              ) : (
                                    tasks.map((task) => (
                                          <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                                {/* Priority accent bar */}
                                                <div className={`w-1 h-10 rounded-full shrink-0 ${getPriorityBarColor(task.priority)}`} />
                                                <div className="flex-1 min-w-0">
                                                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{task.title}</p>
                                                      <div className="flex items-center gap-2 mt-0.5">
                                                            {task.startTime ? (
                                                                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
                                                                        {task.startTime.substring(0, 5)}
                                                                  </span>
                                                            ) : (
                                                                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">미배정</span>
                                                            )}
                                                            {task.durationMinutes && (
                                                                  <span className="text-[10px] font-medium text-gray-400">{task.durationMinutes}분</span>
                                                            )}
                                                      </div>
                                                </div>
                                                <span className="text-base shrink-0">
                                                      {CATEGORY_CONFIG[task.category as Category]?.emoji ?? '🏷️'}
                                                </span>
                                          </div>
                                    ))
                              )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                              {gcalConnected && scheduledCount > 0 && (
                                    <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                          <CalendarDays className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                                확정 시 시간이 배정된 {scheduledCount}개 태스크가 Google Calendar에 자동 추가됩니다
                                          </span>
                                    </div>
                              )}
                              <div className="flex gap-3">
                                    <button
                                          onClick={onClose}
                                          className="flex-1 py-3.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-black transition-colors"
                                    >
                                          취소
                                    </button>
                                    <button
                                          onClick={onConfirm}
                                          className="flex-[2] py-3.5 mystic-gradient-r text-white rounded-xl text-sm font-black shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                          <Check className="w-4.5 h-4.5" />
                                          확정하기
                                    </button>
                              </div>
                        </div>
                  </div>
            </div>
      );
};
