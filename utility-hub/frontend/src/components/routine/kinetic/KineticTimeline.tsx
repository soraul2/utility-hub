import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Trash2, Clock } from 'lucide-react';
import type { Task } from '../../../types/routine';
import { useRoutineStore } from '../../../stores/useRoutineStore';

interface KineticTimelineProps {
      tasks: Task[];
      isConfirmed?: boolean;
      startHour: number;
      endHour: number;
}

const HOUR_WIDTH = 140; // Reduced from 200 to fit 9-hour range better
const SNAP_INTERVAL = 15; // 15 minutes snap

export const KineticTimeline: React.FC<KineticTimelineProps> = ({ tasks, isConfirmed, startHour, endHour }) => {
      const { updateTask, deleteTask } = useRoutineStore();
      const containerRef = useRef<HTMLDivElement>(null);

      const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
      const [resizingTaskId, setResizingTaskId] = useState<number | null>(null);
      const [dragOffsetX, setDragOffsetX] = useState(0);
      const [ghostTime, setGhostTime] = useState<{ start: string; left: number; duration: number } | null>(null);

      const placedTasks = tasks.filter(t => t.startTime);

      const posToTime = (left: number) => {
            // Constrain left position to be non-negative
            const constrainedLeft = Math.max(0, left);

            const minutesFromStart = Math.floor(constrainedLeft / (HOUR_WIDTH / 60));
            const totalMinutes = startHour * 60 + minutesFromStart;

            // Constrain to timeline range
            const maxMinutes = endHour * 60;
            const constrainedMinutes = Math.min(totalMinutes, maxMinutes);

            const snappedMinutes = Math.round(constrainedMinutes / SNAP_INTERVAL) * SNAP_INTERVAL;

            // Ensure we don't go below startHour
            const finalMinutes = Math.max(startHour * 60, snappedMinutes);

            const h = Math.floor(finalMinutes / 60) % 24;
            const m = finalMinutes % 60;
            return {
                  str: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`,
                  minutes: finalMinutes
            };
      };

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

      const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            const taskId = Number(e.dataTransfer.getData('taskId'));
            if (!taskId || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const left = Math.max(0, e.clientX - rect.left + containerRef.current.scrollLeft);
            const { str: startTimeStr, minutes: startMinutes } = posToTime(left);

            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const duration = task.durationMinutes || 60;
            const endMinutes = Math.min((startMinutes + duration), endHour * 60);
            const endTimeStr = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}:00`;

            updateTask(taskId, { startTime: startTimeStr, endTime: endTimeStr });
            setGhostTime(null);
      };

      const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const rawLeft = e.clientX - rect.left + containerRef.current.scrollLeft - (draggedTaskId ? dragOffsetX : 0);
            const left = Math.max(0, rawLeft);
            const { minutes: snappedMinutes, str } = posToTime(left);

            const duration = draggedTaskId ? (tasks.find(t => t.id === draggedTaskId)?.durationMinutes || 60) : 60;

            setGhostTime({
                  start: str,
                  left: Math.max(0, (snappedMinutes - startHour * 60) * (HOUR_WIDTH / 60)),
                  duration: duration
            });
      };

      useEffect(() => {
            const handleMouseMove = (e: MouseEvent) => {
                  if (!containerRef.current || (!draggedTaskId && !resizingTaskId)) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  const currentLeft = e.clientX - rect.left + containerRef.current.scrollLeft;

                  if (draggedTaskId) {
                        const rawLeft = currentLeft - dragOffsetX;
                        const left = Math.max(0, rawLeft);
                        const { minutes: snappedMinutes, str } = posToTime(left);
                        setGhostTime({
                              start: str,
                              left: Math.max(0, (snappedMinutes - startHour * 60) * (HOUR_WIDTH / 60)),
                              duration: tasks.find(t => t.id === draggedTaskId)?.durationMinutes || 60
                        });
                  } else if (resizingTaskId) {
                        const task = tasks.find(t => t.id === resizingTaskId);
                        if (!task) return;
                        const startMin = timeToMinutes(task.startTime);
                        const currentMinutes = Math.max(0, currentLeft / (HOUR_WIDTH / 60));
                        const endMin = Math.max(startMin + SNAP_INTERVAL, Math.round(currentMinutes / SNAP_INTERVAL) * SNAP_INTERVAL);
                        const newDuration = Math.min(endMin - startMin, (endHour * 60) - startMin);

                        setGhostTime({
                              start: task.startTime!,
                              left: timeToPos(task.startTime!),
                              duration: newDuration
                        });
                  }
            };

            const handleMouseUp = () => {
                  if (draggedTaskId && ghostTime) {
                        const endMin = Math.min((timeToMinutes(ghostTime.start) + ghostTime.duration), endHour * 60);
                        const endTimeStr = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}:00`;
                        updateTask(draggedTaskId, { startTime: ghostTime.start, endTime: endTimeStr });
                  } else if (resizingTaskId && ghostTime) {
                        const endMin = Math.min((timeToMinutes(ghostTime.start) + ghostTime.duration), endHour * 60);
                        const endTimeStr = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}:00`;
                        updateTask(resizingTaskId, { durationMinutes: ghostTime.duration, endTime: endTimeStr });
                  }
                  setDraggedTaskId(null);
                  setResizingTaskId(null);
                  setGhostTime(null);
            };

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                  window.removeEventListener('mousemove', handleMouseMove);
                  window.removeEventListener('mouseup', handleMouseUp);
            };
      }, [draggedTaskId, resizingTaskId, ghostTime, tasks, updateTask, dragOffsetX]);

      const renderGrid = () => {
            const hoursCount = endHour >= startHour ? (endHour - startHour + 1) : (24 - startHour + endHour + 1);
            const hours = Array.from({ length: hoursCount }, (_, i) => (startHour + i) % 24);
            return hours.map(h => (
                  <div key={h} className="inline-flex flex-col border-l border-gray-100 dark:border-gray-800" style={{ width: HOUR_WIDTH, height: '100%' }}>
                        <div className="h-8 flex items-center px-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{String(h).padStart(2, '0')}:00</span>
                        </div>
                        <div className="flex-1 bg-white dark:bg-gray-950" />
                  </div>
            ));
      };

      return (
            <div className="relative bg-white dark:bg-gray-950 rounded-[2.5rem] border border-gray-200/60 dark:border-gray-800 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-none h-[650px]">
                  <div
                        ref={containerRef}
                        className="h-full overflow-x-auto overflow-y-hidden custom-scrollbar relative select-none"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                  >
                        {/* Grid Layer */}
                        <div className="absolute inset-0 flex whitespace-nowrap min-w-max pointer-events-none">
                              {renderGrid()}
                        </div>

                        {/* Tasks Layer */}
                        <div className="absolute inset-0 min-w-max mt-8 pointer-events-none h-[calc(100%-32px)]">
                              {ghostTime && (
                                    <div
                                          className="absolute top-4 bottom-4 rounded-2xl border-2 border-dashed border-indigo-400 bg-indigo-50/20 z-0 transition-all duration-75"
                                          style={{
                                                left: ghostTime.left,
                                                width: ghostTime.duration * (HOUR_WIDTH / 60)
                                          }}
                                    >
                                          <div className="absolute -top-6 left-2 text-[10px] font-black text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-100 italic">
                                                {ghostTime.start.substring(0, 5)}
                                          </div>
                                    </div>
                              )}

                              {(() => {
                                    const sortedTasks = [...placedTasks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
                                    const lanes: number[] = []; // Stores the end time of the last task in each lane

                                    return sortedTasks.map(task => {
                                          const start = timeToMinutes(task.startTime);
                                          const end = start + (task.durationMinutes || 60);
                                          let laneIndex = 0;

                                          // Find the first available lane
                                          while (laneIndex < lanes.length && lanes[laneIndex] > start) {
                                                laneIndex++;
                                          }

                                          // Update or add new lane
                                          lanes[laneIndex] = end;

                                          const left = timeToPos(task.startTime);
                                          const width = (task.durationMinutes || 60) * (HOUR_WIDTH / 60);
                                          const isDragging = draggedTaskId === task.id;
                                          const isResizing = resizingTaskId === task.id;

                                          return (
                                                <div
                                                      key={task.id}
                                                      className={`absolute pointer-events-auto rounded-2xl border-t-[6px] shadow-sm transition-all duration-200 ${isDragging || isResizing ? 'opacity-20 scale-95' : 'hover:shadow-xl hover:z-10 group'
                                                            } ${task.priority === 'HIGH' ? 'bg-red-50/95 border-red-500 text-red-950' :
                                                                  task.priority === 'MEDIUM' ? 'bg-amber-50/95 border-amber-500 text-amber-950' :
                                                                        'bg-blue-50/95 border-blue-500 text-blue-950'
                                                            }`}
                                                      style={{
                                                            left,
                                                            width,
                                                            top: laneIndex * 110 + 16,
                                                            height: 100
                                                      }}
                                                >
                                                      <div className="p-4 h-full flex flex-col relative">
                                                            <div
                                                                  className="flex-1 cursor-grab active:cursor-grabbing"
                                                                  onMouseDown={(e) => {
                                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                                        setDraggedTaskId(task.id);
                                                                        setDragOffsetX(e.clientX - rect.left);
                                                                  }}
                                                                  onTouchStart={(e) => {
                                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                                        setDraggedTaskId(task.id);
                                                                        setDragOffsetX(e.touches[0].clientX - rect.left);
                                                                  }}
                                                            >
                                                                  <div className="flex items-center justify-between mb-2">
                                                                        <div className="text-[10px] font-black opacity-60 flex items-center gap-1">
                                                                              <Clock className="w-3 h-3" />
                                                                              {task.startTime?.substring(0, 5)} - {task.endTime?.substring(0, 5)}
                                                                        </div>
                                                                        <button
                                                                              onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                                                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50/80 dark:hover:bg-red-900/30 rounded-lg opacity-60 group-hover:opacity-100 transition-all hover:scale-110"
                                                                              title="Delete task"
                                                                        >
                                                                              <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                  </div>
                                                                  <h4 className="text-sm font-black truncate leading-tight">{task.title}</h4>
                                                            </div>

                                                            <div className="mt-auto flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                                                  <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                                        {task.category === 'WORK' ? '💼 WORK' :
                                                                              task.category === 'HEALTH' ? '💪 HEALTH' :
                                                                                    task.category === 'STUDY' ? '📚 STUDY' :
                                                                                          task.category === 'PERSONAL' ? '🏠 PERSONAL' : '🏷️ GENERAL'}
                                                                  </span>
                                                                  <div className="flex items-center gap-1.5">
                                                                        <div className={`w-2 h-2 rounded-full ${task.priority === 'HIGH' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                                                              task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                                                                              }`} title={task.priority} />
                                                                        <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                                                                  </div>
                                                            </div>

                                                            {/* Resize Handle */}
                                                            <div
                                                                  className="absolute -right-1 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center group/resize"
                                                                  onMouseDown={(e) => {
                                                                        e.stopPropagation();
                                                                        setResizingTaskId(task.id);
                                                                  }}
                                                                  onTouchStart={(e) => {
                                                                        e.stopPropagation();
                                                                        setResizingTaskId(task.id);
                                                                  }}
                                                            >
                                                                  <div className="h-8 w-1 bg-current opacity-10 rounded-full group-hover/resize:opacity-100 transition-opacity" />
                                                            </div>
                                                      </div>
                                                </div>
                                          );
                                    });
                              })()}
                        </div>
                  </div>
            </div>
      );
};
