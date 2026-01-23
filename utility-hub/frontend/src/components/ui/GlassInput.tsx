import React from 'react';
import classNames from 'classnames';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
      label?: string;
      error?: string;
      suffix?: React.ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({ label, error, suffix, className, ...props }) => {
      return (
            <div className="w-full">
                  {label && (
                        <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300 ml-1">
                              {label}
                        </label>
                  )}
                  <div className="relative">
                        <input
                              className={classNames(
                                    'w-full px-4 py-3 rounded-2xl transition-all duration-200 outline-none border-2',
                                    'bg-white/50 border-gray-100 focus:border-blue-500/50 text-gray-900',
                                    'dark:bg-gray-700/50 dark:border-gray-600 dark:focus:border-blue-500/50 dark:text-white',
                                    'placeholder:text-gray-400',
                                    className
                              )}
                              {...props}
                        />
                        {suffix && (
                              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                    {suffix}
                              </div>
                        )}
                  </div>
                  {error && <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>}
            </div>
      );
};
