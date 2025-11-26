import { apiCache } from '@/lib/cache';
import { retryWithBackoff, coinGeckoLimiter } from '@/lib/rate-limiter';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache TTL configs
const CACHE_TTL = {
  MARKETS: 2 * 60 * 1000,      // 2 minutos para listagem de mercados
  PRICE_HISTORY: 5 * 60 * 1000, // 5 minutos para histórico de preços
  DETAILS: 3 * 60 * 1000,       // 3 minutos para detalhes
};

export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  sparkline_in_7d?: { price: number[] };
}

export interface PriceData {
  timestamp: number;
  price: number;
}

export interface ChartData {
  prices: [number, number][];
}

export const fetchTopCryptocurrencies = async (limit: number = 100): Promise<Cryptocurrency[]> => {
  const cacheKey = `top-cryptos-${limit}`;
  
  // Verifica cache primeiro
  const cached = apiCache.get<Cryptocurrency[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const result = await coinGeckoLimiter.schedule(() =>
      retryWithBackoff(async () => {
        const response = await fetch(
          `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
        );
        
        if (!response.ok) {
          const error: any = new Error('Failed to fetch cryptocurrencies');
          error.status = response.status;
          throw error;
        }
        
        return await response.json();
      })
    );
    
    // Salva no cache
    apiCache.set(cacheKey, result, CACHE_TTL.MARKETS);
    return result;
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    throw error;
  }
};

export const fetchTopCryptocurrenciesWithSparkline = async (limit: number = 50, currency: string = 'usd'): Promise<Cryptocurrency[]> => {
  const cacheKey = `top-cryptos-sparkline-${limit}-${currency}`;
  
  // Verifica cache primeiro
  const cached = apiCache.get<Cryptocurrency[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const result = await coinGeckoLimiter.schedule(() =>
      retryWithBackoff(async () => {
        const response = await fetch(
          `${BASE_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`
        );
        
        if (!response.ok) {
          const error: any = new Error('Failed to fetch cryptocurrencies with sparkline');
          error.status = response.status;
          throw error;
        }
        
        return await response.json();
      })
    );
    
    // Salva no cache
    apiCache.set(cacheKey, result, CACHE_TTL.MARKETS);
    return result;
  } catch (error) {
    console.error('Error fetching cryptocurrencies with sparkline:', error);
    throw error;
  }
};

export const fetchCryptoPriceHistory = async (
  coinId: string,
  days: number = 7
): Promise<PriceData[]> => {
  const cacheKey = `price-history-${coinId}-${days}`;
  
  // Verifica cache primeiro
  const cached = apiCache.get<PriceData[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const result = await coinGeckoLimiter.schedule(() =>
      retryWithBackoff(async () => {
        const response = await fetch(
          `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`
        );
        
        if (!response.ok) {
          const error: any = new Error('Failed to fetch price history');
          error.status = response.status;
          throw error;
        }
        
        const data: ChartData = await response.json();
        
        return data.prices.map(([timestamp, price]) => ({
          timestamp,
          price,
        }));
      })
    );
    
    // Salva no cache
    apiCache.set(cacheKey, result, CACHE_TTL.PRICE_HISTORY);
    return result;
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
};

export const fetchCryptocurrencyDetails = async (coinId: string): Promise<Cryptocurrency> => {
  const cacheKey = `crypto-details-${coinId}`;
  
  // Verifica cache primeiro
  const cached = apiCache.get<Cryptocurrency>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const result = await coinGeckoLimiter.schedule(() =>
      retryWithBackoff(async () => {
        const response = await fetch(
          `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
        );
        
        if (!response.ok) {
          const error: any = new Error('Failed to fetch cryptocurrency details');
          error.status = response.status;
          throw error;
        }
        
        const data = await response.json();
        
        return {
          id: data.id,
          symbol: data.symbol,
          name: data.name,
          image: data.image.large,
          current_price: data.market_data.current_price.usd,
          price_change_percentage_24h: data.market_data.price_change_percentage_24h,
          market_cap_rank: data.market_cap_rank,
        };
      })
    );
    
    // Salva no cache
    apiCache.set(cacheKey, result, CACHE_TTL.DETAILS);
    return result;
  } catch (error) {
    console.error('Error fetching cryptocurrency details:', error);
    throw error;
  }
};