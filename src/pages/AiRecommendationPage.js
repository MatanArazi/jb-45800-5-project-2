import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { fetchCoinDetails } from '../features/coins/coinsSlice';
import { useApiKey } from '../contexts/ApiKeyContext';
import { callLlm, callLlmBatch } from '../utils/llmApi';
const buildPrompt = (coin) => {
    const marketData = coin.market_data;
    if (marketData.current_price.usd == null || marketData.market_cap.usd == null) {
        throw new Error('Coin data is incomplete for AI recommendation.');
    }
    if (marketData.total_volume?.usd == null) {
        throw new Error('Volume data is missing for AI recommendation.');
    }
    return `Write a clear recommendation in English for the coin ${coin.name} (${coin.symbol.toUpperCase()}).

Data:
- name: ${coin.name}
- current_price_usd: ${marketData.current_price.usd}
- market_cap_usd: ${marketData.market_cap.usd}
- volume_24h_usd: ${marketData.total_volume.usd}
- price_change_percentage_30d_in_currency: ${marketData.price_change_percentage_30d_in_currency.usd}
- price_change_percentage_60d_in_currency: ${marketData.price_change_percentage_60d_in_currency.usd}
- price_change_percentage_200d_in_currency: ${marketData.price_change_percentage_200d_in_currency.usd}

The recommendation should include:
1. Whether it is advisable or not to buy the coin.
2. A supporting explanation paragraph for the decision.`;
};
const ApiKeyPromptModal = ({ isOpen, onClose, onSubmit, defaultEndpoint }) => {
    const [keyValue, setKeyValue] = useState('');
    const [endpointValue, setEndpointValue] = useState(defaultEndpoint || '');
    useEffect(() => {
        setEndpointValue(defaultEndpoint || '');
    }, [defaultEndpoint]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (keyValue.trim()) {
            onSubmit(keyValue.trim(), endpointValue.trim());
            setKeyValue('');
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), children: [_jsx("h2", { children: "Enter LLM API Settings" }), _jsx("p", { children: "To get AI recommendations, provide your API key and the LLM endpoint to use." }), _jsxs("form", { onSubmit: handleSubmit, className: "api-key-form", children: [_jsxs("label", { children: ["API Key", _jsx("input", { type: "password", value: keyValue, onChange: (e) => setKeyValue(e.target.value), placeholder: "Paste your API key here...", autoFocus: true, className: "api-key-input" })] }), _jsxs("label", { children: ["API Endpoint ", _jsx("span", { style: { color: '#888', fontWeight: 'normal' }, children: "(optional)" }), _jsx("input", { type: "url", value: endpointValue, onChange: (e) => setEndpointValue(e.target.value), placeholder: defaultEndpoint || 'https://api.example.com/v1/chat/completions', className: "api-key-input" })] }), _jsx("p", { style: { fontSize: '0.8rem', color: '#888', marginTop: '0.35rem' }, children: "Leave blank to use the default endpoint." }), _jsx("button", { type: "submit", disabled: !keyValue.trim(), className: "primary-button", children: "Save & Continue" })] }), _jsx("button", { type: "button", onClick: onClose, className: "tertiary-button", children: "Cancel" })] }) }));
};
const AiRecommendationPage = () => {
    const dispatch = useAppDispatch();
    const { list, selection, details } = useAppSelector((state) => state.coins);
    const { apiKey, endpoint, setApiKey, setEndpoint, isKeySet } = useApiKey();
    const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
    const [selectedId, setSelectedId] = useState(selection.selectedIds[0]);
    const [selectedRecommendation, setSelectedRecommendation] = useState('');
    const [loadingRecommendation, setLoadingRecommendation] = useState(false);
    const [errorRecommendation, setErrorRecommendation] = useState(null);
    const [allRecommendations, setAllRecommendations] = useState([]);
    const [loadingAll, setLoadingAll] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const selectedCoins = useMemo(() => list.filter((coin) => selection.selectedIds.includes(coin.id)), [list, selection.selectedIds]);
    useEffect(() => {
        if (!selectedId && selectedCoins.length > 0) {
            setSelectedId(selectedCoins[0].id);
        }
    }, [selectedCoins, selectedId]);
    const selectedCoin = selectedCoins.find((coin) => coin.id === selectedId);
    const handleApiKeySubmit = (key, endpointValue) => {
        setApiKey(key);
        setEndpoint(endpointValue);
        setShowApiKeyPrompt(false);
        // Continue with the pending action
        if (pendingAction === 'single') {
            executeRecommendation(key, endpointValue);
        }
        else if (pendingAction === 'all') {
            executeAllRecommendations(key, endpointValue);
        }
        setPendingAction(null);
    };
    // Fetch recommendation for single selected coin
    const fetchRecommendation = async () => {
        if (!selectedCoin) {
            setErrorRecommendation('Please select one coin to get an AI recommendation.');
            return;
        }
        if (!isKeySet || !apiKey) {
            setPendingAction('single');
            setShowApiKeyPrompt(true);
            return;
        }
        executeRecommendation(apiKey, endpoint);
    };
    const executeRecommendation = async (key, endpointValue) => {
        setLoadingRecommendation(true);
        setErrorRecommendation(null);
        setSelectedRecommendation('');
        try {
            let coinDetails = details[selectedCoin.id];
            if (!coinDetails) {
                coinDetails = await dispatch(fetchCoinDetails(selectedCoin.id)).unwrap();
            }
            if (!coinDetails) {
                throw new Error('Unable to fetch coin details.');
            }
            const prompt = buildPrompt(coinDetails);
            const recommendation = await callLlm(key, endpointValue, prompt);
            setSelectedRecommendation(recommendation || 'No valid recommendation was returned.');
        }
        catch (fetchError) {
            const message = fetchError.message;
            setErrorRecommendation(message.includes('NetworkError')
                ? 'Network error contacting LLM proxy. Check your internet connection or API endpoint.'
                : message || 'AI error.');
        }
        finally {
            setLoadingRecommendation(false);
        }
    };
    // Fetch recommendations for all selected coins in parallel
    const fetchAllRecommendations = async () => {
        if (selectedCoins.length === 0) {
            setErrorRecommendation('No selected coins. Please select coins on the home page.');
            return;
        }
        if (!isKeySet || !apiKey) {
            setPendingAction('all');
            setShowApiKeyPrompt(true);
            return;
        }
        executeAllRecommendations(apiKey, endpoint);
    };
    const executeAllRecommendations = async (key, endpointValue) => {
        setLoadingAll(true);
        setAllRecommendations(selectedCoins.map((coin) => ({
            coinId: coin.id,
            coinName: coin.name,
            symbol: coin.symbol,
            recommendation: '',
            loading: true,
            error: null
        })));
        try {
            const coinsToFetch = selectedCoins.filter((coin) => !details[coin.id]);
            const fetchedDetails = coinsToFetch.length > 0
                ? await Promise.all(coinsToFetch.map((coin) => dispatch(fetchCoinDetails(coin.id)).unwrap()))
                : [];
            const freshDetails = { ...details };
            fetchedDetails.forEach((detail) => {
                freshDetails[detail.id] = detail;
            });
            const prompts = selectedCoins.map((coin) => {
                const coinDetails = freshDetails[coin.id];
                if (!coinDetails) {
                    throw new Error(`Details missing for ${coin.name}`);
                }
                return buildPrompt(coinDetails);
            });
            const recommendations = await callLlmBatch(key, endpointValue, prompts);
            setAllRecommendations(selectedCoins.map((coin, index) => ({
                coinId: coin.id,
                coinName: coin.name,
                symbol: coin.symbol,
                recommendation: recommendations[index] || '',
                loading: false,
                error: null
            })));
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to get recommendations';
            setAllRecommendations(selectedCoins.map((coin) => ({
                coinId: coin.id,
                coinName: coin.name,
                symbol: coin.symbol,
                recommendation: '',
                loading: false,
                error: errorMsg
            })));
        }
        finally {
            setLoadingAll(false);
        }
    };
    return (_jsxs("div", { className: "page ai-page", children: [_jsx("header", { className: "page-title-row", children: _jsxs("div", { children: [_jsx("h1", { children: "AI Recommendation" }), _jsx("p", { children: "Get smart recommendations for your selected coins using your configured LLM endpoint." })] }) }), _jsx("div", { className: "ai-key-controls", children: _jsxs("div", { className: "ai-key-status", children: [_jsx("span", { children: isKeySet
                                ? 'LLM API key is configured. Endpoint will default if not changed.'
                                : 'LLM API credentials are not fully configured.' }), _jsx("button", { type: "button", className: "secondary-button", onClick: () => {
                                setShowApiKeyPrompt(true);
                                setPendingAction(null);
                            }, children: isKeySet ? 'Change Credentials' : 'Enter Credentials' })] }) }), selectedCoins.length === 0 ? (_jsx("div", { className: "status-message", children: "No selected coins. Add coins on the home page to get a recommendation." })) : (_jsxs("div", { className: "ai-panel", children: [_jsxs("section", { className: "ai-single-recommendation", children: [_jsx("h2", { children: "Single Coin Recommendation" }), _jsxs("div", { className: "ai-selection", children: [_jsx("label", { htmlFor: "coin-select", children: "Select coin:" }), _jsx("select", { id: "coin-select", value: selectedId, onChange: (event) => setSelectedId(event.target.value), children: selectedCoins.map((coin) => (_jsxs("option", { value: coin.id, children: [coin.name, " (", coin.symbol.toUpperCase(), ")"] }, coin.id))) })] }), _jsx("button", { className: "primary-button", onClick: fetchRecommendation, disabled: loadingRecommendation, children: loadingRecommendation ? 'Loading recommendation...' : 'Get recommendation' }), errorRecommendation && _jsx("div", { className: "status-error", children: errorRecommendation }), selectedRecommendation && (_jsxs("div", { className: "recommendation-box", children: [_jsxs("h3", { children: ["Recommendation for ", selectedCoin?.name] }), _jsx("p", { children: selectedRecommendation })] }))] }), _jsxs("section", { className: "ai-all-recommendations", children: [_jsx("h2", { children: "All Selected Coins" }), _jsxs("p", { children: ["Get AI recommendations for all ", selectedCoins.length, " selected coin(s) at once."] }), _jsx("button", { className: "primary-button", onClick: fetchAllRecommendations, disabled: loadingAll, children: loadingAll ? 'Loading recommendations...' : `Get All Recommendations (${selectedCoins.length})` }), allRecommendations.length > 0 && (_jsx("div", { className: "recommendations-grid", children: allRecommendations.map((rec) => (_jsxs("div", { className: "recommendation-card", children: [_jsxs("h4", { children: [rec.coinName, " (", rec.symbol.toUpperCase(), ")"] }), rec.loading && _jsx("p", { className: "loading-text", children: "Loading..." }), rec.error && _jsx("p", { className: "status-error", children: rec.error }), !rec.loading && !rec.error && rec.recommendation && (_jsx("p", { children: rec.recommendation }))] }, rec.coinId))) }))] })] })), _jsx(ApiKeyPromptModal, { isOpen: showApiKeyPrompt, defaultEndpoint: endpoint ?? '', onClose: () => {
                    setShowApiKeyPrompt(false);
                    setPendingAction(null);
                }, onSubmit: handleApiKeySubmit })] }));
};
export default AiRecommendationPage;
