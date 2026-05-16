import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setSearchQuery } from '../features/coins/coinsSlice';
const Navbar = () => {
    const dispatch = useAppDispatch();
    const searchQuery = useAppSelector((state) => state.coins.selection.searchQuery);
    return (_jsxs("header", { className: "navbar", children: [_jsxs("div", { className: "navbar-brand", children: [_jsx("span", { className: "brand-title", children: "Cryptonite" }), _jsx("span", { className: "brand-subtitle", children: "Crypto Dashboard" })] }), _jsxs("nav", { className: "navbar-links", children: [_jsx(NavLink, { to: "/", end: true, children: "Home" }), _jsx(NavLink, { to: "/reports", children: "Realtime Report" }), _jsx(NavLink, { to: "/ai", children: "AI Recommendation" }), _jsx(NavLink, { to: "/about", children: "About" })] }), _jsx("div", { className: "navbar-search", children: _jsx("input", { value: searchQuery, onChange: (event) => dispatch(setSearchQuery(event.target.value)), placeholder: "Search coins...", "aria-label": "Search coins" }) })] }));
};
export default Navbar;
