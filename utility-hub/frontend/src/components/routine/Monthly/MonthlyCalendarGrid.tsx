import React, { useMemo } from 'react';
import {
      format,
      endOfMonth,
      startOfWeek,
      endOfWeek,
      eachDayOfInterval,
      isSameMonth,
      isSameDay,
      isToday
} from 'date-fns';
import { Smile, Meh, Frown, Coffee, CheckCircle2, ListTodo, Check, Plus, FileText } from 'lucide-react';
import type { DailySummary, CalendarEvent } from '@/types/routine';
import classNames from 'classnames';

// --- Constants ---
const MAX_EVENT_BARS = 2;
const EVENT_BAR_HEIGHT = 20; // 18px bar + 2px gap

const MOOD_ICON: Record<string, { icon: typeof Smile; color: string }> = {
      'GOOD': { icon: Smile, color: 'text-emerald-500' },
      'NORMAL': { icon: Meh, color: 'text-amber-500' },
      'BAD': { icon: Frown, color: 'text-rose-500' },
};

// --- Helpers ---
function chunk<T>(arr: T[], size: number): T[][] {
      const result: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
      }
      return result;
}

function parseLocalDate(dateStr: string): Date {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
}

function getDateRange(start: string, end: string): string[] {
      const result: string[] = [];
      const current = parseLocalDate(start);
      const endDate = parseLocalDate(end);
      while (current <= endDate) {
            result.push(formatDate(current));
            current.setDate(current.getDate() + 1);
      }
      return result;
}

// --- Slot Allocation ---
function allocateSlots(events: CalendarEvent[]): Map<number, number> {
      // Sort: longer events first, then by start date
      const sorted = [...events].sort((a, b) => {
            const lenA = getDateRange(a.startDate, a.endDate).length;
            const lenB = getDateRange(b.startDate, b.endDate).length;
            if (lenA !== lenB) return lenB - lenA;
            return a.startDate.localeCompare(b.startDate);
      });

      const slotMap = new Map<number, number>();
      const occupied = new Map<string, Set<number>>();

      for (const event of sorted) {
            const dates = getDateRange(event.startDate, event.endDate);
            let slot = 0;
            while (dates.some(d => occupied.get(d)?.has(slot))) slot++;
            slotMap.set(event.id, slot);
            for (const d of dates) {
                  if (!occupied.has(d)) occupied.set(d, new Set());
                  occupied.get(d)!.add(slot);
            }
      }
      return slotMap;
}

// --- Week Segments ---
interface EventSegment {
      event: CalendarEvent;
      slot: number;
      colStart: number;
      colSpan: number;
      isEventStart: boolean;
      isEventEnd: boolean;
}

function getWeekSegments(
      events: CalendarEvent[],
      weekDays: Date[],
      slotMap: Map<number, number>,
): EventSegment[] {
      const weekStart = formatDate(weekDays[0]);
      const weekEnd = formatDate(weekDays[6]);

      return events
            .filter(e => e.endDate >= weekStart && e.startDate <= weekEnd)
            .map(event => {
                  const effStart = event.startDate < weekStart ? weekStart : event.startDate;
                  const effEnd = event.endDate > weekEnd ? weekEnd : event.endDate;
                  const startCol = weekDays.findIndex(d => formatDate(d) === effStart);
                  const endCol = weekDays.findIndex(d => formatDate(d) === effEnd);
                  if (startCol < 0 || endCol < 0) return null;
                  return {
                        event,
                        slot: slotMap.get(event.id) ?? 0,
                        colStart: startCol,
                        colSpan: endCol - startCol + 1,
                        isEventStart: event.startDate >= weekStart,
                        isEventEnd: event.endDate <= weekEnd,
                  };
            })
            .filter((s): s is EventSegment => s !== null)
            .sort((a, b) => a.slot - b.slot);
}

