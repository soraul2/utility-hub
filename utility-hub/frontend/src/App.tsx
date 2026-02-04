import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Pomodoro from './pages/tools/Pomodoro';
import MulchingFilm from './pages/tools/MulchingFilm';
import TextToMd from './pages/tools/TextToMd';
import PhoneCost from './pages/tools/PhoneCost/PhoneCost';
import TarotLayout from './layouts/TarotLayout';
import TarotHome from './pages/tarot/TarotHome';
import DailyCardPage from './pages/tarot/DailyCardPage';
import ThreeCardReadingPage from './pages/tarot/ThreeCardReadingPage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import MyPage from './pages/MyPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
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
          <Route path="*" element={<Navigate to="/tarot" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
