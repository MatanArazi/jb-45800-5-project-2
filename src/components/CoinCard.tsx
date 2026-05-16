import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { RootState } from '../store';
import { fetchCoinDetails } from '../features/coins/coinsSlice';
import { CoinSummary } from '../features/coins/types';

interface Props {
  coin: CoinSummary;
  isSelected: boolean;
  onToggle: () => void;
}

const CoinCard = ({ coin, isSelected, onToggle }: Props) => {
  const dispatch = useAppDispatch();
  const details = useAppSelector((state: RootState) => state.coins.details[coin.id]);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMoreInfo = async () => {
    setShowInfo((current) => !current);
    if (!details) {
      try {
        setLoading(true);
        setError(null);
        await dispatch(fetchCoinDetails(coin.id)).unwrap();
      } catch (fetchError) {
        setError('Unable to load additional details right now.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <article className={`coin-card ${isSelected ? 'coin-card-selected' : ''}`}>
      <div className="card-header">
        <div className="coin-meta">
          <img src={coin.image} alt={`${coin.name} logo`} />
          <div>
            <p className="coin-symbol">{coin.symbol.toUpperCase()}</p>
            <p className="coin-name">{coin.name}</p>
          </div>
        </div>
        <label className="switch-control">
          <input type="checkbox" checked={isSelected} onChange={onToggle} />
          <span className="switch-slider" />
        </label>
      </div>
      <div className="card-body">
        <p>Current price: ${coin.current_price.toLocaleString('en-US')}</p>
        <button className="more-info-button" onClick={handleMoreInfo}>
          {showInfo ? 'Hide details' : 'More Info'}
        </button>
      </div>

      {showInfo && (
        <div className="more-info-panel">
          {loading && <p>Loading...</p>}
          {error && <p className="status-error">{error}</p>}
          {!loading && !error && details && (
            <div className="price-grid">
              <div>
                <strong>USD</strong>
                <p>${details.market_data.current_price.usd.toLocaleString('en-US')}</p>
              </div>
              <div>
                <strong>EUR</strong>
                <p>€{details.market_data.current_price.eur.toLocaleString('en-US')}</p>
              </div>
              <div>
                <strong>ILS</strong>
                <p>₪{details.market_data.current_price.ils.toLocaleString('en-US')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default CoinCard;
