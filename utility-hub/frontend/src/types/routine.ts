// Enum Types
export type Category = 'WORK' | 'PERSONAL' | 'HEALTH' | 'STUDY';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface WeeklyStats {
      weeklyRate: number;
      dailyCompletion: Record<string, number>; // "MON": 80, "TUE": 100
}

export interface Task {
      id: number;
      title: string;
      completed: boolean;
      taskOrder: number;
      // V2 Fields
      category?: Category;
      startTime?: string; // HH:mm:ss
      endTime?: string; // HH:mm:ss
      durationMinutes?: number; // [V2 Kinetic] Expected duration in minutes
      description?: string;
      priority?: Priority;

      createdAt?: string;
      updatedAt?: string;
}

export interface TimeBlock {
      id: number;
      period: string; // 'morning' | 'midday' | 'afternoon' | 'evening'
      label: string;
      startHour: number;
      endHour: number;
      assignedTaskId?: number | null;
}

export interface Reflection {
      id: number;
      planId?: number;
      rating: number; // 1-5
      mood: string;
      whatWentWell?: string;
      whatDidntGoWell?: string;
      tomorrowFocus?: string;

      // V2 Fields
      energyLevel?: number; // 1-5
      morningGoal?: string;

      createdAt?: string;
}

export interface DailyPlan {
      id: number;
      userId: number;
      planDate: string; // YYYY-MM-DD
      status: 'PLANNING' | 'CONFIRMED';
      keyTasks: Task[];
      timeBlocks: TimeBlock[];
      reflection: Reflection | null;
      createdAt?: string;
      updatedAt?: string;
}

export interface DailyPlanDto {
      planDate: string;
}

export interface TaskDto {
      title: string;
      category?: Category;
      startTime?: string;
      endTime?: string;
      durationMinutes?: number;
      description?: string;
      priority?: Priority;
}

export interface ReflectionDto {
      planId: number;
      rating: number;
      mood: string;
      whatWentWell: string;
      whatDidntGoWell: string;
      tomorrowFocus: string;
      energyLevel?: number;
      morningGoal?: string;
}

export interface WeeklyReview {
      id: number;
      weekStart: string; // YYYY-MM-DD
      achievement: string;
      improvement: string;
      nextGoal: string;
      createdAt?: string;
      updatedAt?: string;
}

export interface WeeklyReviewDto {
      weekStart: string;
      achievement: string;
      improvement: string;
      nextGoal: string;
}

// Monthly Types
export interface MonthlyGoalRequest {
      monthlyGoal: string;
}
// ... existing types

export interface CalendarEvent {
      id: number;
      title: string;
      description?: string;
      startDate: string; // YYYY-MM-DD
      endDate: string;   // YYYY-MM-DD
      color: string;
      type: 'MEMO' | 'PLAN' | 'HOLIDAY';
}

export interface CalendarEventCreateRequest {
      title: string;
      description?: string;
      startDate: string;
      endDate: string;
      color: string;
      type: 'MEMO' | 'PLAN' | 'HOLIDAY';
}


export interface DailySummary {
      date: string;
      completionRate: number;
      isRest: boolean;
      hasPlan: boolean;
      memoSnippet: string | null;
}

export interface MonthlyStatus {
      year: number;
      month: number;
      monthlyGoal: string | null;
      totalXp: number;
      monthlyCompletionRate: number;
      days: DailySummary[];
}

// Template Types
export interface TemplateTask {
      id: number;
      title: string;
      taskOrder: number;
      category?: Category;
      startTime?: string;
      endTime?: string;
      durationMinutes?: number;
      description?: string;
      priority?: Priority;
}

export interface RoutineTemplate {
      id: number;
      name: string;
      name: string;
      description?: string;
      type?: TemplateType;
      tasks: TemplateTask[];
      createdAt?: string;
      updatedAt?: string;
}

export interface TemplateCreateRequest {
      name: string;
      description?: string;
      type?: TemplateType;
      sourcePlanId?: number;
}
