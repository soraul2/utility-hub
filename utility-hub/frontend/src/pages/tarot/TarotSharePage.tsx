import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShare } from '../../lib/api/tarotApi';
import type { DailyCardResponse, ThreeCardResponse, ShareResponse } from '../../lib/tarot';
import DailyCardResultView from './components/DailyCardResultView';
import ResultStep from './components/ResultStep';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import { ASSISTANTS } from '../../lib/tarot-assistants';
import { Helmet } from 'react-helmet-async';

const TarotSharePage: React.FC = () => {
      const { shareUuid } = useParams<{ shareUuid: string }>();
      const navigate = useNavigate();
      const [data, setData] = useState<ShareResponse | null>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
            const fetchSharedData = async () => {
                  if (!shareUuid) return;
                  setLoading(true);
                  setError(null);
                  try {
                        const result = await getShare(shareUuid);
                        setData(result);
                  } catch (err) {
                        setError(err instanceof Error ? err.message : '공유된 리딩을 불러오는데 실패했습니다.');
                  } finally {
                        setLoading(false);
                  }
            };

            fetchSharedData();
      }, [shareUuid]);

      if (loading) {
            return (
                  <div className="min-h-screen flex items-center justify-center">
                        <div className="mystic-bg" />
                        <LoadingSpinner message="조상의 예언을 해독 중..." />
                  </div>
            );
      }

      if (error || !data) {
            return (
                  <div className="min-h-screen flex items-center justify-center px-4">
                        <div className="mystic-bg" />
                        <div className="max-w-md w-full">
                              <ErrorBanner message={error || '데이터를 찾을 수 없습니다.'} onRetry={() => navigate('/tarot')} />
                        </div>
                  </div>
            );
      }



      const title = `미스틱 타로 - ${data.question.length > 20 ? data.question.substring(0, 20) + '...' : data.question}`;
      const description = `${data.aiReading.substring(0, 100)}...`;
      const currentUrl = window.location.href;

      return (
            <div className="relative min-h-screen py-12">
                  <Helmet>
                        <title>{title}</title>
                        <meta name="description" content={description} />

                        <meta property="og:title" content={title} />
                        <meta property="og:description" content={description} />
                        <meta property="og:url" content={currentUrl} />

                        <meta name="twitter:title" content={title} />
                        <meta name="twitter:description" content={description} />
                  </Helmet>


                  <div className="relative z-10">
                        <div className="text-center mb-10 px-4">
                              <div className="inline-block px-4 py-1 rounded-full bg-amber-600/20 border border-amber-600/30 text-amber-500 text-[10px] tracking-[0.3em] uppercase mb-4">
                                    Shared Prediction
                              </div>
                              <h1 className="text-4xl md:text-5xl font-bold font-serif italic tracking-tighter py-2">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 dark:from-purple-200 dark:via-blue-100 dark:to-purple-200 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                          운명의 기록
                                    </span>
                              </h1>
                        </div>

                        {data.spreadType === 'THREE_CARD' ? (
                              <div className="px-4">
                                    <ResultStep
                                          data={{
                                                sessionId: 0,
                                                cards: data.cards,
                                                aiReading: data.aiReading,
                                                createdAt: data.createdAt
                                          } as ThreeCardResponse}
                                          selectedLeader={null}
                                          assistants={ASSISTANTS}
                                          onReset={() => navigate('/tarot')}
                                          userName={data.userName}
                                    />
                              </div>
                        ) : (
                              <DailyCardResultView
                                    data={{
                                          sessionId: 0,
                                          card: data.cards[0],
                                          aiReading: data.aiReading,
                                          createdAt: data.createdAt
                                    } as DailyCardResponse}
                                    onRetry={() => navigate('/tarot')}
                              />
                        )}

                        <div className="mt-20 text-center pb-20">
                              <p className="text-slate-500 text-sm mb-6 font-chakra tracking-widest">당신의 운명도 궁금하신가요?</p>
                              <button
                                    onClick={() => navigate('/tarot')}
                                    className="px-10 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full font-bold shadow-[0_10px_30px_rgba(180,83,9,0.3)] hover:scale-105 transition-transform"
                              >
                                    미스틱 타로 시작하기
                              </button>
                        </div>
                  </div>
            </div>
      );
};

export default TarotSharePage;
