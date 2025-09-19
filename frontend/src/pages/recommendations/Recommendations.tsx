import { Card, CardContent } from "@/components";
import CryptoCards from "@/components/CryptoCards";
import { CryptoChart } from "@/components/CryptoChart";
import { useState } from "react";
import { type Cryptocurrency } from '@/api/coingecko';
import { CryptoSelector } from "@/components/CryptoSelector";


const Recommendations = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  return (


    <section className="container mx-auto px-4 py-8 flex flex-col gap-8">

      <Card className="flex flex-col">
        <CardContent className="flex flex-col p-8">
            <h2 className="text-3xl font-semibold pb-3">Aqui estão as Melhores Criptomoedas. Selecionadas para o Seu Perfil de Investidor.</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet velit atque recusandae eveniet, unde, optio voluptates quibusdam, alias modi aliquid dignissimos assumenda ducimus numquam ex quia praesentium dolore? Saepe, nobis!</p>
        </CardContent>

      </Card>

      <div>
        <CryptoCards />
      </div>

      <Card className="flex flex-col p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Valor de mercado</h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
            <CryptoSelector
              selectedCrypto={selectedCrypto}
              onSelect={setSelectedCrypto}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <CryptoChart selectedCrypto={selectedCrypto} />
        </div>

      </Card>
    </section>
  );
}

export default Recommendations