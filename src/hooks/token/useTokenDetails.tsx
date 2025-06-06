import {
  IError,
  ITokenDetails,
  tokenDetailsData,
} from "@/v2/pages/token/mock/tokenDetailsMockData";
import { useQuery } from "@tanstack/react-query";
import { WalletToken } from "@stratosphere-network/wallet";
import sphere from "@/lib/sphere";
import { fetchCoinInfo } from "@/utils/coingecko/markets";

// async function getUserOwnedTokens(): Promise<WalletToken[] | null> {
//   try {
//     const response = await sphere.assets.getUserTokens();

//     if (response.data) {
//       console.log(`User owns ${response.data.length} different tokens:`);
//       response.data.forEach((token) => {
//         console.log(`\n  Token: ${token.name}`);
//         console.log(`  ID: ${token.id}`);
//         console.log(`  Chain: ${token.chain_id}`);
//         if (token.contract_address) {
//           console.log(`  Contract: ${token.contract_address}`);
//         }
//       });
//       return response.data;
//     }
//     return null;
//   } catch (error) {
//     throw error;
//   }
// }

export const useTokenDetails = (id: string) => {
  const {
    data: tokenDetails,
    isLoading: isLoadingTokenDetails,
    error: errorTokenDetails,
  } = useQuery({
    queryKey: ["tokenDetails", id],
    queryFn: () => fetchCoinInfo(id),
    enabled: !!id,
  });

  if (tokenDetails && "error" in tokenDetails) {
    return {
      tokenDetails: null,
      isLoadingTokenDetails: false,
      errorTokenDetails: tokenDetails.error,
    };
  }

  return { tokenDetails, isLoadingTokenDetails, errorTokenDetails };
};
