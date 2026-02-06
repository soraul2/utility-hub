import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Archive, BarChart2, LogOut, User, ChevronDown, LayoutGrid, Menu, X, CalendarDays } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import classNames from 'classnames';

const Header = () => {
      const location = useLocation();
      const navigate = useNavigate();
      const { user, logout, isAuthenticated } = useAuth();
      const { theme, toggleTheme } = useTheme();
      const [isProfileOpen, setIsProfileOpen] = useState(false);
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
      const profileRef = useRef<HTMLDivElement>(null);

      // 프로필 드롭다운 외부 클릭 감지
      useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                  if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                        setIsProfileOpen(false);
                  }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
      }, []);

      // 모바일 메뉴 열릴 때 바디 스크롤 방지
      useEffect(() => {
            if (isMobileMenuOpen) {
                  document.body.style.overflow = 'hidden';
            } else {
                  document.body.style.overflow = 'unset';
            }
      }, [isMobileMenuOpen]);

      const handleLogout = () => {
            logout();
            navigate('/');
      };

      // 유저 이니셜 생성
      const getInitials = (name: string) => {
            return name.slice(0, 2).toUpperCase();
      };

      const menuItems = [
            { path: '/routine/daily-plan', label: '오늘의 계획', icon: Calendar },
            { path: '/routine/reflection', label: '하루 회고', icon: BookOpen },
            { path: '/routine/weekly', label: '주간 회고', icon: BarChart2 },
            { path: '/routine/monthly', label: '월간 캘린더', icon: CalendarDays },
            { path: '/routine/archive', label: '기록 보관소', icon: Archive },
      ];

      return (
            <div className="contents">
                  <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50 px-4 md:px-8 transition-colors">
                        <div className="h-full flex items-center justify-between">
                              <div className="flex items-center gap-4 md:gap-12">
                                    <Link to="/routine/daily-plan" className="hover:opacity-80 transition-opacity">
                                          <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
                                                Routine Hub
                                          </h1>
                                    </Link>

                                    <nav className="hidden lg:flex items-center gap-1">
                                          {menuItems.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = location.pathname.startsWith(item.path);

                                                return (
                                                      <Link
                                                            key={item.path}
                                                            to={item.path}
                                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-300 group ${isActive
                                                                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                                                                  }`}
                                                      >
                                                            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-900'}`} />
                                                            <span className={`text-sm font-bold ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                                                  {item.label}
                                                            </span>
                                                      </Link>
                                                );
                                          })}
                                    </nav>
                              </div>

                              <div className="flex items-center gap-2 md:gap-4">
                                    {/* Desktop Controls */}
                                    <div className="hidden md:flex items-center gap-2">
                                          {/* Theme Toggle */}
                                          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 border border-gray-200 dark:border-gray-700">
                                                <button
                                                      onClick={() => theme === 'dark' && toggleTheme()}
                                                      className={classNames(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                            theme === 'light'
                                                                  ? "bg-white dark:bg-gray-700 shadow-sm text-amber-500"
                                                                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                      )}
                                                      aria-label="Light Mode"
                                                >
                                                      <Sun className="w-4 h-4" />
                                                </button>
                                                <button
                                                      onClick={() => theme === 'light' && toggleTheme()}
                                                      className={classNames(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                            theme === 'dark'
                                                                  ? "bg-gray-700 dark:bg-indigo-600 shadow-sm text-yellow-300"
                                                                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                      )}
                                                      aria-label="Dark Mode"
                                                >
                                                      <Moon className="w-4 h-4" />
                                                </button>
                                          </div>

                                          <Link
                                                to="/"
                                                className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-100 dark:hover:border-indigo-900/30 group"
                                                title="Utility Hub로 돌아가기"
                                          >
                                                <LayoutGrid className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                          </Link>
                                    </div>

                                    {/* Mobile Menu Toggle */}
                                    <button
                                          onClick={() => setIsMobileMenuOpen(true)}
                                          className="flex lg:hidden p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                    >
                                          <Menu className="w-6 h-6" />
                                    </button>

                                    {/* Profile Dropdown (Desktop Only or Mini version for mobile) */}
                                    <div className="hidden md:block relative" ref={profileRef}>
                                          <button
                                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                                className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                                          >
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none">
                                                      {user ? getInitials(user.nickname) : <User className="w-5 h-5" />}
                                                </div>
                                                {isAuthenticated && (
                                                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                                )}
                                          </button>

                                          {/* Dropdown Menu */}
                                          {isProfileOpen && isAuthenticated && (
                                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-gray-100 dark:border-gray-800">
                                                            <div className="flex items-center gap-3">
                                                                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none">
                                                                        {user ? getInitials(user.nickname) : '?'}
                                                                  </div>
                                                                  <div className="flex-1 min-w-0">
                                                                        <p className="font-bold text-gray-900 dark:text-white truncate">
                                                                              {user?.nickname || '사용자'}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                              {user?.email || `${user?.provider} 계정`}
                                                                        </p>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                      <div className="p-2">
                                                            <Link
                                                                  to="/mypage"
                                                                  onClick={() => setIsProfileOpen(false)}
                                                                  className="flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                                            >
                                                                  <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                                  <span className="text-sm font-medium">마이페이지</span>
                                                            </Link>
                                                            <button
                                                                  onClick={handleLogout}
                                                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                                                            >
                                                                  <LogOut className="w-4 h-4" />
                                                                  <span className="text-sm font-medium">로그아웃</span>
                                                            </button>
                                                      </div>
                                                </div>
                                          )}
                                    </div>
                              </div>
                        </div>
                  </header>

                  {/* Mobile Sidebar Navigation */}
                  <div className={classNames(
                        "fixed inset-0 z-[100] lg:hidden transition-opacity duration-300",
                        isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                  )}>
                        {/* Backdrop */}
                        <div
                              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                              onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Sidebar Content */}
                        <aside className={classNames(
                              "absolute right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col",
                              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                        )}>
                              {/* Sidebar Header */}
                              <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none">
                                                {user ? getInitials(user.nickname) : <User className="w-5 h-5" />}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-white truncate text-sm">
                                                      {user?.nickname || '사용자'}님
                                                </p>
                                          </div>
                                    </div>
                                    <button
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                          <X className="w-5 h-5" />
                                    </button>
                              </div>

                              {/* Navigation Links */}
                              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    <p className="px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Navigation</p>
                                    {menuItems.map((item) => {
                                          const Icon = item.icon;
                                          const isActive = location.pathname.startsWith(item.path);

                                          return (
                                                <Link
                                                      key={item.path}
                                                      to={item.path}
                                                      onClick={() => setIsMobileMenuOpen(false)}
                                                      className={classNames(
                                                            "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                                                            isActive
                                                                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                      )}
                                                >
                                                      <Icon className="w-5 h-5" />
                                                      <span>{item.label}</span>
                                                </Link>
                                          );
                                    })}

                                    <div className="my-6 border-t border-gray-100 dark:border-gray-800 pt-6" />

                                    <p className="px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Settings</p>

                                    {/* Mobile Theme Toggle */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">다크 모드</span>
                                          <button
                                                onClick={toggleTheme}
                                                className={classNames(
                                                      "w-12 h-6 rounded-full relative transition-colors duration-300",
                                                      theme === 'dark' ? "bg-indigo-600" : "bg-gray-300"
                                                )}
                                          >
                                                <div className={classNames(
                                                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 flex items-center justify-center",
                                                      theme === 'dark' ? "left-7" : "left-1"
                                                )}>
                                                      {theme === 'dark' ? <Moon className="w-2.5 h-2.5 text-indigo-600" /> : <Sun className="w-2.5 h-2.5 text-amber-500" />}
                                                </div>
                                          </button>
                                    </div>

                                    <Link
                                          to="/"
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-bold transition-all"
                                    >
                                          <LayoutGrid className="w-5 h-5" />
                                          <span>Utility HubHome</span>
                                    </Link>
                              </div>

                              {/* Sidebar Footer */}
                              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                          onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                          }}
                                          className="flex items-center gap-3 w-full px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl font-bold transition-all transition-colors"
                                    >
                                          <LogOut className="w-5 h-5" />
                                          <span>로그아웃</span>
                                    </button>
                              </div>
                        </aside>
                  </div>
            </div>
      );
};

export default Header;
