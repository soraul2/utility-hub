import React from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';

const Sidebar: React.FC = () => {
      const navItems = [
            { to: '/', icon: 'fa-solid fa-home', label: 'Dashboard' },
            { to: '/tools/pomodoro', icon: 'fa-regular fa-clock', label: 'Pomodoro' },
            { to: '/tools/mulching-film', icon: 'fa-solid fa-seedling', label: 'Mulching Film' },
            { to: '/tools/text-to-md', icon: 'fa-brands fa-markdown', label: 'Text to MD' },
      ];

      return (
            <aside className="w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col z-10 transition-colors duration-300">
                  <div className="h-14 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-xl font-bold text-primary flex items-center gap-2">
                              <i className="fa-solid fa-layer-group"></i>
                              <span>Utility Hub</span>
                        </div>
                  </div>

                  <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1 px-3">
                              {navItems.map((item) => (
                                    <li key={item.to}>
                                          <NavLink
                                                to={item.to}
                                                className={({ isActive }) =>
                                                      classNames(
                                                            'flex items-center gap-3 px-3 py-2.5 rounded transition-colors duration-200',
                                                            isActive
                                                                  ? 'bg-primary/10 text-primary font-medium'
                                                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                                                      )
                                                }
                                          >
                                                <i className={classNames(item.icon, 'w-5 text-center')}></i>
                                                {item.label}
                                          </NavLink>
                                    </li>
                              ))}
                        </ul>

                        <div className="px-6 py-4 mt-4">
                              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    External
                              </div>
                              <a
                                    href="#"
                                    className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                              >
                                    <i className="fa-solid fa-circle-question w-5 text-center"></i>
                                    FeedBack
                              </a>
                        </div>
                  </nav>

                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 text-center">
                        v0.1.0 &copy; 2026
                  </div>
            </aside>
      );
};

export default Sidebar;
