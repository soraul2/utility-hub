import React, { useState } from 'react';
import { Sparkles, Clock, Layout, AlignLeft } from 'lucide-react';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from '../../../lib/constants/routine';
import type { Category, Priority } from '../../../types/routine';

interface TaskAddBarProps {
      onAddTask: (title: string, options?: { category?: string; durationMinutes?: number; priority?: string; description?: string }) => Promise<void>;
}

export const TaskAddBar: React.FC<TaskAddBarProps> = ({ onAddTask }) => {
      const [isDetailMode, setIsDetailMode] = useState(false);
      const [newTask, setNewTask] = useState({
            title: '',
            category: 'WORK' as Category,
            durationHours: '1',
            durationMinutes: '0',
            priority: 'MEDIUM' as Priority,
            description: ''
      });

      const handleQuickAdd = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!newTask.title.trim()) return;

            const totalMinutes = parseInt(newTask.durationHours || '0') * 60 + parseInt(newTask.durationMinutes || '0');

            await onAddTask(newTask.title.trim(), {
                  category: newTask.category,
                  durationMinutes: totalMinutes,
                  priority: newTask.priority,
                  description: newTask.description
            });

            setNewTask({
                  title: '',
                  category: 'WORK',
                  durationHours: '1',
                  durationMinutes: '0',
                  priority: 'MEDIUM',
                  description: ''
            });
      };

      return (
            <div className="absolute bottom-6 md:bottom-14 left-0 right-0 z-40 pointer-events-none flex justify-center px-4 md:px-0">
                  <div className={`w-full ${isDetailMode ? 'max-w-2xl' : 'max-w-5xl'} pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]`}>
                        <div className="relative group">
                              {/* Enhanced glow effect */}
                              <div className={`absolute -inset-1.5 mystic-gradient opacity-20 rounded-[2rem] md:rounded-[3rem] blur-2xl group-hover:opacity-40 transition duration-1000 ${isDetailMode ? 'opacity-40' : ''}`}></div>

                              <div className={`relative bg-white dark:bg-gray-900 backdrop-blur-3xl border border-gray-200 dark:border-gray-700 shadow-[0_25px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden ${isDetailMode ? 'rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6' : 'rounded-[2.5rem] md:rounded-[2.8rem] p-1.5 md:p-3'}`}>
                                    <form onSubmit={(e) => {
                                          handleQuickAdd(e);
                                          if (isDetailMode) setIsDetailMode(false);
                                    }}>
                                          <div className="flex flex-col gap-6">
                                                {/* Header Row */}
                                                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                                                      {/* Mode Toggle */}
                                                      <div className={`flex bg-gray-50 dark:bg-gray-800 rounded-full p-1 border border-gray-100 dark:border-gray-700 shrink-0 self-start ${isDetailMode ? 'shadow-sm' : ''}`}>
                                                            <button
                                                                  type="button"
                                                                  onClick={() => setIsDetailMode(false)}
                                                                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 md:gap-2 ${!isDetailMode ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                                            >
                                                                  <Layout className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                                  Task
                                                            </button>
                                                            <button
                                                                  type="button"
                                                                  onClick={() => setIsDetailMode(true)}
                                                                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 md:gap-2 ${isDetailMode ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                                            >
                                                                  <AlignLeft className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                                  Detail
                                                            </button>
                                                      </div>

                                                      {/* Primary Title Input (Mobile - full width row) */}
                                                      <div className="relative lg:hidden">
                                                            <input
                                                                  type="text"
                                                                  placeholder="무엇을 준비할까요?"
                                                                  value={newTask.title}
                                                                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                                                  className="w-full bg-transparent border-none font-bold text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-0 outline-none text-sm py-1"
                                                            />
                                                      </div>

                                                      {/* Primary Title Input (Desktop) */}
                                                      <div className="relative flex-1 hidden lg:block">
                                                            <input
                                                                  type="text"
                                                                  placeholder={isDetailMode ? "어떤 일을 하실 건가요?" : "무엇을 준비할까요?"}
                                                                  value={newTask.title}
                                                                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                                                  className={`w-full bg-transparent border-none font-bold text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-0 outline-none transition-all ${isDetailMode ? 'text-lg md:text-xl px-2' : 'text-sm md:text-base pl-2 md:pl-4 pr-4 md:pr-6 py-3 md:py-5'}`}
                                                            />
                                                      </div>

                                                      {/* Quick Add Controls (Visible only in Quick Mode) */}
                                                      {!isDetailMode && (
                                                            <>
                                                                  {/* Desktop Quick Add Controls */}
                                                                  <div className="hidden lg:flex items-center gap-4 pr-2 animate-in fade-in slide-in-from-right-4 duration-500">
                                                                        <div className="flex items-center bg-gray-50/50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100/50 dark:border-gray-700/50">
                                                                              <select
                                                                                    value={newTask.category}
                                                                                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Category })}
                                                                                    className="bg-transparent border-none pl-3 pr-8 py-2.5 text-xs font-black text-gray-600 dark:text-gray-300 focus:ring-0 outline-none cursor-pointer uppercase tracking-tight"
                                                                              >
                                                                                    {CATEGORY_OPTIONS.map(opt => (
                                                                                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                                    ))}
                                                                              </select>
                                                                              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                                                                              <select
                                                                                    value={newTask.priority}
                                                                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                                                                                    className="bg-transparent border-none pl-3 pr-8 py-2.5 text-xs font-black text-gray-600 dark:text-gray-300 focus:ring-0 outline-none cursor-pointer uppercase tracking-tight"
                                                                              >
                                                                                    {PRIORITY_OPTIONS.map(opt => (
                                                                                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                                    ))}
                                                                              </select>
                                                                        </div>

                                                                        <div className="flex items-center gap-2 bg-indigo-50/30 dark:bg-indigo-900/10 px-4 py-2 rounded-2xl border border-indigo-100/30 dark:border-indigo-800/30">
                                                                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                                                              <div className="flex items-center">
                                                                                    <input
                                                                                          type="number"
                                                                                          min="0"
                                                                                          value={newTask.durationHours}
                                                                                          onChange={(e) => setNewTask({ ...newTask, durationHours: e.target.value })}
                                                                                          className="w-7 bg-transparent border-none text-[11px] font-black text-center text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none"
                                                                                    />
                                                                                    <span className="text-[9px] font-black text-indigo-300 mx-0.5">H</span>
                                                                                    <input
                                                                                          type="number"
                                                                                          min="0" max="59"
                                                                                          value={newTask.durationMinutes}
                                                                                          onChange={(e) => setNewTask({ ...newTask, durationMinutes: e.target.value })}
                                                                                          className="w-7 bg-transparent border-none text-[11px] font-black text-center text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none"
                                                                                    />
                                                                                    <span className="text-[9px] font-black text-indigo-300 mx-0.5">M</span>
                                                                              </div>
                                                                        </div>

                                                                        <button
                                                                              type="submit"
                                                                              disabled={!newTask.title.trim()}
                                                                              className="group/btn relative overflow-hidden px-10 py-3.5 mystic-solid disabled:bg-gray-200 text-white rounded-[1.8rem] text-[11px] font-black shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)] disabled:shadow-none transition-all duration-300 active:scale-95 flex items-center gap-2 whitespace-nowrap uppercase tracking-widest"
                                                                        >
                                                                              <div className="absolute inset-0 mystic-gradient-r opacity-100 group-hover/btn:scale-110 transition-transform duration-500" />
                                                                              <Sparkles className="relative z-10 w-3.5 h-3.5 transition-transform group-hover/btn:rotate-12" />
                                                                              <span className="relative z-10">Quick Add</span>
                                                                        </button>
                                                                  </div>

                                                                  {/* Mobile Quick Add Controls */}
                                                                  <div className="flex lg:hidden items-center gap-2 mt-2 animate-in slide-in-from-bottom-2 duration-300">
                                                                        <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1">
                                                                              <select
                                                                                    value={newTask.category}
                                                                                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Category })}
                                                                                    className="flex-1 bg-transparent border-none pl-2 pr-4 py-1.5 text-[10px] font-black text-gray-600 dark:text-gray-300 focus:ring-0 outline-none"
                                                                              >
                                                                                    {CATEGORY_OPTIONS.map(opt => (
                                                                                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                                    ))}
                                                                              </select>
                                                                              <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 mx-0.5" />
                                                                              <select
                                                                                    value={newTask.priority}
                                                                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                                                                                    className="flex-1 bg-transparent border-none pl-2 pr-4 py-1.5 text-[10px] font-black text-gray-600 dark:text-gray-300 focus:ring-0 outline-none"
                                                                              >
                                                                                    {PRIORITY_OPTIONS.map(opt => (
                                                                                          <option key={opt.value} value={opt.value}>{opt.label === 'Medium' ? 'Med' : opt.label}</option>
                                                                                    ))}
                                                                              </select>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/10 px-2.5 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                                                              <Clock className="w-3 h-3 text-indigo-400" />
                                                                              <div className="flex items-center">
                                                                                    <input
                                                                                          type="number"
                                                                                          min="0"
                                                                                          value={newTask.durationHours}
                                                                                          onChange={(e) => setNewTask({ ...newTask, durationHours: e.target.value })}
                                                                                          className="w-5 bg-transparent border-none p-0 text-[10px] font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none text-center"
                                                                                    />
                                                                                    <span className="text-[8px] font-black text-indigo-300 ml-0.5">H</span>
                                                                                    <input
                                                                                          type="number"
                                                                                          min="0" max="59"
                                                                                          value={newTask.durationMinutes}
                                                                                          onChange={(e) => setNewTask({ ...newTask, durationMinutes: e.target.value })}
                                                                                          className="w-5 bg-transparent border-none p-0 text-[10px] font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none text-center"
                                                                                    />
                                                                                    <span className="text-[8px] font-black text-indigo-300 ml-0.5">M</span>
                                                                              </div>
                                                                        </div>
                                                                        <button
                                                                              type="submit"
                                                                              disabled={!newTask.title.trim()}
                                                                              className="w-9 h-9 mystic-solid disabled:bg-gray-100 text-white rounded-xl shadow-lg flex items-center justify-center active:scale-90 transition-all"
                                                                        >
                                                                              <Sparkles className="w-3.5 h-3.5" />
                                                                        </button>
                                                                  </div>
                                                            </>
                                                      )}
                                                </div>

                                                {/* Detail Mode Expanded Content */}
                                                {isDetailMode && (
                                                      <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
                                                            <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl p-4 border border-gray-100/50 dark:border-gray-700/50 transition-all focus-within:bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500/10">
                                                                  <textarea
                                                                        placeholder="메모나 상세 내용을 적어주세요 (선택사항)"
                                                                        value={newTask.description}
                                                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                                                        className="w-full bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-0 resize-none h-24 placeholder:text-gray-400 p-2"
                                                                  />
                                                            </div>

                                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                                  <div className="flex-1 grid grid-cols-2 gap-4">
                                                                        <div className="bg-gray-50/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100/50 dark:border-gray-700/50 flex items-center">
                                                                              <select
                                                                                    value={newTask.category}
                                                                                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Category })}
                                                                                    className="flex-1 bg-transparent border-none pl-3 pr-2 py-3 text-xs font-black text-gray-700 dark:text-gray-300 focus:ring-0 outline-none cursor-pointer"
                                                                              >
                                                                                    {CATEGORY_OPTIONS.map(opt => (
                                                                                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                                    ))}
                                                                              </select>
                                                                              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                                                                              <select
                                                                                    value={newTask.priority}
                                                                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                                                                                    className="flex-1 bg-transparent border-none pl-3 pr-2 py-3 text-xs font-black text-gray-700 dark:text-gray-300 focus:ring-0 outline-none cursor-pointer"
                                                                              >
                                                                                    {PRIORITY_OPTIONS.map(opt => (
                                                                                          <option key={opt.value} value={opt.value}>{opt.label === 'Medium' ? 'Med' : opt.label}</option>
                                                                                    ))}
                                                                              </select>
                                                                        </div>

                                                                        <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50 px-4 py-2 rounded-2xl border border-gray-100/50 dark:border-gray-700/50">
                                                                              <Clock className="w-4 h-4 text-gray-400" />
                                                                              <div className="flex items-center flex-1 justify-center">
                                                                                    <input
                                                                                          type="number"
                                                                                          value={newTask.durationHours}
                                                                                          onChange={(e) => setNewTask({ ...newTask, durationHours: e.target.value })}
                                                                                          className="w-10 bg-transparent border-none text-sm font-black text-center text-gray-900 dark:text-white focus:ring-0 outline-none"
                                                                                    />
                                                                                    <span className="text-[10px] font-black text-gray-400 mx-1">H</span>
                                                                                    <input
                                                                                          type="number"
                                                                                          value={newTask.durationMinutes}
                                                                                          onChange={(e) => setNewTask({ ...newTask, durationMinutes: e.target.value })}
                                                                                          className="w-10 bg-transparent border-none text-sm font-black text-center text-gray-900 dark:text-white focus:ring-0 outline-none"
                                                                                    />
                                                                                    <span className="text-[10px] font-black text-gray-400 mx-1">M</span>
                                                                              </div>
                                                                        </div>
                                                                  </div>

                                                                  <button
                                                                        type="submit"
                                                                        disabled={!newTask.title.trim()}
                                                                        className="group/btn relative overflow-hidden px-8 py-4 mystic-solid disabled:bg-gray-200 text-white rounded-[1.5rem] font-black shadow-lg transition-all duration-300 active:scale-95 flex items-center gap-3 whitespace-nowrap justify-center"
                                                                  >
                                                                        <div className="absolute inset-0 mystic-gradient-r opacity-100 group-hover/btn:scale-110 transition-transform duration-500" />
                                                                        <Sparkles className="relative z-10 w-5 h-5" />
                                                                        <span className="relative z-10 text-sm tracking-wide">Create Task</span>
                                                                  </button>
                                                            </div>
                                                      </div>
                                                )}
                                          </div>
                                    </form>
                              </div>
                        </div>
                  </div>
            </div>
      );
};
