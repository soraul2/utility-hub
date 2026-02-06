import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import ConfirmModal from '../components/ui/ConfirmModal';

const TarotLayout: React.FC = () => {
      const { isAuthenticated, user, logout } = useAuth();
      const { theme, toggleTheme } = useTheme();
      const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
      const location = useLocation();

      return (
            <div className="min-h-screen text-slate-100 relative overflow-hidden font-sans transition-colors duration-500"
                  style={{ backgroundColor: 'var(--mystic-bg-primary)', color: 'var(--mystic-text-primary)' }}>

                  {/* Background Effects */}
                  <div className="mystic-bg" />
                  <div className="absolute inset-0 z-0 pointer-events-none">
                        {/* Dynamic Gradient Background */}
                        <div className="absolute top-0 left-0 w-full h-full transition-opacity duration-1000 opacity-100 dark:opacity-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent"></div>

                        {/* Sun/Moon Glow Effects */}
                        <div className="absolute top-[20%] left-[20%] w-72 h-72 rounded-full blur-[100px] transition-colors duration-700 bg-amber-400/10 dark:bg-purple-600/10"></div>
                        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 rounded-full blur-[100px] transition-colors duration-700 bg-orange-300/10 dark:bg-blue-600/10"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col min-h-screen">
                        <header className="p-4 border-b transition-colors duration-500 border-black/5 dark:border-white/10 backdrop-blur-md bg-white/30 dark:bg-black/20">
                              <div className="container mx-auto flex items-center justify-between">
                                    <Link to="/tarot" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-800 dark:from-purple-200 dark:to-blue-200" style={{ fontFamily: '"Chakra Petch", sans-serif' }}>
                                          Mystic Tarot
                                    </Link>
                                    <div className="flex items-center gap-4">
                                          {/* Theme Toggle Button */}
                                          <button
                                                onClick={toggleTheme}
                                                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-amber-600 dark:text-purple-300"
                                                title={theme === 'dark' ? "Switch to Celestial Mode" : "Switch to Abyss Mode"}
                                          >
                                                {theme === 'dark' ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
                                          </button>

                                          {isAuthenticated ? (
                                                <>
                                                      <Link to="/tarot/history" className="text-sm text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mr-2">
                                                            <i className="fas fa-history mr-1"></i>
                                                            운명 기록
                                                      </Link>
                                                      <span className="text-sm text-slate-600 dark:text-slate-300 transition-colors">
                                                            <i className="fas fa-user mr-1"></i>
                                                            {user?.nickname}
                                                      </span>
                                                      <button
                                                            onClick={() => setIsLogoutModalOpen(true)}
                                                            className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                                                      >
                                                            로그아웃
                                                      </button>
                                                </>
                                          ) : (
                                                <Link
                                                      to="/login"
                                                      state={{ from: location }}
                                                      className="px-4 py-1.5 rounded-lg bg-amber-500/80 hover:bg-amber-600 dark:bg-purple-600/80 dark:hover:bg-purple-600 text-white text-sm font-medium transition-colors"
                                                >
                                                      로그인
                                                </Link>
                                          )}
                                          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                                                <i className="fas fa-home mr-1"></i>메인으로
                                          </Link>
                                    </div>
                              </div>
                        </header>

                        <main className="flex-grow container mx-auto p-4 md:p-8">
                              <Outlet />
                        </main>

                        <footer className="p-4 text-center text-sm border-t transition-colors duration-500 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-500">
                              <p>© 2024 Mystic Tarot - AI Powered Reading</p>
                              <p className="text-xs mt-1 text-slate-400 dark:text-slate-600">이 리딩은 참고용 조언이며, 중요한 결정은 전문가와 상의하세요.</p>
                        </footer>
                  </div>

                  {/* 로그아웃 확인 모달 */}
                  <ConfirmModal
                        isOpen={isLogoutModalOpen}
                        onClose={() => setIsLogoutModalOpen(false)}
                        onConfirm={logout}
                        title="로그아웃 확인"
                        message="정말로 로그아웃 하시겠습니까?"
                        confirmLabel="로그아웃"
                        cancelLabel="취소"
                        variant="mystic"
                  />
            </div>
      );
};

export default TarotLayout;
