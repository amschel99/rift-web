import { useQuery } from "@tanstack/react-query";
import { fetchCoinPrices } from "@/utils/coingecko/markets";

export const useTokenHistoricalData = (id: string, daysRange: number) => {
  const {
    data: historicalData,
    isLoading: isLoadingHistoricalData,
    error: errorHistoricalData,
  } = useQuery({
    queryKey: ["historicalData", id],
    queryFn: () => fetchCoinPrices(id, daysRange),
  });
  return {
    historicalData,
    isLoadingHistoricalData,
    errorHistoricalData,
  };
};
