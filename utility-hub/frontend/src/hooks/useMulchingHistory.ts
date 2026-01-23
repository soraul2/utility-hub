/**
 * 멀칭 비닐 계산 히스토리 관리 훅
 * 
 * 최근 계산 결과를 로컬 스토리지에 저장하고 관리합니다.
 */

import { useState, useEffect } from 'react';

export interface CalculationResult {
      id: string;
      inputs: {
            areaPyeong: string;
            widthCm: string;
            lengthM: string;
            pricePerRoll: string;
      };
      rolls: number;
      cost: number;
      areaM2: number;
      rollAreaM2: number;
      timestamp: Date;
}

const STORAGE_KEY = 'mulching-history';
const MAX_HISTORY_ITEMS = 5;

/**
 * 멀칭 비닐 계산 히스토리 관리 훅
 * 
 * @param maxItems - 최대 저장 개수 (기본값: 5)
 * @returns 히스토리 배열과 추가 함수
 */
export function useMulchingHistory(maxItems: number = MAX_HISTORY_ITEMS) {
      const [history, setHistory] = useState<CalculationResult[]>(() => {
            // 로컬 스토리지에서 초기 데이터 로드
            try {
                  const stored = localStorage.getItem(STORAGE_KEY);
                  if (stored) {
                        const parsed = JSON.parse(stored);
                        // Date 객체 복원
                        return parsed.map((item: any) => ({
                              ...item,
                              timestamp: new Date(item.timestamp),
                        }));
                  }
            } catch (error) {
                  console.error('Failed to load history from localStorage:', error);
            }
            return [];
      });

      // 히스토리 변경 시 로컬 스토리지에 저장
      useEffect(() => {
            try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
            } catch (error) {
                  console.error('Failed to save history to localStorage:', error);
            }
      }, [history]);

      /**
       * 새로운 계산 결과 추가
       */
      const addResult = (result: CalculationResult) => {
            setHistory((prev) => [result, ...prev].slice(0, maxItems));
      };

      /**
       * 히스토리 초기화
       */
      const clearHistory = () => {
            setHistory([]);
            localStorage.removeItem(STORAGE_KEY);
      };

      return {
            history,
            addResult,
            clearHistory,
      };
}
