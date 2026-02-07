import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
      Star,
      Battery,
      Target,
      Zap,
      TrendingUp,
      ArrowRight,
} from 'lucide-react';
import type { Reflection } from '../../../types/routine';
import { MOOD_CONFIG } from '../../../lib/constants/routine';

interface ReflectionCardProps {
      reflection: Reflection;
      onClick: () => void;
}

const ReflectionCard = ({ reflection, onClick }: ReflectionCardProps) => {
      const moodConfig = MOOD_CONFIG[reflection.mood] || MOOD_CONFIG['NORMAL'];
      const MoodIcon = moodConfig.icon;
      const dateStr = reflection.planDate || reflection.createdAt;
      const completionRate = reflection.totalTasks && reflection.totalTasks > 0
            ? Math.round((reflection.completedTasks || 0) / reflection.totalTasks * 100)
            : null;

      return (
            <button
                  onClick={onClick}
                  className="group relative text-left bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-indigo-100/30 dark:hover:shadow-black/50 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
            >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-gray-900 dark:text-white">
                                    {dateStr ? format(new Date(dateStr), 'M월 d일', { locale: ko }) : '-'}
                              </span>
                              <span className="text-xs text-gray-400">
                                    {dateStr ? format(new Date(dateStr), 'EEEE', { locale: ko }) : ''}
                              </span>
                        </div>
                        <div className={`p-1.5 rounded-lg border ${moodConfig.bgColor}`}>
                              <MoodIcon className={`w-4 h-4 ${moodConfig.color}`} />
                        </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                        <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="text-sm font-black text-gray-900 dark:text-gray-100">{reflection.rating}</span>
                              <span className="text-xs text-gray-400">/5</span>
                        </div>
                        {reflection.energyLevel && (
                              <div className="flex items-center gap-1">
                                    <Battery className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{reflection.energyLevel}</span>
                              </div>
                        )}
                        {completionRate !== null && (
                              <div className="flex items-center gap-1">
                                    <Target className="w-3.5 h-3.5 text-blue-500" />
                                    <span className={`text-sm font-bold ${
                                          completionRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                          completionRate >= 50 ? 'text-amber-600 dark:text-amber-400' :
                                          'text-rose-600 dark:text-rose-400'
                                    }`}>{completionRate}%</span>
                              </div>
                        )}
                  </div>

                  {/* Completion Bar */}
                  {completionRate !== null && (
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
                              <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                          completionRate >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-400' :
                                          completionRate >= 50 ? 'bg-gradient-to-r from-amber-400 to-yellow-400' :
                                          'bg-gradient-to-r from-rose-400 to-red-400'
                                    }`}
                                    style={{ width: `${completionRate}%` }}
                              />
                        </div>
                  )}

                  {/* Content Preview */}
                  <div className="flex-1 space-y-2">
                        {reflection.whatWentWell && (
                              <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                                    <div className="flex items-center gap-1 mb-0.5">
                                          <Zap className="w-3 h-3 text-emerald-500" />
                                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">잘한 점</span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{reflection.whatWentWell}</p>
                              </div>
                        )}
                        {reflection.whatDidntGoWell && (
                              <div className="bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-lg">
                                    <div className="flex items-center gap-1 mb-0.5">
                                          <TrendingUp className="w-3 h-3 text-rose-500" />
                                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">개선할 점</span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{reflection.whatDidntGoWell}</p>
                              </div>
                        )}
                        {reflection.tomorrowFocus && (
                              <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg">
                                    <div className="flex items-center gap-1 mb-0.5">
                                          <Target className="w-3 h-3 text-indigo-500" />
                                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">내일의 다짐</span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1">{reflection.tomorrowFocus}</p>
                              </div>
                        )}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        {reflection.totalTasks != null && reflection.totalTasks > 0 && (
                              <span className="text-[10px] font-bold text-gray-400">
                                    {reflection.completedTasks}/{reflection.totalTasks} 태스크 완료
                              </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ml-auto">
                              상세 보기
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                  </div>
            </button>
      );
};

export default ReflectionCard;
