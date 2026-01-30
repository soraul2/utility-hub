import React, { useState, useRef } from 'react';
import TarotCardView from '../../../components/tarot/TarotCardView';

interface CardSelectionStepProps {
  selectedSlots: (number | null)[];
  onCardSelect: (index: number) => void;
  onCardDeselect: (slotIndex: number) => void;
  onConfirm: () => void;
  onBack: () => void;
  question: string;
  showConfirmModal: boolean;
  setShowConfirmModal: (value: boolean) => void;
  onConfirmProceed: () => void;
}

const CardSelectionStep: React.FC<CardSelectionStepProps> = ({
  selectedSlots,
  onCardSelect,
  onCardDeselect,
  onConfirm,
  onBack,
  question,
  showConfirmModal,
  setShowConfirmModal,
  onConfirmProceed,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
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
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="relative py-4 px-4 flex flex-col items-center">
      {/* Background Particles */}
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

      <div className="relative z-20 w-full max-w-6xl mx-auto flex justify-start mb-8">
        <button onClick={onBack} className="group flex items-center gap-2 text-amber-500/60 hover:text-amber-400">
          <i className="fas fa-arrow-left text-xs"></i>
          <span className="text-[10px] font-chakra tracking-[0.2em] uppercase font-bold">질문 수정하기</span>
        </button>
      </div>

      <div className="text-center space-y-4 mb-8">
        <h2 className="text-4xl md:text-5xl font-bold font-chakra tracking-tighter py-2 leading-relaxed drop-shadow-sm">
          {selectedSlots.filter(s => s !== null).length === 3
            ? <span className="gold-foil-text font-serif italic">모든 운명의 문이 열렸습니다</span>
            : <span className="text-white">당신의 운명을 선택하세요</span>
          }
        </h2>
        {(() => {
          const count = selectedSlots.filter(s => s !== null).length;
          if (count === 3) {
            return (
              <p className="text-amber-400 font-bold text-sm tracking-[0.2em] uppercase font-chakra drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]">
                선택된 카드를 누르면 취소됩니다
              </p>
            );
          }
          if (count > 0) {
            return (
              <p className="text-amber-200/80 text-sm tracking-[0.1em] font-chakra">
                선택된 카드를 눌러 취소할 수 있습니다 ({count} / 3)
              </p>
            );
          }
          return (
            <p className="text-amber-200/60 text-sm tracking-[0.2em] uppercase font-chakra">
              0 / 3 카드가 선택되었습니다
            </p>
          );
        })()}
      </div>

      <div className="grid grid-cols-3 gap-4 md:gap-8 mb-12 max-w-3xl w-full px-4 relative">
        {/* Background Magic Circle */}
        {!selectedSlots.includes(null) && (
          <div className="absolute top-1/2 left-1/2 w-[120%] aspect-square -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
            <div className="w-full h-full border-[1px] border-amber-500/20 rounded-full animate-magic-circle flex items-center justify-center">
              <div className="w-[80%] h-[80%] border-[1px] border-amber-500/10 rounded-full border-dashed" />
              <i className="fas fa-dharmachakra absolute text-[200px] md:text-[400px] text-amber-500/5 opacity-50"></i>
            </div>
          </div>
        )}

        {[0, 1, 2].map((slotIndex) => {
          const deckIndex = selectedSlots[slotIndex];
          const isFilled = deckIndex !== null;
          const isAllSelected = !selectedSlots.includes(null);

          return (
            <div key={slotIndex} className="aspect-[2/3] relative group perspective-1000 z-10">
              <div className={`absolute inset-0 rounded-xl border-2 border-dashed border-amber-500/20 flex flex-col items-center justify-center transition-all ${isFilled ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <span className="text-amber-500/30 text-3xl">+</span>
              </div>
              <div className={`absolute -bottom-8 left-0 right-0 text-center text-[10px] ${isFilled ? 'text-amber-400 font-bold' : 'text-amber-500/30'} font-chakra uppercase tracking-widest`}>
                {slotIndex === 0 ? '과거' : slotIndex === 1 ? '현재' : '미래'}
              </div>
              {isFilled && (
                <div className={`absolute inset-0 animate-slam-in cursor-pointer group/slot ${isAllSelected ? 'animate-golden-pulse animate-levitate' : ''}`} onClick={() => onCardDeselect(slotIndex)}>
                  {isAllSelected && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[70%] h-4 bg-black/40 blur-xl rounded-full" />
                  )}
                  <TarotCardView isFaceDown={true} className="w-full h-full shadow-[0_0_50px_rgba(217,119,6,0.3)] rounded-xl border border-amber-500/30 transition-transform group-hover/slot:scale-[1.02]" />
                  <div className="absolute top-1 right-1 md:top-2 md:right-2 w-6 h-6 md:w-7 md:h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border border-amber-500/20 z-30 opacity-0 group-hover/slot:opacity-100 transition-all duration-300 transform scale-75 group-hover/slot:scale-100">
                    <i className="fas fa-times text-[10px] md:text-xs text-amber-500/80"></i>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-6xl space-y-12 relative pt-12">
        {!selectedSlots.includes(null) ? (
          <div className="flex justify-center pb-24 animate-float-up-glow">
            <button onClick={onConfirm} className="group relative px-20 py-5 overflow-hidden transition-all active:scale-95 shadow-[0_0_40px_rgba(217,119,6,0.4)] rounded-full">
              <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700" />
              <div className="absolute inset-1 border border-amber-400/30 rounded-full z-10" />
              <div className="absolute inset-2 border border-white/10 rounded-full z-10" />

              <span className="relative z-20 text-white font-serif italic text-lg tracking-[0.4em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                운명 확인하기
              </span>

              <div className="absolute inset-0 bg-amber-500/20 blur-2xl group-hover:bg-amber-500/40 transition-all duration-500" />
            </button>
          </div>
        ) : (
          <div className="relative group/deck -mt-12">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex items-center gap-3 text-white/40 group-hover/deck:text-white/80 transition-all pointer-events-none animate-pulse">
              <i className="fas fa-chevron-left text-sm md:text-xl text-amber-500"></i>
              <span className="text-[10px] font-chakra uppercase tracking-widest hidden md:block font-bold">LEFT</span>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex items-center gap-3 text-white/40 group-hover/deck:text-white/80 transition-all pointer-events-none animate-pulse">
              <span className="text-[10px] font-chakra uppercase tracking-widest hidden md:block font-bold">RIGHT</span>
              <i className="fas fa-chevron-right text-sm md:text-xl text-amber-500"></i>
            </div>

            <div ref={sliderRef} onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
              className="flex items-center justify-start overflow-x-auto pt-12 pb-20 md:pt-24 md:pb-24 w-full gold-scrollbar cursor-grab active:cursor-grabbing select-none mask-mystic pl-10 md:pl-0">
              <div className="flex items-center space-x-0 relative min-w-max px-32">
                {[...Array(22)].map((_, i) => {
                  const isSelected = selectedSlots.includes(i);
                  const rotation = (i - 10.5) * 3;
                  const translateY = Math.abs(i - 10.5) * 6;
                  return (
                    <button key={i} onClick={() => !isDragging && onCardSelect(i)}
                      className={`relative flex-shrink-0 w-28 h-44 md:w-44 md:h-64 transition-all duration-300 -ml-22 md:-ml-32 first:ml-0 ${isSelected ? 'opacity-0 scale-0' : 'group/deck-card'} hover:-translate-y-6 md:hover:-translate-y-10 hover:!z-[100] active:scale-105 active:-translate-y-6 active:!z-[100]`}
                      style={{ zIndex: isSelected ? 0 : 22 - i, transform: `rotate(${rotation}deg) translateY(${translateY}px)` }}>
                      <div className="w-full h-full animate-chrarak-in" style={{ animationDelay: `${i * 50}ms` }}>
                        <TarotCardView isFaceDown={true} className="w-full h-full shadow-2xl rounded-xl border border-amber-500/20" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowConfirmModal(false)} />
          <div className="relative w-full max-w-lg bg-[#0d0d15]/95 border border-amber-500/30 rounded-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(217,119,6,0.3)] animate-scale-in overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            <div className="relative z-10 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-chakra text-amber-100 tracking-[0.2em] font-bold uppercase">
                  운명의 서사 확인
                </h2>
                <div className="w-16 h-[1px] bg-amber-500/50 mx-auto" />
              </div>

              <div className="space-y-6">
                <div className="bg-amber-950/20 border border-amber-500/10 rounded-xl p-6 space-y-3">
                  <p className="text-amber-500/50 text-[10px] uppercase tracking-[0.3em] font-chakra">당신의 질문</p>
                  <p className="text-amber-100 text-lg md:text-xl font-serif italic leading-relaxed break-keep">
                    "{question}"
                  </p>
                </div>

                <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed break-keep">
                  "선택된 세 개의 카드가 당신의 질문에 답할 준비를 마쳤습니다.<br />
                  질문에 충분히 집중하셨나요? 마음이 확고하다면 진행하세요."
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-chakra text-sm uppercase tracking-widest"
                >
                  잠시 더 생각하기
                </button>
                <button
                  onClick={onConfirmProceed}
                  className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-900 to-amber-700 text-white font-chakra text-sm uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all animate-pulse-slow"
                >
                  운명의 리더 선택하기
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
    </div>
  );
};

export default CardSelectionStep;
