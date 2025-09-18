const BASE_URL = 'https://api.coingecko.com/api/v3';

export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
}

export interface PriceData {
  timestamp: number;
  price: number;
}

export interface ChartData {
  prices: [number, number][];
}

export const fetchTopCryptocurrencies = async (limit: number = 100): Promise<Cryptocurrency[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch cryptocurrencies');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    throw error;
  }
};

export const fetchCryptoPriceHistory = async (
  coinId: string,
  days: number = 7
): Promise<PriceData[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch price history');
    }
    
    const data: ChartData = await response.json();
    
    return data.prices.map(([timestamp, price]) => ({
      timestamp,
      price,
    }));
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
};

export const fetchCryptocurrencyDetails = async (coinId: string): Promise<Cryptocurrency> => {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch cryptocurrency details');
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
  } catch (error) {
    console.error('Error fetching cryptocurrency details:', error);
    throw error;
  }
};