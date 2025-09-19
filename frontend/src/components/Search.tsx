import React, { useContext, useState, useCallback, useEffect } from "react";
import { CryptoContext } from "@/context/CryptoContext";
import { SearchIcon } from "lucide-react";
import debounce from "lodash/debounce";

interface Coin {
  id: string;
  thumb: string;
  name: string;
}

interface SearchInputProps {
  handleSearch: (val: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ handleSearch }) => {
  const [searchText, setSearchText] = useState<string>("");

  const { searchData, setCoinSearch, setSearchData } = useContext(CryptoContext) as {
    searchData: Coin[];
    setCoinSearch: React.Dispatch<React.SetStateAction<string>>;
    setSearchData: React.Dispatch<React.SetStateAction<any>>;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchText(query);

    if (query.trim() === "") {
      setSearchData([]);
      setCoinSearch("");
    } else {
      handleSearch(query);
    }
  };

  const selectCoin = (coinId: string) => {
    setCoinSearch(coinId);
    setSearchText("");
    setSearchData([]);
  };

  return (
    <>
      <form
        className="w-96 relative flex items-center"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="text"
          name="search"
          value={searchText}
          onChange={handleInput}
          className="w-full rounded bg-white dark:bg-[#222630] text-gray-800 dark:text-white text-sm pl-9 pr-3 p-1
            border border-gray-300 dark:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5e6066]
            placeholder:text-gray-400 dark:placeholder:text-gray-400 transition-all duration-200"
          placeholder="Pesquisar"
          autoComplete="off"
        />

        <button
          type="submit"
          className="absolute left-3 top-1/2 -translate-y-1/2"
          disabled
        >
          <SearchIcon className="w-4 h-4 text-gray-400 dark:text-gray-400" />
        </button>
      </form>

      {searchText.length > 0 && (
        <ul className="absolute top-11 right-0 w-96 h-96 rounded overflow-x-hidden py-2 bg-white dark:bg-[#37383B] text-gray-800 dark:text-white text-sm overflow-y-auto shadow-lg">
          {searchData.length === 0 ? (
            <li className="flex flex-col items-center justify-center py-10">
              <div className="w-6 h-6 border-4 border-t-transparent border-gray-400 dark:border-white rounded-full animate-spin mb-3"></div>
              <span>Por favor, espere...</span>
            </li>
          ) : (
            searchData.map((coin: Coin) => (
              <li
                key={coin.id}
                className="flex items-center m-5 my-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                onClick={() => selectCoin(coin.id)}
              >
                <img
                  className="w-[1rem] h-[1rem] max-w-[1.5rem] m-2"
                  src={coin.thumb}
                  alt={coin.name}
                />
                <span>{coin.name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </>
  );
};

const Search: React.FC = () => {
  const { getSearchResult } = useContext(CryptoContext);

  const debounceFunc = useCallback(
    debounce((val: string) => {
      getSearchResult(val);
    }, 500),
    [getSearchResult]
  );

  useEffect(() => {
    return () => {
      debounceFunc.cancel();
    };
  }, [debounceFunc]);

  return (
    <div className="relative">
      <SearchInput handleSearch={debounceFunc} />
    </div>
  );
};

export default Search;