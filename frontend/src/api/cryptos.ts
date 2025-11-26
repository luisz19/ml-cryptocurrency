const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
import type { Cryptocurrency } from './coingecko';
import { apiCache } from '@/lib/cache';
import { retryWithBackoff, coinGeckoLimiter } from '@/lib/rate-limiter';

// Cache TTL para batch de moedas
const COIN_BATCH_CACHE_TTL = 3 * 60 * 1000; // 3 minutos

export interface CryptoResponse {
  id: number;
  name: string;
  symbol: string;
}

export interface CryptoCreate {
  name: string;
  symbol: string;
}

export type profileType = 'baixo' | 'moderado' | 'alto';

// Estrutura bruta vinda do backend em /recommendations/recommender
interface RawRecommendationItem {
  symbol: string;
  network: string;
  Risk_Level: profileType; // campo vem capitalizado
  predicted_movement: number;
  predicted_proba_up: number;
  eligible_for_profile: boolean;
}

interface RawRecommendationsPayload {
  profile: profileType;
  recommendations: RawRecommendationItem[];
}

// Estrutura enriquecida (CoinGecko + metadados do recomendador)
export interface EnrichedRecommendation extends Cryptocurrency {
  profile_source: profileType;              // perfil do usuário retornado pelo backend
  risk_level: profileType;                  // Risk_Level normalizado
  network: string;
  predicted_movement: number;               // 0 = queda / 1 = alta (interpretação assumida)
  predicted_proba_up: number;               // probabilidade de alta
  eligible_for_profile: boolean;            // se elegível ao perfil do usuário
}

export interface CryptoRecommendationsResult {
  profile: profileType;
  recommendations: EnrichedRecommendation[];
}


// Mantido para compatibilidade com possíveis objetos antigos (não mais utilizado na rota atual)
// (Tipo legado não utilizado removido)

/**
 * Busca dados da CoinGecko em BATCH para otimizar chamadas de API.
 * Faz UMA ÚNICA requisição e cacheia todos os resultados.
 */
async function fetchCoinGeckoBatch(): Promise<Map<string, Cryptocurrency>> {
  const cacheKey = 'coingecko-batch-all';
  
  // Verifica se já temos o batch cacheado
  const cached = apiCache.get<Map<string, Cryptocurrency>>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const result = await coinGeckoLimiter.schedule(() =>
      retryWithBackoff(async () => {
        const response = await fetch(
          `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=24h`
        );
        
        if (!response.ok) {
          const error: any = new Error('Failed to fetch batch coin data');
          error.status = response.status;
          throw error;
        }
        
        return await response.json();
      })
    );
    
    // Cria um mapa com symbol como chave para busca rápida
    const coinMap = new Map<string, Cryptocurrency>();
    
    result.forEach((coin: any) => {
      const crypto: Cryptocurrency = {
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap_rank: coin.market_cap_rank,
        sparkline_in_7d: coin.sparkline_in_7d
      };
      
      // Indexa por symbol (lowercase) e por name (lowercase)
      coinMap.set(coin.symbol.toLowerCase(), crypto);
      coinMap.set(coin.name.toLowerCase(), crypto);
    });
    
    // Cacheia o batch completo
    apiCache.set(cacheKey, coinMap, COIN_BATCH_CACHE_TTL);
    
    return coinMap;
  } catch (error) {
    console.error('Error fetching CoinGecko batch:', error);
    return new Map();
  }
}

async function fetchCoinGeckoDataByNameOrSymbol(name: string, symbol: string): Promise<Cryptocurrency | null> {
  try {
    // Busca o batch completo (cacheado)
    const coinMap = await fetchCoinGeckoBatch();
    
    // Procura por symbol primeiro, depois por name
    const result = coinMap.get(symbol.toLowerCase()) || coinMap.get(name.toLowerCase()) || null;
    
    return result;
  } catch (error) {
    console.error(`Error fetching CoinGecko data for ${name}/${symbol}:`, error);
    return null;
  }
}

export const cryptosApi = {
  // Nova assinatura: retorna objeto com perfil do usuário + lista enriquecida
  getRecommendations: async (): Promise<CryptoRecommendationsResult> => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const rawPayload: RawRecommendationsPayload = await fetch(`${API_BASE}/recommendations/recommender`, { headers })
      .then(res => res.json())
      .catch(err => { throw new Error('Falha ao buscar recomendações: ' + err?.message); });

    const userProfile = rawPayload.profile;
    const items = Array.isArray(rawPayload.recommendations) ? rawPayload.recommendations : [];

    const enriched: EnrichedRecommendation[] = (await Promise.all(
      items.map(async (item) => {
        try {
          const symbol = item.symbol;
          if (!symbol) return null;
          // Usamos o símbolo tanto para nome quanto para busca simplificada
          const coingeckoData = await fetchCoinGeckoDataByNameOrSymbol(symbol, symbol);
          if (!coingeckoData) return null;
          return {
            ...coingeckoData,
            profile_source: userProfile,
            risk_level: item.Risk_Level,
            network: item.network,
            predicted_movement: item.predicted_movement,
            predicted_proba_up: item.predicted_proba_up,
            eligible_for_profile: item.eligible_for_profile,
          } satisfies EnrichedRecommendation;
        } catch (e) {
          console.error('Erro ao enriquecer recomendação:', e);
          return null;
        }
      })
    )).filter(Boolean) as EnrichedRecommendation[];

    return { profile: userProfile, recommendations: enriched };
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
