import { useQuery } from "@tanstack/react-query";
import rift from "@/lib/rift";

export interface BaseUSDCBalance {
  usdcAmount: number;
  kesAmount: number;
  exchangeRate: number;
  currency: "KES";
}

async function getBaseUSDCBalance(): Promise<BaseUSDCBalance> {
  try {
    // Ensure rift has the auth token
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      return {
        usdcAmount: 0,
        kesAmount: 0,
        exchangeRate: 0,
        currency: "KES",
      };
    }

    // Set the bearer token on rift instance
    rift.setBearerToken(authToken);

    // 1. Get Base USDC balance directly
    const balanceResponse = await rift.wallet.getTokenBalance({
      token: "USDC",
      chain: "BASE", // Base chain
    });

    const balance = balanceResponse?.data?.at(0);
    const usdcAmount = balance?.amount || 0;

    if (usdcAmount === 0) {
      return {
        usdcAmount: 0,
        kesAmount: 0,
        exchangeRate: 0,
        currency: "KES",
      };
    }

    //use rift sdk to get exchange rate
    const exchangeRateResponse = await rift.offramp.previewExchangeRate({
      currency: "KES" as any,
    });
    const exchangeRate = exchangeRateResponse.rate;
    const kesAmount = usdcAmount * exchangeRate;

    return {
      usdcAmount,
      kesAmount,
      exchangeRate,
      currency: "KES",
    };
  } catch (error) {
    console.error("Failed to get Base USDC balance:", error);
    return {
      usdcAmount: 0,
      kesAmount: 0,
      exchangeRate: 0,
      currency: "KES",
    };
  }
}

export default function useBaseUSDCBalance() {
  const query = useQuery({
    queryKey: ["base-usdc-balance"],
    queryFn: getBaseUSDCBalance,
    refetchInterval: 1000, // Refetch every 1 second for real-time updates
    staleTime: 500, // Consider data stale after 500ms
    refetchIntervalInBackground: true, // Continue refetching even when tab is not active
    refetchOnWindowFocus: true, // Refetch when user comes back to tab
  });

  return {
    data: query.data,
    isLoading: query.isPending || (!query.data && !query.error), // Don't show as loaded if we have no data
    error: query.error,
    refetch: query.refetch,
  };
}
