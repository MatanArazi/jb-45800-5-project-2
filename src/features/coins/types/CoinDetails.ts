export interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  image: { small: string; thumb: string };
  market_data: {
    current_price: { usd: number; eur: number; ils: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_30d_in_currency: { usd: number | null };
    price_change_percentage_60d_in_currency: { usd: number | null };
    price_change_percentage_200d_in_currency: { usd: number | null };
  };
}
