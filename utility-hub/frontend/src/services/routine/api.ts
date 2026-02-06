import axiosInstance from '../../api/axiosInstance';
import type { DailyPlan, Task, Reflection, ReflectionDto, WeeklyStats, WeeklyReview, WeeklyReviewDto, RoutineTemplate, TemplateCreateRequest, MonthlyStatus, MonthlyGoalRequest, MonthlyMemoRequest, CalendarEvent, CalendarEventCreateRequest } from '../../types/routine';

const BASE_URL = '/v1/routine';

export const routineApi = {
      // Daily Plan
      getTodayPlan: () => axiosInstance.get<{ success: boolean, data: DailyPlan }>(`${BASE_URL}/daily-plans/today`),
      getPlan: (date: string) => axiosInstance.get<{ success: boolean, data: DailyPlan }>(`${BASE_URL}/daily-plans/${date}`),
      createPlan: (data: { planDate: string }) => axiosInstance.post<{ success: boolean, data: DailyPlan }>(`${BASE_URL}/daily-plans`, data),
      confirmPlan: (date: string) => axiosInstance.post<{ success: boolean, data: DailyPlan }>(`${BASE_URL}/daily-plans/${date}/confirm`),
      unconfirmPlan: (date: string) => axiosInstance.post<{ success: boolean, data: DailyPlan }>(`${BASE_URL}/daily-plans/${date}/unconfirm`),
      deletePlan: (date: string) => axiosInstance.delete<{ success: boolean }>(`${BASE_URL}/daily-plans/${date}`),

      // Task
      // Task
      addTask: (planId: number, data: {
            title: string;
            category?: string;
            startTime?: string;
            endTime?: string;
            durationMinutes?: number;
            description?: string;
            priority?: string;
      }) =>
            axiosInstance.post<{ success: boolean, data: Task }>(`${BASE_URL}/daily-plans/${planId}/tasks`, data),

      updateTask: (taskId: number, data: Partial<{
            title: string;
            completed: boolean;
            category: string;
            startTime: string;
            endTime: string;
            durationMinutes: number;
            description: string;
            priority: string;
      }>) =>
            axiosInstance.put<{ success: boolean, data: Task }>(`${BASE_URL}/tasks/${taskId}`, data),

      deleteTask: (taskId: number) =>
            axiosInstance.delete<{ success: boolean }>(`${BASE_URL}/tasks/${taskId}`),

      toggleTask: (taskId: number) =>
            axiosInstance.patch<{ success: boolean, data: Task }>(`${BASE_URL}/tasks/${taskId}/toggle`),

      // Reflection
      saveReflection: (data: ReflectionDto) =>
            axiosInstance.post<{ success: boolean, data: Reflection }>(`${BASE_URL}/reflections`, data),

      getArchive: (params: { page: number; size: number }) =>
            axiosInstance.get<{ success: boolean, data: { content: Reflection[], totalPages: number } }>(`${BASE_URL}/reflections/archive`, { params }),

      // Stats
      getWeeklyStats: (date: string) =>
            axiosInstance.get<{ success: boolean, data: WeeklyStats }>(`${BASE_URL}/stats/weekly`, { params: { date } }),

      // Weekly Review
      saveWeeklyReview: (data: WeeklyReviewDto) =>
            axiosInstance.post<{ success: boolean, data: WeeklyReview }>(`${BASE_URL}/weekly-reviews`, data),

      getWeeklyReview: (weekStart: string) =>
            axiosInstance.get<{ success: boolean, data: WeeklyReview | null }>(`${BASE_URL}/weekly-reviews/${weekStart}`),

      // Templates
      getTemplates: () =>
            axiosInstance.get<{ success: boolean, data: RoutineTemplate[] }>(`${BASE_URL}/templates`),

      createTemplate: (data: TemplateCreateRequest) =>
            axiosInstance.post<{ success: boolean, data: RoutineTemplate }>(`${BASE_URL}/templates`, data),

      deleteTemplate: (templateId: number) =>
            axiosInstance.delete<{ success: boolean }>(`${BASE_URL}/templates/${templateId}`),

      applyTemplate: (planId: number, templateId: number) =>
            axiosInstance.post<{ success: boolean, data: DailyPlan }>(`${BASE_URL}/daily-plans/${planId}/apply-template/${templateId}`),

      // Monthly Calendar
      getMonthlyStatus: (year: number, month: number) =>
            axiosInstance.get<{ success: boolean, data: MonthlyStatus }>(`${BASE_URL}/monthly/${year}/${month}`),

      updateMonthlyGoal: (year: number, month: number, data: MonthlyGoalRequest) =>
            axiosInstance.post<{ success: boolean }>(`${BASE_URL}/monthly/${year}/${month}/goal`, data),

      updateMonthlyMemo: (date: string, data: MonthlyMemoRequest) =>
            axiosInstance.post<{ success: boolean }>(`${BASE_URL}/daily-plans/${date}/memo`, data),

      // Calendar Events
      getCalendarEvents: (year: number, month: number) =>
            axiosInstance.get<{ success: boolean, data: CalendarEvent[] }>(`${BASE_URL}/calendar-events`, { params: { year, month } }),

      createCalendarEvent: (data: CalendarEventCreateRequest) =>
            axiosInstance.post<{ success: boolean, data: CalendarEvent }>(`${BASE_URL}/calendar-events`, data),

      updateCalendarEvent: (eventId: number, data: CalendarEventCreateRequest) =>
            axiosInstance.put<{ success: boolean, data: CalendarEvent }>(`${BASE_URL}/calendar-events/${eventId}`, data),

      deleteCalendarEvent: (eventId: number) =>
            axiosInstance.delete<{ success: boolean }>(`${BASE_URL}/calendar-events/${eventId}`),
};
