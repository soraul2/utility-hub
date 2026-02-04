import React, { useState, useRef, useEffect, useCallback } from 'react';
import TarotCardView from '../../../components/tarot/TarotCardView';
import ParticleEffect from '../../../components/effects/ParticleEffect';
import { useDragScroll } from '../../../hooks/useDragScroll';
import { DAILY_CARD_COUNT } from '../../../lib/constants/tarot';

interface DailyCardSelectionViewProps {
  selectedCardIndex: number | null;
  onCardSelect: (index: number) => void;
  onCardDeselect: () => void;
  onConfirm: () => void;
  showConfirmModal: boolean;
  setShowConfirmModal: (value: boolean) => void;
  onFinalConfirm: () => void;
}

const DailyCardSelectionView: React.FC<DailyCardSelectionViewProps> = ({
  selectedCardIndex,
  onCardSelect,
  onCardDeselect,
  onConfirm,
  showConfirmModal,
  setShowConfirmModal,
  onFinalConfirm,
}) => {
  const [isDealing, setIsDealing] = useState(true);
  const { sliderRef, isDragging, handlers } = useDragScroll(2);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const isDragScrollRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsDealing(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isDealing && sliderRef.current) {
      const scrollWidth = sliderRef.current.scrollWidth;
      const clientWidth = sliderRef.current.clientWidth;
      sliderRef.current.scrollTo({ left: (scrollWidth - clientWidth) / 2, behavior: 'smooth' });
    }
  }, [isDealing]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const progress = target.scrollLeft / (target.scrollWidth - target.clientWidth);
      target.parentElement?.parentElement?.style.setProperty('--scroll-progress', `${progress * 100}%`);
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragScrollRef.current = false;
    dragStartPosRef.current = { x: e.pageX, y: e.pageY };
    handlers.onMouseDown(e);
  }, [handlers]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && !isDragScrollRef.current) {
      const moveX = Math.abs(e.pageX - dragStartPosRef.current.x);
      const moveY = Math.abs(e.pageY - dragStartPosRef.current.y);
      if (moveX > 5 || moveY > 5) {
        isDragScrollRef.current = true;
      }
    }
    handlers.onMouseMove(e);
  }, [isDragging, handlers]);

  return (
    <>
      <ParticleEffect count={20} className="bg-particles hidden md:block" />

      <div className="relative z-10 flex flex-col items-center justify-start min-h-[80vh] space-y-2 pt-0 pb-4 px-4 animate-fade-in-up">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold font-chakra tracking-tighter drop-shadow-sm py-2 leading-relaxed">
              {selectedCardIndex !== null
                ? <span className="gold-foil-text font-serif italic text-amber-600 dark:text-amber-500">운명의 문이 열렸습니다</span>
                : <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-purple-200 dark:via-blue-100 dark:to-purple-200 transition-all">오늘의 카드</span>
              }
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium tracking-widest uppercase text-xs md:text-sm transition-colors">
              10장의 카드 중 당신의 운명을 선택하세요
            </p>
          </div>
          {selectedCardIndex !== null && (
            <p className="text-amber-600 dark:text-amber-400 font-bold text-sm tracking-[0.2em] uppercase font-chakra drop-shadow-[0_0_10px_rgba(217,119,6,0.3)] px-4 animate-fade-in transition-colors">
              선택된 카드를 누르면 취소됩니다
            </p>
          )}
          {selectedCardIndex === null && (
            <p className="text-slate-600 dark:text-purple-200/70 text-base md:text-lg font-light max-w-2xl mx-auto animate-fade-in px-4 leading-relaxed transition-colors" style={{ animationDelay: '0.2s' }}>
              복잡한 생각은 잠시 내려놓고, 지금 이 순간 가장 마음이 가는 카드를 선택하세요.
            </p>
          )}
        </div>

        <div className={`w-full max-w-6xl flex flex-col items-center justify-center relative gap-6 transition-all duration-700 -mt-16`}>
          {/* Destiny Slot */}
          <div className="w-32 h-48 md:w-52 md:h-80 relative group perspective-1000">
            <div className={`absolute inset-0 rounded-xl border-2 border-dashed border-amber-500/20 flex flex-col items-center justify-center transition-all duration-500 ${selectedCardIndex !== null ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <span className="text-amber-500/30 text-5xl mb-4 font-light">+</span>
              <span className="text-amber-500/40 text-[10px] tracking-[0.3em] uppercase font-chakra">Daily Destiny</span>
            </div>

            {selectedCardIndex !== null && (
              <div
                className="absolute inset-0 animate-slam-in z-20 cursor-pointer group/slotted touch-manipulation transition-transform duration-75 active:scale-90"
                onClick={onCardDeselect}
              >
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[70%] h-4 bg-black/40 blur-md rounded-full" />
                <TarotCardView isFaceDown={true} className="w-full h-full shadow-[0_0_50px_rgba(217,119,6,0.3)] rounded-xl border border-amber-500/30 transition-transform group-hover/slotted:scale-[1.02]" />
              </div>
            )}
          </div>

          {/* Confirm Button */}
          {selectedCardIndex !== null && (
            <div className="flex justify-center pb-12 pt-8 animate-float-up-glow">
              <button onClick={onConfirm} className="group relative px-20 py-5 overflow-hidden transition-all active:scale-95 shadow-[0_0_40px_rgba(217,119,6,0.4)] rounded-full">
                <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700" />
                <div className="absolute inset-1 border border-amber-400/30 rounded-full z-10" />
                <div className="absolute inset-2 border border-white/10 rounded-full z-10" />
                <span className="relative z-20 text-white font-serif italic text-lg tracking-[0.4em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  운명 확인하기
                </span>
                <div className="absolute inset-0 bg-amber-500/20 blur-md group-hover:bg-amber-500/40 transition-all duration-500" />
              </button>
            </div>
          )}

          {/* Interactive Deck */}
          <div className="relative w-full mt-0 md:mt-8">
            <div className="absolute top-[40%] left-1 md:left-4 -translate-y-1/2 z-30 text-xs md:text-sm text-amber-300 font-bold font-chakra animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-none">
              <i className="fas fa-chevron-left mr-1 md:mr-2"></i> LEFT
            </div>
            <div className="absolute top-[40%] right-1 md:right-4 -translate-y-1/2 z-30 text-xs md:text-sm text-amber-300 font-bold font-chakra animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-none">
              RIGHT <i className="fas fa-chevron-right ml-1 md:ml-2"></i>
            </div>

            <div
              ref={sliderRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handlers.onMouseLeave}
              onMouseUp={handlers.onMouseUp}
              onMouseMove={handleMouseMove}
              onScroll={handleScroll}
              className="w-full overflow-x-auto scrollbar-none pt-20 pb-24 md:py-32 px-0 cursor-grab active:cursor-grabbing select-none mask-linear-both touch-pan-x flex items-center justify-start relative z-10 transform-gpu perspective-1000"
            >
              <div className="flex items-end justify-center px-[50vw] md:px-[calc(50vw-9rem)] relative min-w-max pb-4 md:pb-12">
                {[...Array(DAILY_CARD_COUNT)].map((_, index) => {
                  const isSelected = selectedCardIndex === index;
                  const isSelectionActive = selectedCardIndex !== null;

                  return (
                    <div
                      key={index}
                      data-card-index={index}
                      className={`relative group will-change-transform flex-shrink-0 animate-float
                      ${isSelectionActive && !isSelected ? 'opacity-50 blur-sm grayscale pointer-events-none' : 'opacity-100'}
                      ${isSelected ? 'opacity-0 scale-0 pointer-events-none' : ''}
                      w-24 h-40 md:w-36 md:h-64 -ml-2 md:-ml-12 first:ml-0
                      hover:!z-50 active:scale-95 active:brightness-90 z-10
                    `}
                      onClick={() => !isDragging && onCardSelect(index)}
                      style={{
                        zIndex: isSelectionActive ? 0 : 10 - Math.abs(index - 4.5),
                        transform: isDealing ? `rotate(0deg) translateY(100px) scale(0)` : `rotate(0deg) translateY(0px)`,
                        transition: isDealing ? 'transform 1000ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 300ms cubic-bezier(0.25, 0.8, 0.25, 1), opacity 300ms ease',
                        animationDelay: `${index * 0.2}s`
                      }}
                    >
                      <div className="w-full h-full transition-all duration-300 ease-out transform-gpu group-hover:scale-105 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#1a1a2e] dark:to-[#0d0d15] rounded-xl"
                      >
                        <TarotCardView isFaceDown={true} className="w-full h-full shadow-2xl rounded-xl border border-amber-500/20 group-hover:border-amber-400 group-hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-all duration-300" />
                      </div>

                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-white/20 font-chakra opacity-0 group-hover:opacity-100 transition-opacity">
                        {index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-64 h-[1px] bg-white/5 rounded-full mx-auto relative -mt-4 md:mt-4 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-transparent via-amber-500 to-transparent w-full transition-transform duration-100 ease-out"
                style={{ transform: 'translateX(calc(-100% + var(--scroll-progress, 50%)))' }}
              />
            </div>

            <div className="mt-1 text-[10px] text-amber-500/20 font-chakra tracking-[0.3em] uppercase animate-pulse">
              Scroll to Explore
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setShowConfirmModal(false)}
          />

          <div className="relative w-full max-w-lg bg-white/95 dark:bg-[#0d0d15]/90 border border-amber-500/30 rounded-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(217,119,6,0.2)] animate-scale-in overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

            <div className="relative z-10 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-chakra text-amber-600 dark:text-amber-100 tracking-[0.2em] font-bold uppercase transition-colors">
                  선택을 확정하시겠습니까?
                </h2>
                <div className="w-16 h-[1px] bg-amber-500/50 mx-auto" />
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg font-light leading-relaxed break-keep transition-colors">
                "우연처럼 보이지만, 당신의 무의식이 이 카드를 선택했습니다.<br />
                마음의 흔들림이 없다면 결과를 확인하세요."
              </p>

              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-4 rounded-xl border border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all font-chakra text-sm uppercase tracking-widest font-bold"
                >
                  아직 고민 중입니다
                </button>
                <button
                  onClick={onFinalConfirm}
                  className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-900 dark:to-amber-700 text-white font-chakra text-sm uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all animate-pulse-slow"
                >
                  네, 확인하겠습니다
                </button>
              </div>
            </div>

            <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-amber-500/20" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-amber-500/20" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-amber-500/20" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-amber-500/20" />
          </div>
        </div>
      )}
    </>
  );
};

export default DailyCardSelectionView;
