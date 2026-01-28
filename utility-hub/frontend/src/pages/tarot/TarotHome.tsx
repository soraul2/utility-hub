import React from 'react';
import { Link } from 'react-router-dom';

const TarotHome: React.FC = () => {
      return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
                  <div className="space-y-4 animate-fade-in-up">
                        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-200 via-blue-100 to-purple-200" style={{ fontFamily: '"Chakra Petch", sans-serif' }}>
                              Mystic Tarot
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                              별들의 속삭임을 들어보세요. 당신의 운명을 비추는 신비로운 여정이 시작됩니다.
                        </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
                        <Link to="/tarot/daily" className="group relative p-8 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm overflow-hidden">
                              <div className="absolute inset-0 bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors"></div>
                              <div className="relative z-10 space-y-4">
                                    <div className="text-5xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity">🌙</div>
                                    <h2 className="text-2xl font-bold text-white">오늘의 카드</h2>
                                    <p className="text-slate-400 group-hover:text-slate-200">
                                          하루의 에너지를 확인하고<br />지혜로운 조언을 얻으세요.
                                    </p>
                              </div>
                        </Link>

                        <Link to="/tarot/three-cards" className="group relative p-8 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm overflow-hidden">
                              <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors"></div>
                              <div className="relative z-10 space-y-4">
                                    <div className="text-5xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity">✨</div>
                                    <h2 className="text-2xl font-bold text-white">3카드 스프레드</h2>
                                    <p className="text-slate-400 group-hover:text-slate-200">
                                          과거, 현재, 미래를 통해<br />깊이 있는 통찰을 경험하세요.
                                    </p>
                              </div>
                        </Link>
                  </div>
            </div>
      );
};

export default TarotHome;
