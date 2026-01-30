import React from 'react';
import { MYSTIC_INFO, type AssistantInfo } from '../../../lib/tarot-assistants';
import type { TarotAssistantType } from '../../../lib/tarot';
import { useDragScroll } from '../../../hooks/useDragScroll';

interface LeaderSelectionStepProps {
  assistants: AssistantInfo[];
  onShuffle: () => void;
  onSelectLeader: (leaderType?: TarotAssistantType) => void;
  leaderPending: AssistantInfo | null;
  showLeaderConfirmModal: boolean;
  setShowLeaderConfirmModal: (value: boolean) => void;
  onConfirmLeader: () => void;
}

const LeaderSelectionStep: React.FC<LeaderSelectionStepProps> = ({
  assistants,
  onShuffle,
  onSelectLeader,
  leaderPending,
  showLeaderConfirmModal,
  setShowLeaderConfirmModal,
  onConfirmLeader,
}) => {
  const { sliderRef: leaderListRef, handlers } = useDragScroll(1.5);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-fade-in space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-amber-100 tracking-tight leading-tight">
          운명의 흐름을 읽어줄 리더를 선택하세요
        </h2>
        <p className="text-slate-400 font-light text-sm md:text-base tracking-wide max-w-2xl mx-auto">
          각기 다른 시선이 당신의 운명을 비춥니다. 마음이 이끄는 리더를 선택하여 그들의 목소리로 해답을 들어보세요.
        </p>
      </div>

      <div className="relative group/leader-list">
        {/* Navigation Guides */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex items-center gap-2 text-amber-500/60 pointer-events-none animate-pulse md:hidden drop-shadow-md">
          <i className="fas fa-chevron-left animate-bounce-left"></i>
          <span className="text-[10px] font-chakra uppercase tracking-widest font-bold">Left</span>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex items-center gap-2 text-amber-500/60 pointer-events-none animate-pulse md:hidden drop-shadow-md">
          <span className="text-[10px] font-chakra uppercase tracking-widest font-bold">Right</span>
          <i className="fas fa-chevron-right animate-bounce-right"></i>
        </div>

        <div
          ref={leaderListRef}
          {...handlers}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible px-10 md:px-0 pb-8 md:pb-0 snap-x snap-mandatory gold-scrollbar justify-start md:justify-center max-w-5xl mx-auto cursor-grab active:cursor-grabbing"
        >
          {/* Mystic Card */}
          <button
            onClick={() => onSelectLeader(undefined)}
            className="group relative aspect-[3/4] flex-shrink-0 w-[85vw] md:w-auto snap-center rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 border border-amber-500/20 hover:border-amber-500/60 bg-[#0a0a0f]"
          >
            <img
              src={MYSTIC_INFO.image}
              alt={MYSTIC_INFO.name}
              className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />

            <div className="absolute top-4 left-4 z-20">
              <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 uppercase tracking-wider drop-shadow-md">Master</span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-20 text-left space-y-2">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 font-serif drop-shadow-sm">Mystic</h3>
              <p className="text-xs text-amber-100/80 font-medium uppercase tracking-widest drop-shadow-md">운명의 관찰자</p>
              <p className="text-xs text-slate-300 font-light leading-relaxed line-clamp-2 drop-shadow-md">
                모든 가능성을 아우르는 깊고 통찰력 있는 정석 리딩. 운명의 큰 흐름을 읽어냅니다.
              </p>
            </div>
          </button>

          {/* Assistant Cards */}
          {assistants.map((assistant) => (
            <button
              key={assistant.type}
              onClick={() => onSelectLeader(assistant.type as TarotAssistantType)}
              className={`group relative aspect-[3/4] flex-shrink-0 w-[85vw] md:w-auto snap-center rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 bg-[#0a0a0f] text-left ${assistant.type === 'FORTUNA'
                ? 'border-transparent shadow-[0_0_40px_rgba(251,191,36,0.3)]'
                : 'border border-white/5 hover:border-amber-500/30'
                }`}
            >
              {assistant.type === 'FORTUNA' ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900/50 to-amber-900/50 opacity-80 z-0" />
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0" />
                  <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 opacity-20 animate-spin-slow blur-xl -z-10" />
                  <div className="absolute top-4 right-4 animate-pulse z-20"><span className="text-xl">✨</span></div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/80 to-[#0a0a0f] z-0" />
              )}

              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />

              <div className="absolute top-4 left-4 z-20 flex gap-2">
                {assistant.type === 'FORTUNA' ? (
                  <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 uppercase tracking-wider animate-pulse">Secret</span>
                ) : (
                  <span className="px-2 py-1 rounded bg-white/10 text-slate-400 text-[10px] font-bold border border-white/10 uppercase tracking-wider">Apprentice</span>
                )}
              </div>

              <div className="absolute inset-0 z-0">
                <img
                  src={assistant.image}
                  alt={assistant.name}
                  className={`w-full h-full object-cover transition-all duration-700 ${assistant.type === 'FORTUNA'
                    ? 'opacity-90 group-hover:scale-110'
                    : 'opacity-60 group-hover:opacity-80 group-hover:scale-105 grayscale group-hover:grayscale-0'}`}
                />
              </div>

              <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2">
                <h3 className={`text-xl font-bold font-serif ${assistant.type === 'FORTUNA' ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400' : 'text-slate-200'}`}>
                  {assistant.name}
                </h3>
                <p className="text-xs text-white/50 font-medium uppercase tracking-widest">{assistant.title}</p>
                <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-2">
                  "{assistant.desc}"
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button onClick={onShuffle} className="px-6 py-3 rounded-full border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-all text-xs font-chakra uppercase tracking-widest flex items-center gap-2">
          <i className="fas fa-random"></i> 다른 조수 찾기
        </button>
      </div>

      {showLeaderConfirmModal && leaderPending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => setShowLeaderConfirmModal(false)} />

          <div className="relative w-full max-w-md bg-[#0d0d15] border border-amber-500/30 rounded-2xl p-8 md:p-10 shadow-[0_0_100px_rgba(217,119,6,0.3)] animate-scale-in text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

            {/* Profile Image */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className={`absolute inset-0 rounded-full border-2 ${leaderPending.type === 'FORTUNA' ? 'border-amber-400 animate-spin-slow' : 'border-amber-500/30'}`} />
              <div className="absolute inset-1 rounded-full overflow-hidden">
                <img src={leaderPending.image} alt={leaderPending.name} className="w-full h-full object-cover" />
              </div>
              {leaderPending.type === 'FORTUNA' && (
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
              )}
            </div>

            {/* Title & Name */}
            <div className="space-y-1 mb-8">
              <p className="text-xs text-amber-500/70 font-bold tracking-[0.2em] uppercase">{leaderPending.title}</p>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-amber-100">
                {leaderPending.name}
              </h3>
            </div>

            {/* Quote */}
            <div className="relative mb-10 px-4">
              <i className="fas fa-quote-left absolute -top-4 -left-2 text-amber-500/20 text-2xl"></i>
              <p className="text-slate-300 font-serif italic leading-loose text-lg break-keep">
                "{leaderPending.introQuote}"
              </p>
              <i className="fas fa-quote-right absolute -bottom-4 -right-2 text-amber-500/20 text-2xl"></i>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirmLeader}
                className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all transform hover:scale-[1.02] shadow-lg ${leaderPending.type === 'FORTUNA'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-black hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]'
                  : 'bg-gradient-to-r from-amber-800 to-amber-600 text-white hover:from-amber-700 hover:to-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.2)]'
                  }`}
              >
                {leaderPending.confirmBtn}
              </button>

              {leaderPending.cancelBtn && (
                <button
                  onClick={() => setShowLeaderConfirmModal(false)}
                  className="w-full py-3 rounded-xl border border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all text-xs tracking-widest uppercase font-bold"
                >
                  {leaderPending.cancelBtn}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderSelectionStep;
