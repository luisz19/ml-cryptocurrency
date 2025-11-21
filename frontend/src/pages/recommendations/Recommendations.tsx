import { Card, CardContent } from "@/components";
import CryptoCards from "@/components/CryptoCards";
import { CryptoChart } from "@/components/CryptoChart";
import { useState, useEffect } from "react";
// import { type Cryptocurrency } from '@/api/coingecko';
import { CryptoSelector } from "@/components/CryptoSelector";
import { MarketTable } from '@/components/MarketTable';
import { cryptosApi, type EnrichedRecommendation, type CryptoRecommendationsResult } from '@/api/cryptos';


const Recommendations = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<EnrichedRecommendation | null>(null);
  const [recommendations, setRecommendations] = useState<EnrichedRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const result: CryptoRecommendationsResult = await cryptosApi.getRecommendations();
        setUserProfile(result.profile);
        setRecommendations(result.recommendations);
        if (!selectedCrypto && result.recommendations.length > 0) {
          setSelectedCrypto(result.recommendations[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar recomendações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);
  return (


    <section className="container mx-auto px-4 py-8 flex flex-col gap-8">

      <Card className="flex flex-col">
        <CardContent className="flex flex-col p-8 gap-2">
          <h2 className="text-3xl font-semibold pb-1">Recomendações para seu perfil: <span className="text-primary capitalize">{userProfile || '—'}</span></h2>
          <p className="text-muted-foreground text-sm max-w-3xl">Lista gerada com base no seu perfil de risco e métricas preditivas. A coluna Elegível indica se o ativo está alinhado ao seu perfil atual.</p>
        </CardContent>
      </Card>

      <div>
        <CryptoCards />
      </div>

      <Card className="container mx-auto p-10 flex flex-col">
        {loading ? (
          <div className="text-center py-8">Carregando recomendações...</div>
        ) : (
          <MarketTable
            data={recommendations}
            selectedId={selectedCrypto?.id || null}
            onSelect={(coin:any) => setSelectedCrypto(coin)}
          />
        )}
      </Card>


      <Card className="flex flex-col p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Valor de mercado</h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
            <CryptoSelector
              selectedCrypto={selectedCrypto as any}
              onSelect={(c:any) => setSelectedCrypto(c)}
              cryptos={recommendations as any}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <CryptoChart selectedCrypto={selectedCrypto as any} />
        </div>

      </Card>
    </section>
  );
}

export default Recommendations