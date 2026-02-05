import React from 'react';
import type { Task } from '../../../types/routine';
import { TaskCategoryBadge } from '../ui/TaskCategoryBadge';
import { Clock, CheckCircle2, Circle, Trash2, MoreVertical } from 'lucide-react';
import { useRoutineStore } from '../../../stores/useRoutineStore';

interface TimelineItemProps {
      task: Task;
      showTime?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ task, showTime = true }) => {
      const { toggleTask, deleteTask } = useRoutineStore();
      const [showActions, setShowActions] = React.useState(false);

      // Format time range string
      const timeRange = task.startTime
            ? `${task.startTime.slice(0, 5)}${task.endTime ? ` - ${task.endTime.slice(0, 5)}` : ''}`
            : 'All Day';

      const priorityColor = {
            HIGH: 'border-l-4 border-l-red-500',
            MEDIUM: 'border-l-4 border-l-yellow-500',
            LOW: 'border-l-4 border-l-green-500',
      };

      return (
            <div
                  className="group relative flex gap-4 animate-in slide-in-from-left-4 duration-300"
                  onMouseEnter={() => setShowActions(true)}
                  onMouseLeave={() => setShowActions(false)}
            >
                  {/* Time Column */}
                  {showTime && (
                        <div className="w-16 flex-shrink-0 flex flex-col items-end pt-1">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {task.startTime ? task.startTime.slice(0, 5) : ''}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {task.endTime ? task.endTime.slice(0, 5) : ''}
                              </span>
                        </div>
                  )}

                  {/* Timeline Line & Dot */}
                  <div className="relative flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full border-2 z-10 bg-white dark:bg-gray-900 ${task.completed
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-gray-300 dark:border-gray-600'
                              }`} />
                        <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-800 -mt-1" />
                  </div>

                  {/* Task Card */}
                  <div
                        className={`relative flex-1 mb-6 p-4 rounded-xl border transition-all duration-200 ${task.completed
                              ? 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
                              } ${priorityColor[task.priority || 'MEDIUM']}`}
                  >
                        <div className="flex gap-4 items-start">
                              {/* Toggle Completion (Left Side) */}
                              <button
                                    onClick={() => toggleTask(task.id)}
                                    className={`mt-0.5 flex-shrink-0 p-1 rounded-full transition-all duration-200 ${task.completed
                                          ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                                          : 'text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                          }`}
                              >
                                    {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                              </button>

                              <div className="flex-1 space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                          <h3 className={`font-semibold text-base break-words ${task.completed
                                                ? 'text-gray-400 line-through decoration-gray-300'
                                                : 'text-gray-900 dark:text-gray-100'
                                                }`}>
                                                {task.title}
                                          </h3>
                                          <TaskCategoryBadge category={task.category} size="sm" />
                                    </div>

                                    {(task.description || !showTime) && (
                                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                {!showTime && <span className="mr-2 inline-flex items-center gap-1 text-xs font-mono"><Clock size={10} /> {timeRange}</span>}
                                                {task.description}
                                          </p>
                                    )}
                              </div>

                              {/* Action area (Right Side) - Space reserved for hover actions or more-options if needed */}
                              <div className="w-6 flex-shrink-0" />
                        </div>

                        {/* Hover Actions (Top Right) */}
                        <div className={`absolute top-2 right-2 transition-all duration-200 ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
                              }`}>
                              <div className="flex items-center bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-100 dark:border-gray-700 p-1">
                                    <button
                                          onClick={(e) => {
                                                e.stopPropagation();
                                                deleteTask(task.id);
                                          }}
                                          className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                                          title="Delete task"
                                    >
                                          <Trash2 size={16} />
                                    </button>
                              </div>
                        </div>
                  </div>
            </div>
      );
};
