import React, { useState } from 'react';

interface ShareModalProps {
      isOpen: boolean;
      onClose: () => void;
      shareUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareUrl }) => {
      const [copied, setCopied] = useState(false);

      if (!isOpen) return null;

      const handleCopy = () => {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
      };

      return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                  {/* Backdrop */}
                  <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={onClose}
                  />

                  {/* Modal Content */}
                  <div className="relative w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-2xl animate-fade-in-up">
                        <div className="absolute top-6 right-6">
                              <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                              >
                                    <i className="fas fa-times"></i>
                              </button>
                        </div>

                        <div className="text-center mb-8">
                              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600/80 dark:text-amber-400/80 ring-4 ring-amber-500/10">
                                    <i className="fas fa-link text-2xl"></i>
                              </div>
                              <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mb-2 italic">운명의 링크 공유</h2>
                              <p className="text-sm text-slate-500 dark:text-slate-400">당신의 운명을 다른 이들과 함께 나누어보세요.</p>
                        </div>

                        <div className="space-y-6">
                              <div className="relative group">
                                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="p-4 bg-slate-100/50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 font-mono text-xs text-slate-600 dark:text-slate-400 break-all leading-loose">
                                          {shareUrl}
                                    </div>
                              </div>

                              <div className="flex gap-3">
                                    <button
                                          onClick={handleCopy}
                                          className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${copied
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg active:scale-95'
                                                }`}
                                    >
                                          <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                                          {copied ? '복사 완료!' : '링크 복사하기'}
                                    </button>
                                    <button
                                          onClick={onClose}
                                          className="px-6 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                                    >
                                          닫기
                                    </button>
                              </div>
                        </div>

                        {/* Decorative corner element */}
                        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 blur-3xl rounded-full -z-10" />
                        <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 blur-3xl rounded-full -z-10" />
                  </div>
            </div>
      );
};

export default ShareModal;
