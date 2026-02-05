import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Circle } from 'lucide-react';
import type { Task } from '../../../types/routine';

interface ExecutionTimelineProps {
      tasks: Task[];
      startHour: number;
      endHour: number;
      onToggleTask: (taskId: number) => Promise<void>;
}

const HOUR_WIDTH = 120;

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({
      tasks,
      startHour,
      endHour,
      onToggleTask
}) => {
      const [currentTime, setCurrentTime] = useState(new Date());

      // Update current time every minute
      useEffect(() => {
            const timer = setInterval(() => {
                  setCurrentTime(new Date());
            }, 60000);
            return () => clearInterval(timer);
      }, []);

      const placedTasks = tasks.filter(t => t.startTime).sort((a, b) => {
            const timeA = a.startTime || '00:00:00';
            const timeB = b.startTime || '00:00:00';
            return timeA.localeCompare(timeB);
      });

      const timeToMinutes = (timeStr?: string) => {
            if (!timeStr) return 0;
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
      };

      const timeToPos = (timeStr?: string) => {
            if (!timeStr) return 0;
            const minutes = timeToMinutes(timeStr);
            return (minutes - startHour * 60) * (HOUR_WIDTH / 60);
      };

      // Current time position
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      const currentTimePos = (currentMinutes - startHour * 60) * (HOUR_WIDTH / 60);
      const isCurrentTimeInRange = currentMinutes >= startHour * 60 && currentMinutes <= endHour * 60;

      // Calculate lanes for overlapping tasks
      const calculateLanes = () => {
            const sortedTasks = [...placedTasks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
            const lanes: number[] = [];
            const taskLanes: Map<number, number> = new Map();

            sortedTasks.forEach(task => {
                  const start = timeToMinutes(task.startTime);
                  const end = start + (task.durationMinutes || 60);
                  let laneIndex = 0;

                  while (laneIndex < lanes.length && lanes[laneIndex] > start) {
                        laneIndex++;
                  }

                  lanes[laneIndex] = end;
                  taskLanes.set(task.id, laneIndex);
            });

            return taskLanes;
      };

      const taskLanes = calculateLanes();

      const renderGrid = () => {
            const hoursCount = endHour >= startHour ? (endHour - startHour + 1) : (24 - startHour + endHour + 1);
            const hours = Array.from({ length: hoursCount }, (_, i) => (startHour + i) % 24);

            return hours.map(h => {
                  const hourMinutes = h * 60;
                  const isPast = currentMinutes > hourMinutes + 60;
                  const isCurrent = currentMinutes >= hourMinutes && currentMinutes < hourMinutes + 60;

                  return (
                        <div
                              key={h}
                              className={`inline-flex flex-col border-l transition-colors duration-300 ${
                                    isPast
                                          ? 'border-green-200 dark:border-green-900/50'
                                          : isCurrent
                                                ? 'border-indigo-300 dark:border-indigo-700'
                                                : 'border-gray-100 dark:border-gray-800'
                              }`}
                              style={{ width: HOUR_WIDTH, height: '100%' }}
                        >
                              <div className={`h-10 flex items-center px-3 border-b transition-colors duration-300 ${
                                    isPast
                                          ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
                                          : isCurrent
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30'
                                                : 'bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'
                              }`}>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                          isPast
                                                ? 'text-green-500'
                                                : isCurrent
                                                      ? 'text-indigo-600 dark:text-indigo-400'
                                                      : 'text-gray-400'
                                    }`}>
                                          {String(h).padStart(2, '0')}:00
                                    </span>
                              </div>
                              <div className={`flex-1 transition-colors duration-300 ${
                                    isPast
                                          ? 'bg-green-50/20 dark:bg-green-900/5'
                                          : 'bg-white dark:bg-gray-950'
                              }`} />
                        </div>
                  );
            });
      };

      return (
            <div className="relative bg-white dark:bg-gray-950 rounded-2xl border border-gray-200/60 dark:border-gray-800 overflow-hidden shadow-lg h-[280px]">
                  <div className="h-full overflow-x-auto overflow-y-hidden custom-scrollbar relative select-none">
                        {/* Grid Layer */}
                        <div className="absolute inset-0 flex whitespace-nowrap min-w-max pointer-events-none">
                              {renderGrid()}
                        </div>

                        {/* Current Time Indicator */}
                        {isCurrentTimeInRange && (
                              <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                    style={{ left: currentTimePos }}
                              >
                                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse" />
                                    <div className="absolute top-10 left-2 text-[10px] font-black text-red-600 bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900 whitespace-nowrap shadow-sm">
                                          {currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                              </div>
                        )}

                        {/* Tasks Layer */}
                        <div className="absolute inset-0 min-w-max mt-10 pointer-events-none h-[calc(100%-40px)]">
                              {placedTasks.map(task => {
                                    const left = timeToPos(task.startTime);
                                    const width = (task.durationMinutes || 60) * (HOUR_WIDTH / 60);
                                    const laneIndex = taskLanes.get(task.id) || 0;

                                    const taskStartMinutes = timeToMinutes(task.startTime);
                                    const taskEndMinutes = taskStartMinutes + (task.durationMinutes || 60);
                                    const isPast = currentMinutes >= taskEndMinutes;
                                    const isActive = currentMinutes >= taskStartMinutes && currentMinutes < taskEndMinutes;

                                    return (
                                          <div
                                                key={task.id}
                                                className={`absolute pointer-events-auto rounded-xl border-t-4 shadow-sm transition-all duration-300 cursor-pointer group ${
                                                      task.completed
                                                            ? 'bg-green-50/95 dark:bg-green-900/20 border-green-500'
                                                            : isActive
                                                                  ? 'bg-indigo-50/95 dark:bg-indigo-900/20 border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-700 animate-pulse'
                                                                  : isPast
                                                                        ? 'bg-gray-100/95 dark:bg-gray-800/50 border-gray-400 opacity-60'
                                                                        : task.priority === 'HIGH'
                                                                              ? 'bg-red-50/95 border-red-500'
                                                                              : task.priority === 'MEDIUM'
                                                                                    ? 'bg-amber-50/95 border-amber-500'
                                                                                    : 'bg-blue-50/95 border-blue-500'
                                                }`}
                                                style={{
                                                      left,
                                                      width: Math.max(width, 80),
                                                      top: laneIndex * 75 + 8,
                                                      height: 65
                                                }}
                                                onClick={() => onToggleTask(task.id)}
                                          >
                                                <div className="p-2 h-full flex flex-col relative overflow-hidden">
                                                      <div className="flex items-center justify-between mb-1">
                                                            <div className={`text-[9px] font-bold flex items-center gap-1 ${
                                                                  task.completed
                                                                        ? 'text-green-600'
                                                                        : isActive
                                                                              ? 'text-indigo-600'
                                                                              : 'text-gray-500'
                                                            }`}>
                                                                  <Clock className="w-2.5 h-2.5" />
                                                                  {task.startTime?.substring(0, 5)}
                                                            </div>
                                                            <div className={`transition-transform duration-200 ${
                                                                  task.completed ? 'scale-100' : 'scale-90 group-hover:scale-100'
                                                            }`}>
                                                                  {task.completed ? (
                                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                                  ) : (
                                                                        <Circle className="w-4 h-4 text-gray-300 group-hover:text-indigo-500" />
                                                                  )}
                                                            </div>
                                                      </div>
                                                      <h4 className={`text-xs font-bold truncate leading-tight ${
                                                            task.completed
                                                                  ? 'text-green-700 line-through'
                                                                  : isActive
                                                                        ? 'text-indigo-900'
                                                                        : 'text-gray-900'
                                                      }`}>
                                                            {task.title}
                                                      </h4>
                                                      <div className="mt-auto flex items-center gap-1">
                                                            <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">
                                                                  {task.category === 'WORK' ? '💼' :
                                                                        task.category === 'HEALTH' ? '💪' :
                                                                              task.category === 'STUDY' ? '📚' :
                                                                                    task.category === 'PERSONAL' ? '🏠' : '🏷️'}
                                                            </span>
                                                            <span className={`text-[8px] font-bold ${
                                                                  task.priority === 'HIGH' ? 'text-red-500' :
                                                                        task.priority === 'MEDIUM' ? 'text-amber-500' : 'text-blue-500'
                                                            }`}>
                                                                  {task.priority}
                                                            </span>
                                                      </div>

                                                      {/* Active indicator */}
                                                      {isActive && !task.completed && (
                                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-b animate-pulse" />
                                                      )}
                                                </div>
                                          </div>
                                    );
                              })}
                        </div>
                  </div>
            </div>
      );
};
