import React, { useState, useEffect } from 'react';
import { Target, Trophy, ChevronLeft, ChevronRight, Edit2, Check, X } from 'lucide-react';
import type { MonthlyStatus } from '@/types/routine';

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
            if (data?.monthlyGoal) {
                  setGoalInput(data.monthlyGoal);
            } else {
                  setGoalInput('');
            }
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
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
            );
      }

      const year = data?.year || new Date().getFullYear();
      const month = data?.month || new Date().getMonth() + 1;
      const completionRate = data?.monthlyCompletionRate || 0;
      const roundedRate = Math.round(completionRate); // Round to integer
      const totalXp = data?.totalXp || 0;

      return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                        {/* Month Navigation & Goal */}
                        <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-4">
                                    <button
                                          onClick={onPrevMonth}
                                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                          <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                          {year}년 {month}월
                                    </h2>
                                    <button
                                          onClick={onNextMonth}
                                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                          <ChevronRight className="w-5 h-5" />
                                    </button>
                              </div>

                              <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-indigo-500" />
                                    {isEditingGoal ? (
                                          <div className="flex items-center gap-2 w-full max-w-sm">
                                                <input
                                                      type="text"
                                                      value={goalInput}
                                                      onChange={(e) => setGoalInput(e.target.value)}
                                                      placeholder="이번 달의 목표를 입력하세요"
                                                      className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                                      autoFocus
                                                      onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveGoal();
                                                            if (e.key === 'Escape') handleCancelEdit();
                                                      }}
                                                />
                                                <button onClick={handleSaveGoal} className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                                                      <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={handleCancelEdit} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">
                                                      <X className="w-4 h-4" />
                                                </button>
                                          </div>
                                    ) : (
                                          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingGoal(true)}>
                                                <span className={`font-medium ${data?.monthlyGoal ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 italic'}`}>
                                                      {data?.monthlyGoal || "목표를 설정해보세요"}
                                                </span>
                                                <Edit2 className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100" />
                                          </div>
                                    )}
                              </div>
                        </div>

                        {/* Vertical Divider (Desktop) */}
                        <div className="hidden md:block w-px h-16 bg-gray-100 dark:bg-gray-700"></div>

                        {/* Stats */}
                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">

                              {/* XP Stat */}
                              <div className="flex flex-col items-center md:items-end">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                          <Trophy className="w-3 h-3" /> Total XP
                                    </span>
                                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-500">
                                          {totalXp.toLocaleString()} XP
                                    </span>
                              </div>

                              {/* Completion Rate */}
                              <div className="flex flex-col items-center md:items-end min-w-[100px]">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                          성취율
                                    </span>
                                    <div className="flex items-end gap-1.5">
                                          <span className="text-3xl font-black text-gray-900 dark:text-white">
                                                {roundedRate}%
                                          </span>
                                    </div>
                                    {/* Simple Progress Bar */}
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                                          <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${roundedRate}%` }}
                                          />
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default MonthlySummaryCard;
