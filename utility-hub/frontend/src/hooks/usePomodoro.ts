/**
 * 뽀모도로 타이머 훅
 * 
 * 뽀모도로 타이머의 상태와 로직을 관리하는 커스텀 훅입니다.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { PomodoroMode, PomodoroSettings } from '../lib/pomodoro';
import {
      DEFAULT_SETTINGS,
      getInitialTimeForMode,
      getNextMode,
} from '../lib/pomodoro';

export interface UsePomodoroReturn {
      // 상태
      mode: PomodoroMode;
      timeLeft: number;
      isRunning: boolean;
      workDuration: number;
      breakDuration: number;

      // 액션
      toggleTimer: () => void;
      resetTimer: () => void;
      switchMode: (newMode: PomodoroMode) => void;
      setWorkDuration: (minutes: number) => void;
      setBreakDuration: (minutes: number) => void;

      // 계산된 값
      totalTime: number;
      progress: number;
}

/**
 * 뽀모도로 타이머 훅
 * 
 * @param initialSettings - 초기 설정 (선택)
 * @param onComplete - 타이머 완료 시 콜백 (선택)
 * @returns 타이머 상태 및 제어 함수
 */
export function usePomodoro(
      initialSettings: PomodoroSettings = DEFAULT_SETTINGS,
      onComplete?: (completedMode: PomodoroMode) => void
): UsePomodoroReturn {
      const [mode, setMode] = useState<PomodoroMode>('work');
      const [workDuration, setWorkDuration] = useState(initialSettings.workDurationMinutes);
      const [breakDuration, setBreakDuration] = useState(initialSettings.breakDurationMinutes);
      const [timeLeft, setTimeLeft] = useState(() =>
            getInitialTimeForMode('work', { workDurationMinutes: workDuration, breakDurationMinutes: breakDuration })
      );
      const [isRunning, setIsRunning] = useState(false);

      const audioRef = useRef<HTMLAudioElement | null>(null);

      // 오디오 요소 초기화
      useEffect(() => {
            audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            return () => {
                  if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current = null;
                  }
            };
      }, []);

      const totalTime = mode === 'work' ? workDuration * 60 : breakDuration * 60;
      const progress = ((totalTime - timeLeft) / totalTime) * 100;

      // 타이머 로직
      useEffect(() => {
            let interval: number | undefined;

            if (isRunning && timeLeft > 0) {
                  interval = setInterval(() => {
                        setTimeLeft((time) => time - 1);
                  }, 1000);
            } else if (timeLeft === 0) {
                  // 타이머 완료
                  const completedMode = mode;

                  // 알림음 재생
                  if (audioRef.current) {
                        audioRef.current.play().catch((e) => console.log('Audio play failed:', e));
                  }

                  // 콜백 실행
                  if (onComplete) {
                        onComplete(completedMode);
                  }

                  // 다음 모드로 전환
                  const nextMode = getNextMode(mode);
                  setMode(nextMode);
                  setTimeLeft(getInitialTimeForMode(nextMode, { workDurationMinutes: workDuration, breakDurationMinutes: breakDuration }));
                  setIsRunning(false);
            }

            return () => clearInterval(interval);
      }, [isRunning, timeLeft, mode, workDuration, breakDuration, onComplete]);

      const toggleTimer = useCallback(() => {
            setIsRunning((prev) => !prev);
      }, []);

      const resetTimer = useCallback(() => {
            setIsRunning(false);
            setTimeLeft(getInitialTimeForMode(mode, { workDurationMinutes: workDuration, breakDurationMinutes: breakDuration }));
      }, [mode, workDuration, breakDuration]);

      const switchMode = useCallback((newMode: PomodoroMode) => {
            setMode(newMode);
            setIsRunning(false);
            setTimeLeft(getInitialTimeForMode(newMode, { workDurationMinutes: workDuration, breakDurationMinutes: breakDuration }));
      }, [workDuration, breakDuration]);

      return {
            mode,
            timeLeft,
            isRunning,
            workDuration,
            breakDuration,
            toggleTimer,
            resetTimer,
            switchMode,
            setWorkDuration,
            setBreakDuration,
            totalTime,
            progress,
      };
}
