import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = '로딩 중...' }) => {
      return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="relative w-16 h-16">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500/30 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-200 text-xs">
                              ✨
                        </div>
                  </div>
                  <p className="text-purple-200 animate-pulse font-light tracking-widest text-sm">{message}</p>
            </div>
      );
};

export default LoadingSpinner;
