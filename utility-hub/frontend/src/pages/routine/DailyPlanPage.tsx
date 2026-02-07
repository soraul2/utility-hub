import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Sparkles, Check, Target, Save, FolderOpen, Plus, Download, Wand2, X, Trash2, BookOpen } from 'lucide-react';
import { TimelineRangeSelector } from '../../components/routine/daily/TimelineRangeSelector';
import { useNavigate } from 'react-router-dom';
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
      const navigate = useNavigate();
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
            addTask,
            aiArrangeTasks,
            aiArranging,
            aiReasoning,
            clearAiReasoning,
            clearAllTasks
      } = useRoutineStore();

      const [isInventoryOpen, setIsInventoryOpen] = useState(true);
      const [showSaveTemplate, setShowSaveTemplate] = useState(false);
      const [showLoadTemplate, setShowLoadTemplate] = useState(false);
      const [showConfirmModal, setShowConfirmModal] = useState(false);
      const [showClearConfirm, setShowClearConfirm] = useState(false);
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

            const startHourStr = `${String(timelineRange.startHour).padStart(2, '0')}:00:00`;
            const duration = task.durationMinutes || 60;
            const endMin = timelineRange.startHour * 60 + duration;
            const endHourStr = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}:00`;

            await updateTask(taskId, {
                  startTime: startHourStr,
                  endTime: endHourStr
            });
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
                                          <div className="hidden md:block">
                                                <TimelineRangeSelector
                                                      startHour={timelineRange.startHour}
                                                      endHour={timelineRange.endHour}
                                                      onChange={setTimelineRange}
                                                />
                                          </div>
                                    )}

                                    {/* Template Buttons + Clear All - Planning mode only */}
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
                                                      <>
                                                            <button
                                                                  onClick={() => setShowSaveTemplate(true)}
                                                                  className="hidden md:flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-black transition-all active:scale-95"
                                                                  title="템플릿 저장"
                                                            >
                                                                  <Save className="w-4 h-4" />
                                                                  <span className="whitespace-nowrap">저장</span>
                                                            </button>
                                                            <button
                                                                  onClick={() => setShowClearConfirm(true)}
                                                                  className="hidden md:flex items-center gap-1.5 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/40 text-red-500 dark:text-red-400 rounded-xl text-xs font-black transition-all active:scale-95"
                                                                  title="모두 지우기"
                                                            >
                                                                  <Trash2 className="w-4 h-4" />
                                                                  <span className="whitespace-nowrap">모두 지우기</span>
                                                            </button>
                                                      </>
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
                                                      onClick={() => navigate('/routine/reflection')}
                                                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all active:scale-95 ${
                                                            today && today.keyTasks.length > 0 && today.keyTasks.filter(t => t.startTime).every(t => t.completed)
                                                                  ? 'mystic-solid mystic-solid-hover text-white shadow-lg'
                                                                  : 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800/40 text-purple-600 dark:text-purple-400'
                                                      }`}
                                                >
                                                      <BookOpen className="w-4 h-4" />
                                                      <span className="whitespace-nowrap">하루 회고</span>
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
                                                      <span className="whitespace-nowrap">계획 수정</span>
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
                        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-gray-950">
                              {/* Horizontal Timeline Workspace */}
                              <div className="flex-1 overflow-y-auto scrollbar-none bg-transparent min-h-0">
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
                                                {/* AI Reasoning Banner */}
                                                {aiReasoning && (
                                                      <div className="m-4 md:m-6 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-200 dark:border-violet-800/40 px-4 py-3 rounded-2xl text-xs md:text-sm animate-in fade-in slide-in-from-top-4">
                                                            <div className="flex items-start gap-3">
                                                                  <Wand2 className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                                                                  <p className="flex-1 text-violet-700 dark:text-violet-300 font-medium leading-relaxed">{aiReasoning}</p>
                                                                  <button
                                                                        onClick={clearAiReasoning}
                                                                        className="shrink-0 p-1 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-800/30 text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
                                                                  >
                                                                        <X className="w-3.5 h-3.5" />
                                                                  </button>
                                                            </div>
                                                      </div>
                                                )}

                                                {error && (
                                                      <div className="m-4 md:m-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-2xl text-xs md:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                                                            <Sparkles className="w-4 h-4" />
                                                            {error}
                                                      </div>
                                                )}

                                                <div className="px-4 md:px-8 pt-4 md:pt-6 pb-2">
                                                      <div className="max-w-7xl mx-auto">
                                                            <KineticTimeline
                                                                  tasks={today?.keyTasks || []}
                                                                  isConfirmed={isConfirmed}
                                                                  startHour={timelineRange.startHour}
                                                                  endHour={timelineRange.endHour}
                                                            />
                                                      </div>
                                                </div>
                                          </>
                                    )}
                              </div>

                              {/* Bottom Section: TaskAddBar + Inventory Strip */}
                              {today && (
                                    <div className="shrink-0 border-t border-gray-200/60 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
                                          <TaskAddBar
                                                onAddTask={addTask}
                                                timelineRange={timelineRange}
                                                onTimelineRangeChange={setTimelineRange}
                                                unassignedCount={today.keyTasks.filter(t => !t.startTime).length}
                                                onAiArrange={aiArrangeTasks}
                                                aiArranging={aiArranging}
                                          />

                                          {/* Inline Inventory - centered, same max-width as TaskAddBar */}
                                          {!isConfirmed && (
                                                <div className="flex justify-center px-4 md:px-0 pb-2">
                                                      <div className="w-full max-w-5xl">
                                                            <KineticPool
                                                                  tasks={today.keyTasks}
                                                                  onDeleteTask={deleteTask}
                                                                  onUnassignTask={(id) => updateTask(id, { startTime: undefined, endTime: undefined })}
                                                                  onAssignTask={handleAssignTask}
                                                                  isConfirmed={isConfirmed}
                                                                  inline
                                                                  isOpen={isInventoryOpen}
                                                                  onToggle={() => setIsInventoryOpen(prev => !prev)}
                                                            />
                                                      </div>
                                                </div>
                                          )}
                                    </div>
                              )}
                        </div>
                  )}

                  {/* Template Modals */}
                  {showSaveTemplate && today && (
                        <SaveTemplateModal plan={today} onClose={() => setShowSaveTemplate(false)} />
                  )}
                  {showLoadTemplate && (
                        <LoadTemplateModal onClose={() => setShowLoadTemplate(false)} />
                  )}

                  {/* Clear All Confirmation Modal */}
                  {showClearConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
                              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in zoom-in-95">
                                    <div className="flex items-center gap-3 mb-4">
                                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                                <Trash2 className="w-5 h-5 text-red-500" />
                                          </div>
                                          <h3 className="text-base font-black text-gray-900 dark:text-white">모든 계획 지우기</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                          현재 {today?.keyTasks.length || 0}개의 태스크가 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                                    </p>
                                    <div className="flex gap-3">
                                          <button
                                                onClick={() => setShowClearConfirm(false)}
                                                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-all"
                                          >
                                                취소
                                          </button>
                                          <button
                                                onClick={async () => {
                                                      await clearAllTasks();
                                                      setShowClearConfirm(false);
                                                }}
                                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all active:scale-95"
                                          >
                                                모두 지우기
                                          </button>
                                    </div>
                              </div>
                        </div>
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
