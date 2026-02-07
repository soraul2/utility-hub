import {
      Search,
      ChevronDown,
      ChevronUp,
      ArrowUpDown,
      SlidersHorizontal,
} from 'lucide-react';
import { MOOD_CONFIG, RATING_LABELS } from '../../../lib/constants/routine';
import type { SortOption } from '../../../hooks/routine/useArchiveFilters';

interface ArchiveFilterBarProps {
      searchTerm: string;
      onSearchChange: (v: string) => void;
      moodFilter: string | null;
      onMoodFilterChange: (v: string | null) => void;
      ratingFilter: number | null;
      onRatingFilterChange: (v: number | null) => void;
      sortBy: SortOption;
      onSortChange: (v: SortOption) => void;
      showFilters: boolean;
      onToggleFilters: () => void;
      hasActiveFilters: boolean;
      onClearFilters: () => void;
      resultCount: number;
}

const ArchiveFilterBar = ({
      searchTerm,
      onSearchChange,
      moodFilter,
      onMoodFilterChange,
      ratingFilter,
      onRatingFilterChange,
      sortBy,
      onSortChange,
      showFilters,
      onToggleFilters,
      hasActiveFilters,
      onClearFilters,
      resultCount,
}: ArchiveFilterBarProps) => {
      return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                  <div className="flex flex-col md:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                    type="text"
                                    placeholder="키워드로 기록 검색..."
                                    value={searchTerm}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-900 dark:text-white placeholder:text-gray-500"
                              />
                        </div>

                        {/* Filter Toggle + Sort */}
                        <div className="flex gap-2">
                              <button
                                    onClick={onToggleFilters}
                                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                                          showFilters || moodFilter || ratingFilter
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                                                : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                              >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    <span className="hidden sm:inline">필터</span>
                                    {(moodFilter || ratingFilter) && (
                                          <span className="w-5 h-5 mystic-solid text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                                {(moodFilter ? 1 : 0) + (ratingFilter ? 1 : 0)}
                                          </span>
                                    )}
                                    {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>

                              {/* Sort */}
                              <div className="relative">
                                    <select
                                          value={sortBy}
                                          onChange={(e) => onSortChange(e.target.value as SortOption)}
                                          className="appearance-none pl-8 pr-8 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all text-sm font-bold text-gray-700 dark:text-gray-300"
                                    >
                                          <option value="newest">최신순</option>
                                          <option value="oldest">오래된순</option>
                                          <option value="rating-high">평점 높은순</option>
                                          <option value="rating-low">평점 낮은순</option>
                                    </select>
                                    <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                              </div>

                              {hasActiveFilters && (
                                    <button onClick={onClearFilters}
                                          className="px-3 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
                                          초기화
                                    </button>
                              )}
                        </div>
                  </div>

                  {/* Expandable Filters */}
                  {showFilters && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
                              {/* Mood Filter */}
                              <div className="flex gap-2">
                                    {Object.entries(MOOD_CONFIG).map(([mood, config]) => {
                                          const Icon = config.icon;
                                          const isActive = moodFilter === mood;
                                          return (
                                                <button key={mood}
                                                      onClick={() => onMoodFilterChange(isActive ? null : mood)}
                                                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-sm font-medium ${isActive
                                                            ? `${config.bgColor} ${config.color} border-current`
                                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                      }`}>
                                                      <Icon className="w-4 h-4" />
                                                      <span>{config.label}</span>
                                                </button>
                                          );
                                    })}
                              </div>

                              {/* Rating Filter */}
                              <div className="relative">
                                    <select
                                          value={ratingFilter || ''}
                                          onChange={(e) => onRatingFilterChange(e.target.value ? Number(e.target.value) : null)}
                                          className="appearance-none px-3 py-2 pr-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all text-sm font-medium text-gray-700 dark:text-gray-300">
                                          <option value="">평점 전체</option>
                                          {[5, 4, 3, 2, 1].map(rating => (
                                                <option key={rating} value={rating}>{'★'.repeat(rating)} {RATING_LABELS[rating]}</option>
                                          ))}
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                              </div>
                        </div>
                  )}

                  {/* Filter Result Count */}
                  {hasActiveFilters && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{resultCount}개</span>의 기록이 검색되었습니다.
                              </p>
                        </div>
                  )}
            </div>
      );
};

export default ArchiveFilterBar;
