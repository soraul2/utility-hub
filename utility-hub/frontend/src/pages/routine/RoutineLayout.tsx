import { Outlet } from 'react-router-dom';
import Header from '../../components/routine/Layout/Header';

const RoutineLayout = () => {
      return (
            <div className="min-h-screen bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
                  <Header />
                  <main className="flex-1 pt-20">
                        <div className="min-h-full bg-white dark:bg-gray-950 transition-colors duration-300">
                              <Outlet />
                        </div>
                  </main>
            </div>
      );
};

export default RoutineLayout;
