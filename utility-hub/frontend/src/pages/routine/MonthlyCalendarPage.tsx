import { useRef, useState as useStateReact } from 'react';
import { format } from 'date-fns';
import { Layers, X, Coffee, ListTodo, Trash2, Download, Printer, Image, FileText, ChevronDown } from 'lucide-react';
import { toPng } from 'html-to-image';
import MonthlySummaryCard from '@/components/routine/Monthly/MonthlySummaryCard';
import MonthlyCalendarGrid from '@/components/routine/Monthly/MonthlyCalendarGrid';
import DayDetailPanel from '@/components/routine/Monthly/DayDetailPanel';
import CalendarEventModal from '@/components/routine/Monthly/CalendarEventModal';
import classNames from 'classnames';
import Toast from '@/components/common/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useMonthlyCalendar } from '@/hooks/routine/useMonthlyCalendar';
import { routineApi } from '@/services/routine/api';

const MonthlyCalendarPage = () => {
      const {
            year, month, monthlyData, templates, calendarEvents, isLoading,
            handlePrevMonth, handleNextMonth,
            selectedDate, handleSelectDay, selectedDayData, selectedDateStr, selectedDayEvents,
            detailPanelOpen, setDetailPanelOpen, handleOpenDetail,
            handleUpdateGoal, handleUpdateMemo, handleApplyTemplate,
            batchMode, setBatchMode, batchSelectedDates, batchApplying, batchDeleting,
            handleToggleBatchDate, handleSelectWeekdays, handleSelectWeekends,
            handleSelectAll, handleClearSelection, handleExitBatchMode,
            handleBatchApplyTemplate, handleBatchDeletePlans,
            eventModalOpen, editingEvent, handleAddEvent, handleEditEvent, handleEventClick,
            handleSaveEvent, handleDeleteEvent, setEventModalOpen, setEditingEvent,
            toast, setToast,
            batchDeleteConfirmOpen, setBatchDeleteConfirmOpen,
      } = useMonthlyCalendar();

      const calendarRef = useRef<HTMLDivElement>(null);
      const [exportOpen, setExportOpen] = useStateReact(false);
      const [exporting, setExporting] = useStateReact(false);

      const handleExportIcs = async () => {
            try {
                  const res = await routineApi.exportMonthlyIcs(year, month);
                  const url = URL.createObjectURL(new Blob([res.data]));
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `routine-${year}-${String(month).padStart(2, '0')}.ics`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
            } catch { /* silently fail */ }
            setExportOpen(false);
      };

      const handleExportImage = async () => {
            if (!calendarRef.current) return;
            setExporting(true);
            try {
                  const dataUrl = await toPng(calendarRef.current, {
                        backgroundColor: '#ffffff',
                        pixelRatio: 2,
                  });
                  const a = document.createElement('a');
                  a.href = dataUrl;
                  a.download = `routine-${year}-${String(month).padStart(2, '0')}.png`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
            } catch {
                  setToast({ type: 'error', text: '이미지 저장에 실패했습니다.' });
            } finally {
                  setExporting(false);
                  setExportOpen(false);
            }
      };

      const handlePrint = () => {
            setExportOpen(false);
            setTimeout(() => window.print(), 100);
      };

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
                                    <div className="bg-mystic-bg-secondary rounded-2xl shadow-sm border border-mystic-border p-4 flex-1 flex flex-col gap-4 min-h-0">
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
                                                                                    className="w-full px-3 py-2 mystic-solid text-white text-[11px] font-bold rounded-lg mystic-solid-hover disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
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
                              {/* Actions */}
                              <div className="flex items-center justify-end gap-2 mb-2 print:hidden">
                                    {/* Export Dropdown */}
                                    <div className="relative">
                                          <button
                                                onClick={() => setExportOpen(prev => !prev)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                          >
                                                <Download className="w-3.5 h-3.5" />
                                                내보내기
                                                <ChevronDown className={`w-3 h-3 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                                          </button>
                                          {exportOpen && (
                                                <>
                                                      <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                                                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-150">
                                                            <button
                                                                  onClick={handlePrint}
                                                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                            >
                                                                  <Printer className="w-4 h-4 text-gray-400" />
                                                                  <div className="text-left">
                                                                        <div>프린트 / PDF</div>
                                                                        <div className="text-[10px] text-gray-400 font-medium">브라우저 인쇄 기능</div>
                                                                  </div>
                                                            </button>
                                                            <button
                                                                  onClick={handleExportImage}
                                                                  disabled={exporting}
                                                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                                            >
                                                                  <Image className="w-4 h-4 text-gray-400" />
                                                                  <div className="text-left">
                                                                        <div>{exporting ? '저장 중...' : 'PNG 이미지'}</div>
                                                                        <div className="text-[10px] text-gray-400 font-medium">캘린더를 이미지로 저장</div>
                                                                  </div>
                                                            </button>
                                                            <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                                                            <button
                                                                  onClick={handleExportIcs}
                                                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                            >
                                                                  <FileText className="w-4 h-4 text-gray-400" />
                                                                  <div className="text-left">
                                                                        <div>ICS 파일</div>
                                                                        <div className="text-[10px] text-gray-400 font-medium">캘린더 앱으로 가져오기</div>
                                                                  </div>
                                                            </button>
                                                      </div>
                                                </>
                                          )}
                                    </div>
                                    <button
                                          onClick={() => setBatchMode(true)}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                          <Layers className="w-3.5 h-3.5" />
                                          배치 적용
                                    </button>
                              </div>

                              <MonthlyCalendarGrid
                                    ref={calendarRef}
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
