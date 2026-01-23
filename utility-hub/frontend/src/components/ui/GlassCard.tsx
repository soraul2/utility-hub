import React from 'react';
import classNames from 'classnames';

interface GlassCardProps {
      children: React.ReactNode;
      className?: string;
      title?: string;
      footer?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, title, footer }) => {
      return (
            <div className={classNames(
                  'relative backdrop-blur-xl rounded-3xl p-8 shadow-2xl transition-all duration-500',
                  'bg-white/40 shadow-gray-200/50',
                  'dark:bg-gray-800/40 dark:shadow-gray-900/50 dark:border dark:border-white/10',
                  className
            )}>
                  {title && (
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
                              {title}
                        </h3>
                  )}
                  <div className={classNames('relative', { 'mb-6': footer })}>
                        {children}
                  </div>
                  {footer}
            </div>
      );
};
