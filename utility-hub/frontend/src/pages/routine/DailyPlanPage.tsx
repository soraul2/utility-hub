import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Sparkles, Check, Target, Clock, Layout, AlignLeft } from 'lucide-react';
import classNames from 'classnames';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { KineticPool } from '../../components/routine/kinetic/KineticPool';
import { KineticTimeline } from '../../components/routine/kinetic/KineticTimeline';
import { ConfirmedPlanView } from '../../components/routine/kinetic/ConfirmedPlanView';
import type { Category, Priority } from '../../types/routine';

const DailyPlanPage: React.FC = () => {
      const { date } = useParams<{ date: string }>();
      const {
            today,
            isLoading,
            error,
            loadPlan,
            confirmPlan,
            unconfirmPlan,
            toggleTask,
            deleteTask,
            updateTask,
            addTask
      } = useRoutineStore();

      const [isDetailMode, setIsDetailMode] = useState(false);
      const [isInventoryOpen, setIsInventoryOpen] = useState(false);

      const [newTask, setNewTask] = useState({
            title: '',
            category: 'WORK' as Category,
            durationHours: '1',
            durationMinutes: '0',
            priority: 'MEDIUM' as Priority,
            description: ''
      });

      const [timelineRange, setTimelineRange] = useState({
            startHour: 9,
            endHour: 18
      });

      useEffect(() => {
            const targetDate = date || format(new Date(), 'yyyy-MM-dd');
            loadPlan(targetDate);
      }, [date, loadPlan]);

      if (isLoading && !today) {
            return (
                  <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
            );
      }

      const isConfirmed = today?.status === 'CONFIRMED';
      const progress = today?.keyTasks.length
            ? Math.round((today.keyTasks.filter(t => t.completed).length / today.keyTasks.length) * 100)
            : 0;

      const handleQuickAdd = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!newTask.title.trim()) return;

            const totalMinutes = parseInt(newTask.durationHours || '0') * 60 + parseInt(newTask.durationMinutes || '0');

            await addTask(newTask.title.trim(), {
                  category: newTask.category,
                  durationMinutes: totalMinutes,
                  priority: newTask.priority,
                  description: newTask.description
            });

            // addTask already updates the store state, no need to reload
            setNewTask({
                  title: '',
                  category: 'WORK',
                  durationHours: '1',
                  durationMinutes: '0',
                  priority: 'MEDIUM',
                  description: ''
            });
      };

      const handleAssignTask = async (taskId: number) => {
            const task = today?.keyTasks.find(t => t.id === taskId);
            if (!task) return;

            // Default to start of current timeline range
            const startHourStr = `${String(timelineRange.startHour).padStart(2, '0')}:00:00`;
            const duration = task.durationMinutes || 60;
            const endMin = timelineRange.startHour * 60 + duration;
            const endHourStr = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}:00`;

            await updateTask(taskId, {
                  startTime: startHourStr,
                  endTime: endHourStr
            });

            // Automatically close inventory on mobile after assignment
            setIsInventoryOpen(false);
      };

      return (
            <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-white dark:bg-gray-950">
                  {/* Global Sub-Header: Spans full width */}
                  <div className="h-auto md:h-20 px-4 md:px-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-40 py-4 md:py-0">
                        <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center shrink-0">
                                          <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                          <h1 className="text-base md:text-lg font-black text-gray-900 dark:text-white tracking-tight leading-none truncate">
                                                {today?.planDate ? format(new Date(today.planDate), 'M월 d일 (E)', { locale: ko }) : '오늘의 계획'}
                                          </h1>
                                          <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest">{isConfirmed ? 'Live Execution' : 'Planning Stage'}</span>
                                                <div className="w-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
                                                <span className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Progress {progress}%</span>
                                          </div>
                                    </div>
                                    {/* Mobile Inventory Toggle */}
                                    {!isConfirmed && (
                                          <button
                                                onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                                                className="md:hidden p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                                          >
                                                <Layout className="w-5 h-5" />
                                          </button>
                                    )}
                              </div>

                              <div className="flex items-center gap-2 md:gap-6 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                                    <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50 px-3 md:px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 shrink-0">
                                          <div className="flex items-center gap-2">
                                                <span className="text-[9px] md:text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Start</span>
                                                <input
                                                      type="number"
                                                      min="0" max="23"
                                                      value={timelineRange.startHour}
                                                      onChange={(e) => setTimelineRange(prev => ({ ...prev, startHour: Math.min(23, Math.max(0, parseInt(e.target.value) || 0)) }))}
                                                      className="w-10 md:w-12 bg-transparent text-center font-black text-[10px] md:text-xs outline-none dark:text-white"
                                                />
                                          </div>
                                          <div className="w-px h-3 bg-gray-200 dark:bg-gray-700" />
                                          <div className="flex items-center gap-2">
                                                <span className="text-[9px] md:text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">End</span>
                                                <input
                                                      type="number"
                                                      min="0" max="23"
                                                      value={timelineRange.endHour}
                                                      onChange={(e) => setTimelineRange(prev => ({ ...prev, endHour: Math.min(23, Math.max(0, parseInt(e.target.value) || 0)) }))}
                                                      className="w-10 md:w-12 bg-transparent text-center font-black text-[10px] md:text-xs outline-none dark:text-white"
                                                />
                                          </div>
                                    </div>

                                    {!isConfirmed ? (
                                          <button
                                                onClick={() => {
                                                      const targetDate = date || today?.planDate;
                                                      if (targetDate) confirmPlan(targetDate);
                                                }}
                                                className="flex items-center gap-2 px-4 md:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] md:text-xs font-black shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95 shrink-0"
                                          >
                                                <Check className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                                <span className="whitespace-nowrap">Finalize Day</span>
                                          </button>
                                    ) : (
                                          <button
                                                onClick={() => {
                                                      const targetDate = date || today?.planDate;
                                                      if (targetDate) {
                                                            unconfirmPlan(targetDate);
                                                      }
                                                }}
                                                className="flex items-center gap-2 px-4 md:px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] md:text-xs font-black shadow-lg shadow-amber-100 dark:shadow-none transition-all active:scale-95 shrink-0"
                                          >
                                                <Layout className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                                <span className="whitespace-nowrap">Edit Plan</span>
                                          </button>
                                    )}
                              </div>
                        </div>
                  </div>

                  {/* Conditional Rendering: Confirmed View vs Planning View */}
                  {isConfirmed && today ? (
                        <ConfirmedPlanView plan={today} onToggleTask={toggleTask} />
                  ) : (
                        <div className="flex flex-1 overflow-hidden relative bg-slate-50 dark:bg-gray-950">
                              {/* Backdrop for Mobile Inventory */}
                              {isInventoryOpen && (
                                    <div
                                          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                                          onClick={() => setIsInventoryOpen(false)}
                                    />
                              )}

                              {/* Left Sidebar: Inventory */}
                              <aside className={classNames(
                                    "fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-shrink-0 z-[45] shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 md:z-30 md:w-[300px]",
                                    isInventoryOpen ? "translate-x-0" : "-translate-x-full"
                              )}>
                                    <KineticPool
                                          tasks={today?.keyTasks || []}
                                          onDeleteTask={deleteTask}
                                          onUnassignTask={(id) => updateTask(id, { startTime: undefined, endTime: undefined })}
                                          onAssignTask={handleAssignTask}
                                          isConfirmed={isConfirmed}
                                    />
                              </aside>

                              {/* Main Content Area: Horizontal Timeline */}
                              <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-gray-950 overflow-hidden">

                                    {/* Horizontal Timeline Workspace */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent pb-40 md:pb-32">
                                          {error && (
                                                <div className="m-4 md:m-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs md:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                                                      < Sparkles className="w-4 h-4" />
                                                      {error}
                                                </div>
                                          )}

                                          <div className="p-4 md:p-8">
                                                <KineticTimeline
                                                      tasks={today?.keyTasks || []}
                                                      isConfirmed={isConfirmed}
                                                      startHour={timelineRange.startHour}
                                                      endHour={timelineRange.endHour}
                                                />

                                                {/* Decoration grid */}
                                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-20 pointer-events-none grayscale">
                                                      <div className="h-40 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800" />
                                                      <div className="h-40 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shrink-0 md:block hidden" />
                                                </div>
                                          </div>
                                    </div>

                                    {/* Floating Task Add Bar: Premium Redesign with Enhanced Distinction */}
                                    <div className="absolute bottom-6 md:bottom-14 left-0 right-0 z-40 pointer-events-none flex justify-center px-4 md:px-0">
                                          <div className={`w-full ${isDetailMode ? 'max-w-2xl' : 'max-w-5xl'} pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]`}>
                                                <div className="relative group">
                                                      {/* Enhanced glow effect */}
                                                      <div className={`absolute -inset-1.5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-[2rem] md:rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 ${isDetailMode ? 'opacity-40' : ''}`}></div>

                                                      <div className={`relative bg-white dark:bg-gray-900 backdrop-blur-3xl border border-gray-200 dark:border-gray-700 shadow-[0_25px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden ${isDetailMode ? 'rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6' : 'rounded-[2.5rem] md:rounded-[2.8rem] p-1.5 md:p-3'}`}>
                                                            <form onSubmit={(e) => {
                                                                  handleQuickAdd(e);
                                                                  if (isDetailMode) setIsDetailMode(false);
                                                            }}>
                                                                  <div className="flex flex-col gap-6">
                                                                        {/* Header Row */}
                                                                        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                                                              <div className="flex items-center gap-3">
                                                                                    {/* Mode Toggle */}
                                                                                    <div className={`flex bg-gray-50 dark:bg-gray-800 rounded-full p-1 border border-gray-100 dark:border-gray-700 shrink-0 ${isDetailMode ? 'shadow-sm' : ''}`}>
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

                                                                                    {/* Primary Title Input (Mobile inline) */}
                                                                                    <div className="relative flex-1 lg:hidden">
                                                                                          <input
                                                                                                type="text"
                                                                                                placeholder="무엇을 준비할까요?"
                                                                                                value={newTask.title}
                                                                                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                                                                                className="w-full bg-transparent border-none font-bold text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-0 outline-none text-sm py-2"
                                                                                          />
                                                                                    </div>
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
                                                                                                            <option value="WORK">💼 Work</option>
                                                                                                            <option value="PERSONAL">🏠 Home</option>
                                                                                                            <option value="HEALTH">💪 Body</option>
                                                                                                            <option value="STUDY">📚 Book</option>
                                                                                                      </select>
                                                                                                      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                                                                                                      <select
                                                                                                            value={newTask.priority}
                                                                                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                                                                                                            className="bg-transparent border-none pl-3 pr-8 py-2.5 text-xs font-black text-gray-600 dark:text-gray-300 focus:ring-0 outline-none cursor-pointer uppercase tracking-tight"
                                                                                                      >
                                                                                                            <option value="LOW">Low</option>
                                                                                                            <option value="MEDIUM">Medium</option>
                                                                                                            <option value="HIGH">High</option>
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
                                                                                                      className="group/btn relative overflow-hidden px-10 py-3.5 bg-indigo-600 disabled:bg-gray-200 text-white rounded-[1.8rem] text-[11px] font-black shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)] disabled:shadow-none transition-all duration-300 active:scale-95 flex items-center gap-2 whitespace-nowrap uppercase tracking-widest"
                                                                                                >
                                                                                                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-100 group-hover/btn:scale-110 transition-transform duration-500" />
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
                                                                                                            <option value="WORK">💼 Work</option>
                                                                                                            <option value="PERSONAL">🏠 Home</option>
                                                                                                            <option value="HEALTH">💪 Body</option>
                                                                                                            <option value="STUDY">📚 Book</option>
                                                                                                      </select>
                                                                                                      <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 mx-0.5" />
                                                                                                      <select
                                                                                                            value={newTask.priority}
                                                                                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                                                                                                            className="flex-1 bg-transparent border-none pl-2 pr-4 py-1.5 text-[10px] font-black text-gray-600 dark:text-gray-300 focus:ring-0 outline-none"
                                                                                                      >
                                                                                                            <option value="LOW">Low</option>
                                                                                                            <option value="MEDIUM">Med</option>
                                                                                                            <option value="HIGH">High</option>
                                                                                                      </select>
                                                                                                </div>
                                                                                                <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/10 px-2.5 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                                                                                      <Clock className="w-3 h-3 text-indigo-400" />
                                                                                                      <div className="flex items-center">
                                                                                                            <input
                                                                                                                  type="number"
                                                                                                                  value={newTask.durationHours}
                                                                                                                  onChange={(e) => setNewTask({ ...newTask, durationHours: e.target.value })}
                                                                                                                  className="w-5 bg-transparent border-none p-0 text-[10px] font-black text-indigo-600 dark:text-indigo-400 focus:ring-0 outline-none text-center"
                                                                                                            />
                                                                                                            <span className="text-[8px] font-black text-indigo-300 ml-0.5">H</span>
                                                                                                      </div>
                                                                                                </div>
                                                                                                <button
                                                                                                      type="submit"
                                                                                                      disabled={!newTask.title.trim()}
                                                                                                      className="w-9 h-9 bg-indigo-600 disabled:bg-gray-100 text-white rounded-xl shadow-lg flex items-center justify-center active:scale-90 transition-all"
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
                                                                                                            <option value="WORK">💼 Work</option>
                                                                                                            <option value="PERSONAL">🏠 Home</option>
                                                                                                            <option value="HEALTH">💪 Body</option>
                                                                                                            <option value="STUDY">📚 Book</option>
                                                                                                      </select>
                                                                                                      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                                                                                                      <select
                                                                                                            value={newTask.priority}
                                                                                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                                                                                                            className="flex-1 bg-transparent border-none pl-3 pr-2 py-3 text-xs font-black text-gray-700 dark:text-gray-300 focus:ring-0 outline-none cursor-pointer"
                                                                                                      >
                                                                                                            <option value="LOW">Low</option>
                                                                                                            <option value="MEDIUM">Med</option>
                                                                                                            <option value="HIGH">High</option>
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
                                                                                                className="group/btn relative overflow-hidden px-8 py-4 bg-indigo-600 disabled:bg-gray-200 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-200/50 dark:shadow-none transition-all duration-300 active:scale-95 flex items-center gap-3 whitespace-nowrap justify-center"
                                                                                          >
                                                                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-100 group-hover/btn:scale-110 transition-transform duration-500" />
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
                              </div>
                        </div>
                  )}
            </div>
      );
};

export default DailyPlanPage;
