import React from 'react';
import { Clock, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface TimelineRangeSelectorProps {
      startHour: number;
      endHour: number;
      onChange: (range: { startHour: number; endHour: number }) => void;
      compact?: boolean;
}

export const TimelineRangeSelector: React.FC<TimelineRangeSelectorProps> = ({
      startHour,
      endHour,
      onChange,
      compact = false
}) => {
      const adjustStart = (delta: number) => {
            const next = Math.min(endHour - 1, Math.max(0, startHour + delta));
            onChange({ startHour: next, endHour });
      };

      const adjustEnd = (delta: number) => {
            const next = Math.min(23, Math.max(startHour + 1, endHour + delta));
            onChange({ startHour, endHour: next });
      };

      const fmt = (h: number) => `${String(h).padStart(2, '0')}:00`;

      const btnBase = compact
            ? 'w-7 h-7 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all active:scale-90 flex items-center justify-center'
            : 'w-8 h-8 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all active:scale-90 flex items-center justify-center';

      const iconSize = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';

      return (
            <div className={`flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl ${compact ? 'px-2.5 py-1.5' : 'px-3 py-2'}`}>
                  <Clock className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-indigo-400 shrink-0`} />

                  {/* Start Hour */}
                  <div className="flex items-center gap-0.5">
                        <button type="button" onClick={() => adjustStart(-1)} className={btnBase} title="1시간 줄이기">
                              <ChevronLeft className={iconSize} />
                        </button>
                        <span className={`${compact ? 'text-xs min-w-[40px]' : 'text-sm min-w-[44px]'} font-black text-gray-800 dark:text-gray-100 text-center tabular-nums`}>
                              {fmt(startHour)}
                        </span>
                        <button type="button" onClick={() => adjustStart(1)} className={btnBase} title="1시간 늘리기">
                              <ChevronRight className={iconSize} />
                        </button>
                  </div>

                  {/* Separator */}
                  <ArrowRight className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-gray-300 dark:text-gray-600 mx-0.5 shrink-0`} />

                  {/* End Hour */}
                  <div className="flex items-center gap-0.5">
                        <button type="button" onClick={() => adjustEnd(-1)} className={btnBase} title="1시간 줄이기">
                              <ChevronLeft className={iconSize} />
                        </button>
                        <span className={`${compact ? 'text-xs min-w-[40px]' : 'text-sm min-w-[44px]'} font-black text-gray-800 dark:text-gray-100 text-center tabular-nums`}>
                              {fmt(endHour)}
                        </span>
                        <button type="button" onClick={() => adjustEnd(1)} className={btnBase} title="1시간 늘리기">
                              <ChevronRight className={iconSize} />
                        </button>
                  </div>
            </div>
      );
};
