import React from 'react';
import { GlassCard } from '../../../../components/ui/GlassCard';
import type { PlanComparisonResult } from '../types';
import { formatToKoreanWon } from '../utils/formatters';

interface ComparisonResultProps {
      result: PlanComparisonResult | null;
}

export const ComparisonResult: React.FC<ComparisonResultProps> = ({ result }) => {
      if (!result) return null;

      return (
            <GlassCard className="p-8 text-center bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-100 dark:border-blue-900">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        📊 24개월 총 비용 비교 결과
                  </h2>

                  <div className="grid grid-cols-2 gap-8 mb-8 relative">
                        <div className={`p-4 rounded-xl transition-all ${result.cheaper === 'carrier' ? 'bg-blue-100 text-blue-900 scale-105 shadow-md ring-2 ring-blue-500' : 'bg-gray-100 text-gray-500 opacity-80'}`}>
                              <div className="text-sm mb-1 font-medium">통신사 약정</div>
                              <span className="text-2xl font-bold block">
                                    {result.carrierTotal.toLocaleString()}원
                              </span>
                              <span className="text-sm opacity-75 block mt-1">
                                    ({formatToKoreanWon(result.carrierTotal)})
                              </span>
                        </div>

                        <div className={`p-4 rounded-xl transition-all ${result.cheaper === 'mvno' ? 'bg-purple-100 text-purple-900 scale-105 shadow-md ring-2 ring-purple-500' : 'bg-gray-100 text-gray-500 opacity-80'}`}>
                              <div className="text-sm mb-1 font-medium">자급제 + 알뜰폰</div>
                              <span className="text-2xl font-bold block">
                                    {result.mvnoTotal.toLocaleString()}원
                              </span>
                              <span className="text-sm opacity-75 block mt-1">
                                    ({formatToKoreanWon(result.mvnoTotal)})
                              </span>
                        </div>

                        {/* VS Badge */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-sm border text-xs font-bold text-gray-400 z-10">
                              VS
                        </div>
                  </div>

                  <div className="mb-8">
                        <span className="text-lg text-gray-600 dark:text-gray-300">
                              {result.cheaper === 'carrier' ? '통신사 약정이' : result.cheaper === 'mvno' ? '자급제 + 알뜰폰이' : '두 플랜의 비용이'}
                        </span>
                        <div className="mt-2">
                              {result.cheaper !== 'same' ? (
                                    <>
                                          <span className={`text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${result.cheaper === 'carrier' ? 'from-blue-600 to-blue-400' : 'from-purple-600 to-purple-400'}`}>
                                                {Math.abs(result.difference).toLocaleString()}원
                                          </span>
                                          <span className="text-xl font-bold text-gray-700 dark:text-gray-200 ml-1">
                                                더 저렴합니다! 🎉
                                          </span>
                                          <div className={`text-base font-medium mt-1 ${result.cheaper === 'carrier' ? 'text-blue-600' : 'text-purple-600'}`}>
                                                ({formatToKoreanWon(Math.abs(result.difference))} 절약)
                                          </div>
                                    </>
                              ) : (
                                    <span className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                                          동일합니다.
                                    </span>
                              )}
                        </div>
                  </div>
                  {/* 상세 계산식 (Formula) */}
                  {result.formula && (
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 space-y-2">
                              <p className="font-semibold text-gray-700 dark:text-gray-300">💡 계산 내역</p>
                              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-2">
                                    <span className="font-medium">통신사:</span>
                                    <span className="break-all">{result.formula.carrier}</span>
                                    <span className="font-medium">알뜰폰:</span>
                                    <span className="break-all">{result.formula.mvno}</span>
                              </div>
                        </div>
                  )}
            </GlassCard>
      );
};

