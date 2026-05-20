import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { RootState } from '../store';
import { fetchCoinDetails } from '../features/coins/coinsSlice';
import { useApiKey } from '../contexts/ApiKeyContext';
import { callLlm, callLlmBatch } from '../utils/llmApi';
import type { CoinDetails } from '../features/coins/types';

const buildPrompt = (coin: CoinDetails) => {
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

interface CoinRecommendation {
  coinId: string;
  coinName: string;
  symbol: string;
  recommendation: string;
  loading: boolean;
  error: string | null;
}

const ApiKeyPromptModal = ({
  isOpen,
  onClose,
  onSubmit,
  defaultEndpoint,
  defaultModel
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (key: string, endpoint: string, model: string) => void;
  defaultEndpoint?: string;
  defaultModel?: string;
}) => {
  const [keyValue, setKeyValue] = useState('');
  const [endpointValue, setEndpointValue] = useState(defaultEndpoint || '');
  const [modelValue, setModelValue] = useState(defaultModel || '');

  useEffect(() => {
    setEndpointValue(defaultEndpoint || '');
    setModelValue(defaultModel || '');
  }, [defaultEndpoint, defaultModel]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (keyValue.trim()) {
      onSubmit(keyValue.trim(), endpointValue.trim(), modelValue.trim());
      setKeyValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Enter LLM API Settings</h2>
        <p>To get AI recommendations, provide your API key, endpoint, and model name.</p>

        <form onSubmit={handleSubmit} className="api-key-form">
          <label>
            API Key
            <input
              type="password"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="Paste your API key here..."
              autoFocus
              className="api-key-input"
            />
          </label>
          <label>
            API Endpoint <span style={{ color: '#888', fontWeight: 'normal' }}>(optional)</span>
            <input
              type="url"
              value={endpointValue}
              onChange={(e) => setEndpointValue(e.target.value)}
              placeholder={defaultEndpoint || 'https://api.openai.com/v1/chat/completions'}
              className="api-key-input"
            />
          </label>
          <label>
            Model <span style={{ color: '#888', fontWeight: 'normal' }}>(optional)</span>
            <input
              type="text"
              value={modelValue}
              onChange={(e) => setModelValue(e.target.value)}
              placeholder={defaultModel || 'gpt-3.5-turbo'}
              className="api-key-input"
            />
          </label>
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.35rem' }}>
            Leave blank to use defaults. Examples: gpt-3.5-turbo, gpt-4, claude-2, meta/llama-2-70b-chat
          </p>
          <button
            type="submit"
            disabled={!keyValue.trim()}
            className="primary-button"
          >
            Save & Continue
          </button>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="tertiary-button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const AiRecommendationPage = () => {
  const dispatch = useAppDispatch();
  const { list, selection, details } = useAppSelector((state: RootState) => state.coins);
  const { apiKey, endpoint, model, setApiKey, setEndpoint, setModel, isKeySet } = useApiKey();
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(selection.selectedIds[0]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>('');
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [errorRecommendation, setErrorRecommendation] = useState<string | null>(null);
  const [allRecommendations, setAllRecommendations] = useState<CoinRecommendation[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [pendingAction, setPendingAction] = useState<'single' | 'all' | null>(null);

  const selectedCoins = useMemo(
    () => list.filter((coin) => selection.selectedIds.includes(coin.id)),
    [list, selection.selectedIds]
  );

  useEffect(() => {
    if (!selectedId && selectedCoins.length > 0) {
      setSelectedId(selectedCoins[0].id);
    }
  }, [selectedCoins, selectedId]);

  const selectedCoin = selectedCoins.find((coin) => coin.id === selectedId);

  const handleApiKeySubmit = (key: string, endpointValue: string, modelValue: string) => {
    setApiKey(key);
    setEndpoint(endpointValue);
    setModel(modelValue);
    setShowApiKeyPrompt(false);

    // Continue with the pending action
    if (pendingAction === 'single') {
      executeRecommendation(key, endpointValue, modelValue);
    } else if (pendingAction === 'all') {
      executeAllRecommendations(key, endpointValue, modelValue);
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

    executeRecommendation(apiKey, endpoint, model);
  };

  const executeRecommendation = async (key: string, endpointValue: string, modelValue: string) => {
    setLoadingRecommendation(true);
    setErrorRecommendation(null);
    setSelectedRecommendation('');

    try {
      let coinDetails = details[selectedCoin!.id];

      if (!coinDetails) {
        coinDetails = await dispatch(fetchCoinDetails(selectedCoin!.id)).unwrap();
      }

      if (!coinDetails) {
        throw new Error('Unable to fetch coin details.');
      }

      const prompt = buildPrompt(coinDetails);
      const recommendation = await callLlm(key, endpointValue, prompt, undefined, modelValue);
      setSelectedRecommendation(recommendation || 'No valid recommendation was returned.');
    } catch (fetchError) {
      const message = (fetchError as Error).message;
      setErrorRecommendation(
        message.includes('NetworkError')
          ? 'Network error contacting LLM proxy. Check your internet connection or API endpoint.'
          : message || 'AI error.'
      );
    } finally {
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

    executeAllRecommendations(apiKey, endpoint, model);
  };

  const executeAllRecommendations = async (key: string, endpointValue: string, modelValue: string) => {
    setLoadingAll(true);
    setAllRecommendations(
      selectedCoins.map((coin) => ({
        coinId: coin.id,
        coinName: coin.name,
        symbol: coin.symbol,
        recommendation: '',
        loading: true,
        error: null
      }))
    );

    try {
      const coinsToFetch = selectedCoins.filter((coin) => !details[coin.id]);
      const fetchedDetails = coinsToFetch.length > 0
        ? await Promise.all(
            coinsToFetch.map((coin) => dispatch(fetchCoinDetails(coin.id)).unwrap())
          )
        : [];

      const freshDetails: Record<string, CoinDetails> = { ...details };
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

      const recommendations = await callLlmBatch(key, endpointValue, prompts, undefined, modelValue);

      setAllRecommendations(
        selectedCoins.map((coin, index) => ({
          coinId: coin.id,
          coinName: coin.name,
          symbol: coin.symbol,
          recommendation: recommendations[index] || '',
          loading: false,
          error: null
        }))
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get recommendations';
      setAllRecommendations(
        selectedCoins.map((coin) => ({
          coinId: coin.id,
          coinName: coin.name,
          symbol: coin.symbol,
          recommendation: '',
          loading: false,
          error: errorMsg
        }))
      );
    } finally {
      setLoadingAll(false);
    }
  };

  return (
    <div className="page ai-page">
      <header className="page-title-row">
        <div>
          <h1>AI Recommendation</h1>
          <p>Get smart recommendations for your selected coins using your configured LLM endpoint.</p>
        </div>
      </header>

      <div className="ai-key-controls">
        <div className="ai-key-status">
          <span>
            {isKeySet
              ? 'LLM API key is configured. Endpoint will default if not changed.'
              : 'LLM API credentials are not fully configured.'}
          </span>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setShowApiKeyPrompt(true);
              setPendingAction(null);
            }}
          >
            {isKeySet ? 'Change Credentials' : 'Enter Credentials'}
          </button>
        </div>
      </div>

      {selectedCoins.length === 0 ? (
        <div className="status-message">No selected coins. Add coins on the home page to get a recommendation.</div>
      ) : (
        <div className="ai-panel">
          <section className="ai-single-recommendation">
            <h2>Single Coin Recommendation</h2>
            <div className="ai-selection">
              <label htmlFor="coin-select">Select coin:</label>
              <select
                id="coin-select"
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {selectedCoins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name} ({coin.symbol.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <button 
              className="primary-button" 
              onClick={fetchRecommendation} 
              disabled={loadingRecommendation}
            >
              {loadingRecommendation ? 'Loading recommendation...' : 'Get recommendation'}
            </button>
            {errorRecommendation && <div className="status-error">{errorRecommendation}</div>}
            {selectedRecommendation && (
              <div className="recommendation-box">
                <h3>Recommendation for {selectedCoin?.name}</h3>
                <p>{selectedRecommendation}</p>
              </div>
            )}
          </section>

          <section className="ai-all-recommendations">
            <h2>All Selected Coins</h2>
            <p>Get AI recommendations for all {selectedCoins.length} selected coin(s) at once.</p>
            <button 
              className="primary-button" 
              onClick={fetchAllRecommendations} 
              disabled={loadingAll}
            >
              {loadingAll ? 'Loading recommendations...' : `Get All Recommendations (${selectedCoins.length})`}
            </button>

            {allRecommendations.length > 0 && (
              <div className="recommendations-grid">
                {allRecommendations.map((rec) => (
                  <div key={rec.coinId} className="recommendation-card">
                    <h4>{rec.coinName} ({rec.symbol.toUpperCase()})</h4>
                    {rec.loading && <p className="loading-text">Loading...</p>}
                    {rec.error && <p className="status-error">{rec.error}</p>}
                    {!rec.loading && !rec.error && rec.recommendation && (
                      <p>{rec.recommendation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <ApiKeyPromptModal
        isOpen={showApiKeyPrompt}
        defaultEndpoint={endpoint ?? ''}
        defaultModel={model ?? ''}
        onClose={() => {
          setShowApiKeyPrompt(false);
          setPendingAction(null);
        }}
        onSubmit={handleApiKeySubmit}
      />
    </div>
  );
};

export default AiRecommendationPage;
