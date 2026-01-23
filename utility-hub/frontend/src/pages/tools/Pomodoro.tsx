import classNames from 'classnames';
import { usePomodoro } from '../../hooks/usePomodoro';
import { formatTime, calculateStrokeDashoffset } from '../../lib/pomodoro';

export default function Pomodoro() {
      const {
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
            progress,
      } = usePomodoro();

      const circumference = 2 * Math.PI * 120;
      const strokeDashoffset = calculateStrokeDashoffset(progress, 120);

      return (
            <div className="flex items-center justify-center py-10">
                  <div style={{ width: '480px' }} className={classNames(
                        'relative backdrop-blur-xl rounded-[40px] p-12 shadow-2xl transition-all duration-500',
                        'bg-white/40 shadow-gray-200/50',
                        'dark:bg-gray-800/40 dark:shadow-gray-900/50 dark:border dark:border-white/5'
                  )}>

                        {/* Mode Indicator */}
                        <div className="text-center mb-10">
                              <div className="inline-flex gap-2 p-1.5 rounded-2xl bg-gray-100/50 dark:bg-gray-700/50 backdrop-blur-md">
                                    <button
                                          onClick={() => switchMode('work')}
                                          className={classNames(
                                                'px-8 py-3 rounded-xl font-bold transition-all duration-300',
                                                mode === 'work'
                                                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 active:scale-95'
                                                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                          )}
                                    >
                                          집중
                                    </button>
                                    <button
                                          onClick={() => switchMode('break')}
                                          className={classNames(
                                                'px-8 py-3 rounded-xl font-bold transition-all duration-300',
                                                mode === 'break'
                                                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 active:scale-95'
                                                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                          )}
                                    >
                                          휴식
                                    </button>
                              </div>
                        </div>

                        {/* Circular Progress Timer */}
                        <div className="flex justify-center items-center mb-12">
                              <div className="relative">
                                    <svg className="transform -rotate-90" width="280" height="280">
                                          <circle
                                                cx="140"
                                                cy="140"
                                                r="120"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="none"
                                                className="text-gray-200 dark:text-gray-700/30"
                                          />
                                          <circle
                                                cx="140"
                                                cy="140"
                                                r="120"
                                                stroke={mode === 'work' ? '#ef4444' : '#10b981'}
                                                strokeWidth="12"
                                                fill="none"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={strokeDashoffset}
                                                strokeLinecap="round"
                                                className="transition-all duration-300 ease-linear"
                                          />
                                    </svg>

                                    {/* Timer Display */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                          <div className="text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
                                                {formatTime(timeLeft)}
                                          </div>
                                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                                                {mode === 'work' ? '집중 시간' : '휴식 시간'}
                                          </div>
                                    </div>
                              </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex justify-center gap-4 mb-10">
                              <button
                                    onClick={toggleTimer}
                                    className={classNames(
                                          'px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 active:scale-95',
                                          isRunning
                                                ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30 hover:bg-yellow-600'
                                                : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600'
                                    )}
                              >
                                    {isRunning ? '일시정지' : '시작'}
                              </button>
                              <button
                                    onClick={resetTimer}
                                    className="px-10 py-4 rounded-2xl font-bold text-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 active:scale-95"
                              >
                                    리셋
                              </button>
                        </div>

                        {/* Settings */}
                        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                              <div className="grid grid-cols-2 gap-4">
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                집중 시간 (분)
                                          </label>
                                          <input
                                                type="number"
                                                value={workDuration}
                                                onChange={(e) => setWorkDuration(Number(e.target.value))}
                                                min="1"
                                                max="180"
                                                className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                                          />
                                    </div>
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                휴식 시간 (분)
                                          </label>
                                          <input
                                                type="number"
                                                value={breakDuration}
                                                onChange={(e) => setBreakDuration(Number(e.target.value))}
                                                min="1"
                                                max="60"
                                                className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                                          />
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>
      );
}
