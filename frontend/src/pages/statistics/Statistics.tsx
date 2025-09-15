import { CryptoProvider } from "@/context/CryptoContext";
import CryptoTable from "@/components/CryptoTable";
import Filters from "@/components/Filters";

const Statistics = () => {
  return (
    <CryptoProvider>
      <div><h1>Statistics</h1></div>

      <div className="w-[80%]  flex flex-col  mb-24 relative mx-auto">
        <Filters/>
        <CryptoTable />
      </div>
    </CryptoProvider>
  );
};

export default Statistics;