import React, { useEffect, useState } from "react";

type Coin = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
};

const CryptoCards: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple&order=market_cap_desc&per_page=3&page=1&sparkline=false"
    )
      .then((res) => res.json())
      .then((data) => setCoins(data));
  }, []);

  return (
    <div className="w-full flex flex-col sm:flex-row gap-8 justify-center">
      {coins.map((coin) => {
        const isPositive = coin.price_change_percentage_24h >= 0;
        return (
          <div
            key={coin.id}
            className="flex items-center justify-between flex-1 
                       bg-white dark:bg-[#1B2028] 
                       rounded-md shadow p-5 transition-colors"
          >

            <div className="flex items-center gap-3">
              <img src={coin.image} alt={coin.name} className="w-8 h-8" />
              <div>
                <h2 className="text-sm text-gray-600 dark:text-gray-400">
                  {coin.name}
                </h2>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${coin.current_price.toLocaleString()}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center text-sm font-semibold ${
                isPositive ? "text-[#99E39E]" : "text-red-500"
              }`}
            >
              {isPositive ? "▲" : "▼"} {coin.price_change_percentage_24h.toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CryptoCards;
