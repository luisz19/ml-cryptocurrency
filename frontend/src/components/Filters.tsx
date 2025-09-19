import { useContext } from "react";
import { CryptoContext } from "../context/CryptoContext";
import Search from "./Search";

const Filters = () => {
  const { resetFunction } = useContext(CryptoContext);

  return (
    <div className="h-12 bg-white dark:bg-[#1B2028] rounded-md flex items-center justify-between relative px-4">
      <Search />

      <button
        className="bg-[#F0FBF1] dark:bg-[#2F3D39] text-gray-800 dark:text-gray-200 px-4 py-1 w-50 rounded text-sm hover:bg-gray-300 dark:hover:bg-[#3A443D] transition-colors duration-200 cursor-pointer"
        onClick={resetFunction}
      >
        Resetar
      </button>
    </div>
  );
};

export default Filters;
