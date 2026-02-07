import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, CalendarDays, Download, ListTodo, ArrowRight, Rocket, Clock, Save, Layers } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

interface OnboardingModalProps {
      isOpen: boolean;
      nickname: string;
      onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, nickname, onComplete }) => {
      const [step, setStep] = useState(0);
      const [mounted, setMounted] = useState(false);

      useEffect(() => {
            setMounted(true);
            return () => setMounted(false);
      }, []);

      if (!isOpen || !mounted) return null;

      const handleComplete = async () => {
            try {
                  await axiosInstance.post('/user/onboarding/complete');
            } catch {
                  // silently continue
            }
            onComplete();
      };

      const workflowSteps = [
            { icon: ListTodo, title: '태스크 추가', desc: '하단 입력창에서 오늘 할 일을 추가하세요', color: 'indigo' },
            { icon: Clock, title: '타임라인 배치', desc: '태스크를 시간대에 배치해 하루 일정을 구성하세요', color: 'violet' },
            { icon: Save, title: '템플릿 저장', desc: '완성된 계획을 템플릿으로 저장해 재사용하세요', color: 'emerald' },
            { icon: Layers, title: '배치 적용', desc: '월간 캘린더에서 템플릿을 여러 날짜에 한번에 적용하세요', color: 'amber' },
      ];

      const features = [
            { icon: ListTodo, title: '일일 계획', desc: '태스크를 시간대별로 배치하고 집중 모드로 실행하세요', color: 'indigo' },
            { icon: CalendarDays, title: '월간 캘린더', desc: '한 달의 계획을 한눈에 보고 배치 적용하세요', color: 'emerald' },
            { icon: Download, title: 'ICS 내보내기', desc: 'Google/Naver 캘린더에 일정을 가져올 수 있어요', color: 'amber' },
      ];

      const getColorClasses = (color: string) => ({
            bg: color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                  color === 'violet' ? 'bg-violet-100 dark:bg-violet-900/30' :
                  color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  'bg-amber-100 dark:bg-amber-900/30',
            text: color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
                  color === 'violet' ? 'text-violet-600 dark:text-violet-400' :
                  color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                  'text-amber-600 dark:text-amber-400',
      });

      return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 overflow-hidden font-sans">
                  {/* Backdrop */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

                  {/* Modal */}
                  <div className="relative w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden animate-fade-in-up">
                        {/* Decorative blurs */}
                        <div className="absolute -top-16 -right-16 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl" />
                        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                        {/* Progress indicator */}
                        <div className="flex gap-1.5 px-8 pt-6">
                              {[0, 1, 2].map(i => (
                                    <div
                                          key={i}
                                          className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                                                i <= step ? 'mystic-solid' : 'bg-gray-200 dark:bg-gray-700'
                                          }`}
                                    />
                              ))}
                        </div>

                        <div className="p-8">
                              {/* Step 0: Welcome */}
                              {step === 0 && (
                                    <div className="text-center">
                                          <div className="w-20 h-20 mystic-gradient-br rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-indigo-500/10 shadow-lg">
                                                <Sparkles className="w-9 h-9 text-white" />
                                          </div>
                                          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                                                환영합니다, {nickname}님!
                                          </h2>
                                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                                                루틴 허브와 함께 하루를 계획하고<br />
                                                더 나은 습관을 만들어 보세요.
                                          </p>
                                          <button
                                                onClick={() => setStep(1)}
                                                className="w-full py-4 mystic-solid mystic-solid-hover text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                                          >
                                                시작하기
                                                <ArrowRight className="w-4 h-4" />
                                          </button>
                                    </div>
                              )}

                              {/* Step 1: Workflow Guide */}
                              {step === 1 && (
                                    <div>
                                          <div className="text-center mb-5">
                                                <h2 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                                                      이렇게 사용해요
                                                </h2>
                                                <p className="text-xs text-gray-400">
                                                      나만의 루틴을 만들고 반복 적용하세요
                                                </p>
                                          </div>

                                          <div className="space-y-2.5">
                                                {workflowSteps.map((s, i) => {
                                                      const colors = getColorClasses(s.color);
                                                      return (
                                                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                                                  <div className="flex items-center gap-2.5 shrink-0">
                                                                        <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black text-gray-500 dark:text-gray-400">
                                                                              {i + 1}
                                                                        </span>
                                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg}`}>
                                                                              <s.icon className={`w-4 h-4 ${colors.text}`} />
                                                                        </div>
                                                                  </div>
                                                                  <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{s.title}</p>
                                                                        <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">{s.desc}</p>
                                                                  </div>
                                                            </div>
                                                      );
                                                })}
                                          </div>

                                          <button
                                                onClick={() => setStep(2)}
                                                className="w-full mt-5 py-3.5 mystic-solid mystic-solid-hover text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                                          >
                                                다음
                                                <ArrowRight className="w-4 h-4" />
                                          </button>
                                    </div>
                              )}

                              {/* Step 2: Feature Introduction */}
                              {step === 2 && (
                                    <div>
                                          <div className="text-center mb-5">
                                                <h2 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                                                      주요 기능 소개
                                                </h2>
                                                <p className="text-xs text-gray-400">
                                                      루틴 허브로 이런 것들을 할 수 있어요
                                                </p>
                                          </div>

                                          <div className="space-y-3 mb-6">
                                                {features.map((f, i) => {
                                                      const colors = getColorClasses(f.color);
                                                      return (
                                                            <div key={i} className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
                                                                        <f.icon className={`w-5 h-5 ${colors.text}`} />
                                                                  </div>
                                                                  <div>
                                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{f.title}</p>
                                                                        <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">{f.desc}</p>
                                                                  </div>
                                                            </div>
                                                      );
                                                })}
                                          </div>

                                          <button
                                                onClick={handleComplete}
                                                className="w-full py-4 mystic-solid mystic-solid-hover text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                                          >
                                                <Rocket className="w-4 h-4" />
                                                시작하기
                                          </button>
                                    </div>
                              )}
                        </div>
                  </div>
            </div>,
            document.body
      );
};

export default OnboardingModal;
