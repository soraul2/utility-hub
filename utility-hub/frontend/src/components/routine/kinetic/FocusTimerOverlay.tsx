import React, { useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import type { Task } from '../../../types/routine';

interface FocusTimerOverlayProps {
  focusTarget: Task;
  isWaiting: boolean;
  currentMinutes: number;
  currentSeconds: number;
  timeToMinutes: (timeStr?: string) => number;
  onToggleTask: (taskId: number) => Promise<void>;
  onClose: () => void;
}

export const FocusTimerOverlay: React.FC<FocusTimerOverlayProps> = ({
  focusTarget,
  isWaiting,
  currentMinutes,
  currentSeconds,
  timeToMinutes,
  onToggleTask,
  onClose,
}) => {
  const [isToggling, setIsToggling] = useState(false);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const focusStart = timeToMinutes(focusTarget.startTime);
  const focusEnd = focusStart + (focusTarget.durationMinutes || 60);

  // Waiting mode: countdown to next task start / Active mode: countdown to task end
  const focusRemainingTotal = isWaiting
    ? (focusStart - currentMinutes) * 60 - currentSeconds
    : (focusEnd - currentMinutes) * 60 - currentSeconds;
  const focusHours = Math.floor(Math.max(0, focusRemainingTotal) / 3600);
  const focusMins = Math.floor((Math.max(0, focusRemainingTotal) % 3600) / 60);
  const focusSecs = Math.max(0, focusRemainingTotal) % 60;

  // Waiting mode: progress fills as time approaches / Active mode: progress by elapsed
  const focusProgress = isWaiting
    ? Math.min(100, Math.max(0, (1 - (focusStart - currentMinutes) / Math.max(1, focusStart - currentMinutes + 1)) * 100))
    : Math.min(100, Math.max(0, ((currentMinutes - focusStart) / (focusTarget.durationMinutes || 60)) * 100));

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggleTask(focusTarget.id);
      onClose();
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-10 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Timer Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        {/* Task Info */}
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isWaiting ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
            <span className={`text-sm font-bold uppercase tracking-widest ${isWaiting ? 'text-emerald-300' : 'text-indigo-300'}`}>
              {isWaiting ? '\uc26c\uc5b4\uac00\uae30' : '\uc9d1\uc911 \ubaa8\ub4dc'}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
            {focusTarget.title}
          </h2>
          <p className="text-white/50 text-sm">
            {isWaiting
              ? `${focusTarget.startTime?.substring(0, 5)} \uc2dc\uc791 \uc608\uc815`
              : `${focusTarget.startTime?.substring(0, 5)} ~ ${String(Math.floor(focusEnd / 60)).padStart(2, '0')}:${String(focusEnd % 60).padStart(2, '0')}`
            }
          </p>
        </div>

        {/* Circular Timer */}
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle
              cx="100" cy="100" r="90"
              fill="none"
              stroke={`url(#focusGradient)`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * Math.max(0, Math.min(1, focusRemainingTotal / (isWaiting ? (focusStart - currentMinutes + focusMins) * 60 || 1 : (focusTarget.durationMinutes || 60) * 60)))}`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isWaiting ? '#2dd4bf' : '#818cf8'} />
                <stop offset="100%" stopColor={isWaiting ? '#10b981' : '#c084fc'} />
              </linearGradient>
            </defs>
          </svg>
          {/* Timer text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl md:text-6xl font-black text-white tabular-nums tracking-tight">
              {focusHours > 0 && <span>{String(focusHours).padStart(2, '0')}:</span>}
              {String(focusMins).padStart(2, '0')}:{String(focusSecs).padStart(2, '0')}
            </div>
            <span className="text-white/40 text-xs font-bold mt-2 uppercase tracking-wider">
              {isWaiting ? '\uc2dc\uc791\uae4c\uc9c0' : '\ub0a8\uc740 \uc2dc\uac04'}
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-4">
          {!isWaiting && (
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className="px-8 py-3.5 bg-white text-indigo-700 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-2xl disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              {isToggling ? '\ucc98\ub9ac \uc911...' : '\uc644\ub8cc\ud558\uae30'}
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 transition-colors shadow-2xl ${
              isWaiting
                ? 'bg-white text-emerald-700 hover:bg-emerald-50'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <X className="w-5 h-5" />
            {'\ub098\uac00\uae30'}
          </button>
        </div>

        {/* Progress info */}
        <div className="text-white/30 text-xs font-bold">
          {isWaiting
            ? `\ub2e4\uc74c \uc77c\uc815\uae4c\uc9c0 \ud3b8\ud788 \uc26c\uc138\uc694 \xb7 ESC \ub610\ub294 X \ubc84\ud2bc\uc73c\ub85c \ub098\uac00\uae30`
            : `\uc9c4\ud589\ub960 ${Math.round(focusProgress)}% \xb7 ESC \ub610\ub294 X \ubc84\ud2bc\uc73c\ub85c \ub098\uac00\uae30`
          }
        </div>
      </div>
    </div>
  );
};
