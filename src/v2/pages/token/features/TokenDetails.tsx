import React from "react";
import { FaSpinner } from "react-icons/fa6";
import TokenRow from "../components/TokenRow";
import { useTokenDetails } from "@/hooks/token/useTokenDetails";

interface TokenDetailsProps {
  tokenID: string | undefined;
}

interface TokenRowItem {
  title: string;
  value: string | number;
}

function TokenDetails({ tokenID }: TokenDetailsProps) {
  const { tokenDetails, isLoadingTokenDetails, errorTokenDetails } =
    useTokenDetails(tokenID as string);
  if (!tokenID) {
    return (
      <div className="flex justify-center items-center bg-accent rounded-md p-4 mx-2">
        <p className="text-danger text-sm">Token ID is required</p>
      </div>
    );
  }

  if (isLoadingTokenDetails) {
    return (
      <div className="flex justify-center items-center bg-accent rounded-md p-4 mx-2">
        <FaSpinner className="animate-spin text-primary" size={20} />
      </div>
    );
  }

  if (errorTokenDetails || !tokenDetails) {
    return (
      <div className="flex justify-center items-center bg-accent rounded-md p-4 mx-2">
        <p className="text-danger text-sm">Error loading token details: </p>
        <p className="text-danger text-sm">
          {errorTokenDetails?.toString() || "Unknown error"}
        </p>
      </div>
    );
  }

  const itemDetails: TokenRowItem[] = [
    {
      title: "Symbol",
      value: tokenDetails.symbol.toUpperCase(),
    },
    {
      title: "Name",
      value: tokenDetails.name,
    },
    {
      title: "Decimals",
      value: tokenDetails.market_data.total_supply,
    },
    {
      title: "Total Supply",
      value: tokenDetails.market_data.total_supply.toLocaleString(),
    },
    {
      title: "Circulating Supply",
      value: tokenDetails.market_data.circulating_supply.toLocaleString(),
    },
    {
      title: "Max Supply",
      value: tokenDetails.market_data.max_supply.toLocaleString(),
    },
  ];

  return (
    <div className="flex flex-col gap-1 rounded-2xl px-2 mx-2 bg-accent">
      {itemDetails.map((detail, index) => (
        <div
          key={index}
          className="border-b border-surface-subtle"
          style={{
            borderBottomWidth: itemDetails.length - 1 === index ? 0 : "0.5px",
          }}
        >
          <TokenRow title={detail.title} value={detail.value} />
        </div>
      ))}
    </div>
  );
}

export default TokenDetails;
