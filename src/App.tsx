import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RealtimeReportPage from './pages/RealtimeReportPage';
import AiRecommendationPage from './pages/AiRecommendationPage';
import AboutPage from './pages/AboutPage';

const App = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports" element={<RealtimeReportPage />} />
          <Route path="/ai" element={<AiRecommendationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
