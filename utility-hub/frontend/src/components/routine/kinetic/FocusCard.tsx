import React, { useState } from 'react';
import { Flame, SkipForward, CheckCircle2, Circle, Timer, Focus } from 'lucide-react';
import type { Task } from '../../../types/routine';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../../../lib/constants/routine';
import { useFocusTimer } from '../../../hooks/routine/useFocusTimer';
import { AllDoneCard } from './AllDoneCard';
import { FocusTimerOverlay } from './FocusTimerOverlay';
import { RestModeCard } from './RestModeCard';

interface FocusCardProps {
  tasks: Task[];
  onToggleTask: (taskId: number) => Promise<void>;
}

export const FocusCard: React.FC<FocusCardProps> = ({ tasks, onToggleTask }) => {
  const [isToggling, setIsToggling] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const {
    currentMinutes,
    currentSeconds,
    currentTask,
    nextTask,
    nextDisplayTask,
    remainingTime,
    progress,
    getTimeUntilDisplay,
    timeToMinutes,
  } = useFocusTimer(tasks);

  const handleToggle = async (taskId: number) => {
    setIsToggling(true);
    try {
      await onToggleTask(taskId);
    } finally {
      setIsToggling(false);
    }
  };

  // All tasks done or no scheduled tasks
  if (!currentTask && !nextTask) {
    const completedCount = tasks.filter(t => t.completed).length;
    const totalScheduled = tasks.filter(t => t.startTime).length;
    return <AllDoneCard completedCount={completedCount} totalScheduled={totalScheduled} />;
  }

  // Focus Mode Timer Overlay
  const focusTarget = currentTask || nextTask;
  if (isFocusMode && focusTarget) {
    return (
      <FocusTimerOverlay
        focusTarget={focusTarget}
        isWaiting={!currentTask && !!nextTask}
        currentMinutes={currentMinutes}
        currentSeconds={currentSeconds}
        timeToMinutes={timeToMinutes}
        onToggleTask={onToggleTask}
        onClose={() => setIsFocusMode(false)}
      />
    );
  }

  // Category display helper
  const getCategoryLabel = (task: Task) => {
    if (task.category && CATEGORY_CONFIG[task.category]) {
      const cfg = CATEGORY_CONFIG[task.category];
      return `${cfg.emoji} ${task.category === 'WORK' ? 'Work' : task.category === 'HEALTH' ? 'Health' : task.category === 'STUDY' ? 'Study' : 'Personal'}`;
    }
    return '\ud83c\udff7\ufe0f General';
  };

  return (
    <div className="space-y-4">
      {/* Current Task - NOW */}
      {currentTask ? (
        <div className="relative overflow-hidden mystic-gradient-br rounded-2xl p-6 text-white shadow-xl">
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
                  <span className="text-[10px] font-bold uppercase">{'\ub0a8\uc740 \uc2dc\uac04'}</span>
                </div>
                <div className="text-lg font-black tabular-nums">
                  {remainingTime || '\uc644\ub8cc \uc784\ubc15'}
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
                {getCategoryLabel(currentTask)}
              </span>
              <span className={`px-2 py-1 rounded-md font-bold ${
                currentTask.priority ? PRIORITY_CONFIG[currentTask.priority].badgeBg : 'bg-blue-500/30'
              }`}>
                {currentTask.priority}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] font-bold text-indigo-200 mb-1">
                <span>{'\uc9c4\ud589\ub960'}</span>
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
                className="flex-1 py-3 min-h-[44px] bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors backdrop-blur-sm"
              >
                <Focus className="w-5 h-5" />
                {'\uc9d1\uc911\ud558\uae30'}
              </button>
              <button
                onClick={() => handleToggle(currentTask.id)}
                disabled={isToggling}
                className="flex-1 py-3 min-h-[44px] bg-white text-indigo-700 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 active:bg-indigo-100 transition-colors disabled:opacity-50 shadow-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                {isToggling ? '\ucc98\ub9ac \uc911...' : '\uc644\ub8cc\ud558\uae30'}
              </button>
            </div>
          </div>
        </div>
      ) : nextTask ? (
        <RestModeCard
          nextTask={nextTask}
          completedCount={tasks.filter(t => t.completed).length}
          totalScheduled={tasks.filter(t => t.startTime).length}
          currentMinutes={currentMinutes}
          currentSeconds={currentSeconds}
          timeToMinutes={timeToMinutes}
          onFocusMode={() => setIsFocusMode(true)}
        />
      ) : null}

      {/* Next Task - compact card */}
      {nextDisplayTask && (
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm">
          <SkipForward className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 shrink-0">NEXT</span>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate flex-1">{nextDisplayTask.title}</h4>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 shrink-0">
            <span className="font-bold">{nextDisplayTask.startTime?.substring(0, 5)}</span>
            <span>{'\xb7'}</span>
            <span>{getTimeUntilDisplay()}</span>
          </div>
          <button
            onClick={() => handleToggle(nextDisplayTask.id)}
            disabled={isToggling}
            className="p-1 text-gray-300 hover:text-green-500 rounded transition-colors shrink-0"
            title={'\ubbf8\ub9ac \uc644\ub8cc'}
          >
            <Circle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
