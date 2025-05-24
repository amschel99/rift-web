import TokenRow from "../components/TokenRow";
import { ITokenDetails } from "@/hooks/useTokenDetails";

interface TokenDetailsProps {
  tokenDetails: ITokenDetails;
}

interface TokenRowItem {
  title: string;
  value: string | number;
}

function TokenDetails({ tokenDetails }: TokenDetailsProps) {
  const itemDetails: TokenRowItem[] = [
    {
      title: "Symbol",
      value: tokenDetails.symbol,
    },
    {
      title: "Name",
      value: tokenDetails.name,
    },
    {
      title: "Decimals",
      value: tokenDetails.decimals,
    },
    {
      title: "Total Supply",
      value: tokenDetails.totalSupply.toLocaleString(),
    },
    {
      title: "Circulating Supply",
      value: tokenDetails.circulatingSupply.toLocaleString(),
    },
  ];
  return (
    <div className="flex flex-col gap-1 bg-accent rounded-md p-2 mx-2">
      {itemDetails.map((detail, index) => (
        <div
          className="border-b border-gray-600"
          style={{
            borderBottomWidth: itemDetails.length - 1 === index ? 0 : "0.5px",
          }}
        >
          <TokenRow key={index} title={detail.title} value={detail.value} />
        </div>
      ))}
    </div>
  );
}

export default TokenDetails;
