import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteReading } from '../../lib/api/tarotApi';
import type { HistoryResponse, PageResponse } from '../../lib/tarot';
import { useAuthStatus } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import ShareModal from '../../components/ui/ShareModal';

const TarotHistoryPage: React.FC = () => {
      const navigate = useNavigate();
      const { isAuthenticated, isLoading: isAuthLoading } = useAuthStatus();
      const [history, setHistory] = useState<PageResponse<HistoryResponse> | null>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [page, setPage] = useState(0);
      const [selectedSpread, setSelectedSpread] = useState<string | undefined>(undefined);
      const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');
      const [searchTerm, setSearchTerm] = useState('');
      const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
      const [isSearchVisible, setIsSearchVisible] = useState(false);
      const [shareModalData, setShareModalData] = useState<{ isOpen: boolean; url: string }>({ isOpen: false, url: '' });

      // Debounce logic
      useEffect(() => {
            const timer = setTimeout(() => {
                  setDebouncedSearchTerm(searchTerm);
            }, 500);
            return () => clearTimeout(timer);
      }, [searchTerm]);

      const fetchHistory = useCallback(async (pageNum: number, spread?: string, sort?: string, search?: string) => {
            setLoading(true);
            setError(null);
            try {
                  const data = await getHistory(pageNum, 10, spread, sort, search);
                  setHistory(data);
            } catch (err) {
                  setError(err instanceof Error ? err.message : '기록을 불러오는데 실패했습니다.');
            } finally {
                  setLoading(false);
            }
      }, []);

      useEffect(() => {
            if (!isAuthLoading) {
                  if (!isAuthenticated) {
                        navigate('/login', { replace: true });
                        return;
                  }
                  const sortParam = `createdAt,${sortOrder.toLowerCase()}`;
                  fetchHistory(page, selectedSpread, sortParam, debouncedSearchTerm);
            }
      }, [isAuthenticated, isAuthLoading, page, selectedSpread, sortOrder, debouncedSearchTerm, fetchHistory, navigate]);

      const handleDelete = async (sessionId: number) => {
            if (!window.confirm('정말 이 기록을 삭제하시겠습니까?')) return;

            try {
                  await deleteReading(sessionId);
                  // 만약 현재 페이지의 마지막 아이템을 삭제했고, 현재 페이지가 0보다 크다면 이전 페이지로 이동 검토 필요
                  // 단순화를 위해 현재 페이지 다시 불러오기
                  const sortParam = `createdAt,${sortOrder.toLowerCase()}`;
                  fetchHistory(page, selectedSpread, sortParam, debouncedSearchTerm);
            } catch (err) {
                  alert('기록 삭제에 실패했습니다.');
            }
      };

      if (isAuthLoading || (loading && !history)) {
            return (
                  <div className="min-h-screen flex items-center justify-center">
                        <div className="mystic-bg" />
                        <LoadingSpinner message="조상의 지혜를 불러오는 중..." />
                  </div>
            );
      }

      return (
            <div className="relative min-h-screen py-8 md:py-12 px-4 md:px-8">


                  <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                              <h1 className="text-4xl md:text-5xl font-bold font-serif italic tracking-tight py-2 px-4">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 dark:from-purple-200 dark:via-blue-100 dark:to-purple-200 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">운명의 기록</span>
                              </h1>
                              <p className="text-slate-500 dark:text-slate-400 font-light tracking-widest uppercase text-xs mt-2">
                                    지나온 운명의 흔적들
                              </p>
                        </div>



                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6 sm:gap-4">
                              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
                                    {[
                                          { id: undefined, label: '전체' },
                                          { id: 'DAILY_ONE', label: '오늘의 카드' },
                                          { id: 'THREE_CARD', label: '3카드 스프레드' },
                                    ].map((tab) => (
                                          <button
                                                key={tab.id || 'all'}
                                                onClick={() => {
                                                      setSelectedSpread(tab.id);
                                                      setPage(0);
                                                }}
                                                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${selectedSpread === tab.id
                                                      ? 'bg-amber-600 dark:bg-amber-700 text-white shadow-lg'
                                                      : 'bg-white/40 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
                                                      }`}
                                          >
                                                {tab.label}
                                          </button>
                                    ))}
                              </div>

                              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                    <div className="flex items-center gap-1 bg-white/40 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 h-10 w-full sm:w-auto justify-center">
                                          <button
                                                onClick={() => {
                                                      setSortOrder('DESC');
                                                      setPage(0);
                                                }}
                                                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${sortOrder === 'DESC'
                                                      ? 'bg-white dark:bg-white/10 text-amber-700 dark:text-amber-500 shadow-sm'
                                                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                      }`}
                                          >
                                                최근순
                                          </button>
                                          <button
                                                onClick={() => {
                                                      setSortOrder('ASC');
                                                      setPage(0);
                                                }}
                                                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${sortOrder === 'ASC'
                                                      ? 'bg-white dark:bg-white/10 text-amber-700 dark:text-amber-500 shadow-sm'
                                                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                      }`}
                                          >
                                                오래된순
                                          </button>
                                    </div>

                                    <button
                                          onClick={() => setIsSearchVisible(!isSearchVisible)}
                                          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 border ${isSearchVisible
                                                ? 'bg-amber-600 dark:bg-amber-500 text-white border-amber-500 shadow-lg'
                                                : 'bg-white/40 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
                                                }`}
                                          title="검색"
                                    >
                                          <i className={`fas ${isSearchVisible ? 'fa-times' : 'fa-search'} text-sm`}></i>
                                    </button>
                              </div>
                        </div>

                        {/* Search Bar */}
                        <div className={`relative overflow-hidden transition-all duration-500 ease-in-out ${isSearchVisible ? 'max-h-24 mb-10 opacity-100' : 'max-h-0 mb-0 opacity-0'}`}>
                              <div className="relative group max-w-2xl mx-auto w-full pt-1">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none pt-1">
                                          <i className="fas fa-search text-slate-400 group-focus-within:text-amber-500 transition-colors"></i>
                                    </div>
                                    <input
                                          type="text"
                                          value={searchTerm}
                                          onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setPage(0);
                                          }}
                                          placeholder="질문 내용으로 검색..."
                                          className="block w-full pl-11 pr-12 py-3.5 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all shadow-sm"
                                    />
                                    {searchTerm && (
                                          <button
                                                onClick={() => {
                                                      setSearchTerm('');
                                                      setPage(0);
                                                }}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pt-1"
                                          >
                                                <i className="fas fa-times-circle"></i>
                                          </button>
                                    )}
                              </div>
                        </div>

                        {error && <ErrorBanner message={error} onRetry={() => {
                              const sortParam = `createdAt,${sortOrder.toLowerCase()}`;
                              fetchHistory(page, selectedSpread, sortParam, debouncedSearchTerm);
                        }} />}

                        {history?.content.length === 0 ? (
                              <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
                                    <i className="fas fa-scroll text-5xl text-slate-600 mb-6"></i>
                                    <p className="text-slate-400">
                                          {debouncedSearchTerm
                                                ? `"${debouncedSearchTerm}"에 대한 검색 결과가 없습니다.`
                                                : '아직 저장된 타로 기록이 없습니다.'}
                                    </p>
                                    <button
                                          onClick={() => navigate('/tarot')}
                                          className="mt-8 px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full font-bold hover:scale-105 transition-transform"
                                    >
                                          첫 운명 점치기
                                    </button>
                              </div>
                        ) : (
                              <div className="space-y-6">
                                    {history?.content.map((item) => (
                                          <div
                                                key={item.sessionId}
                                                onClick={() => navigate(`/tarot/share/${item.shareUuid}`)}
                                                className="group relative bg-white/40 dark:bg-white/5 backdrop-blur-xl hover:bg-white/60 dark:hover:bg-white/10 p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/10 transition-all duration-500 shadow-sm hover:shadow-xl dark:shadow-none cursor-pointer overflow-hidden"
                                          >
                                                {/* Background Glow Effect on Hover */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                                <div className="relative z-10">
                                                      <div className="flex justify-between items-start mb-4">
                                                            <div className="flex flex-col gap-1.5">
                                                                  <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50">
                                                                              {item.spreadType === 'THREE_CARD' ? '3카드 스프레드' : '오늘의 카드'}
                                                                        </span>
                                                                        <span className="text-[10px] sm:text-xs text-slate-400 font-light tracking-wider">
                                                                              {new Date(item.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                  </div>
                                                                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                                                                        Q. {item.question}
                                                                  </h3>
                                                            </div>

                                                            {/* Desktop/Tablet Action Buttons - Absolute positioned for tighter integration */}
                                                            <div className="flex items-center gap-1.5">
                                                                  <button
                                                                        onClick={(e) => {
                                                                              e.stopPropagation();
                                                                              const url = `${window.location.origin}/tarot/share/${item.shareUuid}`;
                                                                              setShareModalData({ isOpen: true, url });
                                                                        }}
                                                                        className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-400 transition-all border border-slate-200 dark:border-white/5 active:scale-95"
                                                                        title="링크 복사"
                                                                  >
                                                                        <i className="fas fa-link text-sm"></i>
                                                                  </button>
                                                                  <button
                                                                        onClick={(e) => {
                                                                              e.stopPropagation();
                                                                              handleDelete(item.sessionId);
                                                                        }}
                                                                        className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-all border border-slate-200 dark:border-white/5 active:scale-95"
                                                                        title="삭제"
                                                                  >
                                                                        <i className="fas fa-trash-alt text-sm"></i>
                                                                  </button>
                                                            </div>
                                                      </div>

                                                      <div className="relative mt-2">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-600/20 dark:bg-amber-400/10 rounded-full" />
                                                            <p className="pl-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed line-clamp-2 italic font-serif">
                                                                  "{item.summarySnippet}"
                                                            </p>
                                                      </div>

                                                      <div className="mt-6 flex items-center text-[10px] sm:text-xs text-amber-700/60 dark:text-amber-400/40 font-medium">
                                                            <span>결과 상세보기</span>
                                                            <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                                                      </div>
                                                </div>
                                          </div>
                                    ))}

                                    {/* Pagination */}
                                    {history && history.totalPages > 1 && (
                                          <div className="flex justify-center items-center gap-4 mt-12">
                                                <button
                                                      disabled={history.first}
                                                      onClick={() => setPage(p => p - 1)}
                                                      className="p-2 w-10 h-10 rounded-full border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                                                >
                                                      <i className="fas fa-chevron-left"></i>
                                                </button>
                                                <span className="text-slate-400 font-chakra">
                                                      {history.number + 1} / {history.totalPages}
                                                </span>
                                                <button
                                                      disabled={history.last}
                                                      onClick={() => setPage(p => p + 1)}
                                                      className="p-2 w-10 h-10 rounded-full border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                                                >
                                                      <i className="fas fa-chevron-right"></i>
                                                </button>
                                          </div>
                                    )}
                              </div>
                        )}
                  </div>

                  <ShareModal
                        isOpen={shareModalData.isOpen}
                        onClose={() => setShareModalData({ ...shareModalData, isOpen: false })}
                        shareUrl={shareModalData.url}
                  />
            </div>
      );
};

export default TarotHistoryPage;
