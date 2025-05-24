import TokenHeader from "./features/TokenHeader";
import BalanceContainer from "./features/BalanceContainer";
import { PriceChart } from "./features/PriceChart";
import TokenActions from "./features/TokenActions";
import Title from "./components/Title";
import TokenContainer from "./features/TokenContainer";
import dummyTokenLogo from "@/assets/images/logos/bera.png";
import TokenDetails from "./features/TokenDetails";
import TokenPerformance from "./features/TokenPerformance";
import TokenActivity from "./features/TokenActivity";
import { useParams } from "react-router-dom";
import { useTokenDetails } from "@/hooks/useTokenDetails";

function Token() {
  const { id } = useParams();
  const { historicalPrice, userBalance, tokenDetails, performanceData } =
    useTokenDetails(id);
  if (!userBalance || !historicalPrice || !tokenDetails || !performanceData) {
    return <div>Loading...</div>;
  }
  return (
    <div className="">
      <TokenHeader title="Sphere" />
      <BalanceContainer userBalance={userBalance} />
      <PriceChart historicalPrice={historicalPrice} />
      <TokenActions />
      <Title title="Your Balance" />
      <TokenContainer
        tokenName="Sphere"
        tokenImage={dummyTokenLogo}
        tokenBalance={7.69}
        tokenUsdBalance={7.69}
        tokenUsdPriceChange={-7.23}
        tokenSymbol="SPHERE"
      />
      <Title title="Token Details" />
      <TokenDetails tokenDetails={tokenDetails} />
      <Title title="24h Performance" />
      <TokenPerformance performanceData={performanceData} />
      <Title title="Activity" />
      <TokenActivity />
    </div>
  );
}

export default Token;
