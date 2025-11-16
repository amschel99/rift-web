import { useQuery } from "@tanstack/react-query";
import rift from "@/lib/rift";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalPoints: number;
  totalVolume: number;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
}

interface LeaderboardResponse {
  success: boolean;
  data: {
    leaderboard: LeaderboardEntry[];
  };
}

export default function useLeaderboard(limit: number = 100) {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      try {
        const apiKey = import.meta.env.VITE_SDK_API_KEY;
        
        console.log("🏆 [Leaderboard] Fetching leaderboard...");
        
        if (!apiKey) {
          console.error("❌ [Leaderboard] No API key found");
          return [];
        }

        const url = `https://payment.riftfi.xyz/api/loyalty/leaderboard?limit=${limit}`;
        console.log("🏆 [Leaderboard] Calling API:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
        });

        console.log("🏆 [Leaderboard] Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ [Leaderboard] API error:", response.status, errorText);
          return [];
        }

        const data: LeaderboardResponse = await response.json();
        console.log("✅ [Leaderboard] Fetched successfully:", data.data.leaderboard.length, "entries");
        return data.data.leaderboard;
      } catch (error) {
        console.error("❌ [Leaderboard] Error:", error);
        return [];
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

