import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../hooks';
import { RootState } from '../store';

interface PriceSnapshot {
  USD?: number;
}

const renderSparkline = (values: number[]) => {
  const width = 160;
  const height = 40;

  if (values.length === 0) {
    return <span className="sparkline-empty">No data yet</span>;
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

  return (
    <div className="sparkline-wrapper" aria-label="1 hour price movement sparkline">
      <div className="sparkline-axis">
        {labels.map((value, index) => (
          <span key={index}>${value.toFixed(0)}</span>
        ))}
      </div>
      <div className="sparkline-chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="sparkline-chart-svg">
          <line x1={0} y1={0} x2={width} y2={0} stroke="#e5e7eb" strokeWidth="1" />
          <line x1={0} y1={height / 4} x2={width} y2={height / 4} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={0} y1={(height / 4) * 3} x2={width} y2={(height / 4) * 3} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={0} y1={height} x2={width} y2={height} stroke="#e5e7eb" strokeWidth="1" />
          {points.slice(1).map((point, index) => {
            const prev = points[index];
            return (
              <line
                key={index}
                x1={prev.x}
                y1={prev.y}
                x2={point.x}
                y2={point.y}
                stroke={point.value >= prev.value ? '#16a34a' : '#dc2626'}
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
          {values.length === 1 ? (
            <circle cx={width / 2} cy={height - ((values[0] - min) / range) * height} r="3" fill="#0c2052" />
          ) : (
            <>
              <circle cx={points[0].x} cy={points[0].y} r="2" fill="#0c2052" />
              <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2" fill={points[points.length - 1].value >= points[0].value ? '#16a34a' : '#dc2626'} />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

const RealtimeReportPage = () => {
  const { list, selection } = useAppSelector((state: RootState) => state.coins);
  const selectedCoins = useMemo(
    () => list.filter((coin) => selection.selectedIds.includes(coin.id)),
    [list, selection.selectedIds]
  );
  const [prices, setPrices] = useState<Record<string, PriceSnapshot>>({});
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>('');

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

    const fetchHistory = async () => {
      try {
        const historyResults = await Promise.all(
          selectedCoins.map(async (coin) => {
            const symbol = coin.symbol.toUpperCase();
            const response = await fetch(
              `https://min-api.cryptocompare.com/data/v2/histominute?fsym=${symbol}&tsym=USD&limit=59&aggregate=1`
            );
            if (!response.ok) {
              throw new Error(`Unable to load history for ${symbol}`);
            }
            const json = await response.json();
            const points = json.Data?.Data?.map((item: any) => item.close).filter((value: any) => value != null) ?? [];
            return { symbol, points };
          })
        );

        if (!active) {
          return;
        }

        const nextHistory: Record<string, number[]> = {};
        historyResults.forEach((result) => {
          nextHistory[result.symbol] = result.points;
        });
        setPriceHistory(nextHistory);
      } catch (fetchError) {
        if (active) {
          setError((fetchError as Error).message);
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
              <span>Movement (1h)</span>
              <span>24h Change</span>
            </div>
            {selectedCoins.map((coin) => {
              const symbol = coin.symbol.toUpperCase();
              const snapshot = prices[symbol];
              const price = snapshot?.USD;
              const history = priceHistory[symbol] ?? [];
              return (
                <div key={coin.id} className="report-row">
                  <span>{coin.name}</span>
                  <span>{price ? `$${price.toLocaleString('en-US')}` : '---'}</span>
                  <span className="sparkline-cell">{renderSparkline(history)}</span>
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
