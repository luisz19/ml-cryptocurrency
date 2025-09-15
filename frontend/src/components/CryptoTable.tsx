import React, { useContext } from "react";
import { CryptoContext } from "@/context/CryptoContext";


interface CryptoDataItem {
  id: string;
  name: string;
  image: string;
  current_price: number;
  market_cap_change_percentage_24h: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  market_cap_rank: number;
}


const formatPrice = (price: number) => {
  return `$ ${price.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const CryptoTable: React.FC = () => {
  const context = useContext(CryptoContext);

  if (!context) return null;

  const { cryptoData } = context;

  return (
    <>
        <div className="flex flex-col mt-9 bg-[#1B2028] rounded-md p-4">
      {cryptoData && cryptoData.length > 0 ? (
        <table className="w-full text-xs">
          <thead className="capitalize text-xs text-gray-100 font-medium border-b border-[#23262F]">
            <tr>
              <th className="py-1">Rank</th>
              <th className="py-1">Moeda</th>
              <th className="py-1">Nome</th>
              <th className="py-1">Valor</th>
              <th className="py-1">Valorização</th>
              <th className="py-1">1H</th>
              <th className="py-1">24H</th>
              <th className="py-1">7D</th>
            </tr>
          </thead>
          <tbody>
            {cryptoData.map((data: CryptoDataItem) => (
              <tr key={data.id} className="text-center text-xs">
                <td className="py-4">{data.market_cap_rank}</td>

                <td className="w-4 h-4">
                  <img
                    className="w-[2.2rem] h-[2.2rem] max-1.5"
                    src={data.image}
                    alt={data.image}
                  />
                </td>

                <td className="py-4">{data.name}</td>

                {}
                <td className="py-4">{formatPrice(data.current_price)}</td>

                <td
                  className={
                    data.market_cap_change_percentage_24h > 0
                      ? "text-[#58BD7D] py-4"
                      : "text-[#D33535] py-4"
                  }
                >
                  {Number(data.market_cap_change_percentage_24h).toFixed(2)}%
                </td>

                <td
                  className={
                    data.price_change_percentage_1h_in_currency > 0
                      ? "text-[#58BD7D] py-4"
                      : "text-[#D33535] py-4"
                  }
                >
                  {Number(data.price_change_percentage_1h_in_currency).toFixed(2)}%
                </td>

                <td
                  className={
                    data.price_change_percentage_24h_in_currency > 0
                      ? "text-[#58BD7D] py-4"
                      : "text-[#D33535] py-4"
                  }
                >
                  {Number(data.price_change_percentage_24h_in_currency).toFixed(2)}%
                </td>

                <td
                  className={
                    data.price_change_percentage_7d_in_currency > 0
                      ? "text-[#58BD7D] py-4"
                      : "text-[#D33535] py-4"
                  }
                >
                  {Number(data.price_change_percentage_7d_in_currency).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-white">Nenhum dado disponível</p>
      )}
    </div>
    </>
  );
};

export default CryptoTable;
