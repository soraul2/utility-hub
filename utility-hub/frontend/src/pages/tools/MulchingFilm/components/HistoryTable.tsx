/**
 * 히스토리 테이블 컴포넌트
 * 
 * 최근 계산 기록을 테이블 형식으로 표시합니다.
 * UI/UX 구조는 기존과 100% 동일하게 유지됩니다.
 */

import React from 'react';
import { formatWonSimple } from '../../../../lib/mulchingFilm';
import type { HistoryTableProps } from '../types';

export const HistoryTable: React.FC<HistoryTableProps> = ({ history }) => {
      if (history.length === 0) {
            return null;
      }

      return (
            <div className="pt-6 mt-2">
                  <div className="flex items-center gap-2 mb-3 px-1">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400">최근 계산 기록</h3>
                        <i className="fa-solid fa-clock-rotate-left text-gray-400 text-xs"></i>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-5 text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/50 py-2 px-3 rounded-t-lg">
                        <div className="text-center">면적</div>
                        <div className="text-center col-span-2">규격</div>
                        <div className="text-center">수량</div>
                        <div className="text-center">금액</div>
                  </div>

                  {/* Table Body */}
                  <div className="border border-t-0 border-gray-100 dark:border-gray-800 rounded-b-lg overflow-hidden text-xs">
                        {history.map((item) => (
                              <div
                                    key={item.id}
                                    className="grid grid-cols-5 py-3 px-3 border-t border-gray-50 dark:border-gray-800 first:border-t-0 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                              >
                                    <div className="text-center font-bold text-gray-800 dark:text-gray-200">
                                          {item.inputs.areaPyeong}평
                                    </div>
                                    <div className="text-center col-span-2 text-gray-500 dark:text-gray-400">
                                          {item.inputs.widthCm}cm × {item.inputs.lengthM}m
                                    </div>
                                    <div className="text-center font-black text-blue-600 dark:text-blue-400">
                                          {item.rolls}
                                    </div>
                                    <div className="text-center font-bold text-gray-900 dark:text-white text-[11px] leading-tight">
                                          {formatWonSimple(item.cost)}
                                    </div>
                              </div>
                        ))}
                  </div>
                  <div className="text-center mt-2">
                        <span className="text-[10px] text-gray-300 dark:text-gray-600">최근 5개 기록만 유지됩니다</span>
                  </div>
            </div>
      );
};
