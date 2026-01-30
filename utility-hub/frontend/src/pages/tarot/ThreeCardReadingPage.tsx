import React, { useState, useEffect } from 'react';
import { useThreeCardReading } from '../../hooks/useThreeCardReading';
import { TAROT_TOPICS } from '../../lib/tarot';
import type { TarotTopic, UserGender } from '../../lib/tarot';
import TarotCardView from '../../components/tarot/TarotCardView';
import MarkdownViewer from '../../components/common/MarkdownViewer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import type { TarotAssistantType } from '../../lib/tarot';
import confetti from 'canvas-confetti';

const ThreeCardReadingPage: React.FC = () => {
      const { data, loading, error, createReading, reset } = useThreeCardReading();
      const [step, setStep] = useState<'input' | 'selection' | 'leader' | 'result'>('input');
      const [selectedLeader, setSelectedLeader] = useState<TarotAssistantType | null>(null);

      // Assistant State
      const [assistants, setAssistants] = useState<{ type: TarotAssistantType; name: string; title: string; desc: string; image: string; }[]>([]);


      const ASSISTANTS = [
            {
                  type: 'SYLVIA', name: '실비아', title: '냉철한 분석가', desc: '팩트 중심의 현실적인 조언', image: '/assets/tarot/assistants/silvia.png',
                  introQuote: "감정을 배제하고 오직 논리와 이성으로만 분석하겠습니다. 달콤한 거짓말보다는 차가운 진실을 들을 준비가 되셨습니까?",
                  confirmBtn: "진실을 들려줘", cancelBtn: "아직은 무서워"
            },
            {
                  type: 'LUNA', name: '루나', title: '다정한 치유자', desc: '마음을 어루만지는 위로', image: '/assets/tarot/assistants/luna.png',
                  introQuote: "마음이 많이 다치셨군요... 제 따뜻한 달빛으로 당신의 상처를 어루만져 드려도 될까요? 아프지 않게 말씀드릴게요.",
                  confirmBtn: "응, 위로가 필요해", cancelBtn: "아니, 괜찮아"
            },
            {
                  type: 'ORION', name: '오리온', title: '쾌활한 예언가', desc: '긍정 에너지와 유머', image: '/assets/tarot/assistants/orion.png',
                  introQuote: "어두운 표정 짓지 마! 태양은 언제나 다시 뜨니까. 내가 네 운명에서 가장 빛나는 부분을 찾아줄게. 갈 준비 됐어?",
                  confirmBtn: "가자! 에너지 충전!", cancelBtn: "조금 부담스러워"
            },
            {
                  type: 'NOCTIS', name: '녹티스', title: '그림자 독설가', desc: '뼈 때리는 직설 화법', image: '/assets/tarot/assistants/noctis.png',
                  introQuote: "당신조차 모르는 당신의 무의식... 그 깊은 심연을 들여다볼 용기가 있는가? 내가 보는 진실은 다소 어둡고 날카로울 것이다.",
                  confirmBtn: "심연을 마주할게", cancelBtn: "다음에 볼게"
            },
            {
                  type: 'VANCE', name: '반스', title: '야망의 전략가', desc: '성공을 위한 구체적 전략', image: '/assets/tarot/assistants/vance.png',
                  introQuote: "운명은 기다리는 게 아니라 쟁취하는 것입니다. 이 판을 뒤집고 승리할 수 있는 확실한 전략을 원하십니까? 승리의 수를 알려드리죠.",
                  confirmBtn: "전략을 알려줘", cancelBtn: "그냥 흘러갈래"
            },
            {
                  type: 'ELARA', name: '엘라라', title: '몽환의 시인', desc: '감성적인 은유와 표현', image: '/assets/tarot/assistants/elara.png',
                  introQuote: "현실의 경계 너머, 꿈속의 이야기를 들려드릴게요. 별들이 속삭이는 운명의 시를 함께 들어보시겠어요?",
                  confirmBtn: "꿈을 꾸고 싶어", cancelBtn: "현실에 있을래"
            },
            {
                  type: 'KLAUS', name: '클라우스', title: '엄격한 규율자', desc: '원칙 중심의 단호한 경고', image: '/assets/tarot/assistants/klaus.png',
                  introQuote: "모든 결과에는 원인이 있는 법. 당신이 지은 업보와 마주할 시간이다. 핑계 댈 생각 말고, 내 심판을 받아들이겠나?",
                  confirmBtn: "심판을 받아들인다", cancelBtn: "너무 무거워"
            },
      ] as const;

      const HIDDEN_ASSISTANT = {
            type: 'FORTUNA', name: '마스터 포르투나', title: '행운의 여신', desc: '무조건적인 축복과 행운', image: '/assets/tarot/assistants/fortuna.png',
            introQuote: "어머나! 저를 찾으셨군요? 이건 우연이 아니에요. 당신에게 쏟아질 기적 같은 행운을 지금 바로 축복해 드릴게요! 준비되셨나요?",
            confirmBtn: "기적을 받을게! ✨", cancelBtn: ""
      } as const;

      const MYSTIC_INFO = {
            type: 'MYSTIC', name: 'Mystic', title: '운명의 관찰자', desc: '정석적인 타로 리딩', image: '/assets/tarot/assistants/mystic.png',
            introQuote: "운명의 흐름을 읽는 자로서, 당신의 질문에 담긴 진실만을 전하겠습니다. 허상 없는 가장 투명한 거울을 마주할 준비가 되셨습니까?",
            confirmBtn: "진실을 보여줘", cancelBtn: "아직 준비 안 됐어"
      };

      const triggerFortunaEffect = () => {
            // Fancy Confetti Effect
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                  const timeLeft = animationEnd - Date.now();

                  if (timeLeft <= 0) {
                        return clearInterval(interval);
                  }

                  const particleCount = 50 * (timeLeft / duration);
                  confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                  confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
      };

      const shuffleAssistants = () => {
            const shuffled = [...ASSISTANTS].sort(() => 0.5 - Math.random()).slice(0, 3);
            // 1% Chance for Fortuna
            if (Math.random() < 0.01) {
                  const replaceIdx = Math.floor(Math.random() * 3);
                  // @ts-ignore
                  shuffled[replaceIdx] = HIDDEN_ASSISTANT;
                  triggerFortunaEffect(); // Trigger effect on appearance
            }
            // @ts-ignore
            setAssistants(shuffled);
      };





      // Form State
      const [question, setQuestion] = useState('');
      const [topic, setTopic] = useState<TarotTopic>('GENERAL');
      const [userName, setUserName] = useState('');
      const [userAge, setUserAge] = useState('');
      const [userGender, setUserGender] = useState<UserGender | ''>('');
      const [revealedCards, setRevealedCards] = useState<boolean[]>([false, false, false]);
      const [showResultRevealModal, setShowResultRevealModal] = useState(false);
      const [isResultUnlocked, setIsResultUnlocked] = useState(false);
      const [isOpening, setIsOpening] = useState(false);

      // Selection State
      const [selectedSlots, setSelectedSlots] = useState<(number | null)[]>([null, null, null]);
      const [showConfirmModal, setShowConfirmModal] = useState(false);
      const [showInputConfirmModal, setShowInputConfirmModal] = useState(false);
      const [flippingIndex, setFlippingIndex] = useState<number | null>(null);

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
            const walk = (x - startX) * 2;
            sliderRef.current.scrollLeft = scrollLeft - walk;
      };

      // Leader Drag Scrolling State
      const leaderListRef = React.useRef<HTMLDivElement>(null);
      const [isLeaderDragging, setIsLeaderDragging] = useState(false);
      const [leaderStartX, setLeaderStartX] = useState(0);
      const [leaderScrollLeft, setLeaderScrollLeft] = useState(0);

      const handleLeaderMouseDown = (e: React.MouseEvent) => {
            if (!leaderListRef.current) return;
            setIsLeaderDragging(true);
            setLeaderStartX(e.pageX - leaderListRef.current.offsetLeft);
            setLeaderScrollLeft(leaderListRef.current.scrollLeft);
      };

      const handleLeaderMouseLeave = () => {
            setIsLeaderDragging(false);
      };

      const handleLeaderMouseUp = () => {
            setIsLeaderDragging(false);
      };

      const handleLeaderMouseMove = (e: React.MouseEvent) => {
            if (!isLeaderDragging || !leaderListRef.current) return;
            e.preventDefault();
            const x = e.pageX - leaderListRef.current.offsetLeft;
            const walk = (x - leaderStartX) * 1.5;
            leaderListRef.current.scrollLeft = leaderScrollLeft - walk;
      };

      const handleInputSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!question.trim()) return;
            setShowInputConfirmModal(true);
      };

      const handleProceedToSelection = () => {
            setShowInputConfirmModal(false);
            setStep('selection');
      };

      const handleCardSelect = (index: number) => {
            if (selectedSlots.includes(index)) return;
            const firstEmptyIndex = selectedSlots.indexOf(null);
            if (firstEmptyIndex === -1) return;

            const newSlots = [...selectedSlots];
            newSlots[firstEmptyIndex] = index;
            setSelectedSlots(newSlots);
      };

      const handleCardDeselect = (slotIndex: number) => {
            const newSlots = [...selectedSlots];
            newSlots[slotIndex] = null;
            setSelectedSlots(newSlots);
      };

      const handleReveal = () => {
            if (selectedSlots.includes(null)) return;
            setShowConfirmModal(true);
      };

      const handleMoveToLeaderSelection = () => {
            setShowConfirmModal(false);
            shuffleAssistants(); // Shuffle assistants before showing selection
            setStep('leader');
      };

      // Soul Contract State
      const [leaderPending, setLeaderPending] = useState<any>(null);
      const [showLeaderConfirmModal, setShowLeaderConfirmModal] = useState(false);

      const handleCreateReading = (leaderType?: TarotAssistantType) => {
            let leaderData;
            if (!leaderType) {
                  leaderData = MYSTIC_INFO;
            } else if (leaderType === 'FORTUNA') {
                  leaderData = HIDDEN_ASSISTANT;
                  triggerFortunaEffect();
            } else {
                  // Find from state or constant
                  leaderData = assistants.find(a => a.type === leaderType) || ASSISTANTS.find(a => a.type === leaderType);
            }

            if (leaderData) {
                  setLeaderPending(leaderData);
                  setShowLeaderConfirmModal(true);
            }
      };

      const handleConfirmLeader = async () => {
            if (!leaderPending) return;
            setShowLeaderConfirmModal(false);

            const leaderType = leaderPending.type === 'MYSTIC' ? undefined : leaderPending.type;

            setSelectedLeader(leaderType || null);
            if (leaderType === 'FORTUNA') triggerFortunaEffect();

            await createReading({
                  question,
                  topic,
                  userName: userName || undefined,
                  userAge: userAge ? parseInt(userAge, 10) : undefined,
                  userGender: userGender || undefined,
                  assistantType: leaderType
            });
            setRevealedCards([false, false, false]);
            setStep('result');
      };

      const handleReset = () => {
            reset();
            setStep('input');
            setQuestion('');
            setSelectedSlots([null, null, null]);
            setRevealedCards([false, false, false]);
            setSelectedLeader(null);
            setShowResultRevealModal(false);
            setIsResultUnlocked(false);
            setIsOpening(false);
      };

      const handleOpenResult = () => {
            setIsOpening(true);
            setTimeout(() => {
                  setShowResultRevealModal(false);
                  setIsResultUnlocked(true);
            }, 800);
      };

      useEffect(() => {
            if (revealedCards.every(Boolean) && !isResultUnlocked) {
                  const timer = setTimeout(() => {
                        setShowResultRevealModal(true);
                  }, 500); // Slight delay for dramatic effect
                  return () => clearTimeout(timer);
            }
      }, [revealedCards, isResultUnlocked]);

      if (loading) {
            const isFortuna = selectedLeader === 'FORTUNA';

            return (
                  <div className="flex flex-col items-center justify-center p-20">
                        {isFortuna ? (
                              <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                                    <div className="absolute inset-0 border-4 border-amber-400 rounded-full animate-spin shadow-[0_0_50px_rgba(251,191,36,0.6)]" />
                                    <div className="absolute inset-4 border-4 border-purple-500 rounded-full animate-spin-reverse opacity-80" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="absolute inset-0 bg-amber-500/20 blur-xl animate-pulse" />
                                          <span className="text-6xl animate-bounce drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">✨</span>
                                    </div>
                              </div>
                        ) : (
                              <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                                    <div className="absolute inset-0 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                                    <div className="absolute inset-4 border-4 border-amber-200/20 border-b-amber-200 rounded-full animate-spin-reverse" />
                                    <div className="absolute w-48 h-48 border border-purple-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                                    <div className="relative z-10 w-24 h-36 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-lg border border-purple-400/30 shadow-[0_0_50px_rgba(168,85,247,0.6)] animate-pulse flex items-center justify-center">
                                          <i className="fas fa-eye text-4xl text-purple-200/80 animate-pulse"></i>
                                    </div>
                              </div>
                        )}

                        <LoadingSpinner message={isFortuna ? "FATE REWRITING..." : "Reading the stars..."} />

                        {isFortuna ? (
                              <p className="mt-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 font-bold text-lg md:text-xl tracking-widest animate-pulse text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-serif leading-relaxed">
                                    "마스터 포르투나가 기존 운명을 뒤틀어버리고<br />새롭게 바꿔버립니다."
                              </p>
                        ) : (
                              <p className="mt-6 text-purple-200/50 text-xs font-light tracking-wider animate-pulse">
                                    "같은 질문을 반복하면 카드의 목소리가 흐려집니다."
                              </p>
                        )}
                  </div>
            );
      }

      if (error) {
            return (
                  <div className="max-w-md mx-auto py-20">
                        <ErrorBanner message={error} onRetry={() => { reset(); setStep('input'); }} />
                  </div>
            );
      }

      // Input Step
      if (step === 'input') {
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

                        <form onSubmit={handleInputSubmit} className="glass-card p-8 md:p-10 rounded-3xl border-amber-500/10 shadow-2xl space-y-6 relative overflow-visible">
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

                        {showInputConfirmModal && (
                              <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowInputConfirmModal(false)} />
                                    <div className="relative w-full max-w-lg bg-[#15100d]/90 border border-amber-500/30 rounded-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(217,119,6,0.2)] animate-scale-in overflow-hidden text-center space-y-8">
                                          <div className="space-y-4">
                                                <h2 className="text-xl md:text-2xl font-bold text-amber-100 font-chakra">리딩을 준비하시겠습니까?</h2>
                                                <div className="w-16 h-[1px] bg-amber-500/50 mx-auto" />
                                          </div>
                                          <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed break-keep">
                                                "충분히 집중하셨나요? 입력하신 질문은 당신의 운명을 비추는 시작점이 됩니다."
                                          </p>
                                          <div className="flex flex-col md:flex-row gap-4 pt-2">
                                                <button onClick={() => setShowInputConfirmModal(false)} className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-chakra text-xs uppercase tracking-widest font-bold">
                                                      다시 생각하기
                                                </button>
                                                <button onClick={handleProceedToSelection} className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 text-white font-chakra text-xs uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all">
                                                      준비되었습니다
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        )}
                  </div>
            );
      }

      // Selection Step
      if (step === 'selection') {
            return (
                  <div className="relative py-4 px-4 flex flex-col items-center">
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
                        <div className="relative z-20 w-full max-w-6xl mx-auto flex justify-start mb-8">
                              <button onClick={() => setStep('input')} className="group flex items-center gap-2 text-amber-500/60 hover:text-amber-400">
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
                              {/* Background Magic Circle (Requirement 2) */}
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
                                                      <div className={`absolute inset-0 animate-slam-in cursor-pointer group/slot ${isAllSelected ? 'animate-golden-pulse animate-levitate' : ''}`} onClick={() => handleCardDeselect(slotIndex)}>
                                                            {/* Levitation Shadow (Requirement: Levitation) */}
                                                            {isAllSelected && (
                                                                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[70%] h-4 bg-black/40 blur-xl rounded-full" />
                                                            )}
                                                            <TarotCardView isFaceDown={true} className="w-full h-full shadow-[0_0_50px_rgba(217,119,6,0.3)] rounded-xl border border-amber-500/30 transition-transform group-hover/slot:scale-[1.02]" />
                                                            {/* Refined 'X' Button (More integrated) */}
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
                                          <button onClick={handleReveal} className="group relative px-20 py-5 overflow-hidden transition-all active:scale-95 shadow-[0_0_40px_rgba(217,119,6,0.4)] rounded-full">
                                                {/* Premium Double Border (Requirement: Magical Tool) */}
                                                <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700" />
                                                <div className="absolute inset-1 border border-amber-400/30 rounded-full z-10" />
                                                <div className="absolute inset-2 border border-white/10 rounded-full z-10" />

                                                <span className="relative z-20 text-white font-serif italic text-lg tracking-[0.4em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                                      운명 확인하기
                                                </span>

                                                {/* Magical Glow (Requirement: Magical Tool) */}
                                                <div className="absolute inset-0 bg-amber-500/20 blur-2xl group-hover:bg-amber-500/40 transition-all duration-500" />
                                          </button>
                                    </div>
                              ) : (
                                    <div className="relative group/deck -mt-12">
                                          {/* Navigation Cues (Requirements) */}
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
                                                                  <button key={i} onClick={() => !isDragging && handleCardSelect(i)}
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
                                          {/* Ornamental Background */}
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
                                                            onClick={handleMoveToLeaderSelection}
                                                            className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-900 to-amber-700 text-white font-chakra text-sm uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all animate-pulse-slow"
                                                      >
                                                            운명의 리더 선택하기
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
      }

      // Leader Selection Step
      if (step === 'leader') {
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
                                    onMouseDown={handleLeaderMouseDown}
                                    onMouseLeave={handleLeaderMouseLeave}
                                    onMouseUp={handleLeaderMouseUp}
                                    onMouseMove={handleLeaderMouseMove}
                                    className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible px-10 md:px-0 pb-8 md:pb-0 snap-x snap-mandatory gold-scrollbar justify-start md:justify-center max-w-5xl mx-auto cursor-grab active:cursor-grabbing"
                              >
                                    <button
                                          onClick={() => handleCreateReading(undefined)}
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
                                                onClick={() => handleCreateReading(assistant.type)}
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

                                                {/* Character Image */}
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
                              <button onClick={shuffleAssistants} className="px-6 py-3 rounded-full border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-all text-xs font-chakra uppercase tracking-widest flex items-center gap-2">
                                    <i className="fas fa-random"></i> 다른 조수 찾기
                              </button>
                        </div>

                        {showLeaderConfirmModal && leaderPending && (
                              <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => setShowLeaderConfirmModal(false)} />

                                    <div className="relative w-full max-w-md bg-[#0d0d15] border border-amber-500/30 rounded-2xl p-8 md:p-10 shadow-[0_0_100px_rgba(217,119,6,0.3)] animate-scale-in text-center overflow-hidden">
                                          {/* Decorative Elements */}
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
                                                      onClick={handleConfirmLeader}
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
      }

      // Result Step
      return (
            <div className="max-w-6xl mx-auto space-y-16 animate-fade-in py-10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <button onClick={handleReset} className="group flex items-center gap-2 text-amber-500/60 hover:text-amber-400">
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
                        {/* Completion Effect - Appears when all cards are revealed */}
                        {revealedCards.every(Boolean) && (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] pointer-events-none -z-10 transition-opacity duration-1000 animate-fade-in">
                                    <div className="absolute inset-0 bg-amber-500/10 blur-[80px] rounded-full animate-pulse-slow" />
                                    <div className="absolute inset-0 bg-gradient-radial from-amber-200/10 via-transparent to-transparent opacity-50" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-amber-500/10 rounded-full animate-[spin_20s_linear_infinite]" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-amber-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                              </div>
                        )}

                        {data?.cards.map((card, index) => {
                              const isRevealed = revealedCards[index];
                              return (
                                    <div key={index} className="flex flex-col items-center">
                                          {/* Timeline Info - Top Position */}
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




                  {/* Scroll Hint (Appears after cards are revealed) */}
                  {showResultRevealModal && !isResultUnlocked && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 text-center pointer-events-none animate-fade-in transition-opacity duration-500" style={{ animationDelay: '0.5s' }}>
                              <p className="text-[10px] text-amber-200/50 uppercase tracking-[0.2em] mb-2 animate-pulse">운명이 도착했습니다</p>
                              <i className="fas fa-chevron-down text-amber-500 text-xl animate-bounce"></i>
                        </div>
                  )}

                  {/* Destiny Envelope Section (In-flow, requires scrolling) */}
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
                                          {/* Seal Pulse */}
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

                                    {/* Magic Button Visuals (Decoration) */}
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
                              {/* Main Content */}
                              <div className="mystic-panel">
                                    <h3 className="text-center text-amber-500 font-chakra font-bold uppercase tracking-[0.3em] mb-12">운명의 조언</h3>
                                    <div className="prose-mystic">
                                          <MarkdownViewer content={data?.aiReading || ''} />
                                    </div>

                                    <div className="mt-12 flex justify-center">
                                          <button onClick={handleReset} className="px-8 py-3 bg-amber-500 text-black font-bold font-chakra uppercase text-xs tracking-widest rounded transition-transform hover:scale-105 shadow-[0_0_15px_rgba(245,158,11,0.4)]">새로운 카드 뽑기</button>
                                    </div>
                              </div>
                        </div>
                  )}







            </div >
      );
};

export default ThreeCardReadingPage;
