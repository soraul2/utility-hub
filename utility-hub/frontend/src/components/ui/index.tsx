import React from 'react';
import classNames from 'classnames';

// --- Card Component ---
interface CardProps {
      children: React.ReactNode;
      className?: string;
      title?: string;
      footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, title, footer }) => {
      return (
            <div className={classNames('bg-white dark:bg-dark-card rounded shadow mb-4 flex flex-col', className)}>
                  {title && (
                        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 font-semibold text-lg text-gray-800 dark:text-gray-200">
                              {title}
                        </div>
                  )}
                  <div className="flex-1 p-5 text-gray-700 dark:text-gray-300">
                        {children}
                  </div>
                  {footer && (
                        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b">
                              {footer}
                        </div>
                  )}
            </div>
      );
};

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
      size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
      children,
      variant = 'primary',
      size = 'md',
      className,
      ...props
}) => {
      const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

      const variants = {
            primary: 'bg-primary hover:bg-blue-700 text-white focus:ring-primary',
            secondary: 'bg-secondary hover:bg-gray-600 text-white focus:ring-secondary',
            success: 'bg-success hover:bg-teal-600 text-white focus:ring-success',
            danger: 'bg-danger hover:bg-red-700 text-white focus:ring-danger',
            warning: 'bg-warning hover:bg-orange-600 text-white focus:ring-warning',
            info: 'bg-info hover:bg-cyan-600 text-white focus:ring-info',
            light: 'bg-light hover:bg-gray-200 text-gray-800 focus:ring-gray-300',
            dark: 'bg-dark hover:bg-black text-white focus:ring-dark',
            link: 'bg-transparent text-primary hover:underline shadow-none',
      };

      const sizes = {
            sm: 'px-2.5 py-1.5 text-xs',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
      };

      return (
            <button
                  className={classNames(baseClasses, variants[variant], sizes[size], 'disabled:opacity-50 disabled:cursor-not-allowed', className)}
                  {...props}
            >
                  {children}
            </button>
      );
};

// --- Badge Component ---
interface BadgeProps {
      children: React.ReactNode;
      variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
      className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className }) => {
      const variants = {
            primary: 'bg-blue-100 text-primary dark:bg-blue-900 dark:text-blue-200',
            secondary: 'bg-gray-100 text-secondary dark:bg-gray-700 dark:text-gray-300',
            success: 'bg-green-100 text-success dark:bg-green-900 dark:text-green-200',
            danger: 'bg-red-100 text-danger dark:bg-red-900 dark:text-red-200',
            warning: 'bg-yellow-100 text-warning dark:bg-yellow-900 dark:text-yellow-200',
            info: 'bg-cyan-100 text-info dark:bg-cyan-900 dark:text-cyan-200',
      };

      return (
            <span className={classNames('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', variants[variant], className)}>
                  {children}
            </span>
      );
};
