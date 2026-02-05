import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from '../components/ui/ConfirmModal';

const Header = () => {
      const { theme, toggleTheme } = useTheme();
      const { isAuthenticated, user, logout } = useAuth();
      const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
      const location = useLocation();

      const isHome = location.pathname === '/';

      return (
            <header className={classNames(
                  'backdrop-blur-xl rounded-2xl shadow-lg px-6 py-4 flex items-center justify-between transition-all',
                  'bg-white/70 shadow-gray-200/50',
                  'dark:bg-gray-800/60 dark:shadow-gray-900/50 dark:border dark:border-white/5'
            )}>

                  {/* Logo / Back Button */}
                  <div className="flex items-center gap-4">
                        {!isHome && (
                              <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                    <i className="fa-solid fa-arrow-left text-gray-600 dark:text-gray-300"></i>
                              </Link>
                        )}
                        <Link to="/" className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                    <i className="fa-solid fa-layer-group"></i>
                              </div>
                              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 hidden sm:block">
                                    Utility Hub
                              </span>
                        </Link>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                              <div className="flex items-center gap-2">
                                    <Link
                                          to="/mypage"
                                          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                {user?.nickname?.charAt(0)}
                                          </div>
                                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {user?.nickname}
                                          </span>
                                    </Link>
                                    <button
                                          onClick={() => setIsLogoutModalOpen(true)}
                                          className="text-sm text-gray-400 hover:text-red-500 transition-colors px-2 underline underline-offset-4"
                                    >
                                          로그아웃
                                    </button>
                              </div>
                        ) : (
                              <Link
                                    to="/login"
                                    state={{ from: location }}
                                    className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
                              >
                                    로그인
                              </Link>
                        )}

                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                        {/* Theme Toggle Segmented Control */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 border border-gray-200 dark:border-gray-700">
                              <button
                                    onClick={() => theme === 'dark' && toggleTheme()}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${theme === 'light'
                                          ? 'bg-white shadow-sm text-amber-500 scale-100'
                                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                          }`}
                                    aria-label="Light Mode"
                              >
                                    <i className="fa-solid fa-sun"></i>
                              </button>
                              <button
                                    onClick={() => theme === 'light' && toggleTheme()}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${theme === 'dark'
                                          ? 'bg-gray-700 shadow-sm text-yellow-300 scale-100'
                                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                          }`}
                                    aria-label="Dark Mode"
                              >
                                    <i className="fa-solid fa-moon"></i>
                              </button>
                        </div>
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
                        isDanger={false}
                  />
            </header>
      );
};

export default Header;
