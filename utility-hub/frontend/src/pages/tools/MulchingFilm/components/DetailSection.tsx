/**
 * 계산 상세 내역 컴포넌트
 * 
 * 밭 전체 면적, 한 롤당 면적, 최종 계산식을 표시합니다.
 * UI/UX 구조는 기존과 100% 동일하게 유지됩니다.
 */

import React from 'react';
import type { DetailSectionProps } from '../types';

export const DetailSection: React.FC<DetailSectionProps> = ({ result }) => {
      return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-1">
                        <span className="text-xl">💡</span>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                              계산 상세 내역 (1평 = 3.3m²)
                        </h3>
                  </div>

                  <div className="space-y-3 text-sm">
                        {/* 1. 밭 전체 면적 */}
                        <div className="flex justify-between items-start pb-3 border-b border-dashed border-gray-200 dark:border-gray-700">
                              <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">1. 밭 전체 면적</span>
                              <div className="text-right">
                                    <span className="text-gray-800 dark:text-gray-200">
                                          {result.inputs.areaPyeong}평 × 3.3 = <b>{result.areaM2.toFixed(1)}m²</b>
                                    </span>
                              </div>
                        </div>

                        {/* 2. 한 롤당 멀칭 가능한 면적 */}
                        <div className="flex justify-between items-start pb-3 border-b border-dashed border-gray-200 dark:border-gray-700">
                              <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">2. 한 롤당 멀칭 가능한 면적</span>
                              <div className="text-right">
                                    <div className="text-gray-800 dark:text-gray-200">
                                          {(parseFloat(result.inputs.widthCm) / 100).toFixed(1)}m × {result.inputs.lengthM}m = <b>{result.rollAreaM2.toFixed(1)}m²</b>
                                    </div>
                                    <div className="text-blue-500 dark:text-blue-400 font-bold text-xs mt-0.5">
                                          (약 {(result.rollAreaM2 / 3.3).toFixed(1)}평)
                                    </div>
                              </div>
                        </div>

                        {/* 3. 최종 계산 */}
                        <div className="flex justify-between items-start pt-1">
                              <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">3. 최종 계산</span>
                              <div className="text-right">
                                    <span className="text-gray-800 dark:text-gray-200">
                                          전체 면적 ÷ 1롤 면적 = <b className="text-blue-600 dark:text-blue-400">{result.rolls}개</b>
                                    </span>
                              </div>
                        </div>
                  </div>
            </div>
      );
};
