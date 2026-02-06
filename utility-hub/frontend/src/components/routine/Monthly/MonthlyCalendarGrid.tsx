import React from 'react';
import {
      format,
      startOfMonth,
      endOfMonth,
      startOfWeek,
      endOfWeek,
      eachDayOfInterval,
      isSameMonth,
      isSameDay,
      isToday
} from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DailySummary } from '@/types/routine';
import classNames from 'classnames';

interface MonthlyCalendarGridProps {
      year: number;
      month: number;
      data: DailySummary[];
      selectedDate: Date | null;
      onSelectDay: (date: Date) => void;
}

const MonthlyCalendarGrid: React.FC<MonthlyCalendarGridProps> = ({
      year,
      month,
      data,
      selectedDate,
      onSelectDay,
}) => {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

      const calendarDays = eachDayOfInterval({
            start: startDate,
            end: endDate,
      });

      const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

      // Helper to find data for a specific day
      const getDayData = (date: Date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            return data.find(d => d.date === dateStr);
      };

      const getStatusColor = (dayData?: DailySummary) => {
            if (!dayData) return 'bg-gray-50 dark:bg-gray-800/50'; // No data
            if (dayData.isRest) return 'bg-amber-50 dark:bg-amber-900/20';
            if (!dayData.hasPlan) return 'bg-gray-50 dark:bg-gray-800/50';

            // Completion rate based color
            if (dayData.completionRate >= 80) return 'bg-indigo-50 dark:bg-indigo-900/30';
            if (dayData.completionRate >= 50) return 'bg-blue-50 dark:bg-blue-900/20';
            return 'bg-rose-50 dark:bg-rose-900/20';
      };

      const getStatusIndicator = (dayData?: DailySummary) => {
            if (!dayData) return null;
            if (dayData.isRest) return <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />;
            if (!dayData.hasPlan) return null;

            if (dayData.completionRate >= 100) return <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />;
            if (dayData.completionRate >= 80) return <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />;
            if (dayData.completionRate > 0) return <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />;
            return <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />;
      };

      return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 mb-2">
                        {weekDays.map((day, idx) => (
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

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 md:gap-2">
                        {calendarDays.map((day, idx) => {
                              const dayData = getDayData(day);
                              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                              const isCurrentMonth = isSameMonth(day, monthStart);
                              const isTodayDate = isToday(day);

                              return (
                                    <div
                                          key={day.toISOString()}
                                          onClick={() => onSelectDay(day)}
                                          className={classNames(
                                                "min-h-[120px] rounded-xl p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between relative border-2",
                                                getStatusColor(dayData),
                                                isSelected
                                                      ? "border-indigo-500 shadow-md transform scale-[1.02] z-10"
                                                      : "border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm",
                                                !isCurrentMonth && "opacity-30 grayscale"
                                          )}
                                    >
                                          {/* Date Number */}
                                          <div className="flex justify-between items-start">
                                                <span className={classNames(
                                                      "text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full",
                                                      isTodayDate
                                                            ? "bg-indigo-600 text-white"
                                                            : (format(day, 'e') === '1' ? "text-rose-500" : (format(day, 'e') === '7' ? "text-blue-500" : "text-gray-700 dark:text-gray-300"))
                                                )}>
                                                      {format(day, 'd')}
                                                </span>
                                          </div>
                                          {dayData?.memoSnippet && (
                                                <div className="mt-2 flex-1">
                                                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-snug break-all font-medium">
                                                            {dayData.memoSnippet}
                                                      </p>
                                                </div>
                                          )}

                                          {/* Status Dot / Info */}
                                          <div className="flex justify-end items-end gap-1">
                                                {getStatusIndicator(dayData)}
                                          </div>
                                    </div>
                              );
                        })}
                  </div>
            </div>
      );
};

export default MonthlyCalendarGrid;
