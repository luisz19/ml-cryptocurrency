const API_BASE = 'https://cryptolens-backend.onrender.com';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
import type { Cryptocurrency } from './coingecko';

export interface CryptoResponse {
  id: number;
  name: string;
  symbol: string;
}

export interface CryptoCreate {
  name: string;
  symbol: string;
}

type RecommendationRaw = {
  id: number;
  crypto_id?: number;
  risk_level?: string;
  user_id?: number;
  name?: string;
  symbol?: string;
};

async function fetchCoinGeckoDataByNameOrSymbol(name: string, symbol: string): Promise<Cryptocurrency | null> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=&per_page=250&page=1&sparkline=true&price_change_percentage=24h`
    );
    
    if (!response.ok) return null;
    
    const coins = await response.json();
    const coin = coins.find((c: any) => 
      c.symbol.toLowerCase() === symbol.toLowerCase() ||
      c.name.toLowerCase() === name.toLowerCase()
    );
    
    return coin ? {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap_rank: coin.market_cap_rank,
      sparkline_in_7d: coin.sparkline_in_7d
    } : null;
  } catch (error) {
    console.error(`Error fetching CoinGecko data for ${name}/${symbol}:`, error);
    return null;
  }
}

export const cryptosApi = {
  getRecommendations: async (): Promise<Cryptocurrency[]> => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const recommendations: RecommendationRaw[] = await fetch(`${API_BASE}/recommendations/`, { headers }).then(res => res.json());
    
    const recommendationsWithData = await Promise.all(
      recommendations.map(async (item: RecommendationRaw) => {
        try {
          let name = item.name;
          let symbol = item.symbol;

          // Se vier apenas o crypto_id do backend, buscar os dados da crypto primeiro
          if ((!name || !symbol) && item.crypto_id) {
            const crypto: CryptoResponse = await fetch(`${API_BASE}/cryptos/${item.crypto_id}`).then(r => r.json());
            name = crypto?.name;
            symbol = crypto?.symbol;
          }

          if (!name || !symbol) return null;

          const coingeckoData = await fetchCoinGeckoDataByNameOrSymbol(name, symbol);
          return coingeckoData;
        } catch (e) {
          console.error('Error building recommendation item:', e);
          return null;
        }
      })
    );
    
    return recommendationsWithData.filter(Boolean) as Cryptocurrency[];
  },
  getAll: (): Promise<CryptoResponse[]> => 
    fetch(`${API_BASE}/cryptos/`).then(res => res.json()),
  
  create: (data: CryptoCreate): Promise<CryptoResponse> => 
    fetch(`${API_BASE}/cryptos/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  
  getById: (id: number): Promise<CryptoResponse> => 
    fetch(`${API_BASE}/cryptos/${id}`).then(res => res.json())
};

export function fetchRecomendations() {

}
