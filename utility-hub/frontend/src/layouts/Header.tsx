import { useTheme } from '../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
      const { theme, toggleTheme } = useTheme();
      const { isAuthenticated, user, logout } = useAuth();
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
                                          onClick={logout}
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

                        <button
                              onClick={toggleTheme}
                              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-yellow-300 hover:scale-105 active:scale-95"
                              aria-label="Toggle Theme"
                        >
                              {theme === 'light' ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun"></i>}
                        </button>
                  </div>
            </header>
      );
};

export default Header;
