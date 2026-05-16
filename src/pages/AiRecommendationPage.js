import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../hooks';
const buildPrompt = (coin) => {
    const marketData = coin.market_data;
    if (marketData.current_price.usd == null || marketData.market_cap.usd == null) {
        throw new Error('Coin data is incomplete for AI recommendation.');
    }
    if (marketData.volume_24h?.usd == null) {
        throw new Error('Volume data is missing for AI recommendation.');
    }
    return `Write a clear recommendation in English for the coin ${coin.name} (${coin.symbol.toUpperCase()}).

Data:
- name: ${coin.name}
- current_price_usd: ${marketData.current_price.usd}
- market_cap_usd: ${marketData.market_cap.usd}
- volume_24h_usd: ${marketData.volume_24h.usd}
- price_change_percentage_30d_in_currency: ${marketData.price_change_percentage_30d_in_currency.usd}
- price_change_percentage_60d_in_currency: ${marketData.price_change_percentage_60d_in_currency.usd}
- price_change_percentage_200d_in_currency: ${marketData.price_change_percentage_200d_in_currency.usd}

The recommendation should include:
1. Whether it is advisable or not to buy the coin.
2. A supporting explanation paragraph for the decision.`;
};
const AiRecommendationPage = () => {
    const { list, selection, details } = useAppSelector((state) => state.coins);
    const selectedCoins = useMemo(() => list.filter((coin) => selection.selectedIds.includes(coin.id)), [list, selection.selectedIds]);
    const [selectedId, setSelectedId] = useState(selection.selectedIds[0]);
    const [recommendation, setRecommendation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!selectedId && selectedCoins.length > 0) {
            setSelectedId(selectedCoins[0].id);
        }
    }, [selectedCoins, selectedId]);
    const selectedCoin = selectedCoins.find((coin) => coin.id === selectedId);
    const fetchRecommendation = async () => {
        if (!selectedCoin) {
            setError('Please select one coin to get an AI recommendation.');
            return;
        }
        const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!openaiKey) {
            setError('VITE_OPENAI_API_KEY must be set to use ChatGPT.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const detailsData = details[selectedCoin.id]
                ? details[selectedCoin.id]
                : await fetch(`https://api.coingecko.com/api/v3/coins/${selectedCoin.id}?localization=false&market_data=true`).then((res) => {
                    if (!res.ok)
                        throw new Error('Unable to fetch coin data for AI.');
                    return res.json();
                });
            const prompt = buildPrompt(detailsData);
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an assistant that provides data-informed investment recommendations. Return a clear yes/no buy recommendation with an explanatory paragraph.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.4,
                    max_tokens: 300
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'ChatGPT error');
            }
            const text = data.choices?.[0]?.message?.content;
            setRecommendation(text || 'No valid recommendation was returned.');
        }
        catch (fetchError) {
            setError(fetchError.message || 'AI error.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "page ai-page", children: [_jsx("header", { className: "page-title-row", children: _jsxs("div", { children: [_jsx("h1", { children: "AI Recommendation" }), _jsx("p", { children: "Get a smart recommendation for a selected coin." })] }) }), selectedCoins.length === 0 ? (_jsx("div", { className: "status-message", children: "No selected coins. Add coins on the home page to get a recommendation." })) : (_jsxs("div", { className: "ai-panel", children: [_jsxs("div", { className: "ai-selection", children: [_jsx("label", { htmlFor: "coin-select", children: "Select coin:" }), _jsx("select", { id: "coin-select", value: selectedId, onChange: (event) => setSelectedId(event.target.value), children: selectedCoins.map((coin) => (_jsxs("option", { value: coin.id, children: [coin.name, " (", coin.symbol.toUpperCase(), ")"] }, coin.id))) })] }), _jsx("button", { className: "primary-button", onClick: fetchRecommendation, disabled: loading, children: loading ? 'Loading recommendation...' : 'Get recommendation' }), error && _jsx("div", { className: "status-error", children: error }), recommendation && (_jsxs("div", { className: "recommendation-box", children: [_jsx("h2", { children: "AI Recommendation" }), _jsx("p", { children: recommendation })] }))] }))] }));
};
export default AiRecommendationPage;
