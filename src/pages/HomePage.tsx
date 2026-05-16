import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { RootState } from '../store';
import { fetchCoinList, toggleCoinSelection, cancelSelectionSwap, confirmSelectionSwap } from '../features/coins/coinsSlice';
import CoinCard from '../components/CoinCard';
import MaxSelectDialog from '../components/MaxSelectDialog';

const HomePage = () => {
  const dispatch = useAppDispatch();
  const { list, status, error, selection } = useAppSelector((state: RootState) => state.coins);
  const filteredCoins = list.filter((coin) => {
    const query = selection.searchQuery.trim().toLowerCase();
    return (
      coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (status === 'idle' && list.length === 0) {
      dispatch(fetchCoinList());
    }
  }, [dispatch, list.length, status]);

  return (
    <div className="page home-page">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Cryptonite</p>
          <h1>Realtime Digital Coins</h1>
          <p>Display the top 100 coins, select up to 5 for tracking, and get smart reports.</p>
        </div>
      </section>

      <section className="home-header">
        <div>
          <h2>Coin cards</h2>
          <p>The user can select up to 5 coins using the switch.</p>
        </div>
        <div className="selection-summary">
          <span>Selected coins: {selection.selectedIds.length} / 5</span>
        </div>
      </section>

      {status === 'loading' && <div className="status-message">Loading coins...</div>}
      {status === 'failed' && <div className="status-error">Failed to load coins: {error}</div>}
      {status === 'idle' && filteredCoins.length === 0 && (
        <div className="status-message">No coins matched that search.</div>
      )}

      <div className="coins-grid">
        {filteredCoins.map((coin) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            isSelected={selection.selectedIds.includes(coin.id)}
            onToggle={() => dispatch(toggleCoinSelection(coin.id))}
          />
        ))}
      </div>

      <MaxSelectDialog
        open={selection.isSelectionDialogOpen}
        currentSelection={selection.selectedIds}
        coins={list}
        pendingSelectionId={selection.pendingSelectionId}
        onClose={() => dispatch(cancelSelectionSwap())}
        onConfirm={(removeId) => dispatch(confirmSelectionSwap(removeId))}
      />
    </div>
  );
};

export default HomePage;
