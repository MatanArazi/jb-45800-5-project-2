import { CoinSummary } from '../features/coins/types';

interface Props {
  open: boolean;
  currentSelection: string[];
  coins: CoinSummary[];
  pendingSelectionId?: string;
  onClose: () => void;
  onConfirm: (removeId: string) => void;
}

const MaxSelectDialog = ({ open, currentSelection, coins, pendingSelectionId, onClose, onConfirm }: Props) => {
  if (!open || !pendingSelectionId) {
    return null;
  }

  const selectedCoins = coins.filter((coin) => currentSelection.includes(coin.id));
  const pendingCoin = coins.find((coin) => coin.id === pendingSelectionId);

  return (
    <div className="dialog-overlay" onClick={(event) => event.stopPropagation()}>
      <div className="dialog-window" role="dialog" aria-modal="true">
        <h2>Select a coin to remove</h2>
        <p>
          5 coins are already selected. To add {pendingCoin?.name || 'the new coin'}, please remove one coin first.
        </p>
        <div className="dialog-list">
          {selectedCoins.map((coin) => (
            <button
              key={coin.id}
              className="dialog-option"
              type="button"
              onClick={() => onConfirm(coin.id)}
            >
              {coin.name} ({coin.symbol.toUpperCase()})
            </button>
          ))}
        </div>
        <button className="secondary-button" type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MaxSelectDialog;
