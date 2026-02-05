import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ToastProps {
      message: string;
      type: 'success' | 'error';
      onClose: () => void;
      duration?: number;
}

const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
      useEffect(() => {
            const timer = setTimeout(() => {
                  onClose();
            }, duration);

            return () => clearTimeout(timer);
      }, [duration, onClose]);

      const content = (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
                  <div
                        className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm ${
                              type === 'success'
                                    ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
                                    : 'bg-rose-50/95 border-rose-200 text-rose-800'
                        }`}
                  >
                        {type === 'success' ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        ) : (
                              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm">{message}</span>
                        <button
                              onClick={onClose}
                              className={`p-1 rounded-lg transition-colors ml-2 ${
                                    type === 'success'
                                          ? 'hover:bg-emerald-100'
                                          : 'hover:bg-rose-100'
                              }`}
                        >
                              <X className="w-4 h-4" />
                        </button>
                  </div>
            </div>
      );

      return createPortal(content, document.body);
};

export default Toast;
