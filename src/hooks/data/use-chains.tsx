import { getTokens } from "@/lib/assets/tokens";
import { getChains } from "@/lib/assets/chains";
import { useQuery } from "@tanstack/react-query";
import { WalletToken } from "@stratosphere-network/wallet";
import { WalletChain } from "@/lib/entities";

async function getWalletChains() {
  // TODO: make request
  const chains = await getChains() as WalletChain[];
  return chains;
}

async function getWalletAssets() {
  // TODO: make request
  const assets = await getTokens() as WalletToken[];
  return assets;
}

export default function useChains() {
  const chainsquery = useQuery({
    queryKey: ["chains"],
    queryFn: async () => {
      return getWalletChains();
    },
  });

  const assetsquery = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      return getWalletAssets();
    },
  });

  return { chainsquery, assetsquery };
}