import React from 'react';
import classNames from 'classnames';
import type { Persona } from './types';

interface PersonaSelectorProps {
      selectedPersona: Persona;
      onSelect: (persona: Persona) => void;
      disabled?: boolean;
}

const PERSONAS: { id: Persona; icon: string; label: string; desc: string }[] = [
      { id: 'STANDARD', icon: '📄', label: 'Standard', desc: '표준 마크다운, 중립적 어조' },
      { id: 'SMART', icon: '🧠', label: 'Smart', desc: '친절한 비서, 요약 포함' },
      { id: 'DRY', icon: '😐', label: 'Dry', desc: '건조한 팩트 중심, 명사형 종결' },
      { id: 'ACADEMIC', icon: '🎓', label: 'Academic', desc: '학술적 논문 스타일' },
      { id: 'CASUAL', icon: '😎', label: 'Casual', desc: '편안한 말투, 이모지 다수' },
      { id: 'TECHNICAL', icon: '💻', label: 'Technical', desc: '기술 문서, 코드 블록 강조' },
      { id: 'CREATIVE', icon: '🎨', label: 'Creative', desc: '감성적 표현, 비유 사용' },
      { id: 'MINIMAL', icon: '⚡', label: 'Minimal', desc: '핵심만 추출, 불렛 포인트' },
      { id: 'DETAILED', icon: '🔍', label: 'Detailed', desc: '상세 가이드, 풍부한 설명' },
      { id: 'BUSINESS', icon: '💼', label: 'Business', desc: '비즈니스, 액션 아이템 중심' },
];

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ selectedPersona, onSelect, disabled }) => {
      return (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {PERSONAS.map((p) => (
                        <button
                              key={p.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => onSelect(p.id)}
                              className={classNames(
                                    "relative p-3 rounded-xl border text-left transition-all duration-200 group",
                                    selectedPersona === p.id
                                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md scale-[1.02]"
                                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-sm"
                              )}
                        >
                              <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{p.icon}</span>
                                    <span
                                          className={classNames(
                                                "font-bold text-sm",
                                                selectedPersona === p.id ? "text-purple-700 dark:text-purple-300" : "text-slate-700 dark:text-slate-200"
                                          )}
                                    >
                                          {p.label}
                                    </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 group-hover:line-clamp-none transition-all">
                                    {p.desc}
                              </p>

                              {selectedPersona === p.id && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                              )}
                        </button>
                  ))}
            </div>
      );
};

export default PersonaSelector;
