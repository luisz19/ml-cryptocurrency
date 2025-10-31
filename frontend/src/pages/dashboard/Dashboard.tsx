import { useState } from 'react';
import { CryptoChart } from '@/components/CryptoChart';
import { CryptoSelector } from '@/components/CryptoSelector';
import { type Cryptocurrency } from '@/api/coingecko';
import CryptoCards from '@/components/CryptoCards';

const Dashboard = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <CryptoCards />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
            <CryptoSelector
              selectedCrypto={selectedCrypto}
              onSelect={setSelectedCrypto}
            />
          </div>

          <CryptoChart selectedCrypto={selectedCrypto} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard