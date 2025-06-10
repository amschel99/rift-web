import { MpesaTransactionHistoryItem, Transaction } from "@stratosphere-network/wallet";
import { formatDistanceToNow } from "date-fns";
import useCoinGecko from "@/hooks/data/use-coin-gecko";

interface TransactionItemProps {
  transaction: Transaction;
  isOnramp: boolean
  onrampitem: MpesaTransactionHistoryItem
}

export const TransactionItem = ({ transaction, isOnramp, onrampitem }: Partial<TransactionItemProps>) => {
  const { token, transaction_hash, amount, created_at, chain } = transaction as Transaction;
  const { cryptoAmount, amountInUSD, status, transactionDate, cryptoTxHash, currency } = onrampitem as MpesaTransactionHistoryItem;
  const { getAssetImage } = useCoinGecko();

  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(Number(isOnramp ? cryptoAmount : amount));

  const shortenedHash = `${isOnramp ? cryptoTxHash : transaction_hash.slice(
    0,
    6
  )}...${isOnramp ? cryptoTxHash?.slice(-4) : transaction_hash.slice(-4)}`;
  const timeAgo = formatDistanceToNow(new Date(isOnramp ? transactionDate as string : created_at), {
    addSuffix: true,
  });

  return (
    <div className="w-full border-b border-[rgba(255,255,255,0.1)] py-2.5 px-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center">
          <img
            src={getAssetImage(isOnramp ? currency : token)}
            alt={isOnramp ? currency : token}
            className="w-8 h-8 object-contain"
          />
        </div>

        <div className="flex-1 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-white font-semibold">
              {formattedAmount} {isOnramp ? currency : token}
            </span>
            <span className="text-[rgba(255,255,255,0.5)] text-sm">
              {timeAgo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://etherscan.io/tx/${isOnramp ? cryptoTxHash : transaction_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3498db] hover:text-[#2980b9] transition-colors font-medium text-sm"
            >
              {shortenedHash}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};