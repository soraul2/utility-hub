import React from 'react';

interface ErrorBannerProps {
      message: string;
      onRetry?: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
      return (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-center my-4 backdrop-blur-sm animate-fade-in">
                  <div className="flex flex-col items-center gap-2">
                        <i className="fas fa-exclamation-circle text-red-500 text-2xl"></i>
                        <p className="text-red-200">{message}</p>
                        {onRetry && (
                              <button
                                    onClick={onRetry}
                                    className="mt-2 px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-md transition-colors text-sm font-medium border border-red-500/30"
                              >
                                    다시 시도
                              </button>
                        )}
                  </div>
            </div>
      );
};

export default ErrorBanner;
