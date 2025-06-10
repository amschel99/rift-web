import { useQuery } from "@tanstack/react-query";
import sphere from "@/lib/sphere";

async function getUserBalances() {
  const balances = await sphere.wallet.getChainBalance();

  return balances;
}

export default function useWalletBalances() {
  const userbalances = useQuery({
    queryKey: ["userbalances"],
    queryFn: getUserBalances,
  });

  return { userbalances };
}
