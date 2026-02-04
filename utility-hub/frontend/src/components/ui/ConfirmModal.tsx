import React from 'react';

interface ConfirmModalProps {
      isOpen: boolean;
      onClose: () => void;
      onConfirm: () => void;
      title: string;
      message: string;
      confirmLabel?: string;
      cancelLabel?: string;
      isDanger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
      isOpen,
      onClose,
      onConfirm,
      title,
      message,
      confirmLabel = '확인',
      cancelLabel = '취소',
      isDanger = false
}) => {
      if (!isOpen) return null;

      return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                  {/* Backdrop */}
                  <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={onClose}
                  />

                  {/* Modal Content */}
                  <div className="relative w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-2xl animate-fade-in-up">
                        <div className="text-center mb-8">
                              <div className={`w-16 h-16 ${isDanger ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'} rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ${isDanger ? 'ring-red-500/10' : 'ring-amber-500/10'}`}>
                                    <i className={`fas ${isDanger ? 'fa-exclamation-triangle' : 'fa-question'} text-2xl`}></i>
                              </div>
                              <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mb-2 italic">{title}</h2>
                              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
                        </div>

                        <div className="flex gap-3">
                              <button
                                    onClick={onClose}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                              >
                                    {cancelLabel}
                              </button>
                              <button
                                    onClick={() => {
                                          onConfirm();
                                          onClose();
                                    }}
                                    className={`flex-1 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 text-white ${isDanger
                                                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                                                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                                          }`}
                              >
                                    {confirmLabel}
                              </button>
                        </div>

                        {/* Decorative corner elements */}
                        <div className={`absolute -bottom-12 -right-12 w-32 h-32 ${isDanger ? 'bg-red-500/10' : 'bg-amber-500/10'} blur-3xl rounded-full -z-10`} />
                        <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 blur-3xl rounded-full -z-10" />
                  </div>
            </div>
      );
};

export default ConfirmModal;
