import { create } from 'zustand';
import { routineApi } from '../services/routine/api';
import type { DailyPlan, Reflection, ReflectionDto, WeeklyStats, Task, WeeklyReview, WeeklyReviewDto, RoutineTemplate, TemplateCreateRequest } from '../types/routine';

// Task 업데이트 시 사용하는 데이터 타입
type TaskUpdateData = Partial<Pick<Task, 'title' | 'completed' | 'category' | 'startTime' | 'endTime' | 'durationMinutes' | 'description' | 'priority'>>;

interface RoutineState {
      today: DailyPlan | null;
      reflections: Reflection[];
      weeklyStats: WeeklyStats | null;
      weeklyReview: WeeklyReview | null;
      templates: RoutineTemplate[];
      templatesLoading: boolean;
      isLoading: boolean;
      error: string | null;

      loadToday: () => Promise<void>;
      addTask: (title: string, options?: { category?: string; startTime?: string; endTime?: string; durationMinutes?: number; description?: string; priority?: string }) => Promise<void>;
      updateTask: (taskId: number, data: TaskUpdateData) => Promise<void>;
      toggleTask: (taskId: number) => Promise<void>;
      deleteTask: (taskId: number) => Promise<void>;
      saveReflection: (data: ReflectionDto) => Promise<void>;
      loadArchive: (page: number, size: number) => Promise<void>;
      loadWeeklyStats: (date: string) => Promise<void>;
      loadWeeklyReview: (weekStart: string) => Promise<void>;
      saveWeeklyReview: (data: WeeklyReviewDto) => Promise<void>;
      loadPlan: (date: string) => Promise<void>;
      confirmPlan: (date: string) => Promise<void>;
      unconfirmPlan: (date: string) => Promise<void>;
      loadTemplates: () => Promise<void>;
      createTemplate: (data: TemplateCreateRequest) => Promise<void>;
      deleteTemplate: (templateId: number) => Promise<void>;
      applyTemplate: (templateId: number) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
      today: null,
      reflections: [],
      weeklyStats: null,
      weeklyReview: null,
      templates: [],
      templatesLoading: false,
      isLoading: false,
      error: null,

      loadToday: async () => {
            set({ isLoading: true, error: null });
            try {
                  const res = await routineApi.getTodayPlan();
                  set({ today: res.data.data, isLoading: false });
            } catch (err: any) {
                  console.error(err);
                  // If 404/empty, maybe handle? But API should return empty plan.
                  set({ error: 'Failed to load daily plan', isLoading: false });
            }
      },

      addTask: async (title: string, options?: { category?: string; startTime?: string; endTime?: string; durationMinutes?: number; description?: string; priority?: string }) => {
            const { today } = get();
            if (!today) return;
            try {
                  const res = await routineApi.addTask(today.id, {
                        title,
                        ...options
                  });
                  set(state => ({
                        today: state.today ? {
                              ...state.today,
                              keyTasks: [...state.today.keyTasks, res.data.data]
                        } : null
                  }));
            } catch (err: any) {
                  console.error(err);
                  set({ error: 'Failed to add task' });
            }
      },

      updateTask: async (taskId: number, data: TaskUpdateData) => {
            try {
                  const res = await routineApi.updateTask(taskId, data);
                  set(state => ({
                        today: state.today ? {
                              ...state.today,
                              keyTasks: state.today.keyTasks.map(t =>
                                    t.id === taskId ? res.data.data : t
                              )
                        } : null
                  }));
            } catch (err: any) {
                  console.error(err);
                  set({ error: 'Failed to update task' });
            }
      },

      toggleTask: async (taskId: number) => {
            try {
                  const res = await routineApi.toggleTask(taskId);
                  set(state => ({
                        today: state.today ? {
                              ...state.today,
                              keyTasks: state.today.keyTasks.map(t =>
                                    t.id === taskId ? res.data.data : t
                              )
                        } : null
                  }));
            } catch (err: any) {
                  console.error(err);
                  set({ error: 'Failed to toggle task' });
            }
      },

      deleteTask: async (taskId: number) => {
            try {
                  await routineApi.deleteTask(taskId);
                  set(state => ({
                        today: state.today ? {
                              ...state.today,
                              keyTasks: state.today.keyTasks.filter(t => t.id !== taskId)
                        } : null
                  }));
            } catch (err: any) {
                  console.error(err);
                  set({ error: 'Failed to delete task' });
            }
      },

