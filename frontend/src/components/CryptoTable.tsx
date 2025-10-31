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
    <div className="flex flex-col mt-9 bg-white dark:bg-[#1B2028] rounded-md p-4">
      {cryptoData && cryptoData.length > 0 ? (
        <table className="w-full text-xs">
          <thead className="capitalize text-xs font-medium border-b border-gray-300 dark:border-[#23262F] text-gray-800 dark:text-gray-100">
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
                <td className="py-4 text-gray-800 dark:text-gray-100">{data.market_cap_rank}</td>

                <td className="w-4 h-4">
                  <img
                    className="w-[2.2rem] h-[2.2rem]"
                    src={data.image}
                    alt={data.name}
                  />
                </td>

                <td className="py-4 text-gray-800 dark:text-gray-100">{data.name}</td>

                <td className="py-4 text-gray-800 dark:text-gray-100">{formatPrice(data.current_price)}</td>

                <td
                  className={
                    data.market_cap_change_percentage_24h > 0
                      ? "py-4 text-[#99E39E] dark:text-[#58BD7D]"
                      : "py-4 text-[#D43D3D] dark:text-[#D33535]"
                  }
                >
                  {Number(data.market_cap_change_percentage_24h).toFixed(2)}%
                </td>

                <td
                  className={
                    data.price_change_percentage_1h_in_currency > 0
                      ? "py-4 text-[#99E39E] dark:text-[#58BD7D]"
                      : "py-4 text-[#D43D3D] dark:text-[#D33535]"
                  }
                >
                  {Number(data.price_change_percentage_1h_in_currency).toFixed(2)}%
                </td>

                <td
                  className={
                    data.price_change_percentage_24h_in_currency > 0
                      ? "py-4 text-[#99E39E] dark:text-[#58BD7D]"
                      : "py-4 text-[#D43D3D] dark:text-[#D33535]"
                  }
                >
                  {Number(data.price_change_percentage_24h_in_currency).toFixed(2)}%
                </td>

                <td
                  className={
                    data.price_change_percentage_7d_in_currency > 0
                      ? "py-4 text-[#99E39E] dark:text-[#58BD7D]"
                      : "py-4 text-[#D43D3D] dark:text-[#D33535]"
                  }
                >
                  {Number(data.price_change_percentage_7d_in_currency).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex items-center justify-center h-32 gap-2 text-gray-800 dark:text-white">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Carregando...</span>
        </div>
      )}
    </div>
  );
};

export default CryptoTable;
