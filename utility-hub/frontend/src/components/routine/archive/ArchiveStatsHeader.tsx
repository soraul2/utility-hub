import {
      Calendar,
      Star,
      Heart,
      Target,
      TrendingUp,
      Flame,
      BarChart3,
} from 'lucide-react';
import { MOOD_CONFIG } from '../../../lib/constants/routine';
import type { ArchiveStats, TrendDataPoint } from '../../../hooks/routine/useArchiveFilters';
import MiniSparkline from './MiniSparkline';

interface ArchiveStatsHeaderProps {
      stats: ArchiveStats;
      trendData: TrendDataPoint[];
      moodDistribution: Record<string, { count: number; pct: number }>;
}

const ArchiveStatsHeader = ({ stats, trendData, moodDistribution }: ArchiveStatsHeaderProps) => {
      const SmileIcon = MOOD_CONFIG['GOOD']?.icon;

      return (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-indigo-100/20 dark:shadow-none border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors">
                  <div className="absolute top-0 right-0 w-80 h-80 mystic-gradient-muted rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                  <div className="relative z-10">
                        {/* Title */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                              <div>
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                                          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                                <Calendar className="w-4 h-4" />
                                          </div>
                                          <span className="text-xs font-bold tracking-wide uppercase">기록 보관소</span>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
                                          나의 회고 아카이브
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                          매일의 작은 회고가 모여 당신의 성장 이야기가 됩니다.
                                    </p>
                              </div>

                              {/* Streak Badge */}
                              {stats.streak > 0 && (
                                    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-orange-200 dark:shadow-none">
                                          <Flame className="w-5 h-5" />
                                          <div>
                                                <div className="text-lg font-black leading-tight">{stats.streak}일</div>
                                                <div className="text-[10px] font-bold text-white/70 uppercase">연속 기록</div>
                                          </div>
                                    </div>
                              )}
                        </div>

                        {/* Stats Grid */}
                        {stats.totalCount > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {/* Total Records */}
                                    <div className="mystic-gradient-muted-br rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                                          <div className="flex items-center gap-1.5 mb-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">총 기록</span>
                                          </div>
                                          <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalCount}<span className="text-sm text-gray-400 ml-0.5">일</span></p>
                                    </div>

                                    {/* Avg Rating */}
                                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
                                          <div className="flex items-center gap-1.5 mb-1.5">
                                                <Star className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">평균 평점</span>
                                          </div>
                                          <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.avgRating.toFixed(1)}<span className="text-sm text-gray-400 ml-0.5">/5</span></p>
                                    </div>

                                    {/* Good Days */}
                                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                                          <div className="flex items-center gap-1.5 mb-1.5">
                                                <Heart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">좋은 날</span>
                                          </div>
                                          <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.goodDays}<span className="text-sm text-gray-400 ml-0.5">일</span></p>
                                    </div>

                                    {/* Avg Completion */}
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
                                          <div className="flex items-center gap-1.5 mb-1.5">
                                                <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">평균 달성률</span>
                                          </div>
                                          <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.avgCompletion}<span className="text-sm text-gray-400 ml-0.5">%</span></p>
                                    </div>

                                    {/* Mood */}
                                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30">
                                          <div className="flex items-center gap-1.5 mb-1.5">
                                                <TrendingUp className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">주요 기분</span>
                                          </div>
                                          <p className="text-2xl font-black text-gray-900 dark:text-white">
                                                {stats.mostCommonMood ? MOOD_CONFIG[stats.mostCommonMood]?.label || '-' : '-'}
                                          </p>
                                    </div>
                              </div>
                        )}

                        {/* Trend & Mood Distribution */}
                        {stats.totalCount >= 2 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {/* Rating Trend */}
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                          <div className="flex items-center gap-2 mb-2">
                                                <BarChart3 className="w-4 h-4 text-indigo-500" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">최근 평점 추이</span>
                                                <span className="text-[10px] text-gray-400 ml-auto">1~5점</span>
                                          </div>
                                          <div className="h-32">
                                                <MiniSparkline data={trendData} />
                                          </div>
                                    </div>

                                    {/* Mood Distribution */}
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                          <div className="flex items-center gap-2 mb-3">
                                                {SmileIcon && <SmileIcon className="w-4 h-4 text-emerald-500" />}
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">기분 분포</span>
                                          </div>
                                          <div className="space-y-2.5">
                                                {(['GOOD', 'NORMAL', 'BAD'] as const).map(mood => {
                                                      const config = MOOD_CONFIG[mood];
                                                      const dist = moodDistribution[mood];
                                                      const Icon = config.icon;
                                                      return (
                                                            <div key={mood} className="flex items-center gap-2.5">
                                                                  <Icon className={`w-4 h-4 ${config.color} shrink-0`} />
                                                                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-12 shrink-0">{config.label}</span>
                                                                  <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                        <div
                                                                              className="h-full rounded-full transition-all duration-500"
                                                                              style={{ width: `${dist.pct}%`, backgroundColor: config.chartColor }}
                                                                        />
                                                                  </div>
                                                                  <span className="text-xs font-black text-gray-700 dark:text-gray-300 w-12 text-right">{dist.count}일 <span className="text-gray-400 font-bold">({dist.pct}%)</span></span>
                                                            </div>
                                                      );
                                                })}
                                          </div>
                                    </div>
                              </div>
                        )}
                  </div>
            </div>
      );
};

export default ArchiveStatsHeader;
