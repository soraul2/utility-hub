import React, { useState } from 'react';
import { useThreeCardReading } from '../../hooks/useThreeCardReading';
import { TAROT_TOPICS } from '../../lib/tarot';
import type { TarotTopic, UserGender } from '../../lib/tarot';
import TarotCardView from '../../components/tarot/TarotCardView';
import MarkdownViewer from '../../components/common/MarkdownViewer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';

const ThreeCardReadingPage: React.FC = () => {
      const { data, loading, error, createReading, reset } = useThreeCardReading();
      const [step, setStep] = useState<'input' | 'selection' | 'result'>('input');

      // Form State
      const [question, setQuestion] = useState('');
      const [topic, setTopic] = useState<TarotTopic>('GENERAL');
      const [userName, setUserName] = useState('');
      const [userAge, setUserAge] = useState('');
      const [userGender, setUserGender] = useState<UserGender | ''>('');
      const [revealedCards, setRevealedCards] = useState<boolean[]>([false, false, false]);

      // Selection State
      // Stores the deck index for each slot [Past, Present, Future]
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
            const walk = (x - startX) * 2; // Drag multiplier speed
            sliderRef.current.scrollLeft = scrollLeft - walk;
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
            // Check if card is already selected in any slot
            if (selectedSlots.includes(index)) return;

            // Find first empty slot
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

      const handleFinalReveal = async () => {
            setShowConfirmModal(false);
            await createReading({
                  question,
                  topic,
                  userName: userName || undefined,
                  userAge: userAge ? parseInt(userAge, 10) : undefined,
                  userGender: userGender || undefined,
            });
            setRevealedCards([false, false, false]);
            setStep('result');
      };

      const handleReset = () => {
            reset();
            setStep('input');
            setQuestion('');
            setSelectedSlots([null, null, null]); // Reset slots
            setRevealedCards([false, false, false]);
      };

      if (loading) {
            return (
                  <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
                        <div className="mystic-bg" />
                        <div className="relative z-10 flex flex-col items-center">
                              {/* Mystic Loading Animation */}
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

      if (error) {
            return (
                  <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
                        <div className="mystic-bg" />
                        <div className="relative z-10 max-w-md w-full">
                              <ErrorBanner message={error} onRetry={() => { reset(); setStep('input'); }} />
                        </div>
                  </div>
            );
      }

      // Input Step
      if (step === 'input') {
            return (
                  <div className="relative min-h-screen pt-12 pb-24 px-4 overflow-hidden flex items-center justify-center">
                        <div className="mystic-bg" />

                        <div className="relative z-10 max-w-2xl w-full space-y-8 animate-fade-in-up">
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
                                    {/* Decorative Elements */}
                                    <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-amber-500/50 rounded-tr-lg" />
                                    <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-amber-500/50 rounded-bl-lg" />

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

                                    {/* Additional Info (Always visible) */}
                                    <div className="space-y-4 pt-2">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in bg-white/5 p-4 rounded-xl border border-white/10">
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
                        </div>

                        {/* Input Confirmation Modal */}
                        {showInputConfirmModal && (
                              <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowInputConfirmModal(false)} />
                                    <div className="relative w-full max-w-lg bg-[#15100d]/90 border border-amber-500/30 rounded-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(217,119,6,0.2)] animate-scale-in overflow-hidden text-center space-y-8">
                                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                                          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

                                          <div className="space-y-4">
                                                <h2 className="text-xl md:text-2xl font-bold text-amber-100 tracking-tight break-keep font-chakra">리딩을 준비하시겠습니까?</h2>
                                                <div className="w-16 h-[1px] bg-amber-500/50 mx-auto" />
                                          </div>

                                          <div className="space-y-4">
                                                <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed break-keep">
                                                      "충분히 집중하셨나요? 입력하신 질문은 당신의 운명을 비추는 시작점이 됩니다.<br />
                                                      심호흡 후, 카드를 선택할 준비가 되었다면 진행해 주세요."
                                                </p>
                                          </div>

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
                  <div className="relative min-h-screen py-4 px-4 overflow-hidden flex flex-col items-center">
                        <div className="mystic-bg" />

                        {/* Top Navigation */}
                        <div className="relative z-20 w-full max-w-6xl mx-auto flex justify-start mb-8">
                              <button
                                    onClick={() => setStep('input')}
                                    className="group flex items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-all"
                              >
                                    <div className="w-8 h-8 rounded-full border border-amber-500/30 flex items-center justify-center group-hover:border-amber-500/80 group-hover:bg-amber-500/5 transition-all">
                                          <i className="fas fa-arrow-left text-xs"></i>
                                    </div>
                                    <span className="text-[10px] font-chakra tracking-[0.2em] uppercase font-bold">질문 수정하기</span>
                              </button>
                        </div>

                        {/* Header */}
                        <div className="relative z-10 text-center space-y-4 mb-8 animate-fade-in-up">
                              <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-white font-chakra tracking-tight">당신의 운명을 선택하세요</h2>
                                    <p className="text-amber-200/60 text-sm tracking-[0.2em] uppercase font-chakra">
                                          {selectedSlots.filter(s => s !== null).length} / 3 카드가 선택되었습니다
                                    </p>
                              </div>
                              <p className="max-w-md mx-auto text-slate-400 text-sm font-light leading-relaxed break-keep">
                                    "그냥 누르지 말고, 크게 심호흡 한번 해봐요.<br />
                                    지금 내 마음에 가장 깊게 들어오는 카드가 당신의 내일을 알려줄 거예요."
                              </p>
                        </div>

                        {/* Selected Slots */}
                        <div className="relative z-10 grid grid-cols-3 gap-4 md:gap-8 mb-12 max-w-3xl w-full px-4">
                              {[0, 1, 2].map((slotIndex) => {
                                    const deckIndex = selectedSlots[slotIndex];
                                    const isFilled = deckIndex !== null;

                                    return (
                                          <div key={slotIndex} className="aspect-[2/3] relative group perspective-1000">
                                                {/* Empty Slot Placeholder */}
                                                <div className={`absolute inset-0 rounded-xl border-2 border-dashed border-amber-500/20 flex flex-col items-center justify-center transition-all duration-500 ${isFilled ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                                      <span className="text-amber-500/30 text-3xl mb-2">+</span>
                                                </div>
                                                <div className={`absolute -bottom-8 left-0 right-0 text-center text-[10px] ${isFilled ? 'text-amber-400 font-bold' : 'text-amber-500/30'} font-chakra uppercase tracking-widest transition-colors`}>
                                                      {slotIndex === 0 ? '과거' : slotIndex === 1 ? '현재' : '미래'}
                                                </div>

                                                {/* Filled Card Animation */}
                                                {isFilled && (
                                                      <div
                                                            className="absolute inset-0 animate-slam-in cursor-pointer group/slotted hover:scale-105 transition-transform z-20"
                                                            onClick={() => handleCardDeselect(slotIndex)}
                                                      >
                                                            <TarotCardView isFaceDown={true} className="w-full h-full shadow-[0_0_50px_rgba(217,119,6,0.3)] rounded-xl border border-amber-500/30" />

                                                            {/* Deselect Overlay */}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/slotted:opacity-100 flex items-center justify-center transition-opacity rounded-xl backdrop-blur-[2px]">
                                                                  <div className="bg-red-500/80 rounded-full p-2">
                                                                        <i className="fas fa-undo text-white text-lg"></i>
                                                                  </div>
                                                            </div>

                                                            {/* Aura Effect */}
                                                            <div className="absolute -inset-4 bg-amber-500/10 blur-2xl rounded-full animate-pulse z-[-1]" />
                                                      </div>
                                                )}
                                          </div>
                                    );
                              })}
                        </div>

                        {/* Interactive Deck */}
                        <div className="relative z-10 w-full max-w-6xl -mt-4">
                              {!selectedSlots.includes(null) ? (
                                    <div className="flex justify-center animate-fade-in-up pb-24 pt-12">
                                          <button
                                                onClick={handleReveal}
                                                className="flex items-center justify-center px-16 py-4 bg-gradient-to-r from-amber-900/60 via-amber-600/60 to-amber-900/60 border border-amber-400/30 rounded-full text-amber-100 font-chakra transition-all shadow-lg active:scale-95 group min-w-[320px] relative overflow-hidden"
                                          >
                                                <span className="relative z-10 tracking-[0.3em] uppercase text-center w-full">운명 확인하기</span>
                                                <i className="fas fa-sparkles absolute right-10 animate-pulse text-amber-300 z-10"></i>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                                          </button>
                                    </div>
                              ) : (
                                    <div
                                          ref={sliderRef}
                                          onMouseDown={handleMouseDown}
                                          onMouseLeave={handleMouseLeave}
                                          onMouseUp={handleMouseUp}
                                          onMouseMove={handleMouseMove}
                                          className="flex items-center justify-start overflow-x-auto overflow-y-visible px-4 md:px-20 py-32 w-full scrollbar-none cursor-grab active:cursor-grabbing select-none"
                                    >
                                          <div className="flex items-center space-x-0 relative min-w-max px-32">
                                                {[...Array(22)].map((_, i) => {
                                                      const isSelected = selectedSlots.includes(i);
                                                      const rotation = (i - 10.5) * 3; // Fan effect for 22 cards
                                                      const translateY = Math.abs(i - 10.5) * 6;

                                                      return (
                                                            <button
                                                                  key={i}
                                                                  onClick={() => !isDragging && handleCardSelect(i)}
                                                                  className={`relative flex-shrink-0 w-28 h-44 md:w-44 md:h-64 transition-all duration-700 ease-out transform-gpu -ml-20 md:-ml-32 first:ml-0
                                                                                        ${isSelected
                                                                              ? 'opacity-0 -translate-y-[200px] scale-0 blur-xl pointer-events-none'
                                                                              : 'group/deck-card hover:!z-50'
                                                                        }`}
                                                                  style={{
                                                                        zIndex: isSelected ? 0 : 22 - i,
                                                                        transform: `rotate(${rotation}deg) translateY(${translateY}px)`
                                                                  }}
                                                            >
                                                                  <div className="w-full h-full transition-all duration-500 animate-mystic-float group-hover/deck-card:-translate-y-24 group-hover/deck-card:scale-110 group-hover/deck-card:rotate-0"
                                                                        style={{ animationDelay: `${i * 100}ms` }}
                                                                  >
                                                                        <TarotCardView isFaceDown={true} className="w-full h-full shadow-2xl rounded-xl border border-amber-500/20" />
                                                                        {/* Aura Glow */}
                                                                        <div className="absolute -inset-12 opacity-0 group-hover/deck-card:opacity-100 transition-all duration-700 pointer-events-none">
                                                                              <div className="absolute inset-0 bg-amber-600/20 blur-3xl animate-pulse" />
                                                                        </div>
                                                                  </div>
                                                            </button>
                                                      )
                                                })}
                                          </div>
                                    </div>
                              )}
                        </div>

                        {/* Solemn Confirmation Modal */}
                        {showConfirmModal && (
                              <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowConfirmModal(false)} />
                                    <div className="relative w-full max-w-lg bg-[#15100d]/90 border border-amber-500/30 rounded-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(217,119,6,0.2)] animate-scale-in overflow-hidden">
                                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                                          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                                          <div className="relative z-10 text-center space-y-8">
                                                <div className="space-y-4">
                                                      <h2 className="text-xl md:text-2xl font-bold text-amber-100 tracking-tight break-keep">당신의 서사(Narrative)가 완성되었습니다.</h2>
                                                      <div className="w-16 h-[1px] bg-amber-500/50 mx-auto" />
                                                </div>

                                                {/* Question Immersion */}
                                                <div className="bg-black/40 rounded-xl p-4 border border-amber-500/10">
                                                      <p className="text-[10px] text-amber-500/60 uppercase tracking-widest mb-1 font-chakra">📝 당신의 질문</p>
                                                      <p className="text-slate-200 text-sm md:text-base font-medium italic">"{question}"</p>
                                                </div>

                                                <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed break-keep">
                                                      "우연히 뽑은 것 같지만, 이 세 장에는 당신이 걸어온 길과 앞으로 나아갈 방향이 담겨 있습니다.<br />
                                                      당신의 선택이 만든 미래를 확인하시겠습니까?"
                                                </p>
                                                <div className="flex flex-col md:flex-row gap-4 pt-2">
                                                      <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-chakra text-xs uppercase tracking-widest">
                                                            다시 선택하고 싶습니다
                                                      </button>
                                                      <button onClick={handleFinalReveal} className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-900 to-amber-700 text-white font-chakra text-xs uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all animate-pulse-slow">
                                                            네, 결과를 마주하겠습니다
                                                      </button>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        )}
                  </div>
            );
      }

      // Result Step
      return (
            <div className="relative min-h-screen py-12 px-4 overflow-hidden">
                  <div className="mystic-bg" />

                  <div className="relative z-10 max-w-6xl mx-auto space-y-16 animate-fade-in-up">
                        {/* Header Navigation */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                              <button onClick={handleReset} className="group flex items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-colors">
                                    <div className="w-8 h-8 rounded-full border border-amber-500/30 flex items-center justify-center group-hover:border-amber-500/80 transition-colors">
                                          <i className="fas fa-arrow-left text-xs"></i>
                                    </div>
                                    <span className="text-xs font-chakra tracking-[0.2em] uppercase">돌아가기</span>
                              </button>
                              <div className="text-center">
                                    <h2 className="text-2xl font-chakra font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 tracking-[0.3em] uppercase drop-shadow-sm">운명의 계시</h2>
                              </div>
                              <button className="text-amber-500/60 hover:text-amber-400 transition-colors">
                                    <i className="fas fa-share-nodes text-xl"></i>
                              </button>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 px-4">
                              {data?.cards.map((card, index) => {
                                    const isRevealed = revealedCards[index];
                                    return (
                                          <div key={index} className="flex flex-col items-center group animate-fade-in-scale" style={{ animationDelay: `${index * 300}ms` }}>
                                                {/* 3D Flip Container */}
                                                <div
                                                      className="relative w-full aspect-[2/3] max-w-[280px] perspective-1000 cursor-pointer"
                                                      onClick={() => {
                                                            if (!isRevealed && flippingIndex === null) {
                                                                  setFlippingIndex(index);
                                                                  setTimeout(() => {
                                                                        const newRevealed = [...revealedCards];
                                                                        newRevealed[index] = true;
                                                                        setRevealedCards(newRevealed);
                                                                        setFlippingIndex(null);
                                                                  }, 1200); // 1.2s delay for solemnity
                                                            }
                                                      }}
                                                >
                                                      <div className={`relative w-full h-full duration-1000 transition-all [transform-style:preserve-3d] ${isRevealed ? '[transform:rotateY(180deg)]' : ''}`}>
                                                            {/* FRONT (Face Down / Card Back) */}
                                                            <div className="absolute inset-0 [backface-visibility:hidden]">
                                                                  <TarotCardView
                                                                        isFaceDown={true}
                                                                        className={`w-full h-full shadow-2xl transition-all duration-700 ${flippingIndex === index ? 'scale-110 blur-md opacity-30 rotate-3' : ''}`}
                                                                  />
                                                                  {/* "What will the result be?" Messenger Overlay */}
                                                                  {flippingIndex === index && (
                                                                        <div className="absolute inset-0 flex items-center justify-center z-30 animate-pulse">
                                                                              <p className="text-xl md:text-2xl font-chakra font-bold tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-b from-amber-100 to-amber-500 drop-shadow-[0_0_15px_rgba(217,119,6,0.6)]">나의 운명은...?</p>
                                                                        </div>
                                                                  )}
                                                            </div>

                                                            {/* BACK (Face Up / Card Front) */}
                                                            <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                                                  <div className="relative w-full h-full">
                                                                        {/* Golden Aura Glow */}
                                                                        <div className="absolute -inset-4 bg-amber-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                                        <TarotCardView
                                                                              card={card.cardInfo}
                                                                              isReversed={card.isReversed}
                                                                              className="w-full h-full shadow-2xl relative z-10"
                                                                              showName={false}
                                                                        />
                                                                  </div>
                                                            </div>
                                                      </div>
                                                </div>

                                                {/* Labels & Name below the card - Dramatically increased margin to prevent overlap */}
                                                <div className="mt-20 text-center space-y-6">
                                                      <div className="flex flex-col items-center">
                                                            <span className="text-amber-500 font-chakra font-bold uppercase tracking-[0.3em] text-sm md:text-base mb-6 drop-shadow-[0_0_15px_rgba(217,119,6,0.5)]">
                                                                  {index === 0 ? '지나온 시간' : index === 1 ? '마주한 현실' : '다가올 운명'}
                                                            </span>
                                                            {isRevealed && (
                                                                  <div className="animate-fade-in-up bg-black/60 backdrop-blur-md px-8 py-3 rounded-full border border-amber-500/30 shadow-2xl inline-flex flex-col items-center min-w-[160px]">
                                                                        <h3 className="text-xl text-white font-chakra font-bold tracking-tight">{card.cardInfo.nameKo}</h3>
                                                                        <p className="text-[10px] text-amber-500/40 uppercase tracking-widest leading-tight mt-1">{card.cardInfo.nameEn}</p>
                                                                  </div>
                                                            )}
                                                      </div>
                                                </div>

                                                {/* MEANING BOX */}
                                                <div className={`mt-6 text-center w-full relative z-20 transition-all duration-700 transform ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                                                      <div className="bg-[#0a0a0f]/80 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-lg transform transition-transform hover:scale-105 duration-300">
                                                            <p className="text-amber-100/90 text-sm leading-relaxed font-light italic">
                                                                  "{card.isReversed ? card.cardInfo.reversedMeaning : card.cardInfo.uprightMeaning}"
                                                            </p>
                                                      </div>
                                                </div>
                                          </div>
                                    );
                              })}
                        </div>

                        {/* Mystic Interpretation */}
                        <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
                              <div className="mystic-panel">
                                    <div className="flex items-center justify-center gap-4 mb-12 text-amber-500 relative">
                                          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-48 h-12 bg-amber-500/5 blur-xl rounded-full" />
                                          <i className="fas fa-stars text-2xl animate-pulse"></i>
                                          <h3 className="text-2xl font-bold font-chakra uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">운명의 조언</h3>
                                          <i className="fas fa-stars text-2xl animate-pulse"></i>
                                    </div>

                                    <div className="prose-mystic max-w-none px-4">
                                          <MarkdownViewer content={data?.aiReading
                                                ?.replace(/\[PAST 위치\]/g, '[과거의 자리]')
                                                ?.replace(/\[PRESENT 위치\]/g, '[현재의 자리]')
                                                ?.replace(/\[FUTURE 위치\]/g, '[미래의 자리]')
                                                || ''}
                                          />
                                    </div>

                                    <div className="mt-12 flex justify-center gap-4">
                                          <button className="px-8 py-3 bg-amber-500 text-black font-bold font-chakra uppercase text-xs tracking-widest rounded hover:bg-amber-400 transition-colors">
                                                <i className="fas fa-bookmark mr-2"></i> 리딩 저장
                                          </button>
                                          <button className="px-8 py-3 border border-amber-500/50 text-amber-500 font-bold font-chakra uppercase text-xs tracking-widest rounded hover:bg-amber-500/10 transition-colors">
                                                <i className="fas fa-share mr-2"></i> 공유하기
                                          </button>
                                    </div>
                              </div>
                        </div>

                        <div className="text-center pt-12 pb-8">
                              <button
                                    onClick={handleReset}
                                    className="text-amber-500/40 hover:text-amber-500 text-xs font-chakra tracking-[0.2em] uppercase transition-colors"
                              >
                                    Start New Reading
                              </button>
                        </div>
                  </div>
            </div>
      );
};

export default ThreeCardReadingPage;
