import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../hooks';
const RealtimeReportPage = () => {
    const { list, selection } = useAppSelector((state) => state.coins);
    const selectedCoins = useMemo(() => list.filter((coin) => selection.selectedIds.includes(coin.id)), [list, selection.selectedIds]);
    const [prices, setPrices] = useState({});
    const [error, setError] = useState(null);
    const [updatedAt, setUpdatedAt] = useState('');
    useEffect(() => {
        if (selectedCoins.length === 0) {
            setPrices({});
            setError(null);
            return;
        }
        let active = true;
        const fetchPrices = async () => {
            try {
                const symbols = selectedCoins.map((coin) => coin.symbol.toUpperCase()).join(',');
                const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?tsyms=USD&fsyms=${symbols}`);
                if (!response.ok) {
                    throw new Error('Unable to load report prices');
                }
                const data = await response.json();
                if (!active) {
                    return;
                }
                setPrices(data);
                setError(null);
                setUpdatedAt(new Date().toLocaleTimeString('en-US'));
            }
            catch (fetchError) {
                if (active) {
                    setError(fetchError.message);
                }
            }
        };
        fetchPrices();
        const interval = window.setInterval(fetchPrices, 1000);
        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [selectedCoins]);
    return (_jsxs("div", { className: "page report-page", children: [_jsx("header", { className: "page-title-row", children: _jsxs("div", { children: [_jsx("h1", { children: "Realtime Report" }), _jsx("p", { children: "Realtime price details for selected coins." })] }) }), selectedCoins.length === 0 ? (_jsx("div", { className: "status-message", children: "No coins selected for the report. Select up to 5 coins on the home page." })) : (_jsxs("div", { className: "report-card", children: [_jsxs("div", { className: "report-meta", children: [_jsxs("span", { children: ["Coins: ", selectedCoins.length] }), _jsxs("span", { children: ["Updated: ", updatedAt || 'Loading...'] })] }), error && _jsxs("div", { className: "status-error", children: ["Report loading error: ", error] }), _jsxs("div", { className: "report-table", children: [_jsxs("div", { className: "report-row header-row", children: [_jsx("span", { children: "Coin" }), _jsx("span", { children: "Price USD" }), _jsx("span", { children: "24h Change" })] }), selectedCoins.map((coin) => {
                                const snapshot = prices[coin.symbol.toUpperCase()];
                                const price = snapshot?.usd;
                                return (_jsxs("div", { className: "report-row", children: [_jsx("span", { children: coin.name }), _jsx("span", { children: price ? `$${price.toLocaleString('en-US')}` : '---' }), _jsx("span", { children: coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined ? `${coin.price_change_percentage_24h.toFixed(2)}%` : '-' })] }, coin.id));
                            })] })] }))] }));
};
export default RealtimeReportPage;
