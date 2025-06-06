import { useQuery } from "@tanstack/react-query";
import { IUserBalance } from "@/v2/pages/token/mock/tokenDetailsMockData";
import {
  IError,
  userBalanceData,
} from "@/v2/pages/token/mock/tokenDetailsMockData";
import Sphere, {
  Environment,
  WalletChain,
  WalletToken,
  ApiResponse,
} from "@stratosphere-network/wallet";
import sphere from "@/lib/sphere";
import { fetchCoinInfo } from "@/utils/coingecko/markets";

export const useTokenPriceChange = (id: string) => {
  const {
    data: tokenPriceChange,
    isLoading: isLoadingTokenPriceChange,
    error: errorTokenPriceChange,
  } = useQuery({
    queryKey: ["tokenPriceChange", id],
    queryFn: () => fetchCoinInfo(id),
    enabled: !!id,
  });
  return {
    tokenPriceChange: tokenPriceChange?.market_data.price_change_percentage_24h,
    tokenPriceChangeUsd:
      tokenPriceChange?.market_data.price_change_24h_in_currency.usd,
    isLoadingTokenPriceChange,
    errorTokenPriceChange,
  };
};
