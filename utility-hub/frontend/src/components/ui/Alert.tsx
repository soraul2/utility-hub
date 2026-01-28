import React from 'react';
import classNames from 'classnames';

interface AlertProps {
      children: React.ReactNode;
      variant?: 'success' | 'error' | 'warning' | 'info';
      className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, variant = 'info', className }) => {
      const variants = {
            success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
            error: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
            warning: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
            info: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
      };

      const icons = {
            success: <i className="fa-solid fa-circle-check"></i>,
            error: <i className="fa-solid fa-triangle-exclamation"></i>,
            warning: <i className="fa-solid fa-circle-exclamation"></i>,
            info: <i className="fa-solid fa-circle-info"></i>,
      };

      return (
            <div className={classNames(
                  "p-4 rounded-2xl border backdrop-blur-md flex items-start gap-3",
                  variants[variant],
                  className
            )}>
                  <span className="mt-0.5 font-bold">{icons[variant]}</span>
                  <div className="text-sm font-medium leading-relaxed">
                        {children}
                  </div>
            </div>
      );
};