      saveReflection: async (data: ReflectionDto) => {
            try {
                  const res = await routineApi.saveReflection(data);
                  set(state => ({
                        today: state.today ? {
                              ...state.today,
                              reflection: res.data.data
                        } : null
                  }));
            } catch (err: any) {
                  console.error(err);
                  set({ error: 'Failed to save reflection' });
            }
      },

      loadArchive: async (page, size) => {
            set({ isLoading: true });
            try {
                  const res = await routineApi.getArchive({ page, size });
                  set(state => ({
                        // 첫 페이지면 교체, 아니면 누적
                        reflections: page === 0
                              ? res.data.data.content
                              : [...state.reflections, ...res.data.data.content],
                        isLoading: false
                  }));
            } catch (err: any) {
                  console.error(err);
                  set({ error: 'Failed to load archive', isLoading: false });
            }
      },

      loadPlan: async (date: string) => {
            set({ isLoading: true, error: null });
            try {
                  const res = await routineApi.getPlan(date);
                  set({ today: res.data.data, isLoading: false });
            } catch (err: any) {
                  console.error(err);
                  set({ error: 'Failed to load plan', isLoading: false, today: null });
            }
      },

      loadWeeklyStats: async (date: string) => {
            // 새 주 로드 시 이전 데이터 초기화
            set({ weeklyStats: null });
            try {
                  const res = await routineApi.getWeeklyStats(date);
                  set({ weeklyStats: res.data.data });
            } catch (err: any) {
                  console.error(err);
                  set({ weeklyStats: null });
            }
      },

      loadWeeklyReview: async (weekStart: string) => {
            // 새 주 로드 시 이전 데이터 초기화
            set({ weeklyReview: null });
            try {
                  const res = await routineApi.getWeeklyReview(weekStart);
                  set({ weeklyReview: res.data.data });
            } catch (err: any) {
                  console.error(err);
                  set({ weeklyReview: null });
            }
      },

      saveWeeklyReview: async (data: WeeklyReviewDto) => {
            try {
                  const res = await routineApi.saveWeeklyReview(data);
                  set({ weeklyReview: res.data.data });
            } catch (err: any) {
                  console.error(err);
                  throw err; // Re-throw to let component handle error
            }
      },

      confirmPlan: async (date: string) => {
            set({ isLoading: true, error: null });
            try {
                  const res = await routineApi.confirmPlan(date);
                  set({ today: res.data.data, isLoading: false });
            } catch (err: any) {
                  console.error(err);
                  set({ error: 'Failed to confirm plan', isLoading: false });
            }
      },

      unconfirmPlan: async (date: string) => {
            set({ isLoading: true, error: null });
            try {
                  const res = await routineApi.unconfirmPlan(date);
                  set({ today: res.data.data, isLoading: false });
            } catch (err: any) {
                  console.error(err);
                  set({ error: 'Failed to unconfirm plan', isLoading: false });
            }
      },

      loadTemplates: async () => {
            set({ templatesLoading: true });
            try {
                  const res = await routineApi.getTemplates();
                  set({ templates: res.data.data, templatesLoading: false });
            } catch (err: any) {
                  console.error(err);
                  set({ templatesLoading: false, error: '템플릿을 불러오는데 실패했습니다' });
            }
      },

      createTemplate: async (data: TemplateCreateRequest) => {
            try {
                  const res = await routineApi.createTemplate(data);
                  set(state => ({ templates: [res.data.data, ...state.templates] }));
            } catch (err: any) {
                  console.error(err);
                  set({ error: '템플릿 저장에 실패했습니다' });
            }
      },

      deleteTemplate: async (templateId: number) => {
            try {
                  await routineApi.deleteTemplate(templateId);
                  set(state => ({ templates: state.templates.filter(t => t.id !== templateId) }));
            } catch (err: any) {
                  console.error(err);
                  set({ error: '템플릿 삭제에 실패했습니다' });
            }
      },

      applyTemplate: async (templateId: number) => {
            const state = get();
            if (!state.today) return;
            try {
                  const res = await routineApi.applyTemplate(state.today.id, templateId);
                  set({ today: res.data.data });
            } catch (err: any) {
                  console.error(err);
                  set({ error: '템플릿 적용에 실패했습니다' });
            }
      }
}));
