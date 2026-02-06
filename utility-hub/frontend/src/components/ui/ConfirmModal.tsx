import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

interface ConfirmModalProps {
      isOpen: boolean;
      onClose: () => void;
      onConfirm: () => void;
      title: string;
      message: string;
      confirmLabel?: string;
      cancelLabel?: string;
      confirmText?: string; // For backward compatibility
      cancelText?: string;  // For backward compatibility
      isDanger?: boolean;
      variant?: 'default' | 'mystic' | 'danger' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
      isOpen,
      onClose,
      onConfirm,
      title,
      message,
      confirmLabel,
      cancelLabel,
      confirmText,
      cancelText,
      isDanger = false,
      variant = 'default'
}) => {
      const [mounted, setMounted] = useState(false);

      useEffect(() => {
            setMounted(true);
            return () => setMounted(false);
      }, []);

      if (!isOpen || !mounted) return null;

      // Determine final labels
      const finalConfirmLabel = confirmLabel || confirmText || '확인';
      const finalCancelLabel = cancelLabel || cancelText || '취소';

      // Determine styling modes
      const isMystic = variant === 'mystic';
      const isWarning = variant === 'warning';
      const effectDanger = isDanger || variant === 'danger';

      // Determine color theme
      let colorClass = 'blue';
      if (effectDanger) colorClass = 'red';
      else if (isMystic || isWarning) colorClass = 'amber';

      return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 overflow-hidden font-sans">
                  {/* Backdrop */}
                  <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={onClose}
                  />

                  {/* Modal Content */}
                  <div className={classNames(
                        "relative w-full max-w-sm backdrop-blur-2xl p-8 border shadow-2xl animate-fade-in-up transition-all",
                        isMystic
                              ? "bg-white/90 dark:bg-slate-900/90 rounded-[2.5rem] border-white/20 dark:border-white/10"
                              : "bg-white dark:bg-gray-900 rounded-3xl border-gray-200 dark:border-gray-800"
                  )}>
                        <div className="text-center mb-8">
                              <div className={classNames(
                                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ring-4",
                                    colorClass === 'red'
                                          ? "bg-red-100 dark:bg-red-900/30 text-red-600 ring-red-500/10"
                                          : colorClass === 'amber'
                                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 ring-amber-500/10"
                                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 ring-blue-500/10"
                              )}>
                                    <i className={classNames(
                                          "fas text-2xl",
                                          colorClass === 'red' ? "fa-exclamation-triangle" : "fa-question"
                                    )}></i>
                              </div>
                              <h2 className={classNames(
                                    "text-2xl font-bold mb-2",
                                    isMystic ? "font-serif italic text-slate-800 dark:text-white" : "text-gray-900 dark:text-white"
                              )}>
                                    {title}
                              </h2>
                              <p className={classNames(
                                    "text-sm leading-relaxed",
                                    isMystic ? "text-slate-500 dark:text-slate-400" : "text-gray-500 dark:text-gray-400"
                              )}>
                                    {message}
                              </p>
                        </div>

                        <div className="flex gap-3">
                              <button
                                    onClick={onClose}
                                    className={classNames(
                                          "flex-1 py-4 font-bold border transition-all active:scale-95",
                                          isMystic
                                                ? "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
                                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    )}
                              >
                                    {finalCancelLabel}
                              </button>
                              <button
                                    onClick={() => {
                                          onConfirm();
                                          onClose();
                                    }}
                                    className={classNames(
                                          "flex-1 py-4 font-bold transition-all shadow-lg active:scale-95 text-white",
                                          isMystic ? "rounded-2xl" : "rounded-xl",
                                          colorClass === 'red'
                                                ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                                                : colorClass === 'amber'
                                                      ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20"
                                                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                                    )}
                              >
                                    {finalConfirmLabel}
                              </button>
                        </div>

                        {/* Decorative corner elements - Only for Mystic */}
                        {isMystic && (
                              <>
                                    <div className={classNames(
                                          "absolute -bottom-12 -right-12 w-32 h-32 blur-3xl rounded-full -z-10",
                                          colorClass === 'red' ? "bg-red-500/10" : "bg-amber-500/10"
                                    )} />
                                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 blur-3xl rounded-full -z-10" />
                              </>
                        )}
                  </div>
            </div>,
            document.body
      );
};

export default ConfirmModal;
