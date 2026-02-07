import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Task } from '../../types/routine';
import { timeToMinutes } from '../../lib/utils/routine';

export interface UseFocusTimerReturn {
  currentTime: Date;
  currentMinutes: number;
  currentSeconds: number;
  scheduledTasks: Task[];
  currentTask: Task | undefined;
  nextTask: Task | undefined;
  taskAfterNext: Task | undefined;
  nextDisplayTask: Task | undefined;
  remainingTime: string | null;
  progress: number;
  getTimeUntilDisplay: () => string | null;
  timeToMinutes: (timeStr?: string) => number;
}

export function useFocusTimer(tasks: Task[]): UseFocusTimerReturn {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentSeconds = currentTime.getSeconds();

  // Find current and next tasks
  const scheduledTasks = useMemo(() =>
    tasks
      .filter(t => t.startTime && !t.completed)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)),
    [tasks]
  );

  const currentTask = useMemo(() =>
    scheduledTasks.find(task => {
      const start = timeToMinutes(task.startTime);
      const end = start + (task.durationMinutes || 60);
      return currentMinutes >= start && currentMinutes < end;
    }),
    [scheduledTasks, currentMinutes]
  );

  const nextTask = useMemo(() =>
    scheduledTasks.find(task => {
      const start = timeToMinutes(task.startTime);
      return start > currentMinutes;
    }),
    [scheduledTasks, currentMinutes]
  );

  // Task after nextTask (for NEXT card in waiting mode)
  const taskAfterNext = useMemo(() =>
    nextTask
      ? scheduledTasks.find(task =>
          timeToMinutes(task.startTime) > timeToMinutes(nextTask.startTime)
        )
      : undefined,
    [nextTask, scheduledTasks]
  );

  // Calculate remaining time for current task
  const getRemainingTime = useCallback((): string | null => {
    if (!currentTask) return null;
    const start = timeToMinutes(currentTask.startTime);
    const end = start + (currentTask.durationMinutes || 60);
    const remainingMinutes = end - currentMinutes;
    const remainingSeconds = 60 - currentSeconds;

    if (remainingMinutes <= 0) return null;

    const hours = Math.floor((remainingMinutes - 1) / 60);
    const mins = (remainingMinutes - 1) % 60;

    if (hours > 0) {
      return `${hours}\uc2dc\uac04 ${mins}\ubd84`;
    }
    return `${mins}\ubd84 ${remainingSeconds}\ucd08`;
  }, [currentTask, currentMinutes, currentSeconds]);

  // Calculate progress for current task
  const getProgress = useCallback((): number => {
    if (!currentTask) return 0;
    const start = timeToMinutes(currentTask.startTime);
    const duration = currentTask.durationMinutes || 60;
    const elapsed = currentMinutes - start;
    return Math.min(100, Math.max(0, (elapsed / duration) * 100));
  }, [currentTask, currentMinutes]);

  const remainingTime = getRemainingTime();
  const progress = getProgress();

  // Which task to display in NEXT card
  // NOW mode: show nextTask / Waiting mode: show taskAfterNext, fallback to nextTask
  const nextDisplayTask = currentTask ? nextTask : (taskAfterNext || nextTask);

  const getTimeUntilDisplay = useCallback((): string | null => {
    if (!nextDisplayTask) return null;
    const start = timeToMinutes(nextDisplayTask.startTime);
    const diff = start - currentMinutes;
    if (diff <= 0) return '\uacf7 \uc2dc\uc791';
    if (diff < 60) return `${diff}\ubd84 \ud6c4`;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return m > 0 ? `${h}\uc2dc\uac04 ${m}\ubd84 \ud6c4` : `${h}\uc2dc\uac04 \ud6c4`;
  }, [nextDisplayTask, currentMinutes]);

  return {
    currentTime,
    currentMinutes,
    currentSeconds,
    scheduledTasks,
    currentTask,
    nextTask,
    taskAfterNext,
    nextDisplayTask,
    remainingTime,
    progress,
    getTimeUntilDisplay,
    timeToMinutes,
  };
}
