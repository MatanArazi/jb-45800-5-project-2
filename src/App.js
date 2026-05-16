import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RealtimeReportPage from './pages/RealtimeReportPage';
import AiRecommendationPage from './pages/AiRecommendationPage';
import AboutPage from './pages/AboutPage';
const App = () => {
    return (_jsxs("div", { className: "app-shell", children: [_jsx(Navbar, {}), _jsx("main", { className: "main-content", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/reports", element: _jsx(RealtimeReportPage, {}) }), _jsx(Route, { path: "/ai", element: _jsx(AiRecommendationPage, {}) }), _jsx(Route, { path: "/about", element: _jsx(AboutPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) })] }));
};
export default App;
