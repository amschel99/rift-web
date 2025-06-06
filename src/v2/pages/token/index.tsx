import BalanceContainer from "./features/BalanceContainer";
import { PriceChart } from "./features/PriceChart";
import Title from "./components/Title";
import TokenContainer from "./features/TokenContainer";
import TokenDetails from "./features/TokenDetails";
import TokenActivity from "./features/TokenActivity";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaQrcode, FaRetweet } from "react-icons/fa6";
import { colors } from "@/constants";
import { BsSendFill } from "react-icons/bs";
import { CiLink } from "react-icons/ci";
import { useParams } from "react-router";

const tokenActions = [
  {
    icon: <FaQrcode color={colors.textprimary} size={24} />,
    label: "Receive",
  },
  {
    icon: <BsSendFill color={colors.textprimary} size={24} />,
    label: "Send",
  },
  {
    icon: <FaRetweet color={colors.textprimary} size={24} />,
    label: "Swap",
  },
  {
    icon: <CiLink color={colors.textprimary} size={24} />,
    label: "Link",
  },
];

function Token() {
  const { id } = useParams();
  // TODO: get user balance from path params
  const userBalance = 7.68;

  if (!id) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-danger">Token ID is required</p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="fixed z-10 bg-app-background max-w-lg w-full h-16 flex flex-row items-center justify-between px-2 ">
        <IoMdArrowRoundBack className="text-2xl text-primary" />
        <h1 className={`text-xl font-bold text-primary mx-2`}>
          {id.toUpperCase()}
        </h1>
      </div>
      <BalanceContainer id={id} userBalance={userBalance} />
      <PriceChart tokenID={id as string} />
      <div className="flex justify-between mx-2 mt-2 gap-2 select-none">
        {tokenActions.map((action) => (
          <div
            key={action.label}
            className="w-24 h-24 rounded-lg items-center justify-center bg-accent flex flex-col gap-2"
          >
            {action.icon}
            <p className="text-sm font-medium">{action.label}</p>
          </div>
        ))}
      </div>
      <Title title="Your Balance" />
      <TokenContainer tokenID={id} userBalance={userBalance} />
      <Title title="Token Details" />
      <TokenDetails tokenID={id} />
      <Title title="Activity" />
      <TokenActivity tokenID={id} />
    </div>
  );
}

export default Token;
