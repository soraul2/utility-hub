import React from 'react';
import type { Category } from '../../../types/routine';
import { Briefcase, Home, Activity, BookOpen } from 'lucide-react';

interface TaskCategoryBadgeProps {
      category?: Category;
      size?: 'sm' | 'md';
}

export const TaskCategoryBadge: React.FC<TaskCategoryBadgeProps> = ({ category = 'WORK', size = 'md' }) => {
      const styles = {
            WORK: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
            PERSONAL: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-700',
            HEALTH: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
            STUDY: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700',
      };

      const icons = {
            WORK: Briefcase,
            PERSONAL: Home,
            HEALTH: Activity,
            STUDY: BookOpen,
      };

      const safeCategory = category ?? 'WORK';
      const Icon = icons[safeCategory];
      const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

      return (
            <span className={`inline-flex items-center font-medium rounded-full border ${styles[safeCategory]} ${sizeClasses}`}>
                  <Icon size={size === 'sm' ? 10 : 12} />
                  {safeCategory.charAt(0) + safeCategory.slice(1).toLowerCase()}
            </span>
      );
};
