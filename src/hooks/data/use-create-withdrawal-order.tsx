import { useMutation, useQueryClient } from "@tanstack/react-query";
import rift from "@/lib/rift";

export interface CreateOfframpOrderRequest {
  token: "USDC" | any;
  amount: number; // USD amount (KES amount / exchange rate)
  currency: "KES" | any;
  chain: "base" | any;
  recipient: string; // JSON stringified Recipient object
}

export interface OfframpOrder {
  id: string;
  status: string;
  transactionCode: string;
  amount: number;
  createdAt: string;
}

export interface CreateOfframpOrderResponse {
  order: OfframpOrder;
}

async function createWithdrawalOrder(request: CreateOfframpOrderRequest): Promise<CreateOfframpOrderResponse> {
  try {
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      throw new Error("No authentication token found");
    }
    
    rift.setBearerToken(authToken);
    
    const response = await rift.offramp.createOrder(request);
    return response;
  } catch (error) {
    
    throw error;
  }
}

export default function useCreateWithdrawalOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWithdrawalOrder,
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["base-usdc-balance"] });
        queryClient.invalidateQueries({ queryKey: ["sailr-balances"] });
        queryClient.invalidateQueries({ queryKey: ["chains-balances"] });
      }, 3000);
    },
  });
}