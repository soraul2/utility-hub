import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import MonthlySummaryCard from '@/components/routine/Monthly/MonthlySummaryCard';
import MonthlyCalendarGrid from '@/components/routine/Monthly/MonthlyCalendarGrid';
import DayDetailPanel from '@/components/routine/Monthly/DayDetailPanel';
import { routineApi } from '@/services/routine/api';
import type { MonthlyStatus, RoutineTemplate } from '@/types/routine';

const MonthlyCalendarPage = () => {
      // State
      const [currentDate, setCurrentDate] = useState(new Date()); // Tracks the month being viewed
      const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Tracks the specific day selected
      const [monthlyData, setMonthlyData] = useState<MonthlyStatus | null>(null);
      const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
      const [isLoading, setIsLoading] = useState(false);

      const detailRef = useRef<HTMLDivElement>(null);

      // Derived values
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      // Fetch Data
      const fetchMonthlyStatus = useCallback(async () => {
            setIsLoading(true);
            try {
                  const response = await routineApi.getMonthlyStatus(year, month);
                  if (response.data.success) {
                        setMonthlyData(response.data.data);
                  }
            } catch (error) {
                  console.error("Failed to fetch monthly status:", error);
            } finally {
                  setIsLoading(false);
            }
      }, [year, month]);

      const fetchTemplates = async () => {
            try {
                  const response = await routineApi.getTemplates();
                  if (response.data.success) {
                        setTemplates(response.data.data);
                  }
            } catch (error) {
                  console.error("Failed to fetch templates:", error);
            }
      };

      useEffect(() => {
            fetchMonthlyStatus();
      }, [fetchMonthlyStatus]);

      useEffect(() => {
            fetchTemplates();
      }, []);

      // Handlers
      const handlePrevMonth = () => {
            setCurrentDate(new Date(year, month - 2, 1)); // Go to prev month
      };

      const handleNextMonth = () => {
            setCurrentDate(new Date(year, month, 1)); // Go to next month
      };

      const handleUpdateGoal = async (goal: string) => {
            try {
                  await routineApi.updateMonthlyGoal(year, month, { monthlyGoal: goal });
                  // Optimistic update or refetch
                  setMonthlyData(prev => prev ? { ...prev, monthlyGoal: goal } : null);
            } catch (error) {
                  console.error("Failed to update goal:", error);
                  alert("목표 수정 실패");
            }
      };

      const handleUpdateMemo = async (date: string, memo: string) => {
            try {
                  await routineApi.updateMonthlyMemo(date, { memo });
                  // Refresh data to show update (e.g. memo dot might change if logic exists)
                  // For now, simple refetch
                  fetchMonthlyStatus();
            } catch (error) {
                  console.error("Failed to update memo:", error);
                  throw error; // Let child handle error state
            }
      };

      const handleApplyTemplate = async (date: string, templateId: number) => {
            try {
                  // Workaround for applying template to future dates by ensuring plan exists first
                  const response = await routineApi.getPlan(date);
                  let planId = response.data.data?.id;

                  if (!planId) {
                        // If plan doesn't exist, create it
                        const createRes = await routineApi.createPlan({ planDate: date });
                        if (createRes.data.success) {
                              planId = createRes.data.data.id;
                        }
                  }

                  if (planId) {
                        await routineApi.applyTemplate(planId, templateId);
                        fetchMonthlyStatus(); // Refresh status
                  }

            } catch (error) {
                  console.error("Failed to apply template:", error);
                  // If getPlan fails (e.g. 404), try create
                  try {
                        const createRes = await routineApi.createPlan({ planDate: date });
                        if (createRes.data.success) {
                              await routineApi.applyTemplate(createRes.data.data.id, templateId);
                              fetchMonthlyStatus();
                        }
                  } catch (createError) {
                        console.error("Failed to create and apply:", createError);
                        throw createError;
                  }
            }
      };

      // Find data for selected date
      const selectedDayData = selectedDate
            ? monthlyData?.days.find(d => d.date === format(selectedDate, 'yyyy-MM-dd'))
            : undefined;

      // Effect to scroll to detail panel when date is selected
      useEffect(() => {
            if (selectedDate && detailRef.current) {
                  // Optional: Smooth scroll or just ensure it's in view
                  // detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
      }, [selectedDate]);

      return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                  {/* Top: Summary Card */}
                  <MonthlySummaryCard
                        data={monthlyData}
                        isLoading={isLoading}
                        onUpdateGoal={handleUpdateGoal}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                  />

                  <div className="flex flex-col gap-6">
                        {/* Calendar Grid (Full Width) */}
                        <div className="w-full">
                              <MonthlyCalendarGrid
                                    year={year}
                                    month={month}
                                    data={monthlyData?.days || []}
                                    selectedDate={selectedDate}
                                    onSelectDay={setSelectedDate}
                              />
                        </div>

                        {/* Day Detail Panel (Bottom, Full Width) */}
                        <div ref={detailRef}>
                              <DayDetailPanel
                                    date={selectedDate}
                                    dayData={selectedDayData}
                                    templates={templates}
                                    onUpdateMemo={handleUpdateMemo}
                                    onApplyTemplate={handleApplyTemplate}
                              />
                        </div>
                  </div>
            </div>
      );
};

export default MonthlyCalendarPage;
