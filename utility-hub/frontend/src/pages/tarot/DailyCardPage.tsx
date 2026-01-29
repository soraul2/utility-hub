import React, { useState } from 'react';
import { useDailyCard } from '../../hooks/useDailyCard';
import TarotCardView from '../../components/tarot/TarotCardView';
import MarkdownViewer from '../../components/common/MarkdownViewer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';

const DailyCardPage: React.FC = () => {
      const { data, loading, error, loadDailyCard } = useDailyCard();
      const [step, setStep] = useState<'selection' | 'result'>('selection');
      const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
      const [showConfirmModal, setShowConfirmModal] = useState(false);

      // Drag Scrolling State
      const sliderRef = React.useRef<HTMLDivElement>(null);
      const [isDragging, setIsDragging] = useState(false);
      const [startX, setStartX] = useState(0);
      const [scrollLeft, setScrollLeft] = useState(0);

      const handleMouseDown = (e: React.MouseEvent) => {
            if (!sliderRef.current) return;
            setIsDragging(true);
            setStartX(e.pageX - sliderRef.current.offsetLeft);
            setScrollLeft(sliderRef.current.scrollLeft);
      };

      const handleMouseLeave = () => {
            setIsDragging(false);
      };

      const handleMouseUp = () => {
            setIsDragging(false);
      };

      const handleMouseMove = (e: React.MouseEvent) => {
            if (!isDragging || !sliderRef.current) return;
            e.preventDefault();
            const x = e.pageX - sliderRef.current.offsetLeft;
            const walk = (x - startX) * 2; // Drag multiplier speed
            sliderRef.current.scrollLeft = scrollLeft - walk;
      };

      const handleCardSelect = (index: number) => {
            if (loading || step === 'result' || selectedCardIndex !== null) return;
            setSelectedCardIndex(index);
      };

      const handleCardDeselect = () => {
            if (loading || step === 'result') return;
            setSelectedCardIndex(null);
      };

      const handleConfirm = () => {
            if (loading || selectedCardIndex === null) return;
            setShowConfirmModal(true);
      };

      const handleFinalConfirm = async () => {
            setShowConfirmModal(false);
            await loadDailyCard();
            setStep('result');
      };

      const handleRetry = () => {
            setStep('selection');
            setSelectedCardIndex(null);
      };

      if (loading) {
            return (
                  <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
                        <div className="mystic-bg" />
                        <div className="relative z-10 flex flex-col items-center">
                              {/* Reusing the Mystic Loading Animation from previous step but larger */}
                              <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                                    <div className="absolute inset-0 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                                    <div className="absolute inset-4 border-4 border-amber-200/20 border-b-amber-200 rounded-full animate-spin-reverse" />

                                    {/* Inner Rotating Runes */}
                                    <div className="absolute w-48 h-48 border border-purple-500/30 rounded-full animate-[spin_10s_linear_infinite]" />

                                    {/* Central Pulsating Orb/Card */}
                                    <div className="relative z-10 w-24 h-36 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-lg border border-purple-400/30 shadow-[0_0_50px_rgba(168,85,247,0.6)] animate-pulse flex items-center justify-center">
                                          <i className="fas fa-eye text-4xl text-purple-200/80 animate-bounce"></i>
                                    </div>
                              </div>
                              <LoadingSpinner message="Reading the stars..." />
                              <p className="mt-6 text-purple-200/50 text-xs font-light tracking-wider animate-pulse">
                                    "같은 질문을 반복하면 카드의 목소리가 흐려집니다."
                              </p>
                        </div>
                  </div>
            );
      }

      return (
            <div className="relative min-h-screen overflow-hidden">
                  {/* Mystic Background */}
                  <div className="mystic-bg" />

                  {/* Background Particles (Requirement: Polish) */}
                  <div className="bg-particles">
                        {[...Array(20)].map((_, i) => (
                              <div key={i} className="particle" style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    width: `${Math.random() * 3 + 1}px`,
                                    height: `${Math.random() * 3 + 1}px`,
                                    animationDuration: `${Math.random() * 10 + 10}s`,
                                    animationDelay: `${Math.random() * 5}s`
                              }} />
                        ))}
                  </div>

                  <div className="relative z-10 flex flex-col items-center justify-start min-h-[80vh] space-y-2 pt-0 pb-4 px-4 animate-fade-in-up">
                        <div className="text-center space-y-4">
                              <div className="space-y-2">
                                    <h1 className="text-4xl md:text-5xl font-bold font-chakra tracking-tighter drop-shadow-sm py-2 leading-relaxed">
                                          {selectedCardIndex !== null && step === 'selection'
                                                ? <span className="gold-foil-text font-serif italic">운명의 문이 열렸습니다</span>
                                                : <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-blue-100 to-purple-200">오늘의 카드</span>
                                          }
                                    </h1>
                                    <p className="text-slate-400 font-light tracking-widest uppercase text-xs md:text-sm">
                                          {step === 'result' ? '우주가 당신에게 전하는 메시지' : '7장의 카드 중 당신의 운명을 선택하세요'}
                                    </p>
                              </div>
                              {selectedCardIndex !== null && step === 'selection' && (
                                    <p className="text-amber-400 font-bold text-sm tracking-[0.2em] uppercase font-chakra drop-shadow-[0_0_10px_rgba(217,119,6,0.5)] px-4 animate-fade-in">
                                          선택된 카드를 누르면 취소됩니다
                                    </p>
                              )}
                              {step === 'selection' && selectedCardIndex === null && (
                                    <p className="text-purple-200/70 text-base md:text-lg font-light max-w-2xl mx-auto animate-fade-in px-4 leading-relaxed" style={{ animationDelay: '0.2s' }}>
                                          복잡한 생각은 잠시 내려놓고, 지금 이 순간 가장 마음이 가는 카드를 선택하세요.
                                    </p>
                              )}
                        </div>

                        {/* Error Banner */}
                        {error && (
                              <div className="w-full max-w-md animate-fade-in">
                                    <ErrorBanner message={error} onRetry={handleRetry} />
                              </div>
                        )}

                        <div className={`w-full max-w-6xl flex flex-col items-center justify-center relative gap-6 transition-all duration-700 ${step === 'selection' ? 'min-h-[400px] -mt-16' : '-mt-16'}`}>
                              {/* SELECTION STEP: Slot + Deck Display */}
                              {step === 'selection' ? (
                                    <>
                                          {/* Destiny Slot - Size unified with Deck Cards */}
                                          <div className="w-32 h-48 md:w-52 md:h-80 relative group perspective-1000">
                                                {/* Empty Slot Placeholder */}
                                                <div className={`absolute inset-0 rounded-xl border-2 border-dashed border-amber-500/20 flex flex-col items-center justify-center transition-all duration-500 ${selectedCardIndex !== null ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                                      <span className="text-amber-500/30 text-5xl mb-4 font-light">+</span>
                                                      <span className="text-amber-500/40 text-[10px] tracking-[0.3em] uppercase font-chakra">Daily Destiny</span>
                                                </div>

                                                {/* Slamming Card Animation */}
                                                {selectedCardIndex !== null && (
                                                      <div
                                                            className="absolute inset-0 animate-slam-in animate-levitate z-20 cursor-pointer group/slotted transition-transform"
                                                            onClick={handleCardDeselect}
                                                      >
                                                            {/* Levitation Shadow */}
                                                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[70%] h-4 bg-black/40 blur-xl rounded-full" />

                                                            <TarotCardView isFaceDown={true} className="w-full h-full shadow-[0_0_50px_rgba(217,119,6,0.3)] rounded-xl border border-amber-500/30 transition-transform group-hover/slotted:scale-[1.02]" />
                                                      </div>
                                                )}
                                          </div>

                                          {/* Confirm Button - Appears only after selection */}
                                          {selectedCardIndex !== null && (
                                                <div className="flex justify-center pb-12 pt-8 animate-float-up-glow">
                                                      <button onClick={handleConfirm} className="group relative px-20 py-5 overflow-hidden transition-all active:scale-95 shadow-[0_0_40px_rgba(217,119,6,0.4)] rounded-full">
                                                            <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700" />
                                                            <div className="absolute inset-1 border border-amber-400/30 rounded-full z-10" />
                                                            <div className="absolute inset-2 border border-white/10 rounded-full z-10" />
                                                            <span className="relative z-20 text-white font-serif italic text-lg tracking-[0.4em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                                                  운명 확인하기
                                                            </span>
                                                            <div className="absolute inset-0 bg-amber-500/20 blur-2xl group-hover:bg-amber-500/40 transition-all duration-500" />
                                                      </button>
                                                </div>
                                          )}

                                          {/* Interactive Deck (Bottom) - Fixed Aura Clipping with Masking */}
                                          <div
                                                ref={sliderRef}
                                                onMouseDown={handleMouseDown}
                                                onMouseLeave={handleMouseLeave}
                                                onMouseUp={handleMouseUp}
                                                onMouseMove={handleMouseMove}
                                                className="w-full overflow-x-auto scrollbar-none pb-24 pt-24 px-4 md:px-0 cursor-grab active:cursor-grabbing select-none mask-mystic mt-8"
                                          >
                                                <div className="group/deck flex items-center justify-start md:justify-center min-w-max md:min-w-full px-12 md:px-0 relative overflow-visible">
                                                      {[...Array(7)].map((_, index) => {
                                                            const isSelected = selectedCardIndex === index;
                                                            // Dramatic Fan Effect for Desktop
                                                            const rotation = (index - 3) * 6; // -18 to +18 degrees
                                                            const translateY = Math.abs(index - 3) * 12; // Curved arc height

                                                            return (
                                                                  <div
                                                                        key={index}
                                                                        className={`relative group transition-all duration-700
                                                                              ${selectedCardIndex !== null && !isSelected ? 'opacity-0 scale-50 blur-2xl pointer-events-none' : 'opacity-100'}
                                                                              ${isSelected ? 'opacity-0 scale-150 pointer-events-none' : ''}
                                                                              w-32 h-48 md:w-52 md:h-80 -ml-20 md:-ml-32 first:ml-0
                                                                        `}
                                                                        onClick={() => !isDragging && handleCardSelect(index)}
                                                                        style={{
                                                                              zIndex: 7 - index,
                                                                              transform: `rotate(${rotation}deg) translateY(${translateY}px)`
                                                                        }}
                                                                  >
                                                                        <div className="w-full h-full transition-all duration-500 ease-out transform-gpu animate-mystic-float group-hover/deck:opacity-40 group-hover/deck:scale-95 group-hover/deck:blur-sm group-hover/deck:grayscale hover:!opacity-100 hover:!scale-110 hover:!blur-0 hover:!grayscale-0 hover:!z-50 hover:-translate-y-20 hover:-rotate-0"
                                                                              style={{
                                                                                    animationDelay: `${index * 800}ms`,
                                                                                    background: 'linear-gradient(to bottom right, #1a1a2e, #0d0d15)',
                                                                              }}
                                                                        >
                                                                              <TarotCardView isFaceDown={true} className="w-full h-full shadow-2xl rounded-xl border border-amber-500/20" />

                                                                              {/* Intense Orbital Glow on Hover */}
                                                                              <div className="absolute -inset-16 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none">
                                                                                    <div className="absolute inset-0 bg-amber-600/30 blur-3xl animate-pulse" />
                                                                                    <div className="absolute inset-8 bg-amber-500/20 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                                                                              </div>
                                                                        </div>
                                                                  </div>
                                                            );
                                                      })}
                                                </div>
                                          </div>
                                    </>
                              ) : (
                                    /* RESULT STEP: Selected Card & Reading */
                                    <div className="w-full px-4 relative z-10">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-fade-in">
                                                {/* Card Display */}
                                                <div className="flex flex-col items-center justify-center order-1 md:order-1 perspective-1000">
                                                      {data?.card ? (
                                                            <>
                                                                  <div className="relative w-64 md:w-80 animate-flip-in perspective-1000 group">
                                                                        {/* Supercharged Aura & Particle Scattering */}
                                                                        <div className="absolute -inset-12 bg-purple-600/30 blur-[80px] rounded-full opacity-80 animate-pulse" />
                                                                        <div className="absolute -inset-16 bg-indigo-500/20 blur-[60px] rounded-full animate-ping opacity-40" style={{ animationDuration: '4s' }} />
                                                                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-transparent to-indigo-500/20 blur-xl rounded-full opacity-50" />

                                                                        {/* Scattering Mystic Particles - Increased Density */}
                                                                        {[...Array(24)].map((_, i) => (
                                                                              <div
                                                                                    key={i}
                                                                                    className="absolute w-1.5 h-1.5 bg-purple-300 rounded-full blur-[1px] shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-mystic-float pointer-events-none"
                                                                                    style={{
                                                                                          top: `${Math.random() * 120 - 10}%`,
                                                                                          left: `${Math.random() * 120 - 10}%`,
                                                                                          animationDelay: `${i * 0.1}s`,
                                                                                          animationDuration: `${3 + Math.random() * 4}s`,
                                                                                          opacity: 0.4 + Math.random() * 0.4
                                                                                    }}
                                                                              />
                                                                        ))}

                                                                        <TarotCardView
                                                                              card={data.card.cardInfo}
                                                                              isReversed={data.card.isReversed}
                                                                              position={data.card.position}
                                                                              className="relative z-10"
                                                                        />
                                                                  </div>

                                                                  <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                                                                        <button
                                                                              onClick={handleRetry}
                                                                              className="px-8 py-3 rounded-full border border-purple-500/30 text-purple-300 text-xs font-chakra tracking-widest hover:bg-purple-500/10 hover:border-purple-500 transition-all uppercase"
                                                                        >
                                                                              새로운 카드 뽑기
                                                                        </button>
                                                                  </div>
                                                            </>
                                                      ) : (
                                                            <div className="glass-card p-8 text-red-300 rounded-2xl border-red-500/30">
                                                                  데이터를 불러오지 못했습니다. 다시 시도해주세요.
                                                                  <button onClick={handleRetry} className="block mt-4 text-white underline">다시 시도</button>
                                                            </div>
                                                      )}
                                                </div>

                                                {/* Interpretation Text */}
                                                <div className="order-2 md:order-2 h-full flex flex-col justify-center">
                                                      {!loading && data && (
                                                            <div className="glass-card p-8 md:p-10 rounded-3xl border-purple-500/20 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                                                  <div className="mb-6 border-b border-purple-500/20 pb-4">
                                                                        <h2 className="text-3xl font-bold text-white mb-2 font-chakra">
                                                                              {data.card.cardInfo.nameKo}
                                                                        </h2>
                                                                        <div className="flex items-center gap-3 text-purple-300/60 text-sm font-light uppercase tracking-widest">
                                                                              <span>{data.card.cardInfo.nameEn}</span>
                                                                              <span className="w-1 h-1 rounded-full bg-purple-500/50" />
                                                                              <span>{data.card.isReversed ? 'Reversed' : 'Upright'}</span>
                                                                        </div>
                                                                  </div>

                                                                  <div className="prose-mystic max-h-[50vh] overflow-y-auto pr-4 mystic-scrollbar">
                                                                        <MarkdownViewer content={data.aiReading} />
                                                                  </div>
                                                            </div>
                                                      )}
                                                </div>
                                          </div>
                                    </div>
                              )}
                        </div>
                  </div>

                  {/* Mystic Confirmation Modal */}
                  {showConfirmModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                              {/* Backdrop */}
                              <div
                                    className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
                                    onClick={() => setShowConfirmModal(false)}
                              />

                              {/* Modal Content */}
                              <div className="relative w-full max-w-lg bg-[#0d0d15]/90 border border-amber-500/30 rounded-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(217,119,6,0.2)] animate-scale-in overflow-hidden">
                                    {/* Ornamental Background */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

                                    <div className="relative z-10 text-center space-y-8">
                                          <div className="space-y-4">
                                                <h2 className="text-2xl md:text-3xl font-chakra text-amber-100 tracking-[0.2em] font-bold uppercase">
                                                      선택을 확정하시겠습니까?
                                                </h2>
                                                <div className="w-16 h-[1px] bg-amber-500/50 mx-auto" />
                                          </div>

                                          <p className="text-slate-300 text-base md:text-lg font-light leading-relaxed break-keep">
                                                "우연처럼 보이지만, 당신의 무의식이 이 카드를 선택했습니다.<br />
                                                마음의 흔들림이 없다면 결과를 확인하세요."
                                          </p>

                                          <div className="flex flex-col md:flex-row gap-4 pt-4">
                                                <button
                                                      onClick={() => setShowConfirmModal(false)}
                                                      className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-chakra text-sm uppercase tracking-widest"
                                                >
                                                      아직 고민 중입니다
                                                </button>
                                                <button
                                                      onClick={handleFinalConfirm}
                                                      className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-900 to-amber-700 text-white font-chakra text-sm uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all animate-pulse-slow"
                                                >
                                                      네, 확인하겠습니다
                                                </button>
                                          </div>
                                    </div>

                                    {/* Decorative Patterns */}
                                    <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-amber-500/20" />
                                    <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-amber-500/20" />
                                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-amber-500/20" />
                                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-amber-500/20" />
                              </div>
                        </div>
                  )}
            </div>
      );
};

export default DailyCardPage;
