import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import rift from "@/lib/rift";

// Types
export interface VaultData {
  address: string;
  balance: string;
  rewards: string;
  hasPendingClaim: boolean;
  pendingWithdrawal: string;
  hasPendingWithdrawal: boolean;
}

export interface ProtocolStats {
  tvl: string;
  totalDeposits: string;
  pendingRewards: string;
  rewardsDistributed: string;
  pendingClaimersCount: number;
  pendingWithdrawersCount: number;
}

// Hook to get user's vault data
export function useVaultData() {
  return useQuery({
    queryKey: ["vault-data"],
    queryFn: async (): Promise<VaultData | null> => {
      try {
        const authToken = localStorage.getItem("token");
        if (!authToken) {
          return null;
        }

        rift.setBearerToken(authToken);
        const data = await rift.vault.getMyVaultData();
        return data;
      } catch {
        return null;
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 seconds
    retry: false,
  });
}

// Hook to get protocol stats
export function useProtocolStats() {
  return useQuery({
    queryKey: ["vault-protocol-stats"],
    queryFn: async (): Promise<ProtocolStats | null> => {
      try {
        const stats = await rift.vault.getProtocolStats();
        return stats;
      } catch {
        return null;
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60, // 1 minute
    retry: false,
  });
}

// Hook to deposit into vault
export function useVaultDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: string) => {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        throw new Error("Please log in to continue");
      }

      rift.setBearerToken(authToken);

      if (!rift.vault) {
        throw new Error("Vault service not available. Please update the app.");
      }

      const result = await rift.vault.deposit({ amount });
      return result;
    },
    onSuccess: () => {
      // Refresh vault data after deposit
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["vault-data"] });
        queryClient.invalidateQueries({ queryKey: ["vault-protocol-stats"] });
      }, 3000);
    },
  });
}

// Hook to withdraw from vault
export function useVaultWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: string) => {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        throw new Error("Please log in to continue");
      }

      rift.setBearerToken(authToken);
      const result = await rift.vault.withdraw({ amount });
      return result;
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["vault-data"] });
      }, 3000);
    },
  });
}

// Hook to cancel withdrawal
export function useVaultCancelWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        throw new Error("Please log in to continue");
      }

      rift.setBearerToken(authToken);
      const result = await rift.vault.cancelWithdrawal();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-data"] });
    },
  });
}

// Hook to claim rewards
export function useVaultClaimRewards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        throw new Error("Please log in to continue");
      }

      rift.setBearerToken(authToken);
      const result = await rift.vault.claimRewards();
      return result;
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["vault-data"] });
      }, 3000);
    },
  });
}

// Hook to cancel claim
export function useVaultCancelClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        throw new Error("Please log in to continue");
      }

      rift.setBearerToken(authToken);
      const result = await rift.vault.cancelClaim();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-data"] });
    },
  });
}

