import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
      Calendar,
      StickyNote,
      Save,
      ArrowRight,
      Coffee,
      CheckCircle2,
      Smile,
      Meh,
      Frown,
      CalendarDays,
      Plus,
      Pencil,
      Trash2
} from 'lucide-react';
import type { DailySummary, CalendarEvent } from '@/types/routine';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import Toast from '@/components/common/Toast';

const MOOD_DISPLAY: Record<string, { icon: typeof Smile; label: string; color: string }> = {
      'GOOD': { icon: Smile, label: '좋은 날', color: 'text-emerald-500' },
      'NORMAL': { icon: Meh, label: '보통', color: 'text-amber-500' },
      'BAD': { icon: Frown, label: '힘든 날', color: 'text-rose-500' },
};

const EVENT_TYPE_LABEL: Record<string, string> = {
      'MEMO': '메모',
      'PLAN': '일정',
      'HOLIDAY': '휴일',
};

interface DayDetailPanelProps {
      date: Date | null;
      dayData?: DailySummary;
      events?: CalendarEvent[];
      onUpdateMemo: (date: string, memo: string) => Promise<void>;
      onAddEvent?: () => void;
      onEditEvent?: (event: CalendarEvent) => void;
      onDeleteEvent?: (eventId: number) => Promise<void>;
      // Keep for backward compat but unused
      templates?: unknown[];
      onApplyTemplate?: unknown;
}

