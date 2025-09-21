import { useQuery } from "@tanstack/react-query";
import rift from "@/lib/rift";

export interface GetWithdrawalFeeResponse {
  fee: number;
}

async function getWithdrawalFee(amount: number): Promise<GetWithdrawalFeeResponse> {
  try {
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      throw new Error("No authentication token found");
    }
    
    rift.setBearerToken(authToken);
    
    const response = await rift.offramp.getWithdrawalFee(amount);
    return response;
  } catch (error) {
    console.error("Error fetching withdrawal fee:", error);
    throw error;
  }
}

export default function useWithdrawalFee(amount: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["withdrawal-fee", amount],
    queryFn: () => getWithdrawalFee(amount),
    enabled: enabled && amount > 0,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}