import React from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

interface ConfirmModalProps {
      isOpen: boolean;
      onClose: () => void;
      onConfirm: () => void;
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      variant?: 'danger' | 'warning';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
      isOpen,
      onClose,
      onConfirm,
      title,
      message,
      confirmText = '확인',
      cancelText = '취소',
      variant = 'warning',
}) => {
      if (!isOpen) return null;

      const variantClasses = {
            danger: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
            warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30',
      };

      return createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  {/* Backdrop */}
                  <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                        onClick={onClose}
                  />

                  {/* Modal Content */}
                  <div className={classNames(
                        "relative w-full max-w-md transform overflow-hidden rounded-3xl p-8 shadow-2xl transition-all",
                        "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-white/10"
                  )}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {title}
                        </h3>
                        <p className="text-gray-600 dark:text-slate-400 mb-8 leading-relaxed">
                              {message}
                        </p>

                        <div className="flex gap-3 mt-6">
                              <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                              >
                                    {cancelText}
                              </button>
                              <button
                                    onClick={() => {
                                          onConfirm();
                                          onClose();
                                    }}
                                    className={classNames(
                                          "flex-1 px-4 py-3 rounded-xl font-medium text-white shadow-lg transition-all active:scale-95",
                                          variantClasses[variant]
                                    )}
                              >
                                    {confirmText}
                              </button>
                        </div>
                  </div>
            </div>,
            document.body
      );
};
