import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../../hooks/useAuth';
import ConfirmModal from '../../components/ui/ConfirmModal';

const TarotHome: React.FC = () => {
      const { isAuthenticated } = useAuthStatus();
      const navigate = useNavigate();
      const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

      const handleHistoryClick = (e: React.MouseEvent) => {
            if (!isAuthenticated) {
                  e.preventDefault();
                  setIsLoginModalOpen(true);
            }
      };
      return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
                  <div className="space-y-4 animate-fade-in-up">
                        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-purple-200 dark:via-blue-100 dark:to-purple-200" style={{ fontFamily: '"Chakra Petch", sans-serif' }}>
                              Mystic Tarot
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium transition-colors">
                              별들의 속삭임을 들어보세요. 당신의 운명을 비추는 신비로운 여정이 시작됩니다.
                        </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
                        <Link to="/tarot/daily" className="group relative p-8 rounded-2xl bg-white/60 dark:bg-gradient-to-br dark:from-gray-900/80 dark:to-purple-900/80 border border-slate-200 dark:border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 backdrop-blur-md overflow-hidden shadow-lg dark:shadow-purple-900/20">
                              <div className="absolute inset-0 bg-purple-500/5 dark:bg-purple-500/10 group-hover:bg-purple-500/10 dark:group-hover:bg-purple-500/20 transition-colors"></div>
                              <div className="relative z-10 space-y-4">
                                    <div className="text-5xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md">🌙</div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">오늘의 카드</h2>
                                    <p className="text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors font-medium">
                                          하루의 에너지를 확인하고<br />지혜로운 조언을 얻으세요.
                                    </p>
                              </div>
                        </Link>

                        <Link to="/tarot/three-cards" className="group relative p-8 rounded-2xl bg-white/60 dark:bg-gradient-to-br dark:from-gray-900/80 dark:to-blue-900/80 border border-slate-200 dark:border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 backdrop-blur-md overflow-hidden shadow-lg dark:shadow-blue-900/20">
                              <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10 group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 transition-colors"></div>
                              <div className="relative z-10 space-y-4">
                                    <div className="text-5xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md">✨</div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">3카드 스프레드</h2>
                                    <p className="text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors font-medium">
                                          과거, 현재, 미래를 통해<br />깊이 있는 통찰을 경험하세요.
                                    </p>
                              </div>
                        </Link>
                  </div>

                  <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                        <Link
                              to="/tarot/history"
                              onClick={handleHistoryClick}
                              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all hover:bg-slate-200 dark:hover:bg-white/10"
                        >
                              <i className="fas fa-history text-xs"></i>
                              <span className="text-sm font-chakra font-bold tracking-wider uppercase">운명의 기록 보기</span>
                        </Link>
                  </div>

                  <ConfirmModal
                        isOpen={isLoginModalOpen}
                        onClose={() => setIsLoginModalOpen(false)}
                        onConfirm={() => navigate('/login', { state: { from: { pathname: '/tarot/history' } } })}
                        title="운명의 기록을 남기시겠습니까?"
                        message="로그인하시면 당신이 마주한 신비로운 운명들을 기록 보관소에 소중히 간직할 수 있습니다. 지금 로그인하시겠습니까?"
                        confirmText="로그인하러 가기"
                        cancelText="나중에 할게요"
                        variant="warning"
                  />
            </div>
      );
};

export default TarotHome;
