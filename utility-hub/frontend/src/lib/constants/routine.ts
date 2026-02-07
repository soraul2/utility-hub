import { Smile, Meh, Frown, Briefcase, Heart, GraduationCap, Home } from 'lucide-react';
import type { Category, Priority } from '../../types/routine';

// ── Mood ──
export const MOOD_CONFIG: Record<string, {
      icon: typeof Smile;
      label: string;
      color: string;
      bgColor: string;
      chartColor: string;
}> = {
      GOOD: { icon: Smile, label: '좋은 날', color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/30', chartColor: '#10b981' },
      NORMAL: { icon: Meh, label: '보통', color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30', chartColor: '#f59e0b' },
      BAD: { icon: Frown, label: '힘든 날', color: 'text-rose-500', bgColor: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/30', chartColor: '#f43f5e' },
};

// Array form for iteration (ReflectionPage mood selector)
export const MOODS = [
      { value: 'BAD', label: '나쁨', icon: Frown, color: 'text-red-500' },
      { value: 'NORMAL', label: '보통', icon: Meh, color: 'text-yellow-500' },
      { value: 'GOOD', label: '좋음', icon: Smile, color: 'text-green-500' },
] as const;

// ── Category ──
export const CATEGORY_CONFIG: Record<Category, {
      emoji: string;
      label: string;
      icon: typeof Briefcase;
      color: string;
      bgColor: string;
}> = {
      WORK: { emoji: '💼', label: '업무', icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
      HEALTH: { emoji: '💪', label: '건강', icon: Heart, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-900/20' },
      STUDY: { emoji: '📚', label: '학습', icon: GraduationCap, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
      PERSONAL: { emoji: '🏠', label: '개인', icon: Home, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
};

// ── Priority ──
export const PRIORITY_CONFIG: Record<Priority, {
      dotColor: string;
      bgColor: string;
      borderColor: string;
      textColor: string;
      badgeBg: string;
}> = {
      HIGH: { dotColor: 'bg-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800', textColor: 'text-red-700 dark:text-red-300', badgeBg: 'bg-red-500/30' },
      MEDIUM: { dotColor: 'bg-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-200 dark:border-yellow-800', textColor: 'text-yellow-700 dark:text-yellow-300', badgeBg: 'bg-amber-500/30' },
      LOW: { dotColor: 'bg-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800', textColor: 'text-green-700 dark:text-green-300', badgeBg: 'bg-blue-500/30' },
};

// ── Rating ──
export const RATING_LABELS: Record<number, string> = {
      1: '아쉬움',
      2: '노력 필요',
      3: '보통',
      4: '잘했음',
      5: '완벽!',
};

// ── Category select options (for <select> dropdowns) ──
export const CATEGORY_OPTIONS = [
      { value: 'WORK' as Category, label: '💼 Work' },
      { value: 'PERSONAL' as Category, label: '🏠 Home' },
      { value: 'HEALTH' as Category, label: '💪 Body' },
      { value: 'STUDY' as Category, label: '📚 Book' },
] as const;

export const PRIORITY_OPTIONS = [
      { value: 'LOW' as Priority, label: 'Low' },
      { value: 'MEDIUM' as Priority, label: 'Medium' },
      { value: 'HIGH' as Priority, label: 'High' },
] as const;
