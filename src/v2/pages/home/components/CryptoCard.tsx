import { ChainName } from "@stratosphere-network/wallet";
import useCoinGecko from "@/hooks/data/use-coin-gecko";
interface CryptoCardProps {
  name: string;
  symbol: string;
  amount: number;
  priceUsd: number;
  chain: ChainName;
}

export function CryptoCard({
  name,
  symbol,
  amount,
  priceUsd,
  chain,
}: CryptoCardProps) {
  const tokenBalance = amount * priceUsd;
  const { getAssetImage, getChainLogo } = useCoinGecko();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex flex-row items-end justify-end">
          <img src={getAssetImage(name)} alt={name} className="w-8 h-8" />
          <span className="bg-white w-5 h-5 -translate-x-3 translate-y-2 rounded-full">
            <img
              src={getChainLogo(chain)}
              alt={name}
              className="w-full h-full object-cover"
            />
          </span>
        </div>

        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-gray-400">
            {amount} {symbol}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">
          ${tokenBalance == 0 ? tokenBalance : tokenBalance?.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
