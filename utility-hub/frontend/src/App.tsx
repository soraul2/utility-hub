import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import TarotLayout from './layouts/TarotLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoutineLayout from './pages/routine/RoutineLayout';

// Lazy-loaded pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const AuthCallbackPage = React.lazy(() => import('./pages/AuthCallbackPage'));
const MyPage = React.lazy(() => import('./pages/MyPage'));

const Pomodoro = React.lazy(() => import('./pages/tools/Pomodoro'));
const MulchingFilm = React.lazy(() => import('./pages/tools/MulchingFilm'));
const TextToMd = React.lazy(() => import('./pages/tools/TextToMd'));
const PhoneCost = React.lazy(() => import('./pages/tools/PhoneCost/PhoneCost'));

const TarotHome = React.lazy(() => import('./pages/tarot/TarotHome'));
const DailyCardPage = React.lazy(() => import('./pages/tarot/DailyCardPage'));
const ThreeCardReadingPage = React.lazy(() => import('./pages/tarot/ThreeCardReadingPage'));
const TarotHistoryPage = React.lazy(() => import('./pages/tarot/TarotHistoryPage'));
const TarotSharePage = React.lazy(() => import('./pages/tarot/TarotSharePage'));

const DailyPlanPage = React.lazy(() => import('./pages/routine/DailyPlanPage'));
const MonthlyCalendarPage = React.lazy(() => import('./pages/routine/MonthlyCalendarPage'));
const WeeklyReviewPage = React.lazy(() =>
  import('./pages/routine/WeeklyReviewPage').then(m => ({ default: m.WeeklyReviewPage }))
);
const ReflectionPage = React.lazy(() => import('./pages/routine/ReflectionPage'));
const ArchivePage = React.lazy(() => import('./pages/routine/ArchivePage'));
const ThemeShopPage = React.lazy(() => import('./pages/shop/ThemeShopPage'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            {/* 마이페이지 (로그인 필요) */}
            <Route element={<ProtectedRoute />}>
              <Route path="mypage" element={<MyPage />} />
            </Route>
            <Route path="tools">
              <Route path="pomodoro" element={<Pomodoro />} />
              <Route path="mulching-film" element={<MulchingFilm />} />
              <Route path="text-to-md" element={<TextToMd />} />
              <Route path="phone-cost" element={<PhoneCost />} />
            </Route>
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* Tarot Routes */}
          <Route path="/tarot" element={<TarotLayout />}>
            <Route index element={<TarotHome />} />
            <Route path="daily" element={<DailyCardPage />} />
            <Route path="three-cards" element={<ThreeCardReadingPage />} />
            <Route path="history" element={<TarotHistoryPage />} />
            <Route path="share/:shareUuid" element={<TarotSharePage />} />
            <Route path="*" element={<Navigate to="/tarot" replace />} />
          </Route>

          {/* Routine Routes (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/routine" element={<RoutineLayout />}>
              <Route index element={<Navigate to="daily-plan" replace />} />
              <Route path="daily-plan" element={<DailyPlanPage />} />
              <Route path="daily-plan/:date" element={<DailyPlanPage />} />
              <Route path="monthly" element={<MonthlyCalendarPage />} />
              <Route path="weekly" element={<WeeklyReviewPage />} />
              <Route path="reflection" element={<ReflectionPage />} />
              <Route path="archive" element={<ArchivePage />} />
              <Route path="shop" element={<ThemeShopPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
