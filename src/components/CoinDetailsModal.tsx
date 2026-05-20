import { useEffect } from 'react';
import { useModal } from '../contexts/ModalContext';
import { CoinDetails } from '../features/coins/types';

interface Props {
  coinId: string;
  coin: CoinDetails | undefined;
  loading: boolean;
  error: string | null;
}

const CoinDetailsModal = ({ coinId, coin, loading, error }: Props) => {
  const { isModalOpen, closeModal } = useModal();
  const isOpen = isModalOpen(`coin-details-${coinId}`);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={() => closeModal(`coin-details-${coinId}`)}>
      <div className="modal-content coin-details-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-button"
          onClick={() => closeModal(`coin-details-${coinId}`)}
          aria-label="Close modal"
        >
          ✕
        </button>

        {loading && (
          <div className="modal-loading">
            <p>Loading details...</p>
          </div>
        )}

        {error && (
          <div className="modal-error">
            <p className="status-error">{error}</p>
            <button
              className="secondary-button"
              onClick={() => closeModal(`coin-details-${coinId}`)}
            >
              Close
            </button>
          </div>
        )}

        {!loading && !error && coin && (
          <>
            <div className="modal-header">
              <div className="coin-meta">
                <img src={coin.image.small} alt={coin.name} />
                <div>
                  <h2>{coin.name}</h2>
                  <p className="coin-symbol">{coin.symbol.toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <section className="detail-section">
                <h3>Current Price</h3>
                <div className="price-grid">
                  <div>
                    <strong>USD</strong>
                    <p>${coin.market_data.current_price.usd.toLocaleString('en-US')}</p>
                  </div>
                  <div>
                    <strong>EUR</strong>
                    <p>€{coin.market_data.current_price.eur.toLocaleString('en-US')}</p>
                  </div>
                  <div>
                    <strong>ILS</strong>
                    <p>₪{coin.market_data.current_price.ils.toLocaleString('en-US')}</p>
                  </div>
                </div>
              </section>

              <section className="detail-section">
                <h3>Market Data</h3>
                <div className="data-grid">
                  <div>
                    <strong>Market Cap (USD)</strong>
                    <p>${coin.market_data.market_cap.usd.toLocaleString('en-US')}</p>
                  </div>
                  <div>
                    <strong>24h Volume (USD)</strong>
                    <p>${coin.market_data.total_volume.usd.toLocaleString('en-US')}</p>
                  </div>
                  <div>
                    <strong>30d Change</strong>
                    <p className={coin.market_data.price_change_percentage_30d_in_currency.usd !== null && coin.market_data.price_change_percentage_30d_in_currency.usd >= 0 ? 'positive' : 'negative'}>
                      {coin.market_data.price_change_percentage_30d_in_currency.usd?.toFixed(2) || 'N/A'}%
                    </p>
                  </div>
                  <div>
                    <strong>60d Change</strong>
                    <p className={coin.market_data.price_change_percentage_60d_in_currency.usd !== null && coin.market_data.price_change_percentage_60d_in_currency.usd >= 0 ? 'positive' : 'negative'}>
                      {coin.market_data.price_change_percentage_60d_in_currency.usd?.toFixed(2) || 'N/A'}%
                    </p>
                  </div>
                  <div>
                    <strong>200d Change</strong>
                    <p className={coin.market_data.price_change_percentage_200d_in_currency.usd !== null && coin.market_data.price_change_percentage_200d_in_currency.usd >= 0 ? 'positive' : 'negative'}>
                      {coin.market_data.price_change_percentage_200d_in_currency.usd?.toFixed(2) || 'N/A'}%
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="modal-footer">
              <button
                className="primary-button"
                onClick={() => closeModal(`coin-details-${coinId}`)}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CoinDetailsModal;
