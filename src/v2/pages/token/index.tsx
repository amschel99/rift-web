import BalanceContainer from "./features/BalanceContainer";
import { PriceChart } from "./features/PriceChart";
import Title from "./components/Title";
import TokenContainer from "./features/TokenContainer";
import dummyTokenLogo from "@/assets/images/logos/bera.png";
import TokenDetails from "./features/TokenDetails";
import TokenPerformance from "./features/TokenPerformance";
import TokenActivity from "./features/TokenActivity";
import { useParams } from "react-router-dom";
import { useTokenDetails } from "@/hooks/useTokenDetails";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaQrcode } from "react-icons/fa6";
import { colors } from "@/constants";
import { BsSendFill } from "react-icons/bs";
import { PiSwap } from "react-icons/pi";
import { CiLink } from "react-icons/ci";

const tokenActions = [
  {
    icon: <FaQrcode color={colors.accent} size={24} />,
    label: "Receive",
  },
  {
    icon: <BsSendFill color={colors.accent} size={24} />,
    label: "Send",
  },
  {
    icon: <PiSwap color={colors.accent} size={24} />,
    label: "Swap",
  },
  {
    icon: <CiLink color={colors.accent} size={24} />,
    label: "Link",
  },
];

function Token() {
  const { id } = useParams();

  const { historicalPrice, userBalance, tokenDetails, performanceData } =
    useTokenDetails(id);
  if (!userBalance || !historicalPrice || !tokenDetails || !performanceData) {
    return <div>Loading...</div>;
  }
  return (
    <div className="">
      <div className="w-full fixed bg-app-background z-10 h-16 flex flex-row items-center justify-between px-2 ">
        <IoMdArrowRoundBack className="text-2xl text-primary" />
        <h1 className={`text-xl font-bold text-primary`}>Sphere</h1>
        <p className=""></p>
      </div>
      <BalanceContainer id={id} />
      <PriceChart historicalPrice={historicalPrice} />
      <div className="flex justify-between mx-2 mt-2 gap-2 select-none">
        {tokenActions.map((action) => (
          <div
            key={action.label}
            className="w-24 h-24 rounded-lg flex items-center justify-center bg-accent flex flex-col gap-2"
          >
            {action.icon}
            <p className="text-sm font-medium">{action.label}</p>
          </div>
        ))}
      </div>
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
