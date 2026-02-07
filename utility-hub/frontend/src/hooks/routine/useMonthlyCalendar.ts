import { useState, useEffect, useCallback } from 'react';
import { format, endOfMonth, eachDayOfInterval } from 'date-fns';
import { routineApi } from '../../services/routine/api';
import type {
  MonthlyStatus,
  RoutineTemplate,
  CalendarEvent,
  CalendarEventCreateRequest,
  DailySummary,
} from '../../types/routine';

export interface UseMonthlyCalendarReturn {
  // Core data
  year: number;
  month: number;
  monthlyData: MonthlyStatus | null;
  templates: RoutineTemplate[];
  calendarEvents: CalendarEvent[];
  isLoading: boolean;

  // Navigation
  handlePrevMonth: () => void;
  handleNextMonth: () => void;

  // Day selection
  selectedDate: Date | null;
  handleSelectDay: (date: Date) => void;
  selectedDayData: DailySummary | undefined;
  selectedDateStr: string;
  selectedDayEvents: CalendarEvent[];

  // Detail panel
  detailPanelOpen: boolean;
  setDetailPanelOpen: (v: boolean) => void;
  handleOpenDetail: (date: Date) => void;

  // Goal / Memo
  handleUpdateGoal: (goal: string) => Promise<void>;
  handleUpdateMemo: (date: string, memo: string) => Promise<void>;

  // Template apply
  handleApplyTemplate: (date: string, templateId: number) => Promise<void>;

  // Batch mode
  batchMode: boolean;
  setBatchMode: (v: boolean) => void;
  batchSelectedDates: Set<string>;
  batchApplying: boolean;
  batchDeleting: boolean;
  handleToggleBatchDate: (dateStr: string) => void;
  handleSelectWeekdays: () => void;
  handleSelectWeekends: () => void;
  handleSelectAll: () => void;
  handleClearSelection: () => void;
  handleExitBatchMode: () => void;
  handleBatchApplyTemplate: (templateId: number) => Promise<void>;
  handleBatchDeletePlans: () => Promise<void>;

  // Calendar events
  eventModalOpen: boolean;
  editingEvent: CalendarEvent | null;
  handleAddEvent: () => void;
  handleEditEvent: (event: CalendarEvent) => void;
  handleEventClick: (event: CalendarEvent) => void;
  handleSaveEvent: (data: CalendarEventCreateRequest) => Promise<void>;
  handleDeleteEvent: (eventId: number) => Promise<void>;
  setEventModalOpen: (v: boolean) => void;
  setEditingEvent: (v: CalendarEvent | null) => void;

  // Toast
  toast: { type: 'success' | 'error'; text: string } | null;
  setToast: (v: { type: 'success' | 'error'; text: string } | null) => void;

  // Batch delete confirm
  batchDeleteConfirmOpen: boolean;
  setBatchDeleteConfirmOpen: (v: boolean) => void;
}

export function useMonthlyCalendar(): UseMonthlyCalendarReturn {
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
    await fetchMonthlyStatus();
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

  return {
    // Core data
    year,
    month,
    monthlyData,
    templates,
    calendarEvents,
    isLoading,

    // Navigation
    handlePrevMonth,
    handleNextMonth,

    // Day selection
    selectedDate,
    handleSelectDay,
    selectedDayData,
    selectedDateStr,
    selectedDayEvents,

    // Detail panel
    detailPanelOpen,
    setDetailPanelOpen,
    handleOpenDetail,

    // Goal / Memo
    handleUpdateGoal,
    handleUpdateMemo,

    // Template apply
    handleApplyTemplate,

    // Batch mode
    batchMode,
    setBatchMode,
    batchSelectedDates,
    batchApplying,
    batchDeleting,
    handleToggleBatchDate,
    handleSelectWeekdays,
    handleSelectWeekends,
    handleSelectAll,
    handleClearSelection,
    handleExitBatchMode,
    handleBatchApplyTemplate,
    handleBatchDeletePlans,

    // Calendar events
    eventModalOpen,
    editingEvent,
    handleAddEvent,
    handleEditEvent,
    handleEventClick,
    handleSaveEvent,
    handleDeleteEvent,
    setEventModalOpen,
    setEditingEvent,

    // Toast
    toast,
    setToast,

    // Batch delete confirm
    batchDeleteConfirmOpen,
    setBatchDeleteConfirmOpen,
  };
}
