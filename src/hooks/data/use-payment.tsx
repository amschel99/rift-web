import { useMutation, useQueryClient } from "@tanstack/react-query";
import rift from "@/lib/rift";

export interface PayRequest {
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

export interface PayResponse {
  order: OfframpOrder;
}

async function makePayment(request: PayRequest): Promise<PayResponse> {
  try {
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      throw new Error("No authentication token found");
    }
    
    rift.setBearerToken(authToken);
    
    const response = await rift.offramp.pay(request);
    return response;
  } catch (error) {
    
    throw error;
  }
}

export default function usePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: makePayment,
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["base-usdc-balance"] });
        queryClient.invalidateQueries({ queryKey: ["sailr-balances"] });
        queryClient.invalidateQueries({ queryKey: ["chains-balances"] });
      }, 3000);
    },
  });
}