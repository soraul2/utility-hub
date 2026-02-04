import React, { useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { toPng } from 'html-to-image';
import { GlassInput } from '../../ui/GlassInput';
import { GlassButton } from '../../ui/GlassButton';
import { TalismanCard, type TalismanTheme } from './TalismanCard';
import { useTheme } from '../../../context/ThemeContext';

interface TalismanModalProps {
      isOpen: boolean;
      onClose: () => void;
      userName: string;
      initialKeyword: string;
      assistantType?: TalismanTheme;
      cardImageUrl?: string;
}

const TalismanModal: React.FC<TalismanModalProps> = ({
      isOpen,
      onClose,
      userName,
      initialKeyword,
      assistantType = 'MYSTIC',
      cardImageUrl
}) => {
      const [step, setStep] = useState<'INPUT' | 'PREVIEW'>('INPUT');
      const [wish, setWish] = useState('');
      const [generatedImage, setGeneratedImage] = useState<string | null>(null);
      const [isGenerating, setIsGenerating] = useState(false);
      const { theme } = useTheme();
      const isDark = theme === 'dark';

      // Hidden Ref for Generation (High Resolution)
      const captureRef = useRef<HTMLDivElement>(null);

      const handleGenerate = useCallback(async () => {
            if (!wish.trim()) return;
            setIsGenerating(true);

            // Give React time to render the hidden component if it wasn't rendered
            setTimeout(async () => {
                  if (captureRef.current) {
                        try {
                              // toPng options for better quality
                              const dataUrl = await toPng(captureRef.current, {
                                    cacheBust: true,
                                    pixelRatio: 2,
                                    quality: 1.0,
                                    skipAutoScale: true
                              });
                              setGeneratedImage(dataUrl);
                              setStep('PREVIEW');
                        } catch (err) {
                              console.error('Talisman generation failed', err);
                              alert('부적 생성에 실패했습니다. 다시 시도해주세요.');
                        } finally {
                              setIsGenerating(false);
                        }
                  } else {
                        console.error('Capture ref is null');
                        setIsGenerating(false);
                  }
            }, 100);
      }, [wish]);

      const handleReset = () => {
            setStep('INPUT');
            setGeneratedImage(null);
      };

      if (!isOpen) return null;

      return createPortal(
            <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 font-sans">
                  <div className={classNames(
                        "absolute inset-0 backdrop-blur-md animate-fade-in",
                        isDark ? "bg-black/80" : "bg-white/40"
                  )} onClick={onClose} />

                  <div className={classNames(
                        "relative z-10 w-full max-w-md border rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up",
                        isDark
                              ? "bg-slate-900/90 border-amber-500/30 text-white"
                              : "bg-white/90 border-amber-500/20 text-slate-900"
                  )}>

                        {/* Header */}
                        <div className={classNames("p-6 text-center border-b relative", isDark ? "border-white/10" : "border-slate-200")}>
                              <button onClick={onClose} className={classNames("absolute top-6 right-6 transition-colors", isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}>
                                    <i className="fas fa-times"></i>
                              </button>
                              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 font-chakra">
                                    {step === 'INPUT' ? '부적 제작소' : '운명 봉인 완료'}
                              </h2>
                              <p className={classNames("text-sm mt-1", isDark ? "text-slate-400" : "text-slate-500")}>
                                    {step === 'INPUT' ? '이루고 싶은 간절한 소망을 담으세요' : '당신의 염원이 부적에 담겼습니다'}
                              </p>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col items-center">

                              {step === 'INPUT' ? (
                                    <>
                                          {/* Preview Card (Visual Only) */}
                                          <div className="mb-6 relative w-[240px] h-[400px] flex items-center justify-center bg-black/20 rounded-2xl overflow-hidden border border-white/5">
                                                <div className="transform scale-[0.6] origin-center shadow-2xl">
                                                      <TalismanCard
                                                            userName={userName}
                                                            wishText={wish || "소원 성취"}
                                                            tarotKeyword={initialKeyword}
                                                            assistantType={assistantType}
                                                            cardImageUrl={cardImageUrl}
                                                            scale={1}
                                                      />
                                                </div>
                                          </div>

                                          <div className="w-full space-y-4">
                                                <GlassInput
                                                      placeholder="예) 이번 시험 합격, 가족 건강"
                                                      value={wish}
                                                      onChange={(e) => setWish(e.target.value)}
                                                      className={classNames(
                                                            "text-center",
                                                            isDark ? "placeholder:text-slate-600" : "placeholder:text-slate-400"
                                                      )}
                                                      maxLength={10}
                                                />
                                                <p className={classNames("text-xs text-center", isDark ? "text-slate-500" : "text-slate-600")}>
                                                      * 짧고 명확할수록 효험이 좋습니다 (최대 10자)
                                                </p>

                                                <GlassButton
                                                      onClick={handleGenerate}
                                                      disabled={!wish.trim() || isGenerating}
                                                      className={classNames(
                                                            "w-full py-4 text-lg font-bold text-white shadow-lg transition-all",
                                                            "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 hover:scale-[1.02]",
                                                            isDark ? "shadow-amber-900/40" : "shadow-amber-500/20"
                                                      )}
                                                >
                                                      {isGenerating ? (
                                                            <span className="flex items-center justify-center gap-2">
                                                                  <i className="fas fa-circle-notch animate-spin"></i> 기운을 모으는 중...
                                                            </span>
                                                      ) : '부적 완성하기'}
                                                </GlassButton>
                                          </div>

                                          {/* Actual Generation Element - Fixed off-screen but properly rendered */}
                                          <div
                                                className="fixed top-0 left-0 pointer-events-none"
                                                style={{ left: '-9999px' }}
                                                aria-hidden="true"
                                          >
                                                <div ref={captureRef}>
                                                      <TalismanCard
                                                            userName={userName}
                                                            wishText={wish}
                                                            tarotKeyword={initialKeyword}
                                                            assistantType={assistantType}
                                                            cardImageUrl={cardImageUrl}
                                                            scale={2} // Generate at 2x scale (720x1280)
                                                      />
                                                </div>
                                          </div>
                                    </>
                              ) : (
                                    <>
                                          {/* Result View */}
                                          {generatedImage && (
                                                <div className="relative group mb-6 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                                                      <img src={generatedImage} alt="My Talisman" className="w-[280px] h-auto rounded-xl" />
                                                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                                                            <p className="text-white font-bold mb-2 text-sm">이미지를 길게 눌러 저장하세요</p>
                                                            <i className="fas fa-download text-3xl text-amber-400 animate-bounce"></i>
                                                      </div>
                                                </div>
                                          )}

                                          <div className="w-full space-y-3">
                                                <p className={classNames("text-center text-sm mb-4 animate-pulse", isDark ? "text-amber-200/60" : "text-amber-700/80")}>
                                                      ✨ 이미지를 길게 눌러(모바일) 저장하세요 ✨
                                                </p>

                                                <div className="grid grid-cols-2 gap-3">
                                                      <button
                                                            onClick={handleReset}
                                                            className={classNames(
                                                                  "py-3 rounded-xl transition-all font-bold text-sm",
                                                                  isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                            )}
                                                      >
                                                            다시 만들기
                                                      </button>
                                                      <button
                                                            onClick={onClose}
                                                            className={classNames(
                                                                  "py-3 rounded-xl transition-all font-bold text-sm border",
                                                                  isDark
                                                                        ? "bg-amber-600/20 text-amber-400 border-amber-500/30 hover:bg-amber-600/30"
                                                                        : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                                                            )}
                                                      >
                                                            닫기
                                                      </button>
                                                </div>
                                          </div>
                                    </>
                              )}

                        </div>
                  </div>
            </div>,
            document.body
      );
};

export default TalismanModal;
