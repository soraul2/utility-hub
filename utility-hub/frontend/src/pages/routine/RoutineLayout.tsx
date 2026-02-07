import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/routine/Layout/Header';
import { useAuth } from '../../hooks/useAuth';
import OnboardingModal from '../../components/onboarding/OnboardingModal';

const RoutineLayout = () => {
      const { user, restoreSession } = useAuth();
      const [onboardingDismissed, setOnboardingDismissed] = useState(false);

      const showOnboarding = !!user && !user.onboardingCompleted && !onboardingDismissed;

      const handleOnboardingComplete = () => {
            setOnboardingDismissed(true);
            restoreSession();
      };

      return (
            <div className="min-h-screen bg-mystic-bg font-sans text-mystic-text flex flex-col transition-colors duration-300">
                  <div id="theme-bg-pattern" className="fixed inset-0 z-0 pointer-events-none transition-all duration-500" />
                  <Header />
                  <main className="flex-1 pt-20 relative z-10">
                        <div className="min-h-full transition-colors duration-300">
                              <Outlet />
                        </div>
                  </main>

                  <OnboardingModal
                        isOpen={showOnboarding}
                        nickname={user?.nickname || ''}
                        onComplete={handleOnboardingComplete}
                  />
            </div>
      );
};

export default RoutineLayout;
