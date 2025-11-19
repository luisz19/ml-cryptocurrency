// const API_BASE = 'https://cryptolens-backend.onrender.com';
const API_BASE = 'http://localhost:8000';
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
