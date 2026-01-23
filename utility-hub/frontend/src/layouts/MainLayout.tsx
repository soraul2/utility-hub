import { Outlet } from 'react-router-dom';
// import { useTheme } from '../context/ThemeContext';
import classNames from 'classnames';
import Header from './Header';

const MainLayout = () => {
      // const { theme } = useTheme();

      return (
            <div className={classNames(
                  'min-h-screen w-full transition-colors duration-500 font-sans',
                  'bg-gradient-to-br from-gray-50 to-gray-100',
                  'dark:from-gray-900 dark:to-gray-800'
            )}>
                  <div className="max-w-7xl mx-auto min-h-screen flex flex-col">
                        {/* Floating Header */}
                        <div className="sticky top-0 z-50 p-4">
                              <Header />
                        </div>

                        {/* Main Content Area */}
                        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                              <div className="max-w-5xl mx-auto">
                                    <Outlet />
                              </div>
                        </main>

                        <footer className="p-6 text-center text-sm text-gray-400 dark:text-gray-600">
                              Utility Hub v0.2 © 2026
                        </footer>
                  </div>
            </div>
      );
};

export default MainLayout;
