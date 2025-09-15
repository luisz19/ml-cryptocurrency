import { createContext, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";

type CryptoContextType = {
  cryptoData: any;
  setCryptoData: React.Dispatch<React.SetStateAction<any>>;
  searchData: any;
  setSearchData: React.Dispatch<React.SetStateAction<any>>;
  getSearchResult: (query: string) => void;
  setCoinSearch: React.Dispatch<React.SetStateAction<string>>;
  resetFunction: () => void;
};

export const CryptoContext = createContext<CryptoContextType>({
  cryptoData: [],
  setCryptoData: () => { },
  searchData: [],
  setSearchData: () => { },
  getSearchResult: () => { },
  setCoinSearch: () => { },
  resetFunction: () => { },
});

type CryptoProviderProps = {
  children: ReactNode;
};

export const CryptoProvider = ({ children }: CryptoProviderProps) => {
  const [cryptoData, setCryptoData] = useState<any>([]);
  const [searchData, setSearchData] = useState<any>([]);
  const [coinSearch, setCoinSearch] = useState<string>("");

  const getCryptoData = async () => {
    try {
      const url = coinSearch
        ? `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinSearch}&price_change_percentage=1h,24h,7d&per_page=10&order=market_cap_desc`
        : `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=10&order=market_cap_desc&price_change_percentage=1h,24h,7d`;

      const data = await fetch(url).then((res) => res.json());

      setCryptoData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const resetFunction = () => {
    setCoinSearch("");
  };

  const getSearchResult = async (query: string) => {
    try {
      const data = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${query}`
      ).then((res) => res.json());

      setSearchData(data.coins);
    } catch (error) {
      console.log(error);
    }
  };

  useLayoutEffect(() => {
    getCryptoData();
  }, [coinSearch]);

  return (
    <CryptoContext.Provider
      value={{
        cryptoData,
        setCryptoData,
        searchData,
        setSearchData,
        getSearchResult,
        setCoinSearch,
        resetFunction,
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
};