const DayDetailPanel: React.FC<DayDetailPanelProps> = ({
      date,
      dayData,
      events = [],
      onUpdateMemo,
      onAddEvent,
      onEditEvent,
      onDeleteEvent,
}) => {
      const [memo, setMemo] = useState('');
      const [isSaving, setIsSaving] = useState(false);
      const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

      useEffect(() => {
            setMemo(dayData?.memoSnippet || '');
      }, [date, dayData]);

      if (!date) {
            return (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center text-gray-400 space-y-3 min-h-[200px]">
                        <Calendar className="w-10 h-10 opacity-20" />
                        <p className="text-sm font-medium">날짜를 선택하여 상세 내용을 확인하세요</p>
                  </div>
            );
      }

      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'M월 d일 (EEEE)', { locale: ko });
      const completionRate = dayData?.hasPlan && dayData.totalTasks > 0
            ? Math.round(dayData.completionRate)
            : null;

      const moodEntry = dayData?.mood ? MOOD_DISPLAY[dayData.mood] : null;

      const handleSaveMemo = async () => {
            setIsSaving(true);
            try {
                  await onUpdateMemo(dateStr, memo);
                  setToast({ type: 'success', text: memo.trim() ? '메모가 저장되었습니다.' : '메모가 삭제되었습니다.' });
            } catch {
                  setToast({ type: 'error', text: '메모 저장에 실패했습니다.' });
            } finally {
                  setIsSaving(false);
            }
      };

      return (
            <>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-gray-100 dark:border-gray-700">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2.5">
                                          <Calendar className="w-4 h-4 text-indigo-500" />
                                          <h3 className="text-sm font-black text-gray-900 dark:text-white">{displayDate}</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                          {dayData?.isRest ? (
                                                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md text-[11px] font-bold">
                                                      <Coffee className="w-3 h-3" /> 휴식
                                                </span>
                                          ) : dayData?.hasPlan ? (
                                                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-md text-[11px] font-bold">
                                                      <CheckCircle2 className="w-3 h-3" /> 계획 있음
                                                </span>
                                          ) : (
                                                <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-md text-[11px] font-bold">
                                                      계획 없음
                                                </span>
                                          )}
                                          {moodEntry && (
                                                <span className={classNames("flex items-center gap-1 px-2 py-0.5 bg-white/60 dark:bg-gray-800/60 rounded-md text-[11px] font-bold", moodEntry.color)}>
                                                      <moodEntry.icon className="w-3 h-3" />
                                                      {moodEntry.label}
                                                </span>
                                          )}
                                    </div>
                              </div>

                              {completionRate !== null && (
                                    <div className="mt-2.5">
                                          <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="font-bold text-gray-600 dark:text-gray-400">
                                                      태스크 {dayData!.completedTasks}/{dayData!.totalTasks} 완료
                                                </span>
                                                <span className="font-black text-gray-900 dark:text-white">{completionRate}%</span>
                                          </div>
                                          <div className="h-1.5 bg-white/50 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                      className={classNames("h-full rounded-full transition-all duration-500",
                                                            completionRate >= 80 ? 'bg-indigo-500' :
                                                            completionRate >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                                                      )}
                                                      style={{ width: `${completionRate}%` }}
                                                />
                                          </div>
                                    </div>
                              )}
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4">
                              {/* Calendar Events Section */}
                              <div>
                                    <div className="flex items-center justify-between mb-2">
                                          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                <CalendarDays className="w-3.5 h-3.5" /> 이벤트
                                          </label>
                                          {onAddEvent && (
                                                <button
                                                      onClick={onAddEvent}
                                                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                >
                                                      <Plus className="w-3 h-3" /> 추가
                                                </button>
                                          )}
                                    </div>
                                    {events.length === 0 ? (
                                          <div className="text-center py-4 text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                <p className="text-xs">등록된 이벤트가 없습니다.</p>
                                          </div>
                                    ) : (
                                          <div className="space-y-1.5">
                                                {events.map(event => (
                                                      <div
                                                            key={event.id}
                                                            className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg group"
                                                      >
                                                            <div
                                                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                                                  style={{ backgroundColor: event.color }}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{event.title}</p>
                                                                  <p className="text-[10px] text-gray-400">
                                                                        {EVENT_TYPE_LABEL[event.type] || event.type}
                                                                        {event.startDate !== event.endDate && ` · ${event.startDate} ~ ${event.endDate}`}
                                                                  </p>
                                                            </div>
                                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                                  {onEditEvent && (
                                                                        <button
                                                                              onClick={() => onEditEvent(event)}
                                                                              className="p-1 text-gray-400 hover:text-indigo-500 rounded transition-colors"
                                                                        >
                                                                              <Pencil className="w-3 h-3" />
                                                                        </button>
                                                                  )}
                                                                  {onDeleteEvent && (
                                                                        <button
                                                                              onClick={() => onDeleteEvent(event.id)}
                                                                              className="p-1 text-gray-400 hover:text-rose-500 rounded transition-colors"
                                                                        >
                                                                              <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                  )}
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                    )}
                              </div>

                              {/* Memo Section */}
                              <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                          <StickyNote className="w-3.5 h-3.5" /> 메모
                                    </label>
                                    <div className="relative">
                                          <textarea
                                                value={memo}
                                                onChange={(e) => setMemo(e.target.value)}
                                                placeholder="이 날의 메모를 남겨보세요..."
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm transition-all h-24"
                                          />
                                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                                                {memo.trim() !== (dayData?.memoSnippet || '') && (
                                                      <button
                                                            onClick={handleSaveMemo}
                                                            disabled={isSaving}
                                                            className={classNames(
                                                                  "p-2 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50",
                                                                  memo.trim() ? "bg-indigo-600 hover:bg-indigo-700" : "bg-rose-500 hover:bg-rose-600"
                                                            )}
                                                            title={memo.trim() ? '저장' : '메모 삭제'}
                                                      >
                                                            {memo.trim() ? <Save className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                                      </button>
                                                )}
                                          </div>
                                    </div>
                              </div>

                              {/* Footer */}
                              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <Link
                                          to={`/routine/daily-plan/${dateStr}`}
                                          className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                                    >
                                          상세 계획 보기 <ArrowRight className="w-4 h-4" />
                                    </Link>
                              </div>
                        </div>
                  </div>

                  {toast && (
                        <Toast
                              message={toast.text}
                              type={toast.type}
                              onClose={() => setToast(null)}
                        />
                  )}
            </>
      );
};

export default DayDetailPanel;
