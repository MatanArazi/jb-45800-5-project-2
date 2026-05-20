import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { RootState } from '../store';
import { fetchCoinDetails } from '../features/coins/coinsSlice';
import { CoinSummary } from '../features/coins/types';
import { useModal } from '../contexts/ModalContext';
import CoinDetailsModal from './CoinDetailsModal';

interface Props {
  coin: CoinSummary;
  isSelected: boolean;
  onToggle: () => void;
}

const CoinCard = ({ coin, isSelected, onToggle }: Props) => {
  const dispatch = useAppDispatch();
  const details = useAppSelector((state: RootState) => state.coins.details[coin.id]);
  const { openModal, isModalOpen, closeModal } = useModal();
  const isDetailsOpen = isModalOpen(`coin-details-${coin.id}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMoreInfo = async () => {
    if (isDetailsOpen) {
      closeModal(`coin-details-${coin.id}`);
      return;
    }

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

    openModal(`coin-details-${coin.id}`);
  };

  return (
    <>
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
            {isDetailsOpen ? 'Hide details' : 'More Info'}
          </button>
        </div>
      </article>

      <CoinDetailsModal
        coinId={coin.id}
        coin={details}
        loading={loading}
        error={error}
      />
    </>
  );
};

export default CoinCard;
