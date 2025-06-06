import React, { useMemo } from "react";
import { useTokenPriceChange } from "@/hooks/token/useTokenBalance";
import { FaSpinner } from "react-icons/fa6";
import { useTokenDetails } from "@/hooks/token/useTokenDetails";

interface BalanceContainerProps {
  id: string | undefined;
  userBalance: number;
}

function BalanceContainer({ id, userBalance }: BalanceContainerProps) {
  const {
    tokenPriceChange,
    tokenPriceChangeUsd,
    isLoadingTokenPriceChange,
    errorTokenPriceChange,
  } = useTokenPriceChange(id as string);
  const { tokenDetails, isLoadingTokenDetails, errorTokenDetails } =
    useTokenDetails(id as string);

  const { isPositive, usdPriceChangeDisplay, percentPriceChangeDisplay } =
    useMemo(() => {
      const isPositive = tokenPriceChange && tokenPriceChange > 0;
      const usdPriceChangeDisplay = `$${tokenPriceChangeUsd?.toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
      const percentPriceChangeDisplay = `${tokenPriceChange?.toFixed(2)}%`;
      return { isPositive, usdPriceChangeDisplay, percentPriceChangeDisplay };
    }, [tokenPriceChange]);

  if (errorTokenDetails || errorTokenPriceChange) {
    return (
      <div className="flex bg-accent rounded-xl p-4 mx-2">
        <p className="text-danger text-sm">Error loading data</p>
        <p className="text-danger text-sm">
          {errorTokenDetails?.toString() || errorTokenPriceChange?.toString()}
        </p>
      </div>
    );
  }
  if (isLoadingTokenDetails || isLoadingTokenPriceChange) {
    return (
      <div className="flex justify-center items-center bg-accent p-4 mx-2 animate-pulse h-12 w-full rounded-xl"></div>
    );
  }
  if (!tokenDetails || "status" in tokenDetails || !tokenPriceChange) {
    return (
      <div className="flex items-center justify-center mx-2 bg-accent rounded-lg p-2 py-4 h-20">
        <p className="text-danger text-sm">Error loading data</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify center mt-16">
      <p className={`text-5xl font-bold text-primary`}>
        $
        {(
          userBalance * tokenDetails.market_data.current_price.usd
        ).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
      {isLoadingTokenPriceChange ? (
        <div className="flex justify-center items-center bg-accent p-4 mx-2 animate-pulse h-12 w-full rounded-xl"></div>
      ) : (
        <div className="flex flex-row items-center justify-center my-2">
          <p
            className={`text-xl font-semibold text-center ${
              isPositive ? "text-success" : "text-danger"
            }`}
          >
            {usdPriceChangeDisplay}
          </p>
          <p
            className={`text-sm font-semibold mx-1 rounded-sm py.5 px-1 text-primary ${
              isPositive ? "bg-success" : "bg-danger"
            }`}
          >
            {percentPriceChangeDisplay}
          </p>
        </div>
      )}
    </div>
  );
}

export default BalanceContainer;
