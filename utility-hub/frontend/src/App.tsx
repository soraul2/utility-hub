import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Pomodoro from './pages/tools/Pomodoro';
import MulchingFilm from './pages/tools/MulchingFilm';
import TextToMd from './pages/tools/TextToMd';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tools">
            <Route path="pomodoro" element={<Pomodoro />} />
            <Route path="mulching-film" element={<MulchingFilm />} />
            <Route path="text-to-md" element={<TextToMd />} />
          </Route>
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
