import React from 'react';
import classNames from 'classnames';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: ButtonVariant;
      size?: ButtonSize;
      children: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
      variant = 'primary',
      size = 'md',
      className,
      children,
      ...props
}) => {

      const variants = {
            primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30',
            secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
            danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30',
            success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30',
            ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300',
      };

      const sizes = {
            sm: 'px-4 py-2 text-sm rounded-xl',
            md: 'px-6 py-3 text-base rounded-2xl',
            lg: 'px-8 py-4 text-lg rounded-2xl',
      };

      return (
            <button
                  className={classNames(
                        'font-medium transition-all duration-300 active:scale-95 flex items-center justify-center gap-2',
                        variants[variant],
                        sizes[size],
                        className
                  )}
                  {...props}
            >
                  {children}
            </button>
      );
};
