import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Sparkles, Check, Target, Layout, Save, FolderOpen, Plus, Download } from 'lucide-react';
import classNames from 'classnames';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { KineticPool } from '../../components/routine/kinetic/KineticPool';
import { KineticTimeline } from '../../components/routine/kinetic/KineticTimeline';
import { ConfirmedPlanView } from '../../components/routine/kinetic/ConfirmedPlanView';
import { SaveTemplateModal } from '../../components/routine/template/SaveTemplateModal';
import { LoadTemplateModal } from '../../components/routine/template/LoadTemplateModal';
import { WorkflowStepper } from '../../components/routine/daily/WorkflowStepper';
import { TaskAddBar } from '../../components/routine/daily/TaskAddBar';
import { ConfirmPlanModal } from '../../components/routine/daily/ConfirmPlanModal';
import { routineApi } from '../../services/routine/api';
import { calendarApi } from '../../services/calendar/api';

const DailyPlanPage: React.FC = () => {
      const { date } = useParams<{ date: string }>();
      const {
            today,
            isLoading,
            error,
            loadPlan,
            createNewPlan,
            confirmPlan,
            unconfirmPlan,
            toggleTask,
            deleteTask,
            updateTask,
            addTask
      } = useRoutineStore();

      const [isInventoryOpen, setIsInventoryOpen] = useState(false);
      const [showSaveTemplate, setShowSaveTemplate] = useState(false);
      const [showLoadTemplate, setShowLoadTemplate] = useState(false);
      const [showConfirmModal, setShowConfirmModal] = useState(false);
      const [gcalConnected, setGcalConnected] = useState(false);

      const handleExportIcs = async () => {
            const targetDate = date || today?.planDate;
            if (!targetDate) return;
            try {
                  const res = await routineApi.exportDailyIcs(targetDate);
                  const url = URL.createObjectURL(new Blob([res.data]));
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `routine-${targetDate}.ics`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
            } catch {
                  // silently fail
            }
      };

      const [timelineRange, setTimelineRange] = useState({
            startHour: 9,
            endHour: 18
      });

      useEffect(() => {
            const targetDate = date || format(new Date(), 'yyyy-MM-dd');
            loadPlan(targetDate);
      }, [date, loadPlan]);

      useEffect(() => {
            calendarApi.getGoogleStatus()
                  .then(res => setGcalConnected(res.data.connected))
                  .catch(() => {});
      }, []);

      if (isLoading && !today) {
            return (
                  <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
            );
      }

      const isConfirmed = today?.status === 'CONFIRMED';

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

      const handleConfirm = () => {
            const targetDate = date || today?.planDate;
            if (targetDate) {
                  confirmPlan(targetDate);
                  setShowConfirmModal(false);
            }
      };

      return (
            <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-mystic-bg">
                  {/* Global Sub-Header */}
                  <div className="px-4 md:px-8 border-b border-mystic-border bg-mystic-bg/80 backdrop-blur-md z-40 py-4">
                        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
                              {/* Left: Date */}
                              <div className="flex items-center gap-3 shrink-0">
                                    <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
                                          <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                          <h1 className="text-base md:text-lg font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                                {today?.planDate ? format(new Date(today.planDate), 'M월 d일 (E)', { locale: ko }) : '오늘의 계획'}
                                          </h1>
                                          {isConfirmed && (
                                                <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">실행 모드</span>
                                          )}
                                    </div>
                              </div>

                              {/* Center: Workflow Stepper */}
                              <div className="flex items-center gap-1 md:gap-1.5">
                                    <WorkflowStepper isConfirmed={isConfirmed} today={today} />
                              </div>

                              {/* Right: Actions */}
                              <div className="flex items-center gap-2.5 shrink-0">
                                    {/* Timeline Range - Planning mode only */}
                                    {!isConfirmed && (
                                          <div className="hidden md:flex items-center gap-2.5 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Start</span>
                                                <input
                                                      type="number"
                                                      min="0" max="23"
                                                      value={timelineRange.startHour}
                                                      onChange={(e) => setTimelineRange(prev => ({ ...prev, startHour: Math.min(23, Math.max(0, parseInt(e.target.value) || 0)) }))}
                                                      className="w-10 bg-transparent text-center font-black text-xs outline-none dark:text-white"
                                                />
                                                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">End</span>
                                                <input
                                                      type="number"
                                                      min="0" max="23"
                                                      value={timelineRange.endHour}
                                                      onChange={(e) => setTimelineRange(prev => ({ ...prev, endHour: Math.min(23, Math.max(0, parseInt(e.target.value) || 0)) }))}
                                                      className="w-10 bg-transparent text-center font-black text-xs outline-none dark:text-white"
                                                />
                                          </div>
                                    )}

                                    {/* Mobile Inventory Toggle */}
                                    {!isConfirmed && (
                                          <button
                                                onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                                                className="md:hidden p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                                          >
                                                <Layout className="w-5 h-5" />
                                          </button>
                                    )}

                                    {/* Template Buttons - Planning mode only */}
                                    {!isConfirmed && (
                                          <>
                                                <button
                                                      onClick={() => setShowLoadTemplate(true)}
                                                      className="hidden md:flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-black transition-all active:scale-95"
                                                      title="템플릿 불러오기"
                                                >
                                                      <FolderOpen className="w-4 h-4" />
                                                      <span className="whitespace-nowrap">불러오기</span>
                                                </button>
                                                {today && today.keyTasks.length > 0 && (
                                                      <button
                                                            onClick={() => setShowSaveTemplate(true)}
                                                            className="hidden md:flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-black transition-all active:scale-95"
                                                            title="템플릿 저장"
                                                      >
                                                            <Save className="w-4 h-4" />
                                                            <span className="whitespace-nowrap">저장</span>
                                                      </button>
                                                )}
                                          </>
                                    )}

                                    {/* Main Action Button */}
                                    {!isConfirmed ? (
                                          <button
                                                onClick={() => setShowConfirmModal(true)}
                                                className="flex items-center gap-2 px-5 py-2.5 mystic-solid mystic-solid-hover text-white rounded-xl text-xs md:text-sm font-black shadow-lg transition-all active:scale-95"
                                          >
                                                <Check className="w-4 h-4" />
                                                <span className="whitespace-nowrap">확정하기</span>
                                          </button>
                                    ) : (
                                          <>
                                                <button
                                                      onClick={handleExportIcs}
                                                      className="hidden md:flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-black transition-all active:scale-95"
                                                      title="ICS 내보내기"
                                                >
                                                      <Download className="w-4 h-4" />
                                                      <span className="whitespace-nowrap">ICS</span>
                                                </button>
                                                <button
                                                      onClick={() => {
                                                            const targetDate = date || today?.planDate;
                                                            if (targetDate) {
                                                                  unconfirmPlan(targetDate);
                                                            }
                                                      }}
                                                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-500 text-white rounded-xl text-xs md:text-sm font-black transition-all active:scale-95"
                                                >
                                                      <Layout className="w-4 h-4" />
                                                      <span className="whitespace-nowrap">수정하기</span>
                                                </button>
                                          </>
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
                                    "fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-shrink-0 z-[45] shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 md:z-30 md:w-[300px] flex flex-col",
                                    isInventoryOpen ? "translate-x-0" : "-translate-x-full"
                              )}>
                                    <div className="flex-1 min-h-0">
                                          <KineticPool
                                                tasks={today?.keyTasks || []}
                                                onDeleteTask={deleteTask}
                                                onUnassignTask={(id) => updateTask(id, { startTime: undefined, endTime: undefined })}
                                                onAssignTask={handleAssignTask}
                                                isConfirmed={isConfirmed}
                                          />
                                    </div>
                                    {/* Mobile Template Actions */}
                                    <div className="md:hidden shrink-0 border-t border-mystic-border p-3 bg-mystic-bg-secondary space-y-2">
                                          <button
                                                onClick={() => { setShowLoadTemplate(true); setIsInventoryOpen(false); }}
                                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-black transition-all"
                                          >
                                                <FolderOpen className="w-4 h-4" />
                                                템플릿 불러오기
                                          </button>
                                          {today && today.keyTasks.length > 0 && (
                                                <button
                                                      onClick={() => { setShowSaveTemplate(true); setIsInventoryOpen(false); }}
                                                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-black transition-all"
                                                >
                                                      <Save className="w-4 h-4" />
                                                      현재 계획 저장
                                                </button>
                                          )}
                                    </div>
                              </aside>

                              {/* Main Content Area: Horizontal Timeline */}
                              <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-gray-950 overflow-hidden">

                                    {/* Horizontal Timeline Workspace */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent pb-40 md:pb-32">
                                          {!today && error ? (
                                                <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in">
                                                      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-5">
                                                            <Sparkles className="w-7 h-7 text-indigo-400" />
                                                      </div>
                                                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">새로운 하루를 계획해보세요</h3>
                                                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
                                                            아직 이 날의 계획이 없습니다. 아래 버튼을 눌러 시작하세요.
                                                      </p>
                                                      <button
                                                            onClick={() => {
                                                                  const targetDate = date || format(new Date(), 'yyyy-MM-dd');
                                                                  createNewPlan(targetDate);
                                                            }}
                                                            className="flex items-center gap-2 px-6 py-3 mystic-solid mystic-solid-hover text-white rounded-xl text-sm font-black shadow-lg transition-all active:scale-95"
                                                      >
                                                            <Plus className="w-4 h-4" />
                                                            새 계획 작성하기
                                                      </button>
                                                </div>
                                          ) : (
                                                <>
                                                      {error && (
                                                            <div className="m-4 md:m-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-2xl text-xs md:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                                                                  <Sparkles className="w-4 h-4" />
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
                                                                  <div className="h-40 bg-mystic-bg-secondary rounded-3xl border border-mystic-border" />
                                                                  <div className="h-40 bg-mystic-bg-secondary rounded-3xl border border-mystic-border shrink-0 md:block hidden" />
                                                            </div>
                                                      </div>
                                                </>
                                          )}
                                    </div>

                                    {/* Floating Task Add Bar */}
                                    {today && <TaskAddBar onAddTask={addTask} />}
                              </div>
                        </div>
                  )}

                  {/* Template Modals */}
                  {showSaveTemplate && today && (
                        <SaveTemplateModal plan={today} onClose={() => setShowSaveTemplate(false)} />
                  )}
                  {showLoadTemplate && (
                        <LoadTemplateModal onClose={() => setShowLoadTemplate(false)} />
                  )}

                  {/* Confirm Plan Modal */}
                  {showConfirmModal && today && (
                        <ConfirmPlanModal
                              plan={today}
                              onConfirm={handleConfirm}
                              onClose={() => setShowConfirmModal(false)}
                              gcalConnected={gcalConnected}
                        />
                  )}
            </div>
      );
};

export default DailyPlanPage;
