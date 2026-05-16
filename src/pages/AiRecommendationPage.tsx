import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../hooks';
import { RootState } from '../store';
import type { CoinDetails } from '../features/coins/types';

const buildPrompt = (coin: CoinDetails) => {
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
  const { list, selection, details } = useAppSelector((state: RootState) => state.coins);
  const selectedCoins = useMemo(
    () => list.filter((coin) => selection.selectedIds.includes(coin.id)),
    [list, selection.selectedIds]
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(selection.selectedIds[0]);
  const [recommendation, setRecommendation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);

    try {
      const detailsData = details[selectedCoin.id]
        ? details[selectedCoin.id]
        : await fetch(`https://api.coingecko.com/api/v3/coins/${selectedCoin.id}?localization=false&market_data=true`).then((res) => {
            if (!res.ok) throw new Error('Unable to fetch coin data for AI.');
            return res.json();
          });
      const prompt = buildPrompt(detailsData);
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
        throw new Error(data.error?.message || data.error || 'ChatGPT proxy error');
      }
      const text = data.choices?.[0]?.message?.content;
      setRecommendation(text || 'No valid recommendation was returned.');
    } catch (fetchError) {
      setError((fetchError as Error).message || 'AI error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page ai-page">
      <header className="page-title-row">
        <div>
          <h1>AI Recommendation</h1>
          <p>Get a smart recommendation for a selected coin.</p>
        </div>
      </header>

      {selectedCoins.length === 0 ? (
        <div className="status-message">No selected coins. Add coins on the home page to get a recommendation.</div>
      ) : (
        <div className="ai-panel">
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
          <button className="primary-button" onClick={fetchRecommendation} disabled={loading}>
            {loading ? 'Loading recommendation...' : 'Get recommendation'}
          </button>
          {error && <div className="status-error">{error}</div>}
          {recommendation && (
            <div className="recommendation-box">
              <h2>AI Recommendation</h2>
              <p>{recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiRecommendationPage;
