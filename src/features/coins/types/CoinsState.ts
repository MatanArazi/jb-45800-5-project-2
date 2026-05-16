import type { CoinSummary } from './CoinSummary';
import type { CoinDetails } from './CoinDetails';
import type { SelectionState } from './SelectionState';

export interface CoinsState {
  list: CoinSummary[];
  status: 'idle' | 'loading' | 'failed';
  error?: string;
  details: Record<string, CoinDetails>;
  selection: SelectionState;
}
