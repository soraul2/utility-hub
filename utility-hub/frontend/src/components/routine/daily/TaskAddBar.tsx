import React, { useState } from 'react';
import { Sparkles, Clock, Layout, AlignLeft, Wand2, Loader2 } from 'lucide-react';
import { TimelineRangeSelector } from './TimelineRangeSelector';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from '../../../lib/constants/routine';
import { AI_MODE_OPTIONS, DEFAULT_AI_MODE, type AiScheduleMode } from '../../../lib/constants/aiModes';
import type { Category, Priority } from '../../../types/routine';

type Mode = 'task' | 'detail' | 'ai';

interface TaskAddBarProps {
      onAddTask: (title: string, options?: { category?: string; durationMinutes?: number; priority?: string; description?: string }) => Promise<void>;
      timelineRange?: { startHour: number; endHour: number };
      onTimelineRangeChange?: (range: { startHour: number; endHour: number }) => void;
      unassignedCount?: number;
      onAiArrange?: (startHour: number, endHour: number, taskText?: string, mode?: string) => Promise<void>;
      aiArranging?: boolean;
}

export const TaskAddBar: React.FC<TaskAddBarProps> = ({ onAddTask, timelineRange, onTimelineRangeChange, unassignedCount = 0, onAiArrange, aiArranging = false }) => {
      const [mode, setMode] = useState<Mode>('task');
      const [newTask, setNewTask] = useState({
            title: '',
            category: 'WORK' as Category,
            durationHours: '1',
            durationMinutes: '0',
            priority: 'MEDIUM' as Priority,
            description: ''
      });
      const [aiText, setAiText] = useState('');
      const [aiMode, setAiMode] = useState<AiScheduleMode>(DEFAULT_AI_MODE);

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

      const handleAiArrange = async () => {
            if (!onAiArrange) return;
            if (unassignedCount === 0 && !aiText.trim()) return;
            const start = timelineRange?.startHour ?? 9;
            const end = timelineRange?.endHour ?? 18;
            await onAiArrange(start, end, aiText.trim() || undefined, aiMode);
            setAiText('');
            setMode('task');
      };

      const isExpanded = mode === 'detail' || mode === 'ai';

      return (
            <div className="relative z-40 pointer-events-none flex justify-center px-4 md:px-0 pb-1.5 md:pb-2 pt-1.5">
                  <div className={`w-full ${isExpanded ? 'max-w-2xl' : 'max-w-5xl'} pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]`}>
                        <div className="relative group">
                              {/* Enhanced glow effect */}
                              <div className={`absolute -inset-1.5 ${mode === 'ai' ? 'bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500' : 'mystic-gradient'} opacity-20 rounded-[2rem] md:rounded-[3rem] blur-2xl group-hover:opacity-40 transition duration-1000 ${isExpanded ? 'opacity-40' : ''}`}></div>

                              <div className={`relative bg-white dark:bg-gray-900 backdrop-blur-3xl border border-gray-200 dark:border-gray-700 shadow-[0_25px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden ${isExpanded ? 'rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6' : 'rounded-[2.5rem] md:rounded-[2.8rem] p-1.5 md:p-3'}`}>
                                    <form onSubmit={(e) => {
                                          if (mode === 'ai') {
                                                e.preventDefault();
                                                handleAiArrange();
                                          } else {
                                                handleQuickAdd(e);
                                                if (mode === 'detail') setMode('task');
                                          }
                                    }}>
                                          <div className="flex flex-col gap-6">
                                                {/* Header Row */}
                                                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                                                      {/* Mode Toggle */}
                                                      <div className={`flex bg-gray-50 dark:bg-gray-800 rounded-full p-1 border border-gray-100 dark:border-gray-700 shrink-0 ${isExpanded ? 'shadow-sm self-start' : ''}`}>
                                                            <button
                                                                  type="button"
                                                                  onClick={() => setMode('task')}
                                                                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 md:gap-2 ${mode === 'task' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                                            >
                                                                  <Layout className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                                  Task
                                                            </button>
                                                            <button
                                                                  type="button"
                                                                  onClick={() => setMode('detail')}
                                                                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 md:gap-2 ${mode === 'detail' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                                            >
                                                                  <AlignLeft className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                                  Detail
                                                            </button>
                                                            <button
                                                                  type="button"
                                                                  onClick={() => setMode('ai')}
                                                                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 md:gap-2 ${mode === 'ai' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-sm text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                                            >
                                                                  <Wand2 className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                                  AI
                                                            </button>
                                                      </div>

                                                      {/* Task/Detail Mode: Title Input */}
                                                      {mode !== 'ai' && (
                                                            <>
                                                                  {/* Mobile */}
                                                                  <div className="relative lg:hidden">
                                                                        <input
                                                                              type="text"
                                                                              placeholder="무엇을 준비할까요?"
                                                                              value={newTask.title}
                                                                              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                                                              className="w-full bg-transparent border-none font-bold text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-0 outline-none text-sm py-1"
                                                                        />
                                                                  </div>
                                                                  {/* Desktop */}
                                                                  <div className="relative flex-1 min-w-0 hidden lg:block">
                                                                        <input
                                                                              type="text"
                                                                              placeholder={mode === 'detail' ? "어떤 일을 하실 건가요?" : "할 일을 입력하세요"}
                                                                              value={newTask.title}
                                                                              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                                                              className={`w-full bg-transparent border-none font-bold text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-0 outline-none transition-all ${mode === 'detail' ? 'text-lg md:text-xl px-2' : 'text-sm md:text-base pl-2 md:pl-4 pr-4 md:pr-6 py-3 md:py-5'}`}
                                                                        />
                                                                  </div>
                                                            </>
                                                      )}

                                                      {/* AI Mode: Summary */}
                                                      {mode === 'ai' && (
                                                            <div className="flex-1 flex items-center gap-3 px-2">
                                                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap shrink-0">
                                                                        <Wand2 className="w-4 h-4 text-violet-500" />
                                                                        <span>AI 배치</span>
                                                                  </div>
                                                                  <div className="hidden lg:flex items-center gap-2">
                                                                        <TimelineRangeSelector
                                                                              startHour={timelineRange?.startHour ?? 9}
                                                                              endHour={timelineRange?.endHour ?? 18}
                                                                              onChange={(r) => onTimelineRangeChange?.(r)}
                                                                              compact
                                                                        />
                                                                        {unassignedCount > 0 && (
                                                                              <span className="px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-full text-xs font-black">
                                                                                    Inventory {unassignedCount}
                                                                              </span>
                                                                        )}
                                                                  </div>
                                                            </div>
                                                      )}

                                                      {/* Quick Add Controls (Task mode only) */}
                                                      {mode === 'task' && (
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

                                                                        <div className="flex items-center gap-2 bg-indigo-50/30 dark:bg-indigo-900/10 px-4 py-2.5 rounded-2xl border border-indigo-100/30 dark:border-indigo-800/30">
                                                                              <Clock className="w-4 h-4 text-indigo-400" />
                                                                              <div className="flex items-center">
                                                                                    <input
                                                                                          type="number"
                                                                                          min="0"
                                                                                          value={newTask.durationHours}
                                                                                          onChange={(e) => setNewTask({ ...newTask, durationHours: e.target.value })}
                                                                                          className="w-10 bg-transparent border-none text-sm font-black text-center text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none"
                                                                                    />
                                                                                    <span className="text-xs font-black text-indigo-300 mx-0.5">H</span>
                                                                                    <input
                                                                                          type="number"
                                                                                          min="0" max="59"
                                                                                          value={newTask.durationMinutes}
                                                                                          onChange={(e) => setNewTask({ ...newTask, durationMinutes: e.target.value })}
                                                                                          className="w-10 bg-transparent border-none text-sm font-black text-center text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none"
                                                                                    />
                                                                                    <span className="text-xs font-black text-indigo-300 mx-0.5">M</span>
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
                                                                        <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/10 px-3 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                                                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                                                              <div className="flex items-center">
                                                                                    <input
                                                                                          type="number"
                                                                                          min="0"
                                                                                          value={newTask.durationHours}
                                                                                          onChange={(e) => setNewTask({ ...newTask, durationHours: e.target.value })}
                                                                                          className="w-7 bg-transparent border-none p-0 text-xs font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none text-center"
                                                                                    />
                                                                                    <span className="text-[10px] font-black text-indigo-300 ml-0.5">H</span>
                                                                                    <input
                                                                                          type="number"
                                                                                          min="0" max="59"
                                                                                          value={newTask.durationMinutes}
                                                                                          onChange={(e) => setNewTask({ ...newTask, durationMinutes: e.target.value })}
                                                                                          className="w-7 bg-transparent border-none p-0 text-xs font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none text-center"
                                                                                    />
                                                                                    <span className="text-[10px] font-black text-indigo-300 ml-0.5">M</span>
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
                                                {mode === 'detail' && (
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

                                                {/* AI Mode Expanded Content */}
                                                {mode === 'ai' && (
                                                      <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                                                            {/* Mobile info + editable time range */}
                                                            <div className="flex lg:hidden items-center gap-2">
                                                                  <TimelineRangeSelector
                                                                        startHour={timelineRange?.startHour ?? 9}
                                                                        endHour={timelineRange?.endHour ?? 18}
                                                                        onChange={(r) => onTimelineRangeChange?.(r)}
                                                                        compact
                                                                  />
                                                                  {unassignedCount > 0 && (
                                                                        <span className="px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-full text-xs font-black">
                                                                              Inventory {unassignedCount}
                                                                        </span>
                                                                  )}
                                                            </div>

                                                            {/* AI Mode Selection Chips */}
                                                            <div className="space-y-1.5">
                                                                  <div className="flex gap-2">
                                                                        {AI_MODE_OPTIONS.map((opt) => (
                                                                              <button
                                                                                    key={opt.value}
                                                                                    type="button"
                                                                                    onClick={() => setAiMode(opt.value)}
                                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                                                                                          aiMode === opt.value
                                                                                                ? 'bg-violet-50 dark:bg-violet-900/30 border-violet-400 dark:border-violet-500 text-violet-700 dark:text-violet-300 shadow-sm'
                                                                                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                                                                                    }`}
                                                                              >
                                                                                    <span>{opt.icon}</span>
                                                                                    <span>{opt.label}</span>
                                                                              </button>
                                                                        ))}
                                                                  </div>
                                                                  <p className="text-[11px] text-violet-500 dark:text-violet-400 font-medium pl-1">
                                                                        {AI_MODE_OPTIONS.find(o => o.value === aiMode)?.description}
                                                                  </p>
                                                            </div>

                                                            {/* Description */}
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                                  {unassignedCount > 0
                                                                        ? `인벤토리의 ${unassignedCount}개 태스크를 포함하여 AI가 최적의 시간에 배치합니다.`
                                                                        : '아래에 할 일을 적으면 AI가 태스크를 만들고 타임라인에 배치합니다.'}
                                                                  {' '}추가 태스크가 있다면 아래에 자유롭게 적어주세요.
                                                            </p>

                                                            {/* Text Area */}
                                                            <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl p-3 border border-gray-100/50 dark:border-gray-700/50 transition-all focus-within:ring-2 focus-within:ring-violet-500/20">
                                                                  <textarea
                                                                        placeholder={"추가 할 일을 자유롭게 적어주세요 (선택)\n예: 운동 30분\n    코딩 2시간\n    독서 1시간"}
                                                                        value={aiText}
                                                                        onChange={(e) => setAiText(e.target.value)}
                                                                        disabled={aiArranging}
                                                                        className="w-full bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-0 resize-none h-24 placeholder:text-gray-400 p-1 disabled:opacity-50"
                                                                  />
                                                            </div>

                                                            {/* AI Arrange Button */}
                                                            <button
                                                                  type="button"
                                                                  onClick={handleAiArrange}
                                                                  disabled={aiArranging || (unassignedCount === 0 && !aiText.trim())}
                                                                  className="w-full group/btn relative overflow-hidden px-8 py-4 text-white rounded-2xl font-black shadow-lg transition-all duration-300 active:scale-[0.98] flex items-center gap-3 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 opacity-100 group-hover/btn:scale-105 transition-transform duration-500" />
                                                                  {aiArranging ? (
                                                                        <>
                                                                              <Loader2 className="relative z-10 w-5 h-5 animate-spin" />
                                                                              <span className="relative z-10 text-sm tracking-wide">AI가 최적 배치 중...</span>
                                                                        </>
                                                                  ) : (
                                                                        <>
                                                                              <Wand2 className="relative z-10 w-5 h-5 transition-transform group-hover/btn:rotate-12" />
                                                                              <span className="relative z-10 text-sm tracking-wide">AI 배치</span>
                                                                        </>
                                                                  )}
                                                            </button>
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
