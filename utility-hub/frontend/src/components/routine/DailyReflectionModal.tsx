
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X, CalendarDays, ArrowRight } from 'lucide-react';
import type { Reflection } from '../../types/routine';

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
      const navigate = useNavigate();

      useEffect(() => {
            setMounted(true);
            return () => setMounted(false);
      }, []);

      if (!isOpen || !mounted) return null;

      const formattedDate = format(new Date(date), 'M월 d일 EEEE', { locale: ko });

      const handleViewDetail = () => {
            navigate(`/routine/daily-plan/${date}`);
      };

      return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 overflow-hidden font-sans">
                  {/* Backdrop */}
                  <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={onClose}
                  />

                  {/* Modal Content */}
                  <div className={classNames(
                        "relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl animate-fade-in-up transition-all p-6 md:p-8"
                  )}>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                              <div>
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                                          <CalendarDays className="w-4 h-4" />
                                          <span className="text-xs font-bold uppercase tracking-wider">Daily Reflection</span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                                          {formattedDate}의 회고
                                    </h2>
                              </div>
                              <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                    <X className="w-5 h-5" />
                              </button>
                        </div>

                        {/* Content */}
                        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">

                              {/* Mood & Rating (If available) */}
                              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                    <div className="text-center">
                                          <span className="block text-2xl mb-1">{data.mood}</span>
                                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Mood</span>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                                    <div className="text-center">
                                          <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400">
                                                {data.rating}<span className="text-sm font-normal text-gray-400">/5</span>
                                          </span>
                                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Score</span>
                                    </div>
                                    {data.energyLevel && (
                                          <>
                                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                                                <div className="text-center">
                                                      <span className="block text-xl font-black text-amber-500 dark:text-amber-400">
                                                            {data.energyLevel}<span className="text-sm font-normal text-gray-400">/5</span>
                                                      </span>
                                                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Energy</span>
                                                </div>
                                          </>
                                    )}
                              </div>

                              {/* What Went Well */}
                              <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                          <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-md flex items-center justify-center text-emerald-600 dark:text-emerald-400">👍</span>
                                          잘한 점
                                    </label>
                                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20 text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                                          {data.whatWentWell || "기록 없음"}
                                    </div>
                              </div>

                              {/* What Didn't Go Well */}
                              <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                          <span className="w-6 h-6 bg-rose-100 dark:bg-rose-900/30 rounded-md flex items-center justify-center text-rose-600 dark:text-rose-400">👎</span>
                                          아쉬운 점
                                    </label>
                                    <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20 text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                                          {data.whatDidntGoWell || "기록 없음"}
                                    </div>
                              </div>

                              {/* Tomorrow Focus */}
                              <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                          <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-md flex items-center justify-center text-indigo-600 dark:text-indigo-400">🎯</span>
                                          내일의 목표
                                    </label>
                                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20 text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                                          {data.tomorrowFocus || "기록 없음"}
                                    </div>
                              </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                              <button
                                    onClick={handleViewDetail}
                                    className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                              >
                                    상세 계획 보기 <ArrowRight className="w-4 h-4" />
                              </button>
                              <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl transition-colors"
                              >
                                    닫기
                              </button>
                        </div>
                  </div>
            </div>,
            document.body
      );
};

export default DailyReflectionModal;