// --- Component ---
interface MonthlyCalendarGridProps {
      year: number;
      month: number;
      data: DailySummary[];
      selectedDate: Date | null;
      onSelectDay: (date: Date) => void;
      onOpenDetail?: (date: Date) => void;
      onEventClick?: (event: CalendarEvent) => void;
      batchMode?: boolean;
      batchSelectedDates?: Set<string>;
      onToggleBatchDate?: (dateStr: string) => void;
      events?: CalendarEvent[];
      className?: string;
}

const MonthlyCalendarGrid: React.FC<MonthlyCalendarGridProps> = ({
      year, month, data, selectedDate, onSelectDay, onOpenDetail, onEventClick,
      batchMode = false, batchSelectedDates, onToggleBatchDate,
      events = [],
      className,
}) => {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd_ = endOfMonth(monthStart);
      const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const gridEnd = endOfWeek(monthEnd_, { weekStartsOn: 0 });

      const calendarDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
      const weeks = chunk(calendarDays, 7);
      const weekDayLabels = ['일', '월', '화', '수', '목', '금', '토'];

      const slotMap = useMemo(() => allocateSlots(events), [events]);

      const getDayData = (date: Date) => data.find(d => d.date === format(date, 'yyyy-MM-dd'));

      const getOverflowCount = (date: Date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayEvts = events.filter(e => e.startDate <= dateStr && e.endDate >= dateStr);
            return dayEvts.filter(e => (slotMap.get(e.id) ?? 0) >= MAX_EVENT_BARS).length;
      };

      const getStatusColor = (dayData?: DailySummary) => {
            if (!dayData) return 'bg-gray-50 dark:bg-gray-800/50';
            if (dayData.isRest) return 'bg-amber-50 dark:bg-amber-900/20';
            if (!dayData.hasPlan || dayData.totalTasks === 0) return 'bg-gray-50 dark:bg-gray-800/50';
            if (dayData.completionRate >= 80) return 'bg-indigo-50 dark:bg-indigo-900/30';
            if (dayData.completionRate >= 50) return 'bg-blue-50 dark:bg-blue-900/20';
            return 'bg-rose-50 dark:bg-rose-900/20';
      };

      const getProgressBarColor = (rate: number) => {
            if (rate >= 80) return 'mystic-solid';
            if (rate >= 50) return 'bg-amber-400';
            if (rate > 0) return 'bg-rose-400';
            return 'bg-gray-300 dark:bg-gray-600';
      };

      return (
            <div className={classNames("bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col", className)}>
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 mb-1">
                        {weekDayLabels.map((day, idx) => (
                              <div
                                    key={day}
                                    className={classNames(
                                          "text-center text-xs font-bold py-2 uppercase tracking-wider",
                                          idx === 0 ? "text-rose-500" : (idx === 6 ? "text-blue-500" : "text-gray-400")
                                    )}
                              >
                                    {day}
                              </div>
                        ))}
                  </div>

                  {/* Week Rows */}
                  <div className="flex-1 flex flex-col gap-1 min-h-0">
                        {weeks.map((weekDays, weekIdx) => {
                              const segments = getWeekSegments(events, weekDays, slotMap);
                              const visibleSegments = segments.filter(s => s.slot < MAX_EVENT_BARS);
                              const maxVisibleSlot = visibleSegments.length > 0
                                    ? Math.max(...visibleSegments.map(s => s.slot))
                                    : -1;
                              const eventRows = maxVisibleSlot + 1;
                              const eventAreaPx = eventRows * EVENT_BAR_HEIGHT;

                              return (
                                    <div key={weekIdx} className="relative flex-1 min-h-0">
                                          {/* Day Cells Grid */}
                                          <div className="grid grid-cols-7 gap-1 h-full">
                                                {weekDays.map((day) => {
                                                      const dayData = getDayData(day);
                                                      const dateStr = format(day, 'yyyy-MM-dd');
                                                      const isCurrentMonth = isSameMonth(day, monthStart);
                                                      const isSelected = !batchMode && selectedDate ? isSameDay(day, selectedDate) : false;
                                                      const isBatchSelected = batchMode && batchSelectedDates?.has(dateStr);
                                                      const isTodayDate = isToday(day);
                                                      const dayOfWeek = day.getDay();
                                                      const MoodEntry = dayData?.mood ? MOOD_ICON[dayData.mood] : null;
                                                      const overflow = !batchMode ? getOverflowCount(day) : 0;

                                                      return (
                                                            <div
                                                                  key={day.toISOString()}
                                                                  onClick={() => {
                                                                        if (batchMode && onToggleBatchDate && isCurrentMonth) {
                                                                              onToggleBatchDate(dateStr);
                                                                        } else if (!batchMode) {
                                                                              onSelectDay(day);
                                                                        }
                                                                  }}
                                                                  className={classNames(
                                                                        "rounded-xl cursor-pointer transition-all duration-200 flex flex-col relative group",
                                                                        batchMode
                                                                              ? (isBatchSelected
                                                                                    ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md"
                                                                                    : classNames(getStatusColor(dayData), isCurrentMonth && "hover:ring-1 hover:ring-indigo-200"))
                                                                              : classNames(
                                                                                    getStatusColor(dayData),
                                                                                    isSelected
                                                                                          ? "ring-2 ring-indigo-500 shadow-md"
                                                                                          : "hover:ring-1 hover:ring-indigo-200 dark:hover:ring-indigo-800 hover:shadow-sm"
                                                                              ),
                                                                        !isCurrentMonth && "opacity-30 grayscale"
                                                                  )}
                                                            >
                                                                  {/* Batch Checkbox */}
                                                                  {batchMode && isCurrentMonth && (
                                                                        <div className={classNames(
                                                                              "absolute top-1.5 right-1.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all z-20",
                                                                              isBatchSelected
                                                                                    ? "mystic-solid border-transparent shadow-sm"
                                                                                    : "border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90"
                                                                        )}>
                                                                              {isBatchSelected && <Check className="w-3 h-3 text-white" />}
                                                                        </div>
                                                                  )}

                                                                  {/* Quick Detail Button */}
                                                                  {!batchMode && isCurrentMonth && onOpenDetail && (
                                                                        <button
                                                                              className="absolute top-1 right-1 w-5 h-5 rounded-full mystic-solid opacity-80 text-white group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 mystic-solid-hover"
                                                                              onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onOpenDetail(day);
                                                                              }}
                                                                              title="상세 보기"
                                                                        >
                                                                              <Plus className="w-3 h-3" />
                                                                        </button>
                                                                  )}

                                                                  {/* Date Row */}
                                                                  <div className="flex justify-between items-start px-2 pt-1.5">
                                                                        <span className={classNames(
                                                                              "text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full",
                                                                              isTodayDate
                                                                                    ? "mystic-solid text-white"
                                                                                    : (dayOfWeek === 0 ? "text-rose-500" : (dayOfWeek === 6 ? "text-blue-500" : "text-gray-700 dark:text-gray-300"))
                                                                        )}>
                                                                              {format(day, 'd')}
                                                                        </span>
                                                                        {MoodEntry && !batchMode && (
                                                                              <MoodEntry.icon className={classNames("w-3.5 h-3.5", MoodEntry.color)} />
                                                                        )}
                                                                  </div>

                                                                  {/* Event Bar Spacer */}
                                                                  {eventAreaPx > 0 && !batchMode && (
                                                                        <div style={{ height: `${eventAreaPx}px` }} className="shrink-0" />
                                                                  )}

                                                                  {/* Overflow */}
                                                                  {overflow > 0 && (
                                                                        <div className="px-2 text-[9px] text-gray-400 font-bold leading-tight">
                                                                              +{overflow}개 더
                                                                        </div>
                                                                  )}

                                                                  {/* Content */}
                                                                  <div className="flex-1 px-2 mt-0.5 min-h-0 overflow-hidden">
                                                                        {dayData?.appliedTemplateName && (
                                                                              <div className="flex items-center gap-0.5 mb-0.5">
                                                                                    <FileText className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                                                                                    <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 truncate">
                                                                                          {dayData.appliedTemplateName}
                                                                                    </span>
                                                                              </div>
                                                                        )}
                                                                        {dayData?.isRest ? (
                                                                              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                                                    <Coffee className="w-3 h-3" />
                                                                                    <span className="text-[10px] font-bold">휴식</span>
                                                                              </div>
                                                                        ) : dayData?.memoSnippet ? (
                                                                              <p className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-2 leading-snug break-all font-medium">
                                                                                    {dayData.memoSnippet}
                                                                              </p>
                                                                        ) : dayData?.hasPlan && dayData.totalTasks > 0 ? (
                                                                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                                                    <ListTodo className="w-3 h-3" />
                                                                                    <span className="text-[10px] font-bold">{dayData.totalTasks}개</span>
                                                                              </div>
                                                                        ) : null}
                                                                  </div>

                                                                  {/* Progress Bar */}
                                                                  {dayData?.hasPlan && !dayData.isRest && dayData.totalTasks > 0 && (
                                                                        <div className="mt-auto px-2 pb-1.5 pt-0.5">
                                                                              <div className="flex items-center justify-between mb-0.5">
                                                                                    <div className="flex items-center gap-0.5">
                                                                                          <CheckCircle2 className="w-2.5 h-2.5 text-gray-400" />
                                                                                          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                                                                                                {dayData.completedTasks}/{dayData.totalTasks}
                                                                                          </span>
                                                                                    </div>
                                                                                    {dayData.completionRate > 0 && (
                                                                                          <span className="text-[9px] font-bold text-gray-400">
                                                                                                {Math.round(dayData.completionRate)}%
                                                                                          </span>
                                                                                    )}
                                                                              </div>
                                                                              <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                                                    <div
                                                                                          className={classNames("h-full rounded-full transition-all duration-300", getProgressBarColor(dayData.completionRate))}
                                                                                          style={{ width: `${dayData.completionRate}%` }}
                                                                                    />
                                                                              </div>
                                                                        </div>
                                                                  )}

                                                                  {dayData?.isRest && (
                                                                        <div className="mt-auto pb-1.5 px-2 flex justify-end">
                                                                              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      );
                                                })}
                                          </div>

                                          {/* Event Bars Overlay */}
                                          {eventRows > 0 && !batchMode && (
                                                <div
                                                      className="absolute inset-x-0 grid grid-cols-7 gap-x-1 pointer-events-none"
                                                      style={{
                                                            top: '28px',
                                                            gridTemplateRows: `repeat(${eventRows}, 18px)`,
                                                            rowGap: '2px',
                                                      }}
                                                >
                                                      {visibleSegments.map(segment => (
                                                            <div
                                                                  key={`${segment.event.id}-w${weekIdx}`}
                                                                  className="pointer-events-auto"
                                                                  style={{
                                                                        gridColumn: `${segment.colStart + 1} / span ${segment.colSpan}`,
                                                                        gridRow: segment.slot + 1,
                                                                  }}
                                                            >
                                                                  <div
                                                                        className={classNames(
                                                                              "h-full flex items-center overflow-hidden text-[10px] font-bold text-white cursor-pointer hover:brightness-110 transition-all",
                                                                              segment.isEventStart && "rounded-l-[4px] ml-0.5",
                                                                              segment.isEventEnd && "rounded-r-[4px] mr-0.5",
                                                                              !segment.isEventStart && !segment.isEventEnd && "",
                                                                        )}
                                                                        style={{ backgroundColor: segment.event.color }}
                                                                        onClick={(e) => {
                                                                              e.stopPropagation();
                                                                              onEventClick?.(segment.event);
                                                                        }}
                                                                        title={segment.event.title}
                                                                  >
                                                                        {segment.isEventStart && (
                                                                              <span className="truncate px-1.5 whitespace-nowrap">{segment.event.title}</span>
                                                                        )}
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          )}
                                    </div>
                              );
                        })}
                  </div>
            </div>
      );
};

export default MonthlyCalendarGrid;
