import React, { useMemo } from "react";
import { type IUserBalance } from "@/hooks/useTokenDetails";

interface BalanceContainerProps {
  userBalance: IUserBalance;
}

function BalanceContainer({ userBalance }: BalanceContainerProps) {
  const isPositive = userBalance.usdPriceChange > 0;

  const { usdPriceChangeDisplay, percentPriceChangeDisplay } = useMemo(() => {
    if (!isPositive) {
      const usdPrice = userBalance.usdPriceChange.toString().replace("-", "");
      const percentPrice = userBalance.percentPriceChange
        .toString()
        .replace("-", "");
      return {
        usdPriceChangeDisplay: `-$${usdPrice}`,
        percentPriceChangeDisplay: `-${percentPrice}%`,
      };
    } else {
      return {
        usdPriceChangeDisplay: `$${userBalance.usdPriceChange}`,
        percentPriceChangeDisplay: `${userBalance.percentPriceChange}%`,
      };
    }
  }, [userBalance.usdPriceChange, userBalance.percentPriceChange, isPositive]);

  return (
    <div className="w-full flex flex-col items-center justify center mt-16">
      <p className={`text-5xl font-bold text-primary`}>
        ${userBalance.balance}
      </p>
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
    </div>
  );
}

export default BalanceContainer;
