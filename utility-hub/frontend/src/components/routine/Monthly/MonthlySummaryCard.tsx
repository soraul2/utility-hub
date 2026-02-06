import React, { useState, useEffect } from 'react';
import { Target, Trophy, ChevronLeft, ChevronRight, Edit2, Check, X } from 'lucide-react';
import type { MonthlyStatus } from '@/types/routine';

const XP_LEVELS = [
      { level: 1, name: '입문', min: 0, max: 99, color: 'from-gray-400 to-gray-500' },
      { level: 2, name: '견습', min: 100, max: 299, color: 'from-green-400 to-emerald-500' },
      { level: 3, name: '숙련', min: 300, max: 699, color: 'from-blue-400 to-indigo-500' },
      { level: 4, name: '전문가', min: 700, max: 1499, color: 'from-purple-400 to-violet-500' },
      { level: 5, name: '마스터', min: 1500, max: Infinity, color: 'from-amber-400 to-orange-500' },
];

const getCurrentLevel = (xp: number) => {
      return XP_LEVELS.find(l => xp >= l.min && xp <= l.max) || XP_LEVELS[0];
};

const getXpProgress = (xp: number) => {
      const level = getCurrentLevel(xp);
      if (level.max === Infinity) return 100;
      const range = level.max - level.min + 1;
      return Math.min(100, Math.round(((xp - level.min) / range) * 100));
};

interface MonthlySummaryCardProps {
      data: MonthlyStatus | null;
      isLoading: boolean;
      onUpdateGoal: (goal: string) => Promise<void>;
      onPrevMonth: () => void;
      onNextMonth: () => void;
}

const MonthlySummaryCard: React.FC<MonthlySummaryCardProps> = ({
      data,
      isLoading,
      onUpdateGoal,
      onPrevMonth,
      onNextMonth,
}) => {
      const [isEditingGoal, setIsEditingGoal] = useState(false);
      const [goalInput, setGoalInput] = useState('');

      useEffect(() => {
            setGoalInput(data?.monthlyGoal || '');
      }, [data?.monthlyGoal]);

      const handleSaveGoal = async () => {
            if (!goalInput.trim()) return;
            await onUpdateGoal(goalInput);
            setIsEditingGoal(false);
      };

      const handleCancelEdit = () => {
            setGoalInput(data?.monthlyGoal || '');
            setIsEditingGoal(false);
      };

      if (isLoading && !data) {
            return (
                  <div className="bg-white dark:bg-gray-800 rounded-xl px-5 py-3 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
            );
      }

      const year = data?.year || new Date().getFullYear();
      const month = data?.month || new Date().getMonth() + 1;
      const completionRate = data?.monthlyCompletionRate || 0;
      const roundedRate = Math.round(completionRate);
      const totalXp = data?.totalXp || 0;
      const level = getCurrentLevel(totalXp);
      const xpProgress = getXpProgress(totalXp);
      const nextLevel = XP_LEVELS.find(l => l.level === level.level + 1);

      return (
            <div className="bg-white dark:bg-gray-800 rounded-xl px-5 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between gap-4">
                        {/* Left: Month Nav + Goal */}
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                              {/* Month Navigation */}
                              <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={onPrevMonth} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                          <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
                                          {year}년 {month}월
                                    </h2>
                                    <button onClick={onNextMonth} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                          <ChevronRight className="w-4 h-4" />
                                    </button>
                              </div>

                              {/* Goal (inline) */}
                              <div className="hidden sm:flex items-center gap-1.5 min-w-0 flex-1">
                                    <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                    {isEditingGoal ? (
                                          <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                                                <input
                                                      type="text"
                                                      value={goalInput}
                                                      onChange={(e) => setGoalInput(e.target.value)}
                                                      placeholder="이번 달 목표"
                                                      className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                                      autoFocus
                                                      onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveGoal();
                                                            if (e.key === 'Escape') handleCancelEdit();
                                                      }}
                                                />
                                                <button onClick={handleSaveGoal} className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                                                      <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={handleCancelEdit} className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded">
                                                      <X className="w-3.5 h-3.5" />
                                                </button>
                                          </div>
                                    ) : (
                                          <div className="flex items-center gap-1.5 group cursor-pointer min-w-0" onClick={() => setIsEditingGoal(true)}>
                                                <span className={`text-xs truncate ${data?.monthlyGoal ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 italic'}`}>
                                                      {data?.monthlyGoal || "목표를 설정해보세요"}
                                                </span>
                                                <Edit2 className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0" />
                                          </div>
                                    )}
                              </div>
                        </div>

                        {/* Right: Stats (compact inline) */}
                        <div className="flex items-center gap-4 shrink-0">
                              {/* XP */}
                              <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end">
                                          <div className="flex items-center gap-1">
                                                <Trophy className="w-3 h-3 text-amber-500" />
                                                <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-500">
                                                      {totalXp.toLocaleString()}
                                                </span>
                                          </div>
                                          <div className="flex items-center gap-1 mt-0.5">
                                                <span className={`text-[9px] font-black px-1 py-px rounded bg-gradient-to-r ${level.color} text-white leading-none`}>
                                                      Lv.{level.level}
                                                </span>
                                                <span className="text-[9px] text-gray-400">{level.name}</span>
                                          </div>
                                    </div>
                                    {nextLevel && (
                                          <div className="w-12 hidden md:block">
                                                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                      <div
                                                            className={`h-full rounded-full bg-gradient-to-r ${level.color} transition-all duration-700`}
                                                            style={{ width: `${xpProgress}%` }}
                                                      />
                                                </div>
                                          </div>
                                    )}
                              </div>

                              {/* Divider */}
                              <div className="w-px h-7 bg-gray-100 dark:bg-gray-700" />

                              {/* Completion Rate */}
                              <div className="flex items-center gap-2">
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{roundedRate}%</span>
                                    <div className="w-8 hidden md:block">
                                          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                                      style={{ width: `${roundedRate}%` }}
                                                />
                                          </div>
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default MonthlySummaryCard;
