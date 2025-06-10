import useWalletTxHistory from "@/hooks/wallet/use-history";
import { TransactionItem } from "./components/TransactionItem";
import { BalancesLoading } from "../home";

export default function History() {
  const { wallettxhistory } = useWalletTxHistory();
  const { data: TX_HISTORY, isPending: TX_HISTORY_LOADING } = wallettxhistory;

  return (
    <div className="w-full min-h-screen p-6 px-0">
      {TX_HISTORY_LOADING && <BalancesLoading />}

      <h1 className="text-lg font-bold px-4 text-white">Transaction History</h1>

      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        {Array.isArray(TX_HISTORY) &&
          TX_HISTORY?.map((transaction, idx) => (
            <TransactionItem
              key={transaction.token + idx}
              transaction={transaction}
            />
          ))}
      </div>
    </div>
  );
}
