import { useQuery } from "@tanstack/react-query";
import rift from "@/lib/rift";

export interface PointValue {
  pointValue: number;
  totalSupply: number;
  budget: number;
  commitment: number;
  remaining: number;
}

interface PointValueResponse {
  success: boolean;
  data: PointValue;
}

export default function usePointValue() {
  return useQuery({
    queryKey: ["point-value"],
    queryFn: async (): Promise<PointValue | null> => {
      try {
        const authToken = localStorage.getItem("token");
        const apiKey = import.meta.env.VITE_SDK_API_KEY;
        
        console.log("💎 [Point Value] Fetching point value...");
        
        if (!apiKey) {
          console.error("❌ [Point Value] No API key found");
          return null;
        }

        // This is a public endpoint, but we still set token if available
        if (authToken) {
          rift.setBearerToken(authToken);
        }

        const url = "https://payment.riftfi.xyz/api/loyalty/point-value";
        console.log("💎 [Point Value] Calling API:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
        });

        console.log("💎 [Point Value] Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ [Point Value] API error:", response.status, errorText);
          return null;
        }

        const data: PointValueResponse = await response.json();
        console.log("✅ [Point Value] Fetched successfully:", data.data);
        return data.data;
      } catch (error) {
        console.error("❌ [Point Value] Error:", error);
        return null;
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 minutes (this doesn't change often)
    retry: false,
  });
}

