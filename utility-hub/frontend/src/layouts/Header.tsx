import { useTheme } from '../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';

const Header = () => {
      const { theme, toggleTheme } = useTheme();
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
                  <div className="flex items-center gap-2">
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
