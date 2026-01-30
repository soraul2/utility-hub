import React, { useCallback } from 'react';
import { TAROT_TOPICS, type TarotTopic, type UserGender } from '../../../lib/tarot';

interface InputFormStepProps {
  question: string;
  setQuestion: (value: string) => void;
  topic: TarotTopic;
  setTopic: (value: TarotTopic) => void;
  userName: string;
  setUserName: (value: string) => void;
  userAge: string;
  setUserAge: (value: string) => void;
  userGender: UserGender | '';
  setUserGender: (value: UserGender | '') => void;
  onProceed: () => void;
  showConfirmModal: boolean;
  setShowConfirmModal: (value: boolean) => void;
}

const InputFormStep: React.FC<InputFormStepProps> = ({
  question,
  setQuestion,
  topic,
  setTopic,
  userName,
  setUserName,
  userAge,
  setUserAge,
  userGender,
  setUserGender,
  onProceed,
  showConfirmModal,
  setShowConfirmModal,
}) => {
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setShowConfirmModal(true);
  }, [question, setShowConfirmModal]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up py-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white font-chakra tracking-tight leading-tight">
          카드는 당신의 마음을 비추는 거울입니다
        </h1>
        <p className="text-amber-200/60 font-light text-sm md:text-base tracking-wide max-w-md mx-auto">
          상황이 구체적일수록, 해석의 선명도가 높아집니다.<br />
          당신의 이야기를 조금 더 들려주시겠어요?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10 rounded-3xl border-amber-500/10 shadow-2xl space-y-6 relative overflow-visible">
        <div className="space-y-3">
          <label className="text-amber-200/80 font-medium font-chakra tracking-wide text-xs uppercase ml-1 italic">질문을 구체적으로 기입해 주세요</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="예: '지금 짝사랑하는 사람과 3개월 안에 연인이 될 수 있을까요?' 처럼 구체적으로 물어보세요."
            className="w-full h-32 bg-[#050505]/50 border border-white/10 rounded-xl p-5 text-amber-50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none resize-none transition-all placeholder-white/20 mystic-scrollbar text-base"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-amber-200/80 font-medium font-chakra tracking-wide text-xs uppercase ml-1">주제 선택</label>
          <div className="grid grid-cols-2 gap-4">
            {TAROT_TOPICS.filter(t => t.value !== 'GENERAL').map((t) => {
              let icon = 'fa-sparkles';
              let subtext = '일반적인 조언';
              let label = '일반';
              if (t.value === 'LOVE') { icon = 'fa-heart'; subtext = '사랑 & 관계'; label = '연애/관계'; }
              else if (t.value === 'MONEY') { icon = 'fa-coins'; subtext = '금전 & 재물'; label = '재물/금전'; }
              else if (t.value === 'CAREER') { icon = 'fa-briefcase'; subtext = '직업 & 진로'; label = '커리어/진로'; }
              else if (t.value === 'HEALTH') { icon = 'fa-leaf'; subtext = '건강 & 활력'; label = '건강/컨디션'; }

              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTopic(t.value as TarotTopic)}
                  className={`relative p-6 rounded-2xl border transition-all duration-300 group overflow-hidden ${topic === t.value
                    ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.2)]'
                    : 'bg-[#0a0a0f]/60 border-white/5 hover:border-amber-500/50 hover:bg-[#0a0a0f]'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto transition-colors ${topic === t.value ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-slate-400 group-hover:text-amber-500'
                    }`}>
                    <i className={`fas ${icon} text-xl`}></i>
                  </div>
                  <div className="text-center space-y-1 relative z-10">
                    <div className={`font-chakra font-bold text-sm tracking-wide ${topic === t.value ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {label}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-light">
                      {subtext}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="space-y-2">
              <label className="text-amber-200/80 text-[10px] font-chakra uppercase ml-1">성별</label>
              <div className="flex gap-2">
                {['MALE', 'FEMALE'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setUserGender(g as UserGender)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${userGender === g
                      ? 'bg-amber-500 text-black border-amber-500'
                      : 'bg-transparent text-slate-400 border-white/10 hover:border-amber-500/50'
                      }`}
                  >
                    {g === 'MALE' ? '남성' : '여성'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-amber-200/80 text-[10px] font-chakra uppercase ml-1">나이</label>
                <input
                  type="number"
                  value={userAge}
                  onChange={(e) => setUserAge(e.target.value)}
                  placeholder="23"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg p-2 text-amber-50 focus:border-amber-500/50 outline-none text-center font-chakra"
                />
              </div>
              <div className="space-y-2 flex-[2]">
                <label className="text-amber-200/80 text-[10px] font-chakra uppercase ml-1">이름</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="김서윤"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg p-2 text-amber-50 focus:border-amber-500/50 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!question.trim()}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(217,119,6,0.2)] font-chakra tracking-[0.2em] uppercase text-sm border border-amber-400/20"
        >
          리딩 시작하기
        </button>
      </form>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowConfirmModal(false)} />
          <div className="relative w-full max-w-lg bg-[#15100d]/90 border border-amber-500/30 rounded-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(217,119,6,0.2)] animate-scale-in overflow-hidden text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-amber-100 font-chakra">리딩을 준비하시겠습니까?</h2>
              <div className="w-16 h-[1px] bg-amber-500/50 mx-auto" />
            </div>
            <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed break-keep">
              "충분히 집중하셨나요? 입력하신 질문은 당신의 운명을 비추는 시작점이 됩니다."
            </p>
            <div className="flex flex-col md:flex-row gap-4 pt-2">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-chakra text-xs uppercase tracking-widest font-bold">
                다시 생각하기
              </button>
              <button onClick={onProceed} className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 text-white font-chakra text-xs uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all">
                준비되었습니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputFormStep;
