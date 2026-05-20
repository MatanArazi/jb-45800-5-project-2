import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../hooks';
const renderSparkline = (values) => {
    const width = 160;
    const height = 40;
    if (values.length === 0) {
        return _jsx("span", { className: "sparkline-empty", children: "No data yet" });
    }
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max === min ? 1 : max - min;
    const mid = (max + min) / 2;
    const topQuarter = max - range * 0.25;
    const bottomQuarter = min + range * 0.25;
    const labels = [max, topQuarter, mid, bottomQuarter, min];
    const points = values.map((value, index) => {
        const x = (index / (Math.max(values.length - 1, 1))) * width;
        const y = height - ((value - min) / range) * height;
        return { x, y, value };
    });
    return (_jsxs("div", { className: "sparkline-wrapper", "aria-label": "1 hour price movement sparkline", children: [_jsx("div", { className: "sparkline-axis", children: labels.map((value, index) => (_jsxs("span", { children: ["$", value.toFixed(0)] }, index))) }), _jsx("div", { className: "sparkline-chart-container", children: _jsxs("svg", { viewBox: `0 0 ${width} ${height}`, className: "sparkline-chart-svg", children: [_jsx("line", { x1: 0, y1: 0, x2: width, y2: 0, stroke: "#e5e7eb", strokeWidth: "1" }), _jsx("line", { x1: 0, y1: height / 4, x2: width, y2: height / 4, stroke: "#e5e7eb", strokeWidth: "1", strokeDasharray: "4 4" }), _jsx("line", { x1: 0, y1: height / 2, x2: width, y2: height / 2, stroke: "#e5e7eb", strokeWidth: "1", strokeDasharray: "4 4" }), _jsx("line", { x1: 0, y1: (height / 4) * 3, x2: width, y2: (height / 4) * 3, stroke: "#e5e7eb", strokeWidth: "1", strokeDasharray: "4 4" }), _jsx("line", { x1: 0, y1: height, x2: width, y2: height, stroke: "#e5e7eb", strokeWidth: "1" }), points.slice(1).map((point, index) => {
                            const prev = points[index];
                            return (_jsx("line", { x1: prev.x, y1: prev.y, x2: point.x, y2: point.y, stroke: point.value >= prev.value ? '#16a34a' : '#dc2626', strokeWidth: "2", strokeLinecap: "round" }, index));
                        }), values.length === 1 ? (_jsx("circle", { cx: width / 2, cy: height - ((values[0] - min) / range) * height, r: "3", fill: "#0c2052" })) : (_jsxs(_Fragment, { children: [_jsx("circle", { cx: points[0].x, cy: points[0].y, r: "2", fill: "#0c2052" }), _jsx("circle", { cx: points[points.length - 1].x, cy: points[points.length - 1].y, r: "2", fill: points[points.length - 1].value >= points[0].value ? '#16a34a' : '#dc2626' })] }))] }) })] }));
};
const RealtimeReportPage = () => {
    const { list, selection } = useAppSelector((state) => state.coins);
    const selectedCoins = useMemo(() => list.filter((coin) => selection.selectedIds.includes(coin.id)), [list, selection.selectedIds]);
    const [prices, setPrices] = useState({});
    const [priceHistory, setPriceHistory] = useState({});
    const [error, setError] = useState(null);
    const [updatedAt, setUpdatedAt] = useState('');
    useEffect(() => {
        if (selectedCoins.length === 0) {
            setPrices({});
            setPriceHistory({});
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
        const fetchHistory = async () => {
            try {
                const historyResults = await Promise.all(selectedCoins.map(async (coin) => {
                    const symbol = coin.symbol.toUpperCase();
                    const response = await fetch(`https://min-api.cryptocompare.com/data/v2/histominute?fsym=${symbol}&tsym=USD&limit=59&aggregate=1`);
                    if (!response.ok) {
                        throw new Error(`Unable to load history for ${symbol}`);
                    }
                    const json = await response.json();
                    const points = json.Data?.Data?.map((item) => item.close).filter((value) => value != null) ?? [];
                    return { symbol, points };
                }));
                if (!active) {
                    return;
                }
                const nextHistory = {};
                historyResults.forEach((result) => {
                    nextHistory[result.symbol] = result.points;
                });
                setPriceHistory(nextHistory);
            }
            catch (fetchError) {
                if (active) {
                    setError(fetchError.message);
                }
            }
        };
        fetchHistory();
        fetchPrices();
        const interval = window.setInterval(fetchPrices, 15000);
        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [selectedCoins]);
    return (_jsxs("div", { className: "page report-page", children: [_jsx("header", { className: "page-title-row", children: _jsxs("div", { children: [_jsx("h1", { children: "Realtime Report" }), _jsx("p", { children: "Realtime price details for selected coins." })] }) }), selectedCoins.length === 0 ? (_jsx("div", { className: "status-message", children: "No coins selected for the report. Select up to 5 coins on the home page." })) : (_jsxs("div", { className: "report-card", children: [_jsxs("div", { className: "report-meta", children: [_jsxs("span", { children: ["Coins: ", selectedCoins.length] }), _jsxs("span", { children: ["Updated: ", updatedAt || 'Loading...'] })] }), error && _jsxs("div", { className: "status-error", children: ["Report loading error: ", error] }), _jsxs("div", { className: "report-table", children: [_jsxs("div", { className: "report-row header-row", children: [_jsx("span", { children: "Coin" }), _jsx("span", { children: "Price USD" }), _jsx("span", { children: "Movement (1h)" }), _jsx("span", { children: "24h Change" })] }), selectedCoins.map((coin) => {
                                const symbol = coin.symbol.toUpperCase();
                                const snapshot = prices[symbol];
                                const price = snapshot?.USD;
                                const history = priceHistory[symbol] ?? [];
                                return (_jsxs("div", { className: "report-row", children: [_jsx("span", { children: coin.name }), _jsx("span", { children: price ? `$${price.toLocaleString('en-US')}` : '---' }), _jsx("span", { className: "sparkline-cell", children: renderSparkline(history) }), _jsx("span", { children: coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined ? `${coin.price_change_percentage_24h.toFixed(2)}%` : '-' })] }, coin.id));
                            })] })] }))] }));
};
export default RealtimeReportPage;
