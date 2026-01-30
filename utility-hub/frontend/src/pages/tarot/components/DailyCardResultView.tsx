import React from 'react';
import TarotCardView from '../../../components/tarot/TarotCardView';
import MarkdownViewer from '../../../components/common/MarkdownViewer';
import type { DailyCardResponse } from '../../../lib/tarot';

interface DailyCardResultViewProps {
  data: DailyCardResponse | null;
  onRetry: () => void;
}

const DailyCardResultView: React.FC<DailyCardResultViewProps> = ({ data, onRetry }) => {
  if (!data?.card) {
    return (
      <div className="glass-card p-8 text-red-300 rounded-2xl border-red-500/30">
        데이터를 불러오지 못했습니다. 다시 시도해주세요.
        <button onClick={onRetry} className="block mt-4 text-white underline">다시 시도</button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 relative z-10 pb-20">
      <div className="flex flex-col gap-20 items-center animate-fade-in max-w-4xl mx-auto">
        {/* Card Display */}
        <div className="flex flex-col items-center justify-center perspective-1000 w-full">
          <div className="relative w-64 md:w-80 animate-flip-in perspective-1000 group">
            {/* Supercharged Aura & Particle Scattering */}
            <div className="absolute -inset-12 bg-purple-600/30 blur-[80px] rounded-full opacity-80 animate-pulse" />
            <div className="absolute -inset-16 bg-indigo-500/20 blur-[60px] rounded-full animate-ping opacity-40" style={{ animationDuration: '4s' }} />
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-transparent to-indigo-500/20 blur-xl rounded-full opacity-50" />

            {/* Scattering Mystic Particles */}
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
              showName={false}
            />
          </div>

          {/* Card Info Text */}
          <div className="mt-8 text-center space-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-bold text-amber-100 font-chakra tracking-wider">
              {data.card.cardInfo.nameKo}
            </h3>
            <div className="text-amber-400/60 text-sm font-light uppercase tracking-[0.2em]">
              {data.card.cardInfo.nameEn} • {data.card.isReversed ? 'Reversed' : 'Upright'}
            </div>
            {Array.isArray((data.card.cardInfo as any).keywords) && (data.card.cardInfo as any).keywords.length > 0 && (
              <p className="text-slate-400 text-sm mt-2 font-light">
                {(data.card.cardInfo as any).keywords.slice(0, 3).join(" • ")}
              </p>
            )}
          </div>

          <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <button
              onClick={onRetry}
              className="px-8 py-3 rounded-full border border-purple-500/30 text-purple-300 text-xs font-chakra tracking-widest hover:bg-purple-500/10 hover:border-purple-500 transition-all uppercase"
            >
              새로운 카드 뽑기
            </button>
          </div>
        </div>

        {/* Interpretation Text */}
        <div className="w-full">
          <div className="glass-card p-6 md:p-10 rounded-3xl border-purple-500/20 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="mb-8 border-b border-purple-500/20 pb-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 font-chakra">
                {data.card.cardInfo.nameKo}
              </h2>
              <div className="flex items-center justify-center gap-3 text-purple-300/60 text-sm font-light uppercase tracking-widest">
                <span>{data.card.cardInfo.nameEn}</span>
                <span className="w-1 h-1 rounded-full bg-purple-500/50" />
                <span>{data.card.isReversed ? 'Reversed' : 'Upright'}</span>
              </div>
            </div>

            <div className="prose-mystic w-full">
              <MarkdownViewer content={data.aiReading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCardResultView;
