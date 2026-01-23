/**
 * 결과 표시 컴포넌트
 * 
 * 계산 결과(필요 롤 수, 예상 금액)를 표시합니다.
 * UI/UX 구조는 기존과 100% 동일하게 유지됩니다.
 */

import React from 'react';
import { formatWonSimple } from '../../../../lib/mulchingFilm';
import type { ResultDisplayProps } from '../types';

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
      return (
            <div className="text-center min-h-[100px] flex flex-col justify-center items-center">
                  {result ? (
                        <div className="animate-fade-in-up w-full">
                              <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">
                                    필요 수량
                              </div>
                              <div className="flex justify-center items-baseline gap-1 mb-2">
                                    <span className="text-6xl font-black text-blue-600 dark:text-blue-400 leading-none tracking-tight">
                                          {result.rolls}
                                    </span>
                                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">롤</span>
                              </div>
                              <div className="text-lg text-gray-600 dark:text-gray-300">
                                    예상 금액: <span className="text-gray-900 dark:text-white font-bold">{result.cost.toLocaleString()}원</span> <span className="text-gray-500 dark:text-gray-400 text-base">({formatWonSimple(result.cost)})</span>
                              </div>
                        </div>
                  ) : (
                        <div className="text-gray-400 dark:text-gray-600 py-4">
                              <i className="fa-solid fa-calculator text-4xl mb-2 opacity-20"></i>
                              <p className="text-sm">입력 후 계산하기를 눌러주세요</p>
                        </div>
                  )}
            </div>
      );
};
