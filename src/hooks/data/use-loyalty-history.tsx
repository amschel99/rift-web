import { useQuery } from "@tanstack/react-query";
import rift from "@/lib/rift";

export interface LoyaltyActivity {
  id: string;
  type: "OFFRAMP" | "ONRAMP" | "PAYMENT" | "BLOCKCHAIN_TXN" | "AIRTIME";
  pointsEarned: number;
  transactionValue: number;
  transactionId: string;
  createdAt: string;
  metadata: {
    currency?: string;
    isUtility?: boolean;
    chain?: string;
    token?: string;
  };
}

interface LoyaltyHistoryResponse {
  success: boolean;
  data: {
    activities: LoyaltyActivity[];
  };
}

export default function useLoyaltyHistory() {
  return useQuery({
    queryKey: ["loyalty-history"],
    queryFn: async (): Promise<LoyaltyActivity[]> => {
      try {
        const authToken = localStorage.getItem("token");
        const apiKey = import.meta.env.VITE_SDK_API_KEY;
        
        console.log("📜 [Loyalty] Fetching loyalty history...");
        
        if (!authToken || !apiKey) {
          console.error("❌ [Loyalty History] Missing auth token or API key");
          return [];
        }

        rift.setBearerToken(authToken);

        const url = "https://payment.riftfi.xyz/api/loyalty/history";
        console.log("📜 [Loyalty] Calling API:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
            "x-api-key": apiKey,
          },
        });

        console.log("📜 [Loyalty] Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ [Loyalty History] API error:", response.status, errorText);
          
          // If 404 or other error, return empty array
          if (response.status === 404) {
            console.log("ℹ️ [Loyalty History] No history found (404)");
            return [];
          }
          return [];
        }

        const data: LoyaltyHistoryResponse = await response.json();
        console.log("✅ [Loyalty History] Fetched successfully:", data.data.activities.length, "activities");
        return data.data.activities;
      } catch (error) {
        console.error("❌ [Loyalty History] Error:", error);
        // Return empty array instead of throwing
        return [];
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 seconds
    retry: false,
  });
}

