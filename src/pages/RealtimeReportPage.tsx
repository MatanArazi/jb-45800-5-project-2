import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../hooks';
import { RootState } from '../store';

interface PriceSnapshot {
  usd?: number;
}

const RealtimeReportPage = () => {
  const { list, selection } = useAppSelector((state: RootState) => state.coins);
  const selectedCoins = useMemo(
    () => list.filter((coin) => selection.selectedIds.includes(coin.id)),
    [list, selection.selectedIds]
  );
  const [prices, setPrices] = useState<Record<string, PriceSnapshot>>({});
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>('');

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
        const response = await fetch(
          `https://min-api.cryptocompare.com/data/pricemulti?tsyms=USD&fsyms=${symbols}`
        );
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
      } catch (fetchError) {
        if (active) {
          setError((fetchError as Error).message);
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

  return (
    <div className="page report-page">
      <header className="page-title-row">
        <div>
          <h1>Realtime Report</h1>
          <p>Realtime price details for selected coins.</p>
        </div>
      </header>

      {selectedCoins.length === 0 ? (
        <div className="status-message">No coins selected for the report. Select up to 5 coins on the home page.</div>
      ) : (
        <div className="report-card">
          <div className="report-meta">
            <span>Coins: {selectedCoins.length}</span>
            <span>Updated: {updatedAt || 'Loading...'}</span>
          </div>
          {error && <div className="status-error">Report loading error: {error}</div>}
          <div className="report-table">
            <div className="report-row header-row">
              <span>Coin</span>
              <span>Price USD</span>
              <span>24h Change</span>
            </div>
            {selectedCoins.map((coin) => {
              const snapshot = prices[coin.symbol.toUpperCase()];
              const price = snapshot?.usd;
              return (
                <div key={coin.id} className="report-row">
                  <span>{coin.name}</span>
                  <span>{price ? `$${price.toLocaleString('en-US')}` : '---'}</span>
                  <span>{coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined ? `${coin.price_change_percentage_24h.toFixed(2)}%` : '-'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeReportPage;
