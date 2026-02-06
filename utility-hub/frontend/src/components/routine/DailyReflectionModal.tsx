
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
      X,
      Star,
      Battery,
      Smile,
      Meh,
      Frown,
      Zap,
      Target,
      TrendingUp,
      ArrowRight
} from 'lucide-react';
import type { Reflection } from '../../types/routine';

const MOOD_CONFIG: Record<string, { icon: typeof Smile; label: string }> = {
      'GOOD': { icon: Smile, label: '좋은 날' },
      'NORMAL': { icon: Meh, label: '보통' },
      'BAD': { icon: Frown, label: '힘든 날' }
};

interface DailyReflectionModalProps {
      isOpen: boolean;
      onClose: () => void;
      date: string;
      data: Reflection;
}

const DailyReflectionModal: React.FC<DailyReflectionModalProps> = ({
      isOpen,
      onClose,
      date,
      data
}) => {
      const [mounted, setMounted] = useState(false);

      useEffect(() => {
            setMounted(true);
            return () => setMounted(false);
      }, []);

      if (!isOpen || !mounted) return null;

      const moodConfig = MOOD_CONFIG[data.mood] || MOOD_CONFIG['NORMAL'];
      const MoodIcon = moodConfig.icon;
      const dateStr = date || data.planDate || data.createdAt;
      const formattedDate = dateStr
            ? format(new Date(dateStr), 'yyyy년 M월 d일 (EEEE)', { locale: ko })
            : '-';

      const completionRate = data.totalTasks && data.totalTasks > 0
            ? Math.round((data.completedTasks || 0) / data.totalTasks * 100)
            : null;

      return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden font-sans">
                  {/* Backdrop */}
                  <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
                        onClick={onClose}
                  />

                  {/* Modal */}
                  <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
                        {/* Gradient Header */}
                        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white flex-shrink-0">
                              <button onClick={onClose}
                                    className="absolute top-4 right-4 p-1.5 text-white/50 hover:text-white hover:bg-white/20 rounded-lg transition-colors z-10">
                                    <X className="w-5 h-5" />
                              </button>

                              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Daily Reflection</div>
                              <h2 className="text-xl font-black mb-4">{formattedDate}</h2>

                              {/* Stats Grid */}
                              <div className={`grid gap-2 ${completionRate !== null ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                    <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                                          <MoodIcon className="w-5 h-5 mx-auto mb-0.5" />
                                          <div className="text-[9px] font-bold text-white/60 uppercase">{moodConfig.label}</div>
                                    </div>
                                    <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                                          <div className="flex items-center justify-center gap-0.5">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-lg font-black leading-tight">{data.rating}</span>
                                          </div>
                                          <div className="text-[9px] font-bold text-white/60 uppercase mt-0.5">평점</div>
                                    </div>
                                    {data.energyLevel && (
                                          <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                                                <div className="flex items-center justify-center gap-0.5">
                                                      <Battery className="w-4 h-4" />
                                                      <span className="text-lg font-black leading-tight">{data.energyLevel}</span>
                                                </div>
                                                <div className="text-[9px] font-bold text-white/60 uppercase mt-0.5">에너지</div>
                                          </div>
                                    )}
                                    {completionRate !== null && (
                                          <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                                                <div className="text-lg font-black leading-tight">{completionRate}%</div>
                                                <div className="text-[9px] font-bold text-white/60 uppercase mt-0.5">달성률</div>
                                          </div>
                                    )}
                              </div>
                        </div>

                        {/* Task Stats Progress Bar */}
                        {completionRate !== null && (
                              <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                          <span className="font-bold text-gray-600 dark:text-gray-400">태스크 달성률</span>
                                          <span className="font-black text-gray-900 dark:text-white">{data.completedTasks}/{data.totalTasks} 완료</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                          <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                      completionRate >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                                                      completionRate >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                                                      'bg-gradient-to-r from-rose-500 to-red-400'
                                                }`}
                                                style={{ width: `${completionRate}%` }}
                                          />
                                    </div>
                              </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                              {data.morningGoal && (
                                    <div>
                                          <div className="flex items-center gap-1.5 mb-2">
                                                <Target className="w-4 h-4 text-indigo-500" />
                                                <span className="text-sm font-black text-gray-900 dark:text-white">오늘의 목표</span>
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 rounded-xl whitespace-pre-wrap">{data.morningGoal}</p>
                                    </div>
                              )}

                              {data.whatWentWell && (
                                    <div>
                                          <div className="flex items-center gap-1.5 mb-2">
                                                <Zap className="w-4 h-4 text-emerald-500" />
                                                <span className="text-sm font-black text-gray-900 dark:text-white">잘한 점 (Keep)</span>
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-xl whitespace-pre-wrap">{data.whatWentWell}</p>
                                    </div>
                              )}

                              {data.whatDidntGoWell && (
                                    <div>
                                          <div className="flex items-center gap-1.5 mb-2">
                                                <TrendingUp className="w-4 h-4 text-rose-500" />
                                                <span className="text-sm font-black text-gray-900 dark:text-white">아쉬운 점 (Problem)</span>
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-rose-50 dark:bg-rose-900/20 px-4 py-3 rounded-xl whitespace-pre-wrap">{data.whatDidntGoWell}</p>
                                    </div>
                              )}

                              {data.tomorrowFocus && (
                                    <div>
                                          <div className="flex items-center gap-1.5 mb-2">
                                                <Target className="w-4 h-4 text-purple-500" />
                                                <span className="text-sm font-black text-gray-900 dark:text-white">내일의 다짐 (Try)</span>
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-purple-50 dark:bg-purple-900/20 px-4 py-3 rounded-xl whitespace-pre-wrap">{data.tomorrowFocus}</p>
                                    </div>
                              )}

                              {!data.whatWentWell && !data.whatDidntGoWell && !data.tomorrowFocus && !data.morningGoal && (
                                    <div className="text-center py-8 text-gray-400">
                                          <p className="text-sm">작성된 회고 내용이 없습니다.</p>
                                    </div>
                              )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex gap-3 flex-shrink-0">
                              <button onClick={onClose}
                                    className="flex-1 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-black transition-colors">
                                    닫기
                              </button>
                              <Link
                                    to={`/routine/daily-plan/${dateStr ? format(new Date(dateStr), 'yyyy-MM-dd') : ''}`}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-1.5"
                              >
                                    해당 날 계획 보기
                                    <ArrowRight className="w-4 h-4" />
                              </Link>
                        </div>
                  </div>
            </div>,
            document.body
      );
};

export default DailyReflectionModal;
