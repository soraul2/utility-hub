import React from 'react';
import classNames from 'classnames';
import type { TextToMdMode } from './types';

interface ModeToggleProps {
      mode: TextToMdMode;
      onModeChange: (mode: TextToMdMode) => void;
      disabled?: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange, disabled }) => {
      return (
            <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl w-fit">
                  <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onModeChange('local')}
                        className={classNames(
                              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                              mode === 'local'
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        )}
                  >
                        🖼️ 로컬 변환
                  </button>
                  <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onModeChange('ai')}
                        className={classNames(
                              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                              mode === 'ai'
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                        )}
                  >
                        ✨ AI 변환
                  </button>
            </div>
      );
};

export default ModeToggle;
