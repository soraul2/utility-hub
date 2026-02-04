import React, { useState } from 'react';
import TarotCardView from '../../../components/tarot/TarotCardView';
import MarkdownViewer from '../../../components/common/MarkdownViewer';
import type { DailyCardResponse } from '../../../lib/tarot';
import ShareModal from '../../../components/ui/ShareModal';
import { useAuth } from '../../../hooks/useAuth';
import TalismanModal from '../../../components/tarot/talisman/TalismanModal';
import { MYSTIC_INFO } from '../../../lib/tarot-assistants';

interface DailyCardResultViewProps {
  data: DailyCardResponse | null;
  onRetry: () => void;
}

const DailyCardResultView: React.FC<DailyCardResultViewProps> = ({ data, onRetry }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTalismanModalOpen, setIsTalismanModalOpen] = useState(false);
  const { user } = useAuth();

  if (!data?.card) {
    return (
      <div className="glass-card p-8 text-red-600 dark:text-red-300 rounded-2xl border-red-500/30 bg-white/50 dark:bg-black/20">
        데이터를 불러오지 못했습니다. 다시 시도해주세요.
        <button onClick={onRetry} className="block mt-4 text-slate-800 dark:text-white underline font-bold">다시 시도</button>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/tarot/share/${data.shareUuid}`;
  const userName = user?.nickname || '여행자';
  const talismanKeyword = data.card.cardInfo.nameKo;

  return (
    <div className="w-full px-4 relative z-10 pb-20">
      <div className="flex flex-col gap-20 items-center animate-fade-in max-w-4xl mx-auto">
        {/* Card Display */}
        <div className="flex flex-col items-center justify-center perspective-1000 w-full">
          <div className="relative w-64 md:w-80 animate-flip-in perspective-1000 group">
            {/* Supercharged Aura & Particle Scattering */}
            <div className="absolute -inset-12 bg-purple-600/20 dark:bg-purple-600/30 blur-[80px] rounded-full opacity-60 dark:opacity-80 animate-pulse" />
            <div className="absolute -inset-16 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[60px] rounded-full animate-ping opacity-30 dark:opacity-40" style={{ animationDuration: '4s' }} />
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-transparent to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 blur-xl rounded-full opacity-50" />

            {/* Scattering Mystic Particles */}
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-purple-400 dark:bg-purple-300 rounded-full blur-[1px] shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-mystic-float pointer-events-none"
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
              className="relative z-10 shadow-2xl"
              showName={false}
            />
          </div>

          {/* Card Info Text */}
          <div className="mt-8 text-center space-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-amber-100 font-chakra tracking-wider transition-colors">
              {data.card.cardInfo.nameKo}
            </h3>
            <div className="text-amber-600 dark:text-amber-400/60 text-sm font-light uppercase tracking-[0.2em] transition-colors">
              {data.card.cardInfo.nameEn} • {data.card.isReversed ? 'Reversed' : 'Upright'}
            </div>
            {Array.isArray((data.card.cardInfo as any).keywords) && (data.card.cardInfo as any).keywords.length > 0 && (
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 font-medium transition-colors">
                {(data.card.cardInfo as any).keywords.slice(0, 3).join(" • ")}
              </p>
            )}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <button
              onClick={onRetry}
              className="px-8 py-3 rounded-full border border-purple-600/30 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-chakra tracking-widest hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-600 dark:hover:border-purple-500 transition-all uppercase font-bold"
            >
              새로운 카드 뽑기
            </button>

            {/* Talisman Button */}
            <button
              onClick={() => setIsTalismanModalOpen(true)}
              className="group relative px-8 py-3 bg-slate-900 border border-amber-500/50 font-bold font-chakra uppercase text-xs tracking-widest rounded-full overflow-hidden transition-all hover:bg-slate-800 shadow-[0_0_15px_rgba(180,83,9,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 text-amber-400 group-hover:text-amber-200">
                <i className="fas fa-scroll mr-2"></i> 부적 봉인하기
              </span>
            </button>

            {data.shareUuid && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-8 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-chakra tracking-widest transition-all uppercase font-bold shadow-lg"
              >
                <i className="fas fa-share-alt mr-2"></i>
                결과 공유하기
              </button>
            )}
          </div>
        </div>

        {/* Interpretation Text */}
        <div className="w-full">
          <div className="bg-white/80 dark:glass-card p-6 md:p-10 rounded-3xl border border-slate-200 dark:border-purple-500/20 shadow-xl dark:shadow-2xl animate-fade-in-up transition-colors" style={{ animationDelay: '0.3s' }}>
            <div className="mb-8 border-b border-slate-200 dark:border-purple-500/20 pb-6 text-center transition-colors">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 font-chakra transition-colors">
                {data.card.cardInfo.nameKo}
              </h2>
              <div className="flex items-center justify-center gap-3 text-slate-500 dark:text-purple-300/60 text-sm font-light uppercase tracking-widest transition-colors">
                <span>{data.card.cardInfo.nameEn}</span>
                <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-purple-500/50" />
                <span>{data.card.isReversed ? 'Reversed' : 'Upright'}</span>
              </div>
            </div>

            <div className="prose-mystic w-full text-slate-700 dark:text-slate-300">
              <MarkdownViewer content={data.aiReading} />
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />

      <TalismanModal
        isOpen={isTalismanModalOpen}
        onClose={() => setIsTalismanModalOpen(false)}
        userName={userName}
        initialKeyword={talismanKeyword}
        assistantType="MYSTIC"
        cardImageUrl={MYSTIC_INFO.image}
      />
    </div>
  );
};

export default DailyCardResultView;
