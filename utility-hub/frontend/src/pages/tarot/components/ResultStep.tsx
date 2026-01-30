import React, { useState, useEffect, useCallback } from 'react';
import TarotCardView from '../../../components/tarot/TarotCardView';
import MarkdownViewer from '../../../components/common/MarkdownViewer';
import type { ThreeCardResponse, TarotAssistantType } from '../../../lib/tarot';
import type { AssistantInfo } from '../../../lib/tarot-assistants';

interface ResultStepProps {
  data: ThreeCardResponse | null;
  selectedLeader: TarotAssistantType | null;
  assistants: AssistantInfo[];
  onReset: () => void;
}

const ResultStep: React.FC<ResultStepProps> = ({
  data,
  selectedLeader,
  assistants,
  onReset,
}) => {
  const [revealedCards, setRevealedCards] = useState<boolean[]>([false, false, false]);
  const [showResultRevealModal, setShowResultRevealModal] = useState(false);
  const [isResultUnlocked, setIsResultUnlocked] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [flippingIndex, setFlippingIndex] = useState<number | null>(null);

  const handleOpenResult = useCallback(() => {
    setIsOpening(true);
    setTimeout(() => {
      setShowResultRevealModal(false);
      setIsResultUnlocked(true);
    }, 800);
  }, []);

  useEffect(() => {
    if (revealedCards.every(Boolean) && !isResultUnlocked) {
      const timer = setTimeout(() => {
        setShowResultRevealModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [revealedCards, isResultUnlocked]);

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-fade-in py-10">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <button onClick={onReset} className="group flex items-center gap-2 text-amber-500/60 hover:text-amber-400">
          <i className="fas fa-arrow-left text-xs"></i>
          <span className="text-xs font-chakra tracking-[0.2em] uppercase">돌아가기</span>
        </button>
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold italic text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 tracking-[0.1em] drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse-slow">
            운명의 계시
          </h2>
          {selectedLeader ? (
            <p className="text-sm font-chakra text-white/50 mt-2 uppercase tracking-widest">
              Reading by <span className={selectedLeader === 'FORTUNA' ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                {assistants.find(a => a.type === selectedLeader)?.name || 'Unknown'}
              </span>
            </p>
          ) : (
            <p className="text-sm font-chakra text-white/50 mt-2 uppercase tracking-widest">
              Reading by <span className="text-amber-500 font-bold">Mystic</span>
            </p>
          )}
        </div>
        <div className="w-8" />
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
        {/* Completion Effect */}
        {revealedCards.every(Boolean) && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] pointer-events-none -z-10 transition-opacity duration-1000 animate-fade-in">
            <div className="absolute inset-0 bg-amber-500/10 blur-[80px] rounded-full animate-pulse-slow" />
            <div className="absolute inset-0 bg-gradient-radial from-amber-200/10 via-transparent to-transparent opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-amber-500/10 rounded-full animate-[spin_20s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-amber-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          </div>
        )}

        {data.cards.map((card, index) => {
          const isRevealed = revealedCards[index];
          return (
            <div key={index} className="flex flex-col items-center">
              {/* Timeline Info */}
              <div className="text-center relative z-10 flex items-center justify-center mb-4">
                <span className={`font-chakra font-bold uppercase tracking-[0.4em] transition-all duration-700 ${isRevealed
                  ? 'text-xs md:text-sm text-amber-500/80 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  : 'text-xl md:text-2xl text-amber-500/60 font-serif italic drop-shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse'
                  }`}>
                  {index === 0 ? '지나온 시간' : index === 1 ? '마주한 현실' : '다가올 운명'}
                </span>
              </div>
              <div className="relative w-full aspect-[2/3] max-w-[280px] perspective-1000 cursor-pointer"
                onClick={() => {
                  if (!isRevealed && flippingIndex === null) {
                    setFlippingIndex(index);
                    setTimeout(() => {
                      const newRevealed = [...revealedCards];
                      newRevealed[index] = true;
                      setRevealedCards(newRevealed);
                      setFlippingIndex(null);
                    }, 1000);
                  }
                }}>
                <div className={`relative w-full h-full duration-1000 transition-all [transform-style:preserve-3d] ${isRevealed ? '[transform:rotateY(180deg)]' : ''}`}>
                  <div className="absolute inset-0 [backface-visibility:hidden]">
                    <TarotCardView isFaceDown={true} className={`w-full h-full shadow-2xl transition-all ${flippingIndex === index ? 'scale-105 blur-sm' : ''}`} />
                    {flippingIndex === index && (
                      <div className="absolute inset-0 flex items-center justify-center z-30 animate-pulse">
                        <p className="text-amber-500 font-chakra font-bold">나의 운명은...?</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <TarotCardView card={card.cardInfo} isReversed={card.isReversed} className="w-full h-full shadow-2xl" showName={false} />
                  </div>
                </div>
              </div>
              <div className="mt-20 text-center relative z-10 w-full max-w-[280px]">
                {isRevealed && (
                  <div className="animate-fade-in-up flex flex-col items-center space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-3xl font-serif text-amber-400 drop-shadow-md tracking-tight leading-tight">
                        {card.cardInfo.nameEn}
                      </h3>
                      <p className="text-sm font-chakra text-slate-400 font-medium tracking-wide">
                        {card.cardInfo.nameKo}
                      </p>
                    </div>

                    <div className="relative group/keyword">
                      <div className="absolute inset-0 bg-amber-500/5 blur-xl rounded-full opacity-0 group-hover/keyword:opacity-100 transition-opacity" />
                      <p className="relative z-10 text-xs md:text-sm text-amber-200/60 italic font-light max-w-[220px] leading-relaxed break-keep px-4 mx-auto">
                        "{card.cardInfo.keywords}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll Hint */}
      {showResultRevealModal && !isResultUnlocked && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 text-center pointer-events-none animate-fade-in transition-opacity duration-500" style={{ animationDelay: '0.5s' }}>
          <p className="text-[10px] text-amber-200/50 uppercase tracking-[0.2em] mb-2 animate-pulse">운명이 도착했습니다</p>
          <i className="fas fa-chevron-down text-amber-500 text-xl animate-bounce"></i>
        </div>
      )}

      {/* Destiny Envelope Section */}
      {showResultRevealModal && !isResultUnlocked && (
        <div className="relative w-full text-center py-20 md:py-32 animate-fade-in">
          <style>
            {`
              @keyframes gatherGold {
                0% { transform: scale(3); filter: blur(20px); opacity: 0; }
                50% { opacity: 0.5; }
                100% { transform: scale(1); filter: blur(0); opacity: 1; }
              }
              .animate-gather-gold {
                animation: gatherGold 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
              }
            `}
          </style>

          <div className={`relative max-w-xl mx-auto cursor-pointer group transition-all duration-1000 ${isOpening ? 'opacity-0 scale-95 pointer-events-none' : 'animate-gather-gold'}`} onClick={handleOpenResult}>
            {/* Particle Focus Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
              <div className="absolute inset-0 bg-amber-500/10 blur-[60px] rounded-full animate-pulse-slow" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent blur-sm" />
              <div className="absolute top-1/2 left-0 -translate-y-1/2 h-1 w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent blur-sm" />
            </div>

            {/* Envelope Asset */}
            <div className="relative w-56 md:w-64 mx-auto mb-8 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
              <img
                src="/assets/tarot/envelope.png"
                alt="Destiny Envelope"
                className="w-full h-auto filter drop-shadow-[0_0_30px_rgba(251,191,36,0.2)] brightness-110"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-amber-400/30 blur-[30px] rounded-full animate-pulse" />
            </div>

            <div className="space-y-3 relative z-10">
              <h3 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 italic drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                운명의 메시지 개봉
              </h3>
              <p className="text-white/40 text-[10px] md:text-xs font-chakra tracking-[0.3em] uppercase group-hover:text-amber-400/80 transition-colors">
                Click to reveal your destiny
              </p>
            </div>

            <div className="mt-8 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
              <span className="px-6 py-2 rounded-full border border-amber-500/30 text-amber-300 text-[10px] tracking-widest uppercase bg-amber-950/30">
                봉인 해제
              </span>
            </div>
          </div>
        </div>
      )}

      {isResultUnlocked && (
        <div className="max-w-4xl mx-auto mt-12 animate-fade-in-up">
          <div className="mystic-panel">
            <h3 className="text-center text-amber-500 font-chakra font-bold uppercase tracking-[0.3em] mb-12">운명의 조언</h3>
            <div className="prose-mystic">
              <MarkdownViewer content={data.aiReading || ''} />
            </div>

            <div className="mt-12 flex justify-center">
              <button onClick={onReset} className="px-8 py-3 bg-amber-500 text-black font-bold font-chakra uppercase text-xs tracking-widest rounded transition-transform hover:scale-105 shadow-[0_0_15px_rgba(245,158,11,0.4)]">새로운 카드 뽑기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultStep;
