import React, { useState, useEffect, useCallback } from 'react';
import { format, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Layers, X, Coffee, ListTodo, Trash2 } from 'lucide-react';
import MonthlySummaryCard from '@/components/routine/Monthly/MonthlySummaryCard';
import MonthlyCalendarGrid from '@/components/routine/Monthly/MonthlyCalendarGrid';
import DayDetailPanel from '@/components/routine/Monthly/DayDetailPanel';
import CalendarEventModal from '@/components/routine/Monthly/CalendarEventModal';
import { routineApi } from '@/services/routine/api';
import type { MonthlyStatus, RoutineTemplate, CalendarEvent, CalendarEventCreateRequest } from '@/types/routine';
import classNames from 'classnames';
import Toast from '@/components/common/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

const MonthlyCalendarPage = () => {
      // State
      const [currentDate, setCurrentDate] = useState(new Date());
      const [selectedDate, setSelectedDate] = useState<Date | null>(null);
      const [monthlyData, setMonthlyData] = useState<MonthlyStatus | null>(null);
      const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
      const [isLoading, setIsLoading] = useState(false);

      // Detail Panel
      const [detailPanelOpen, setDetailPanelOpen] = useState(false);

      // Batch Mode State
      const [batchMode, setBatchMode] = useState(false);
      const [batchSelectedDates, setBatchSelectedDates] = useState<Set<string>>(new Set());
      const [batchApplying, setBatchApplying] = useState(false);
      const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

      // Batch Delete State
      const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);
      const [batchDeleting, setBatchDeleting] = useState(false);

      // Calendar Events State
      const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
      const [eventModalOpen, setEventModalOpen] = useState(false);
      const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

      // Derived
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      // Fetch
      const fetchMonthlyStatus = useCallback(async () => {
            setIsLoading(true);
            try {
                  const response = await routineApi.getMonthlyStatus(year, month);
                  if (response.data.success) setMonthlyData(response.data.data);
            } catch (error) {
                  console.error("Failed to fetch monthly status:", error);
            } finally {
                  setIsLoading(false);
            }
      }, [year, month]);

      const fetchTemplates = async () => {
            try {
                  const response = await routineApi.getTemplates();
                  if (response.data.success) setTemplates(response.data.data);
            } catch (error) {
                  console.error("Failed to fetch templates:", error);
            }
      };

      const fetchCalendarEvents = useCallback(async () => {
            try {
                  const response = await routineApi.getCalendarEvents(year, month);
                  if (response.data.success) setCalendarEvents(response.data.data);
            } catch (error) {
                  console.error("Failed to fetch calendar events:", error);
            }
      }, [year, month]);

      useEffect(() => {
            fetchMonthlyStatus();
            fetchCalendarEvents();
      }, [fetchMonthlyStatus, fetchCalendarEvents]);

      useEffect(() => { fetchTemplates(); }, []);

      useEffect(() => {
            setBatchMode(false);
            setBatchSelectedDates(new Set());
      }, [year, month]);

      // Navigation
      const handlePrevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
      const handleNextMonth = () => setCurrentDate(new Date(year, month, 1));

      // Goal / Memo
      const handleUpdateGoal = async (goal: string) => {
            try {
                  await routineApi.updateMonthlyGoal(year, month, { monthlyGoal: goal });
                  setMonthlyData(prev => prev ? { ...prev, monthlyGoal: goal } : null);
            } catch {
                  setToast({ type: 'error', text: '목표 수정에 실패했습니다.' });
            }
      };

      const handleUpdateMemo = async (date: string, memo: string) => {
            try {
                  await routineApi.updateMonthlyMemo(date, { memo });
                  fetchMonthlyStatus();
            } catch (error) {
                  console.error("Failed to update memo:", error);
                  throw error;
            }
      };

      // Day Selection
      const handleSelectDay = (date: Date) => {
            setSelectedDate(date);
      };

      const handleOpenDetail = (date: Date) => {
            setSelectedDate(date);
            setDetailPanelOpen(true);
      };

      // Template Apply (core - single date)
      const applyTemplateToDate = async (date: string, templateId: number) => {
            try {
                  const response = await routineApi.getPlan(date);
                  let planId = response.data.data?.id;
                  if (!planId) {
                        const createRes = await routineApi.createPlan({ planDate: date });
                        if (createRes.data.success) planId = createRes.data.data.id;
                  }
                  if (planId) await routineApi.applyTemplate(planId, templateId);
            } catch {
                  try {
                        const createRes = await routineApi.createPlan({ planDate: date });
                        if (createRes.data.success) await routineApi.applyTemplate(createRes.data.data.id, templateId);
                  } catch (createError) {
                        throw createError;
                  }
            }
      };

      const handleApplyTemplate = async (date: string, templateId: number) => {
            await applyTemplateToDate(date, templateId);
            fetchMonthlyStatus();
      };

      // Batch Mode
      const getMonthDates = useCallback(() => {
            const monthStart = new Date(year, month - 1, 1);
            const monthEnd_ = endOfMonth(monthStart);
            return eachDayOfInterval({ start: monthStart, end: monthEnd_ });
      }, [year, month]);

      const handleToggleBatchDate = (dateStr: string) => {
            setBatchSelectedDates(prev => {
                  const next = new Set(prev);
                  if (next.has(dateStr)) next.delete(dateStr); else next.add(dateStr);
                  return next;
            });
      };

      const handleSelectWeekdays = () => {
            const dates = getMonthDates().filter(d => d.getDay() !== 0 && d.getDay() !== 6);
            setBatchSelectedDates(new Set(dates.map(d => format(d, 'yyyy-MM-dd'))));
      };
      const handleSelectWeekends = () => {
            const dates = getMonthDates().filter(d => d.getDay() === 0 || d.getDay() === 6);
            setBatchSelectedDates(new Set(dates.map(d => format(d, 'yyyy-MM-dd'))));
      };
      const handleSelectAll = () => {
            setBatchSelectedDates(new Set(getMonthDates().map(d => format(d, 'yyyy-MM-dd'))));
      };
      const handleClearSelection = () => setBatchSelectedDates(new Set());
      const handleExitBatchMode = () => { setBatchMode(false); setBatchSelectedDates(new Set()); };

      const handleBatchApplyTemplate = async (templateId: number) => {
            setBatchApplying(true);
            const dates = Array.from(batchSelectedDates);
            let successCount = 0;
            for (const date of dates) {
                  try { await applyTemplateToDate(date, templateId); successCount++; }
                  catch (error) { console.error(`Failed: ${date}`, error); }
            }
            setBatchApplying(false);
            fetchMonthlyStatus();
            if (successCount === dates.length) setToast({ type: 'success', text: `${successCount}일에 템플릿이 적용되었습니다.` });
            else if (successCount > 0) setToast({ type: 'error', text: `${dates.length}일 중 ${successCount}일만 적용되었습니다.` });
            else setToast({ type: 'error', text: '템플릿 적용에 실패했습니다.' });
            setBatchSelectedDates(new Set());
            setBatchMode(false);
      };

      // Batch Delete
      const handleBatchDeletePlans = async () => {
            setBatchDeleting(true);
            const dates = Array.from(batchSelectedDates);
            let successCount = 0;
            for (const date of dates) {
                  try { await routineApi.deletePlan(date); successCount++; }
                  catch { /* Plan may not exist, skip */ }
            }
            setBatchDeleting(false);
            fetchMonthlyStatus();
            if (successCount > 0) setToast({ type: 'success', text: `${successCount}일의 계획이 초기화되었습니다.` });
            else setToast({ type: 'error', text: '초기화할 계획이 없습니다.' });
            setBatchSelectedDates(new Set());
            setBatchMode(false);
      };

      // Calendar Events
      const handleAddEvent = () => { setEditingEvent(null); setEventModalOpen(true); };
      const handleEditEvent = (event: CalendarEvent) => { setEditingEvent(event); setEventModalOpen(true); };
      const handleEventClick = (event: CalendarEvent) => { setEditingEvent(event); setEventModalOpen(true); };

      const handleSaveEvent = async (data: CalendarEventCreateRequest) => {
            if (editingEvent) {
                  await routineApi.updateCalendarEvent(editingEvent.id, data);
                  setToast({ type: 'success', text: '이벤트가 수정되었습니다.' });
            } else {
                  await routineApi.createCalendarEvent(data);
                  setToast({ type: 'success', text: '이벤트가 추가되었습니다.' });
            }
            fetchCalendarEvents();
      };

      const handleDeleteEvent = async (eventId: number) => {
            await routineApi.deleteCalendarEvent(eventId);
            setToast({ type: 'success', text: '이벤트가 삭제되었습니다.' });
            fetchCalendarEvents();
      };

      // Day detail data
      const selectedDayData = selectedDate
            ? monthlyData?.days.find(d => d.date === format(selectedDate, 'yyyy-MM-dd'))
            : undefined;

      const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
      const selectedDayEvents = calendarEvents.filter(
            e => e.startDate <= selectedDateStr && e.endDate >= selectedDateStr
      );

      return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3 h-[calc(100vh-5rem)]">
                  {/* Summary Card */}
                  <MonthlySummaryCard
                        data={monthlyData}
                        isLoading={isLoading}
                        onUpdateGoal={handleUpdateGoal}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                  />

                  {/* Main Content */}
                  {batchMode ? (
                        /* ====== BATCH MODE: Left Panel + Calendar ====== */
                        <div className="flex gap-5 flex-1 min-h-0">
                              {/* Left: Template Panel */}
                              <div className="w-72 shrink-0 flex flex-col min-h-0">
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex-1 flex flex-col gap-4 min-h-0">
                                          {/* Header */}
                                          <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                                            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                      </div>
                                                      <div>
                                                            <h3 className="text-sm font-black text-gray-900 dark:text-white">배치 적용</h3>
                                                            <p className="text-[10px] text-gray-400">
                                                                  {batchSelectedDates.size > 0 ? `${batchSelectedDates.size}일 선택` : '날짜를 선택하세요'}
                                                            </p>
                                                      </div>
                                                </div>
                                                <button onClick={handleExitBatchMode} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                      <X className="w-4 h-4" />
                                                </button>
                                          </div>

                                          {/* Quick Selection */}
                                          <div className="grid grid-cols-2 gap-1.5">
                                                {[
                                                      { label: '평일', action: handleSelectWeekdays },
                                                      { label: '주말', action: handleSelectWeekends },
                                                      { label: '전체', action: handleSelectAll },
                                                      { label: '해제', action: handleClearSelection },
                                                ].map(btn => (
                                                      <button
                                                            key={btn.label}
                                                            onClick={btn.action}
                                                            className="px-2 py-1.5 text-[11px] font-bold bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 transition-colors"
                                                      >
                                                            {btn.label}
                                                      </button>
                                                ))}
                                          </div>

                                          {/* Batch Delete */}
                                          <button
                                                onClick={() => setBatchDeleteConfirmOpen(true)}
                                                disabled={batchDeleting || batchSelectedDates.size === 0}
                                                className="w-full px-3 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold rounded-lg border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                                          >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                {batchDeleting ? '삭제 중...' : `${batchSelectedDates.size}일 계획 초기화`}
                                          </button>

                                          {/* Divider */}
                                          <div className="border-t border-gray-100 dark:border-gray-700" />

                                          {/* Template List */}
                                          <div className="flex-1 flex flex-col min-h-0">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 shrink-0">템플릿 선택</p>
                                                {templates.length === 0 ? (
                                                      <div className="text-center py-6 text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                            <Layers className="w-7 h-7 mx-auto mb-1.5 opacity-30" />
                                                            <p className="text-xs">저장된 템플릿 없음</p>
                                                      </div>
                                                ) : (
                                                      <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                                                            {templates.map(template => {
                                                                  const taskCount = template.tasks?.length || 0;
                                                                  return (
                                                                        <div key={template.id} className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                                                              <div className="flex items-center gap-2 mb-2">
                                                                                    <div className={classNames(
                                                                                          "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                                                                                          template.type === 'REST' ? "bg-amber-100 dark:bg-amber-900/30" : "bg-indigo-100 dark:bg-indigo-900/30"
                                                                                    )}>
                                                                                          {template.type === 'REST'
                                                                                                ? <Coffee className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                                                                                : <ListTodo className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                                                                          }
                                                                                    </div>
                                                                                    <div className="min-w-0 flex-1">
                                                                                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{template.name}</p>
                                                                                          <p className="text-[10px] text-gray-400">{taskCount}개 태스크</p>
                                                                                    </div>
                                                                              </div>

                                                                              {/* Task Preview */}
                                                                              {template.tasks && template.tasks.length > 0 && (
                                                                                    <div className="space-y-0.5 mb-2">
                                                                                          {template.tasks.slice(0, 3).map((task, idx) => (
                                                                                                <div key={task.id || idx} className="flex items-center gap-1.5 text-[10px]">
                                                                                                      <div className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                                                                                                      <span className="text-gray-500 dark:text-gray-400 truncate">{task.title}</span>
                                                                                                </div>
                                                                                          ))}
                                                                                          {template.tasks.length > 3 && (
                                                                                                <p className="text-[9px] text-gray-400 pl-2.5">+{template.tasks.length - 3}개 더</p>
                                                                                          )}
                                                                                    </div>
                                                                              )}

                                                                              <button
                                                                                    onClick={() => handleBatchApplyTemplate(template.id)}
                                                                                    disabled={batchApplying || batchSelectedDates.size === 0}
                                                                                    className="w-full px-3 py-2 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                                                                              >
                                                                                    {batchApplying ? (
                                                                                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                                    ) : (
                                                                                          <>{batchSelectedDates.size}일에 적용</>
                                                                                    )}
                                                                              </button>
                                                                        </div>
                                                                  );
                                                            })}
                                                      </div>
                                                )}
                                          </div>
                                    </div>
                              </div>

                              {/* Right: Calendar */}
                              <div className="flex-1 min-w-0 flex flex-col">
                                    <MonthlyCalendarGrid
                                          year={year}
                                          month={month}
                                          data={monthlyData?.days || []}
                                          selectedDate={selectedDate}
                                          onSelectDay={handleSelectDay}
                                          batchMode={true}
                                          batchSelectedDates={batchSelectedDates}
                                          onToggleBatchDate={handleToggleBatchDate}
                                          events={calendarEvents}
                                          className="flex-1"
                                    />
                              </div>
                        </div>
                  ) : (
                        /* ====== NORMAL MODE: Full Calendar ====== */
                        <div className="flex-1 flex flex-col min-h-0">
                              {/* Batch Toggle */}
                              <div className="flex items-center justify-end mb-2">
                                    <button
                                          onClick={() => setBatchMode(true)}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                          <Layers className="w-3.5 h-3.5" />
                                          배치 적용
                                    </button>
                              </div>

                              <MonthlyCalendarGrid
                                    year={year}
                                    month={month}
                                    data={monthlyData?.days || []}
                                    selectedDate={selectedDate}
                                    onSelectDay={handleSelectDay}
                                    onOpenDetail={handleOpenDetail}
                                    onEventClick={handleEventClick}
                                    events={calendarEvents}
                                    className="flex-1"
                              />
                        </div>
                  )}

                  {/* ====== Day Detail Slide Panel ====== */}
                  <div
                        className={classNames(
                              "fixed inset-0 bg-black/20 z-40 transition-opacity duration-300",
                              detailPanelOpen && !batchMode ? "opacity-100" : "opacity-0 pointer-events-none"
                        )}
                        onClick={() => setDetailPanelOpen(false)}
                  />
                  <div
                        className={classNames(
                              "fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-gray-50 dark:bg-gray-950 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col",
                              detailPanelOpen && !batchMode ? "translate-x-0" : "translate-x-full"
                        )}
                  >
                        {/* Panel Header */}
                        <div className="sticky top-0 bg-gray-50 dark:bg-gray-950 z-10 px-5 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                              <h3 className="text-sm font-black text-gray-900 dark:text-white">
                                    {selectedDate ? format(selectedDate, 'M월 d일') : '날짜 상세'}
                              </h3>
                              <button
                                    onClick={() => setDetailPanelOpen(false)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                    <X className="w-5 h-5" />
                              </button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                              {selectedDate && (
                                    <DayDetailPanel
                                          date={selectedDate}
                                          dayData={selectedDayData}
                                          templates={templates}
                                          events={selectedDayEvents}
                                          onUpdateMemo={handleUpdateMemo}
                                          onApplyTemplate={handleApplyTemplate}
                                          onAddEvent={handleAddEvent}
                                          onEditEvent={handleEditEvent}
                                          onDeleteEvent={handleDeleteEvent}
                                    />
                              )}
                        </div>
                  </div>

                  {/* Calendar Event Modal */}
                  <CalendarEventModal
                        isOpen={eventModalOpen}
                        onClose={() => { setEventModalOpen(false); setEditingEvent(null); }}
                        onSave={handleSaveEvent}
                        onDelete={handleDeleteEvent}
                        editEvent={editingEvent}
                        defaultDate={selectedDateStr}
                  />

                  {/* Batch Delete Confirm Modal */}
                  <ConfirmModal
                        isOpen={batchDeleteConfirmOpen}
                        onClose={() => setBatchDeleteConfirmOpen(false)}
                        onConfirm={handleBatchDeletePlans}
                        title="계획 초기화"
                        message={`선택한 ${batchSelectedDates.size}일의 계획을 모두 삭제합니다. 태스크, 메모, 회고가 함께 삭제됩니다.`}
                        confirmLabel="초기화"
                        variant="danger"
                  />

                  {toast && (
                        <Toast
                              message={toast.text}
                              type={toast.type}
                              onClose={() => setToast(null)}
                        />
                  )}
            </div>
      );
};

export default MonthlyCalendarPage;
