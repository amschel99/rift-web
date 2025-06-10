import { useState } from "react";
import { Balance, ChainName } from "@stratosphere-network/wallet";
import { useNavigate } from "react-router";
import { IoArrowUpCircle } from "react-icons/io5";
import { TbQrcode } from "react-icons/tb";
import { IoIosLink } from "react-icons/io";
import { BiExpandAlt, BiCollapseAlt } from "react-icons/bi";
import useWalletBalances from "@/hooks/wallet/use-wallet-balances";
import useChains from "@/hooks/data/use-chains";
import useCoinGecko, { cgTokens } from "@/hooks/data/use-coin-gecko";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionButton } from "./components/ActionButton";
import { CryptoCard } from "./components/CryptoCard";
import SendToKnown from "@/features/send/known";

export default function Home() {
  const navigate = useNavigate();
  const { userbalances } = useWalletBalances();
  const { chainsquery } = useChains();
  const { data: SUPPORTED_CHAINS } = chainsquery;
  const { data: USER_BALANCES, isPending: USER_BALANCES_LOADING } =
    userbalances;
  const { supportedtokensprices, getTokenPriceUsd } = useCoinGecko();

  const [selectedChain, setSelectedChain] = useState<ChainName | "ALL">("ALL");
  const [displayTokens, setDisplayTokens] = useState<Balance[] | null>(null);
  const [showMore, setShowMore] = useState<boolean>(false);

  const combinedBalances = Object.values(USER_BALANCES?.data || []).flat();
  let sortedBalances: Balance[] = combinedBalances?.sort((a, b) => {
    if (Number(a?.amount) === 0 && Number(b?.amount) !== 0) return 1;
    if (Number(a?.amount) !== 0 && Number(b?.amount) === 0) return -1;

    return Number(b?.amount) - Number(a?.amount);
  });

  const onFilterTokensCategory = (filter: ChainName | "ALL") => {
    if (selectedChain == filter) {
      setDisplayTokens(null);
      setSelectedChain("ALL");
    } else {
      const filteredtokens = USER_BALANCES?.data?.filter(
        (_token) => _token?.chainName == filter
      );
      setDisplayTokens(filteredtokens as Balance[]);
      setSelectedChain(filter);
    }
  };

  const aggregateBalancesUsd = () => {
    const tokenprices = supportedtokensprices?.data as cgTokens;

    return USER_BALANCES?.data?.reduce((total, _asset) => {
      const multipllier: number = getTokenPriceUsd(_asset?.token, tokenprices);

      const tokenUsdBal = Number(_asset?.amount) * multipllier;
      return total + tokenUsdBal;
    }, 0);
  };

  const renderTokens = () => {
    return showMore
      ? sortedBalances
      : displayTokens == null
        ? sortedBalances.slice(0, 5)
        : displayTokens;
  };

  return (
    <div className="w-full h-full overflow-y-auto mb-18 p-4 bg-surface">
      {USER_BALANCES_LOADING && <BalancesLoading />}

      <div className="text-center mt-8 mb-4">
        <h1 className="text-5xl font-medium mb-2">
          $
          {isNaN(Number(aggregateBalancesUsd()))
            ? 0
            : aggregateBalancesUsd()?.toFixed(2)}
        </h1>
      </div>

      <div className="flex flex-row items-center justify-center gap-3 mb-6">

        <ActionButton
          icon={<TbQrcode className="w-6 h-6" />}
          onclick={() => navigate("/app/receive")}
        />

        <SendToKnown
          renderTrigger={() => (
            <ActionButton icon={<IoArrowUpCircle className="w-6 h-6" />} />
          )}
        />

        <SendToKnown
          renderTrigger={() => (
            <ActionButton icon={<IoIosLink className="w-6 h-6" />} />
          )}
        />
      </div>

      <div className="flex flex-row items-start justify-start gap-2 overflow-x-auto mb-4">
        {SUPPORTED_CHAINS?.map((_chain) => (
          <button
            key={_chain?.name}
            onClick={() =>
              onFilterTokensCategory(_chain?.name as string as ChainName)
            }
            className={`flex-none px-3 py-1 rounded-full text-sm font-bold outline-none ${selectedChain == (_chain?.name as string as ChainName)
              ? "bg-accent-primary text-text-default"
              : "bg-border text-text-subtle"
              }`}
          >
            {_chain?.name}
          </button>
        ))}
      </div>

      {USER_BALANCES_LOADING && [1, 2, 3].map((idx) => <Skeleton key={idx} />)}

      <div className="space-y-6">
        {renderTokens()?.map((_asset, idx) => (
          <CryptoCard
            key={_asset?.token + idx}
            name={_asset?.token}
            symbol={_asset?.token}
            amount={_asset?.amount}
            priceUsd={getTokenPriceUsd(
              _asset?.token,
              supportedtokensprices?.data as cgTokens
            )}
            chain={_asset?.chainName as string as ChainName}
          />
        ))}
      </div>

      <div className="w-full flex flex-row items-center justify-center mt-4">
        <button
          className="flex flex-row items-center gap-2 p-1 px-4 rounded-full bg-secondary text-text-default font-semibold cursor-pointer"
          onClick={() => setShowMore(!showMore)}
        >
          View
          {showMore ? (
            <>
              Less <BiCollapseAlt className="w-4 h-4" />
            </>
          ) : (
            <>
              More <BiExpandAlt className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export const BalancesLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center z-10 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full h-full bg-secondary-500 p-4">
      <div className="h-30 w-full bg-secondary flex flex-col items-center justify-center border-1 border-border rounded-md shadow-xl">
        <span className="font-semibold text-center">Please wait</span>
        <span>Getting the latest data for you...</span>
      </div>
    </div>
  );
};
