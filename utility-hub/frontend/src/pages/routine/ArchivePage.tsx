import { useEffect, useState } from 'react';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { Search } from 'lucide-react';
import type { Reflection } from '../../types/routine';
import { MOOD_CONFIG } from '../../lib/constants/routine';
import { useArchiveFilters } from '../../hooks/routine/useArchiveFilters';
import ArchiveStatsHeader from '../../components/routine/archive/ArchiveStatsHeader';
import ArchiveFilterBar from '../../components/routine/archive/ArchiveFilterBar';
import ReflectionCard from '../../components/routine/archive/ReflectionCard';
import DailyReflectionModal from '../../components/routine/DailyReflectionModal';

const ArchivePage = () => {
      const { reflections, loadArchive, isLoading, error } = useRoutineStore();
      const [currentPage, setCurrentPage] = useState(0);
      const [hasMore, setHasMore] = useState(true);
      const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
      const pageSize = 20;

      const {
            searchTerm,
            setSearchTerm,
            moodFilter,
            setMoodFilter,
            ratingFilter,
            setRatingFilter,
            sortBy,
            setSortBy,
            showFilters,
            setShowFilters,
            filteredReflections,
            groupedByMonth,
            stats,
            trendData,
            moodDistribution,
            clearFilters,
            hasActiveFilters,
      } = useArchiveFilters(reflections);

      useEffect(() => {
            loadArchive(0, pageSize);
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const loadMore = async () => {
            const nextPage = currentPage + 1;
            await loadArchive(nextPage, pageSize);
            setCurrentPage(nextPage);
            if (reflections.length < pageSize * (nextPage + 1)) {
                  setHasMore(false);
            }
      };

      if (error) {
            const FrownIcon = MOOD_CONFIG['BAD']?.icon;
            return (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-600 dark:text-red-400">
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                              {FrownIcon && <FrownIcon className="w-10 h-10" />}
                        </div>
                        <h3 className="text-lg font-bold mb-2">기록을 불러오는데 실패했습니다</h3>
                        <p className="text-sm text-red-500 dark:text-red-400 mb-6">{error}</p>
                        <button onClick={() => window.location.reload()}
                              className="px-6 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/70 text-red-700 dark:text-red-200 rounded-xl font-medium transition-colors">
                              다시 시도
                        </button>
                  </div>
            );
      }

      if (isLoading && reflections.length === 0) {
            return (
                  <div className="flex items-center justify-center h-screen bg-mystic-bg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
            );
      }

      return (
            <div className="min-h-screen bg-mystic-bg space-y-6 animate-in fade-in duration-500 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
                  {/* Header & Stats */}
                  <ArchiveStatsHeader
                        stats={stats}
                        trendData={trendData}
                        moodDistribution={moodDistribution}
                  />

                  {/* Search and Filter */}
                  <ArchiveFilterBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        moodFilter={moodFilter}
                        onMoodFilterChange={setMoodFilter}
                        ratingFilter={ratingFilter}
                        onRatingFilterChange={setRatingFilter}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        showFilters={showFilters}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={clearFilters}
                        resultCount={filteredReflections.length}
                  />

                  {/* Content */}
                  {filteredReflections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-mystic-bg-secondary rounded-3xl border border-dashed border-mystic-border">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                                    {hasActiveFilters ? '검색 결과가 없습니다.' : '아직 기록된 회고가 없습니다.'}
                              </p>
                              <p className="text-sm text-gray-400 dark:text-gray-500">
                                    {hasActiveFilters ? '다른 검색어나 필터를 시도해보세요.' : '오늘 하루를 회고해보세요!'}
                              </p>
                              {hasActiveFilters && (
                                    <button onClick={clearFilters}
                                          className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                                          필터 초기화
                                    </button>
                              )}
                        </div>
                  ) : (
                        <div className="space-y-8">
                              {Object.entries(groupedByMonth).map(([month, monthReflections]) => (
                                    <div key={month}>
                                          {/* Month Header */}
                                          <div className="flex items-center gap-3 mb-4">
                                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{month}</h2>
                                                <span className="text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                      {monthReflections.length}개
                                                </span>
                                          </div>

                                          {/* Cards Grid */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {monthReflections.map((ref) => (
                                                      <ReflectionCard
                                                            key={ref.id}
                                                            reflection={ref}
                                                            onClick={() => setSelectedReflection(ref)}
                                                      />
                                                ))}
                                          </div>
                                    </div>
                              ))}

                              {/* Load More */}
                              {hasMore && !hasActiveFilters && (
                                    <div className="flex justify-center pt-4">
                                          <button onClick={loadMore} disabled={isLoading}
                                                className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50">
                                                {isLoading ? '로딩 중...' : '더 많은 기록 보기'}
                                          </button>
                                    </div>
                              )}
                        </div>
                  )}

                  {/* Detail Modal */}
                  {selectedReflection && (
                        <DailyReflectionModal
                              data={selectedReflection}
                              onClose={() => setSelectedReflection(null)}
                        />
                  )}
            </div>
      );
};

export default ArchivePage;
