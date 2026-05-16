import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchCoinDetails } from '../features/coins/coinsSlice';
const CoinCard = ({ coin, isSelected, onToggle }) => {
    const dispatch = useAppDispatch();
    const details = useAppSelector((state) => state.coins.details[coin.id]);
    const [showInfo, setShowInfo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleMoreInfo = async () => {
        setShowInfo((current) => !current);
        if (!details) {
            try {
                setLoading(true);
                setError(null);
                await dispatch(fetchCoinDetails(coin.id)).unwrap();
            }
            catch (fetchError) {
                setError('Unable to load additional details right now.');
            }
            finally {
                setLoading(false);
            }
        }
    };
    return (_jsxs("article", { className: `coin-card ${isSelected ? 'coin-card-selected' : ''}`, children: [_jsxs("div", { className: "card-header", children: [_jsxs("div", { className: "coin-meta", children: [_jsx("img", { src: coin.image, alt: `${coin.name} logo` }), _jsxs("div", { children: [_jsx("p", { className: "coin-symbol", children: coin.symbol.toUpperCase() }), _jsx("p", { className: "coin-name", children: coin.name })] })] }), _jsxs("label", { className: "switch-control", children: [_jsx("input", { type: "checkbox", checked: isSelected, onChange: onToggle }), _jsx("span", { className: "switch-slider" })] })] }), _jsxs("div", { className: "card-body", children: [_jsxs("p", { children: ["Current price: $", coin.current_price.toLocaleString('en-US')] }), _jsx("button", { className: "more-info-button", onClick: handleMoreInfo, children: showInfo ? 'Hide details' : 'More Info' })] }), showInfo && (_jsxs("div", { className: "more-info-panel", children: [loading && _jsx("p", { children: "Loading..." }), error && _jsx("p", { className: "status-error", children: error }), !loading && !error && details && (_jsxs("div", { className: "price-grid", children: [_jsxs("div", { children: [_jsx("strong", { children: "USD" }), _jsxs("p", { children: ["$", details.market_data.current_price.usd.toLocaleString('en-US')] })] }), _jsxs("div", { children: [_jsx("strong", { children: "EUR" }), _jsxs("p", { children: ["\u20AC", details.market_data.current_price.eur.toLocaleString('en-US')] })] }), _jsxs("div", { children: [_jsx("strong", { children: "ILS" }), _jsxs("p", { children: ["\u20AA", details.market_data.current_price.ils.toLocaleString('en-US')] })] })] }))] }))] }));
};
export default CoinCard;
