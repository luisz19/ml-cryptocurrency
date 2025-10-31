const API_BASE = 'http://localhost:8000';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export interface CryptoResponse {
  id: number;
  name: string;
  symbol: string;
}

export interface CryptoCreate {
  name: string;
  symbol: string;
}

async function fetchCoinGeckoDataByNameOrSymbol(name: string, symbol: string): Promise<any> {
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
  getRecommendations: async (): Promise<any[]> => {
    const recommendations = await fetch(`${API_BASE}/crypto/`).then(res => res.json());
    
    const recommendationsWithData = await Promise.all(
      recommendations.map(async (crypto: CryptoResponse) => {
        const coingeckoData = await fetchCoinGeckoDataByNameOrSymbol(crypto.name, crypto.symbol);
        if (!coingeckoData) {
          return null;
        }
        return coingeckoData;
      })
    );
    
    return recommendationsWithData.filter(Boolean);
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
