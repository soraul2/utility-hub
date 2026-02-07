import React from 'react';
import { Clock, Timer, Coffee } from 'lucide-react';
import type { Task } from '../../../types/routine';

interface RestModeCardProps {
  nextTask: Task;
  completedCount: number;
  totalScheduled: number;
  currentMinutes: number;
  currentSeconds: number;
  timeToMinutes: (timeStr?: string) => number;
  onFocusMode: () => void;
}

export const RestModeCard: React.FC<RestModeCardProps> = ({
  nextTask,
  completedCount,
  totalScheduled,
  currentMinutes,
  currentSeconds,
  timeToMinutes,
  onFocusMode,
}) => {
  const restDiff = timeToMinutes(nextTask.startTime) - currentMinutes;
  const restSecs = Math.max(0, restDiff * 60 - currentSeconds);
  const restMins = Math.floor(restSecs / 60);
  const restSecond = restSecs % 60;

  return (
    <div className="relative overflow-hidden mystic-gradient-muted-br dark:from-gray-800 rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700 shadow-lg">
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
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">{'\uc26c\ub294 \uc2dc\uac04'}</span>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {'\ub2e4\uc74c \uc77c\uc815'} {nextTask.startTime?.substring(0, 5)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-gray-400">
              <Timer className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase">{'\ub0a8\uc740 \uc2dc\uac04'}</span>
            </div>
            <div className="text-lg font-black tabular-nums text-indigo-600 dark:text-indigo-400">
              {restDiff <= 0 ? '\uacf7 \uc2dc\uc791' : restDiff < 60
                ? `${restMins}\ubd84 ${String(restSecond).padStart(2, '0')}\ucd08`
                : (() => {
                    const h = Math.floor(restDiff / 60);
                    const m = restDiff % 60;
                    return m > 0 ? `${h}\uc2dc\uac04 ${m}\ubd84` : `${h}\uc2dc\uac04`;
                  })()
              }
            </div>
          </div>
        </div>

        {/* Status message */}
        <h3 className="text-lg font-black mb-3 leading-tight text-gray-900 dark:text-white">
          {restDiff <= 5 ? '\uacf7 \ub2e4\uc74c \uc77c\uc815\uc774 \uc2dc\uc791\ub429\ub2c8\ub2e4'
            : restDiff <= 15 ? '\uc7a0\uc2dc \ud6c4 \uc2dc\uc791\uc774\uc5d0\uc694, \uc900\ube44\ud558\uc138\uc694'
            : restDiff <= 30 ? '\uc5ec\uc720\uc788\uac8c \uc26c\uc5b4\uac00\uc138\uc694'
            : '\ucda9\ubd84\ud788 \uc26c\uace0 \uc5d0\ub108\uc9c0\ub97c \ucda9\uc804\ud558\uc138\uc694'}
        </h3>

        {/* Progress stats */}
        <div className="flex items-center gap-3 mb-4 text-xs">
          <span className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-md font-bold text-indigo-600 dark:text-indigo-400">
            {completedCount}/{totalScheduled} {'\uc644\ub8cc'}
          </span>
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md font-bold text-gray-600 dark:text-gray-300">
            {nextTask.durationMinutes || 60}{'\ubd84 \uc608\uc815'}
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
            <span>{'\ud734\uc2dd \uc9c4\ud589'}</span>
            <span>{restDiff <= 0 ? '\uc644\ub8cc' : `${nextTask.startTime?.substring(0, 5)} \uc2dc\uc791`}</span>
          </div>
          <div className="h-2 bg-gray-200/60 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full mystic-gradient-r rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(2, (1 - restSecs / Math.max(1, restDiff * 60)) * 100))}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onFocusMode}
          className="w-full py-3 mystic-solid mystic-solid-hover text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
        >
          <Coffee className="w-5 h-5" />
          {'\uc26c\uc5b4\uac00\uae30'}
        </button>
      </div>
    </div>
  );
};
