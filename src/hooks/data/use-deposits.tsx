import { useQuery } from "@tanstack/react-query";
import rift from "@/lib/rift";

export interface Deposit {
  id: string;
  userId: string;
  transactionHash: string;
  blockNumber: string;
  blockTimestamp: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  rawAmount: string;
  exchangeRate: number;
  kesAmount: number;
  processed: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    phoneNumber: string;
  };
}

export interface GetAllDepositsResponse {
  deposits: Deposit[];
}

export const useDeposits = () => {
  const getDeposits = async (): Promise<Deposit[]> => {
    try {
      // Set auth token
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        throw new Error("No authentication token found");
      }
      rift.setBearerToken(authToken);
      
      const response = await (rift as any).deposits.getAllDeposits();
      
      // Handle both direct array and nested response
      const deposits = (response as any)?.deposits || response || [];
      
      // Ensure we return an array and sort by createdAt (latest first)
      const depositsArray = Array.isArray(deposits) ? deposits : [];
      const sortedDeposits = depositsArray.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Latest first (descending order)
      });
      
      return sortedDeposits;
    } catch {
      return [];
    }
  };

  return useQuery({
    queryKey: ["deposits"],
    queryFn: getDeposits,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
