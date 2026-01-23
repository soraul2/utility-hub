/**
 * 뽀모도로 타이머 로직
 * 
 * 뽀모도로 기법을 구현하는 타이머 상태 머신과 유틸리티 함수들을 제공합니다.
 */

/**
 * 뽀모도로 모드
 */
export type PomodoroMode = 'work' | 'break';

/**
 * 뽀모도로 설정
 */
export interface PomodoroSettings {
      /** 집중 시간 (분) */
      workDurationMinutes: number;
      /** 휴식 시간 (분) */
      breakDurationMinutes: number;
}

/**
 * 기본 뽀모도로 설정
 */
export const DEFAULT_SETTINGS: PomodoroSettings = {
      workDurationMinutes: 25,
      breakDurationMinutes: 5,
};

/**
 * 시간을 MM:SS 형식으로 포맷팅
 * 
 * @param seconds - 초 단위 시간
 * @returns 포맷팅된 문자열 (예: "25:00", "05:30")
 */
export function formatTime(seconds: number): string {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 분을 초로 변환
 * 
 * @param minutes - 분
 * @returns 초
 */
export function minutesToSeconds(minutes: number): number {
      return minutes * 60;
}

/**
 * 진행률 계산
 * 
 * @param timeLeft - 남은 시간 (초)
 * @param totalTime - 전체 시간 (초)
 * @returns 진행률 (0-100)
 */
export function calculateProgress(timeLeft: number, totalTime: number): number {
      if (totalTime === 0) return 0;
      return ((totalTime - timeLeft) / totalTime) * 100;
}

/**
 * SVG 원형 진행 바의 stroke-dashoffset 계산
 * 
 * @param progress - 진행률 (0-100)
 * @param radius - 원의 반지름
 * @returns stroke-dashoffset 값
 */
export function calculateStrokeDashoffset(progress: number, radius: number): number {
      const circumference = 2 * Math.PI * radius;
      return circumference - (progress / 100) * circumference;
}

/**
 * 다음 모드 결정
 * 
 * @param currentMode - 현재 모드
 * @returns 다음 모드
 */
export function getNextMode(currentMode: PomodoroMode): PomodoroMode {
      return currentMode === 'work' ? 'break' : 'work';
}

/**
 * 모드에 따른 초기 시간 계산
 * 
 * @param mode - 뽀모도로 모드
 * @param settings - 뽀모도로 설정
 * @returns 초 단위 시간
 */
export function getInitialTimeForMode(
      mode: PomodoroMode,
      settings: PomodoroSettings
): number {
      return mode === 'work'
            ? minutesToSeconds(settings.workDurationMinutes)
            : minutesToSeconds(settings.breakDurationMinutes);
}
