import React, { useState } from 'react';
import { Target, GripVertical, Clock, Trash2, LayoutList, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { Task } from '../../../types/routine';

interface KineticPoolProps {
      tasks: Task[];
      onDeleteTask: (taskId: number) => void;
      onUnassignTask: (taskId: number) => void;
      onAssignTask?: (taskId: number) => void;
      isConfirmed?: boolean;
      inline?: boolean;
      isOpen?: boolean;
      onToggle?: () => void;
}

export const KineticPool: React.FC<KineticPoolProps> = ({ tasks, onDeleteTask, onUnassignTask, onAssignTask, inline, isOpen, onToggle }) => {
      const [isDraggingOver, setIsDraggingOver] = useState(false);
      const unassignedTasks = tasks.filter(t => !t.startTime);

      const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (!isDraggingOver) setIsDraggingOver(true);
      };

      const handleDragLeave = (e: React.DragEvent) => {
            const rect = e.currentTarget.getBoundingClientRect();
            if (
                  e.clientX <= rect.left ||
                  e.clientX >= rect.right ||
                  e.clientY <= rect.top ||
                  e.clientY >= rect.bottom
            ) {
                  setIsDraggingOver(false);
            }
      };

      const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDraggingOver(false);
            const taskIdStr = e.dataTransfer.getData('taskId');
            if (taskIdStr) {
                  const taskId = Number(taskIdStr);
                  onUnassignTask(taskId);
            }
      };

      // ─── Inline (horizontal strip) mode ───
      if (inline) {
            // Hide entirely when no unassigned tasks and collapsed
            if (unassignedTasks.length === 0 && !isOpen) return null;

            return (
                  <div
                        className={`transition-all duration-300 ${isDraggingOver ? 'ring-2 ring-indigo-500/30' : ''}`}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                  >
                        {/* Compact Toggle Header */}
                        <button
                              type="button"
                              onClick={onToggle}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                              {isOpen ? (
                                    <ChevronDown className="w-3 h-3 text-gray-400" />
                              ) : (
                                    <ChevronUp className="w-3 h-3 text-gray-400" />
                              )}
                              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    {unassignedTasks.length > 0 ? `${unassignedTasks.length} unassigned` : 'All assigned'}
                              </span>
                        </button>

                        {/* Expanded: horizontal card strip */}
                        {isOpen && unassignedTasks.length > 0 && (
                              <div className="px-2 pb-2.5 pt-0.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <div className="flex gap-2 overflow-x-auto scrollbar-none">
                                          {unassignedTasks.map(task => (
                                                <div
                                                      key={task.id}
                                                      draggable={true}
                                                      onDragStart={(e) => {
                                                            e.dataTransfer.setData('taskId', task.id.toString());
                                                            e.dataTransfer.effectAllowed = 'move';
                                                            e.currentTarget.style.opacity = '0.5';
                                                      }}
                                                      onDragEnd={(e) => {
                                                            e.currentTarget.style.opacity = '1';
                                                      }}
                                                      className={`group relative shrink-0 rounded-xl border-l-[3px] pl-3 pr-2.5 py-2.5 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing ${task.priority === 'HIGH' ? 'bg-red-50/90 border-red-500 dark:bg-red-900/20' :
                                                            task.priority === 'MEDIUM' ? 'bg-amber-50/90 border-amber-500 dark:bg-amber-900/20' :
                                                                  'bg-blue-50/90 border-blue-500 dark:bg-blue-900/20'
                                                            }`}
                                                >
                                                      <div className="flex items-center gap-2.5">
                                                            <div className="min-w-0">
                                                                  <h4 className="font-bold text-gray-900 dark:text-white text-xs truncate leading-tight max-w-[140px]">
                                                                        {task.title}
                                                                  </h4>
                                                                  <span className="text-[9px] text-gray-400 uppercase tracking-wide">
                                                                        {task.category === 'WORK' ? '💼' : task.category === 'HEALTH' ? '💪' : task.category === 'STUDY' ? '📚' : task.category === 'PERSONAL' ? '🏠' : '🏷️'} {task.category || 'GENERAL'}
                                                                  </span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-400 shrink-0">
                                                                  {task.durationMinutes || 60}m
                                                            </span>
                                                            <button
                                                                  onClick={(e) => { e.stopPropagation(); onAssignTask?.(task.id); }}
                                                                  className="p-1 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-md transition-all shrink-0"
                                                                  title="Add to timeline"
                                                            >
                                                                  <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                  onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                                                  className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                                                  title="Delete"
                                                            >
                                                                  <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              </div>
                        )}
                  </div>
            );
      }

      // ─── Default (sidebar) mode ───
      return (
            <div
                  className={`flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ${isDraggingOver ? 'ring-4 ring-indigo-500/20 bg-indigo-50/10' : ''}`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
            >
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 mystic-solid rounded-xl flex items-center justify-center shadow-lg">
                                          <LayoutList className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Inventory</h3>
                                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Backlog</p>
                                    </div>
                              </div>
                        </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {unassignedTasks.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-12 px-4 text-center opacity-30 select-none">
                                    <Target size={32} className="mb-4 text-gray-300" />
                                    <p className="text-xs font-bold text-gray-400 tracking-tight leading-relaxed">Inventory is empty.<br />Create a task to begin.</p>
                              </div>
                        ) : (
                              unassignedTasks.map(task => (
                                    <div
                                          key={task.id}
                                          draggable={true}
                                          onDragStart={(e) => {
                                                e.dataTransfer.setData('taskId', task.id.toString());
                                                e.dataTransfer.effectAllowed = 'move';
                                                e.currentTarget.style.opacity = '0.5';
                                          }}
                                          onDragEnd={(e) => {
                                                e.currentTarget.style.opacity = '1';
                                          }}
                                          className={`group relative rounded-2xl border p-5 shadow-sm transition-all hover:shadow-lg cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:scale-[1.02] ${task.priority === 'HIGH' ? 'bg-red-50/90 border-red-200 dark:bg-red-900/20 dark:border-red-900/40' :
                                                task.priority === 'MEDIUM' ? 'bg-amber-50/90 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/40' :
                                                      'bg-blue-50/90 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/40'
                                                }`}
                                    >
                                          {/* Priority Top Bar */}
                                          <div className={`absolute top-0 left-4 right-4 h-2 rounded-b-full shadow-md ${task.priority === 'HIGH' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]' :
                                                task.priority === 'MEDIUM' ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]' :
                                                      'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                                                }`} />

                                          <div className="flex items-start justify-between gap-3 pt-3">
                                                <div className="flex-1 min-w-0">
                                                      <h4 className="font-black text-gray-900 dark:text-white text-sm truncate mb-2">
                                                            {task.title}
                                                      </h4>
                                                      <div className="flex items-center gap-2">
                                                            <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-tight ${task.priority === 'HIGH' ? 'text-red-600' :
                                                                  task.priority === 'MEDIUM' ? 'text-amber-600' :
                                                                        'text-indigo-500'
                                                                  }`}>
                                                                  <Clock className="w-3.5 h-3.5" />
                                                                  {task.durationMinutes || 60}m
                                                            </div>
                                                      </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                      <button
                                                            onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  onAssignTask?.(task.id);
                                                            }}
                                                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/40 rounded-lg transition-all border border-indigo-100 dark:border-indigo-800/40 shadow-sm"
                                                            title="Add to timeline"
                                                      >
                                                            <Plus className="w-4 h-4" />
                                                      </button>
                                                      <button
                                                            onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  onDeleteTask(task.id);
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-60 group-hover:opacity-100"
                                                            title="Delete task"
                                                      >
                                                            <Trash2 className="w-4 h-4" />
                                                      </button>
                                                </div>
                                          </div>
                                          <div className="mt-4 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                                      {task.category === 'WORK' ? '💼 WORK' :
                                                            task.category === 'HEALTH' ? '💪 HEALTH' :
                                                                  task.category === 'STUDY' ? '📚 STUDY' :
                                                                        task.category === 'PERSONAL' ? '🏠 PERSONAL' : '🏷️ GENERAL'}
                                                </span>
                                                <GripVertical className="w-4 h-4 text-gray-400" />
                                          </div>
                                    </div>
                              ))
                        )}
                  </div>
            </div>
      );
};
